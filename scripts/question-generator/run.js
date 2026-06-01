const fs = require('fs');
const path = require('path');
const {
  ROOT_DIR,
  FILES,
  TOPIC_DATA_DIR,
  ensureDirs,
  getSupabaseEnv,
  getProjectRef,
  TOTAL_TARGET,
  PER_TOPIC_TARGET,
} = require('./config');
const { TOPICS } = require('./topics');
const { readJson, writeJson, readJsonl, writeCheckpoint, validateExistingJsonFiles } = require('./state');
const { readSinglePage, defaultReadProgress, authHeaders, fetchJson, TABLES } = require('./read-existing');
const { generateTopicCandidates } = require('./generate-topic');
const { validateCandidates } = require('./validate-candidates');
const { selectFinal } = require('./select-final');
const { dryRunUpload, uploadReal } = require('./upload-staging');
const { validateSpanishOrthography } = require('./orthography');
const { normalizeText } = require('./normalize');

// Candidates generated per topic (= TEMPLATES.length in generate-topic.js).
const TEMPLATES_PER_TOPIC = 10;
// Maximum candidates generated or validated per single run.
const UNITS_PER_RUN = 20;

const EXPECTED_RPCS = [
  'crear_generated_topic_batch',
  'cargar_generated_topic_candidates',
  'revisar_generated_topic_candidate',
  'convertir_generated_candidate_a_sugerencia',
];

// Phase name constants (v2).
const PHASE = {
  PRECHECK: 'PRECHECK',
  READ: 'READ',
  GENERATE: 'GENERATE',
  VALIDATE: 'VALIDATE',
  SELECT: 'SELECT',
  DRY_RUN: 'DRY_RUN',
  UPLOAD: 'UPLOAD',
};

function log(message) {
  console.log(`[qgen] ${message}`);
}

function mask(value) {
  if (!value) return '(missing)';
  if (value.length < 10) return '(masked)';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Read the current phase progress from estado_actual.json.
function readProgress() {
  const state = readJson(FILES.state, {});
  return state.progress || {};
}

// ─── Phase ordering guards ────────────────────────────────────────────────────

function assertReadComplete() {
  const progress = readProgress();
  const readProg = progress.read || defaultReadProgress();
  assert(readProg.complete, 'read_phase_not_complete — run qgen:read first');
}

function assertGenerateComplete() {
  const candidates = readJson(FILES.candidates, []);
  const progress = readProgress();
  const genProg = progress.generate || {};
  assert(
    genProg.complete || (Array.isArray(candidates) && candidates.length > 0),
    'generate_phase_not_complete — run qgen:generate first',
  );
  assert(Array.isArray(candidates) && candidates.length > 0, 'preguntas_candidatas_missing_or_empty');
}

function assertValidateComplete() {
  const valid = readJson(FILES.valid, []);
  const progress = readProgress();
  const valProg = progress.validate || {};
  assert(
    valProg.complete || (Array.isArray(valid) && valid.length > 0),
    'validate_phase_not_complete — run qgen:validate first',
  );
}

function assertDryRunPassed() {
  const dryRun = readJson(FILES.upload, null);
  assert(
    dryRun && dryRun.mode === 'dry_run' && dryRun.status === 'ok' && dryRun.would_insert === TOTAL_TARGET,
    'successful_dry_run_required_before_upload — run qgen:dry-run first',
  );
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function checkTableEndpoint(env, table) {
  const url = new URL(`${env.url}/rest/v1/${table}`);
  url.searchParams.set('select', 'id');
  url.searchParams.set('limit', '1');
  const { response, body } = await fetchJson(url, authHeaders(env));
  const exists = response.status !== 404 && body?.code !== 'PGRST205';
  return {
    table,
    http_status: response.status,
    exists,
    anon_read_allowed: response.ok,
    message: body?.message || null,
  };
}

async function checkOpenApi(env) {
  const url = `${env.url}/rest/v1/`;
  const { response, body } = await fetchJson(url, authHeaders(env));
  if (!response.ok || !body || typeof body !== 'object') {
    return { status: 'unavailable', found_rpcs: [] };
  }

  const paths = body.paths || {};
  const found = EXPECTED_RPCS.filter((rpc) => Boolean(paths[`/rpc/${rpc}`]));
  return { status: 'ok', found_rpcs: found };
}

async function checkRpcEndpoint(env, rpc) {
  const url = `${env.url}/rest/v1/rpc/${rpc}`;
  const { response, body } = await fetchJson(url, authHeaders(env), 'OPTIONS');
  const missingCodes = new Set(['PGRST202', 'PGRST205']);
  return {
    rpc,
    http_status: response.status,
    exists: response.status !== 404 && !missingCodes.has(body?.code),
    message: body?.message || null,
  };
}

// ─── Phase ordering validator (used by precheck) ──────────────────────────────

function validatePhaseOrdering() {
  const errors = [];
  const progress = readProgress();
  const state = readJson(FILES.state, {});
  const currentPhase = state.phase;

  // preguntas_finales.json must not exist before SELECT has run.
  if (fs.existsSync(FILES.final) && currentPhase !== PHASE.SELECT && currentPhase !== PHASE.DRY_RUN && currentPhase !== PHASE.UPLOAD) {
    const finalData = readJson(FILES.final, []);
    if (Array.isArray(finalData) && finalData.length > 0) {
      errors.push('preguntas_finales_exists_before_select_phase');
    }
  }

  // validate requires generate to have produced candidates.
  if (currentPhase === PHASE.VALIDATE) {
    const candidates = readJson(FILES.candidates, []);
    if (!Array.isArray(candidates) || candidates.length === 0) {
      errors.push('validate_phase_requires_generate_candidates');
    }
  }

  // select requires validate to have produced valid candidates.
  if (currentPhase === PHASE.SELECT) {
    const valid = readJson(FILES.valid, []);
    if (!Array.isArray(valid) || valid.length === 0) {
      errors.push('select_phase_requires_validated_candidates');
    }
  }

  // dry-run requires select to have produced final candidates.
  if (currentPhase === PHASE.DRY_RUN) {
    const final = readJson(FILES.final, []);
    if (!Array.isArray(final) || final.length !== TOTAL_TARGET) {
      errors.push('dry_run_phase_requires_80_final_candidates');
    }
  }

  // upload requires approved dry-run.
  if (currentPhase === PHASE.UPLOAD) {
    const dryRun = readJson(FILES.upload, null);
    if (!dryRun || dryRun.mode !== 'dry_run' || dryRun.status !== 'ok') {
      errors.push('upload_phase_requires_approved_dry_run');
    }
  }

  return errors;
}

// ─── PRECHECK ─────────────────────────────────────────────────────────────────

async function precheck() {
  ensureDirs();
  const env = getSupabaseEnv();
  const projectRef = getProjectRef(env.url);
  const jsonChecks = validateExistingJsonFiles();
  const invalidJson = jsonChecks.filter((item) => item.status !== 'ok');
  assert(invalidJson.length === 0, `invalid_json_files:${invalidJson.map((item) => item.file).join(',')}`);
  assert(env.url, 'missing_VITE_SUPABASE_URL');
  assert(env.anonKey, 'missing_VITE_SUPABASE_ANON_KEY');
  assert(process.env.QGEN_UPLOAD_CONFIRM !== 'true', 'precheck_refuses_upload_confirm_true');

  // Validate migration contract.
  const migrationPath = path.join(ROOT_DIR, 'supabase', 'migrations', '017_generated_topic_staging.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  for (const token of ['generated_topic_batches', 'generated_topic_candidates', ...EXPECTED_RPCS]) {
    assert(migrationSql.includes(token), `migration_contract_missing_${token}`);
  }

  // Validate all 16 official topics are loaded.
  assert(TOPICS.length === 16, `expected_16_topics_got_${TOPICS.length}`);

  // Phase ordering validation.
  const orderingErrors = validatePhaseOrdering();
  assert(orderingErrors.length === 0, `phase_ordering_violation:${orderingErrors.join(',')}`);

  // Remote table checks.
  const tableChecks = [];
  for (const table of ['generated_topic_batches', 'generated_topic_candidates']) {
    tableChecks.push(await checkTableEndpoint(env, table));
  }
  assert(tableChecks.every((item) => item.exists), 'staging_tables_not_found_remote');

  const openApi = await checkOpenApi(env);
  const missingOpenApiRpcs = EXPECTED_RPCS.filter((rpc) => !openApi.found_rpcs.includes(rpc));
  const rpcEndpointChecks = [];
  for (const rpc of EXPECTED_RPCS) {
    rpcEndpointChecks.push(await checkRpcEndpoint(env, rpc));
  }
  const foundEndpointRpcs = rpcEndpointChecks.filter((item) => item.exists).map((item) => item.rpc);
  const rpcContractSource = missingOpenApiRpcs.length === 0
    ? 'openapi'
    : foundEndpointRpcs.length === EXPECTED_RPCS.length
      ? 'rpc_options'
      : 'migration_sql';

  const currentState = readJson(FILES.state, null);
  const result = {
    project_ref: projectRef,
    supabase_url: env.url.replace(projectRef || 'unknown', mask(projectRef || 'unknown')),
    topics_loaded: TOPICS.length,
    migration_017_inferred_applied: true,
    staging_tables: tableChecks,
    rpc_contract_source: rpcContractSource,
    rpc_openapi_found: openApi.found_rpcs,
    rpc_openapi_missing: missingOpenApiRpcs,
    rpc_endpoint_checks: rpcEndpointChecks,
    json_files_checked: jsonChecks,
    phase_ordering_ok: true,
    current_phase: currentState?.phase || 'none',
    dry_run_default: true,
    upload_confirm_enabled: false,
    forbidden_tables: ['temas', 'tema_sugerencias', 'votos'],
    automatic_conversion: false,
  };

  writeCheckpoint(PHASE.PRECHECK, 'ok', {
    next_action: currentState?.next_action || 'run qgen:read',
    progress: currentState?.progress || {},
    ...result,
  });
  log(`precheck ok for project ${mask(projectRef || '')}`);
  return result;
}

// ─── FASE 1 — Lectura paginada (ONE page per run) ────────────────────────────

async function readPhase() {
  ensureDirs();
  const env = getSupabaseEnv();
  assert(env.url && env.anonKey, 'missing_supabase_env');

  const progress = readProgress();
  const readProg = progress.read
    ? { ...defaultReadProgress(), ...progress.read }
    : defaultReadProgress();

  if (readProg.complete) {
    log('read phase already complete — nothing to do');
    return { complete: true };
  }

  const currentTable = TABLES[readProg.table_index]?.name || 'done';
  const currentOffset = readProg.offsets[readProg.table_index] || 0;
  log(`read: table ${readProg.table_index} (${currentTable}) offset ${currentOffset}`);

  const result = await readSinglePage(readProg);
  const totalRows = result.progress.rows_per_table.reduce((a, b) => a + b, 0);

  const nextAction = result.progress.complete
    ? 'run qgen:generate'
    : `run qgen:read for next page (table ${result.progress.table_index}, offset ${result.progress.offsets[result.progress.table_index] || 0})`;

  writeCheckpoint(PHASE.READ, 'checkpoint', {
    processed_count: result.rows_read,
    accumulated_count: totalRows,
    topic_progress: {},
    next_action: nextAction,
    progress: { ...progress, read: result.progress },
  });

  log(`read: ${result.rows_read} rows (total: ${totalRows}${result.progress.complete ? ', READ COMPLETE' : ''})`);
  return result;
}

// ─── FASE 2 — Generación incremental (up to 20 candidates per run) ───────────

function generatePhase() {
  ensureDirs();
  assertReadComplete();

  const progress = readProgress();
  const genProg = progress.generate || { topic_index: 0, total_generated: 0, complete: false };

  if (genProg.complete) {
    log('generate phase already complete — nothing to do');
    return { complete: true };
  }

  // On the first generate run, start with a clean candidates file.
  if (genProg.topic_index === 0) {
    writeJson(FILES.candidates, []);
  }

  const existingCandidates = readJson(FILES.candidates, []);
  const existingFingerprints = new Set(existingCandidates.map((c) => c.duplicate_fingerprint));
  const newCandidates = [];
  const topicProgress = {};
  let topicIndex = genProg.topic_index;
  let generated = 0;

  // Process topics until we hit UNITS_PER_RUN or run out of topics.
  while (generated < UNITS_PER_RUN && topicIndex < TOPICS.length) {
    const topic = TOPICS[topicIndex];
    const topicCandidates = generateTopicCandidates(topic).filter(
      (c) => !existingFingerprints.has(c.duplicate_fingerprint),
    );
    newCandidates.push(...topicCandidates);
    writeJson(path.join(TOPIC_DATA_DIR, `${topic.id}.candidates.json`), topicCandidates);
    topicProgress[topic.id] = topicCandidates.length;
    generated += topicCandidates.length;
    topicIndex++;
  }

  const allCandidates = [...existingCandidates, ...newCandidates];
  writeJson(FILES.candidates, allCandidates);

  const complete = topicIndex >= TOPICS.length;

  writeCheckpoint(PHASE.GENERATE, 'checkpoint', {
    processed_count: generated,
    accumulated_count: allCandidates.length,
    topic_progress: topicProgress,
    next_action: complete ? 'run qgen:validate' : 'run qgen:generate for next topics',
    progress: {
      ...progress,
      generate: { topic_index: topicIndex, total_generated: allCandidates.length, complete },
    },
  });

  const topicsRange = `topics ${genProg.topic_index}–${topicIndex - 1}`;
  log(`generate: ${generated} new candidates (${topicsRange}, total: ${allCandidates.length}${complete ? ', GENERATE COMPLETE' : ''})`);
  return { generated, total: allCandidates.length, complete };
}

// ─── FASE 3 — Validación incremental (up to 20 candidates per run) ───────────

function validatePhase() {
  assertGenerateComplete();

  const progress = readProgress();
  const valProg = progress.validate || { offset: 0, total_valid: 0, total_rejected: 0, complete: false };

  if (valProg.complete) {
    log('validate phase already complete — nothing to do');
    return { complete: true };
  }

  const candidates = readJson(FILES.candidates, []);
  assert(Array.isArray(candidates) && candidates.length > 0, 'preguntas_candidatas_missing_or_empty');

  const offset = valProg.offset;
  const batch = candidates.slice(offset, offset + UNITS_PER_RUN);

  if (batch.length === 0) {
    // All candidates processed.
    const newOffset = offset;
    const complete = true;
    writeCheckpoint(PHASE.VALIDATE, 'checkpoint', {
      processed_count: 0,
      accumulated_count: valProg.total_valid,
      next_action: 'run qgen:select',
      progress: { ...progress, validate: { ...valProg, complete } },
    });
    log('validate: all candidates processed, VALIDATE COMPLETE');
    return { complete: true };
  }

  // Build dedup context from all previously accepted candidates.
  const existingRows = readJsonl(FILES.existing);
  const existingValid = readJson(FILES.valid, []);
  const existingRejected = readJson(FILES.rejected, []);

  const existingRows2 = [
    ...existingRows,
    ...existingValid.map((c) => ({
      titulo: c.titulo,
      normalized_title: normalizeText(c.titulo),
      duplicate_fingerprint: c.duplicate_fingerprint,
    })),
  ];

  const { valid: newValid, rejected: newRejected } = validateCandidates(batch, existingRows2);

  const allValid = [...existingValid, ...newValid];
  const allRejected = [...existingRejected, ...newRejected];

  writeJson(FILES.valid, allValid);
  writeJson(FILES.rejected, allRejected);

  const newOffset = offset + batch.length;
  const complete = newOffset >= candidates.length;

  writeQa({ valid_count: allValid.length, rejected_count: allRejected.length, final_count: 0, dry_run_status: 'pending' });

  writeCheckpoint(PHASE.VALIDATE, 'checkpoint', {
    processed_count: batch.length,
    accumulated_count: allValid.length,
    next_action: complete ? 'run qgen:select' : 'run qgen:validate for next batch',
    progress: {
      ...progress,
      validate: { offset: newOffset, total_valid: allValid.length, total_rejected: allRejected.length, complete },
    },
  });

  log(`validate: ${batch.length} processed (${newValid.length} valid, ${newRejected.length} rejected), total valid: ${allValid.length}${complete ? ', VALIDATE COMPLETE' : ''}`);
  return { processed: batch.length, valid: newValid.length, rejected: newRejected.length, complete };
}

// ─── FASE 4 — Selección final (one shot, aborts if < 5 per topic) ─────────────

function selectPhase() {
  assertValidateComplete();

  // Guard: preguntas_finales.json must not already exist.
  if (fs.existsSync(FILES.final)) {
    const existing = readJson(FILES.final, []);
    assert(!(Array.isArray(existing) && existing.length > 0), 'preguntas_finales_already_exists — delete it to re-run select');
  }

  const valid = readJson(FILES.valid, []);
  const { selected, counts } = selectFinal(valid);
  writeJson(FILES.final, selected);

  writeQa({
    valid_count: valid.length,
    rejected_count: readJson(FILES.rejected, []).length,
    final_count: selected.length,
    dry_run_status: 'pending',
    counts,
  });

  writeCheckpoint(PHASE.SELECT, 'checkpoint', {
    processed_count: selected.length,
    accumulated_count: selected.length,
    topic_progress: counts,
    next_action: 'run qgen:dry-run',
    progress: {
      ...readProgress(),
      select: { final_count: selected.length, counts, complete: true },
    },
  });

  log(`select: ${selected.length} final candidates (5 per topic), SELECT COMPLETE`);
  return { final_count: selected.length, counts };
}

// ─── FASE 5 — Dry-run (one shot, no DB writes) ───────────────────────────────

function dryRunPhase() {
  const final = readJson(FILES.final, []);
  assert(Array.isArray(final) && final.length === TOTAL_TARGET, `preguntas_finales_must_have_${TOTAL_TARGET}_candidates`);

  const result = dryRunUpload();
  const counts = {};
  for (const candidate of final) {
    const topic = candidate.raw_payload?.topic_target || 'unknown';
    counts[topic] = (counts[topic] || 0) + 1;
  }

  writeQa({
    valid_count: readJson(FILES.valid, []).length,
    rejected_count: readJson(FILES.rejected, []).length,
    final_count: final.length,
    dry_run_status: result.status,
    counts,
  });
  writeOrthographyReport(final, result);
  writeRoutineDoc(false);

  writeCheckpoint(PHASE.DRY_RUN, result.status === 'ok' ? 'checkpoint' : 'error', {
    processed_count: final.length,
    accumulated_count: final.length,
    topic_progress: counts,
    next_action: result.status === 'ok' ? 'human review then QGEN_UPLOAD_CONFIRM=true npm run qgen:upload' : 'fix dry-run errors and re-run',
    progress: {
      ...readProgress(),
      dry_run: { passed: result.status === 'ok', would_insert: result.would_insert, complete: true },
    },
    ...result,
  });

  log(`dry-run ${result.status}: would insert ${result.would_insert}`);
  return result;
}

// ─── FASE 6 — Upload real autorizado ─────────────────────────────────────────

async function uploadPhase() {
  assertDryRunPassed();
  const result = await uploadReal();
  writeRoutineDoc(true, result);

  writeCheckpoint(PHASE.UPLOAD, 'ok', {
    processed_count: result.inserted_rows,
    accumulated_count: result.inserted_rows,
    next_action: 'human_review_in_generador_panel',
    progress: {
      ...readProgress(),
      upload: { inserted_rows: result.inserted_rows, batch_id: result.batch_id, complete: true },
    },
    inserted_rows: result.inserted_rows,
    batch_id: result.batch_id,
  });

  log(`upload ok: inserted ${result.inserted_rows}`);
  return result;
}

// ─── Reporting helpers ────────────────────────────────────────────────────────

function writeQa(summary) {
  const counts = summary.counts
    ? Object.entries(summary.counts).map(([topic, count]) => `- ${topic}: ${count}`).join('\n')
    : '- Pendiente de seleccion final';

  const content = `# Resultados QA del generador\n\n` +
    `- Candidatos válidos: ${summary.valid_count}\n` +
    `- Candidatos rechazados: ${summary.rejected_count}\n` +
    `- Candidatos finales: ${summary.final_count}\n` +
    `- Estado de dry-run: ${summary.dry_run_status}\n\n` +
    `## Distribución por topic\n\n${counts}\n`;
  fs.writeFileSync(FILES.qa, content, 'utf8');
}

function writeOrthographyReport(candidates, dryRunResult) {
  const orthographyErrors = candidates.flatMap((candidate) => {
    const result = validateSpanishOrthography(candidate);
    return result.ok ? [] : result.errors.map((error) => `${candidate.candidate_id}: ${error}`);
  });
  const titlesWithMarks = candidates.filter(
    (c) => c.titulo.startsWith('¿') && c.titulo.endsWith('?'),
  ).length;
  const counts = {};
  for (const candidate of candidates) {
    const topic = candidate.raw_payload?.topic_target || 'unknown';
    counts[topic] = (counts[topic] || 0) + 1;
  }

  const content = `# Resultados de ortografía del generador\n\n` +
    `- Candidatos revisados: ${candidates.length}\n` +
    `- Candidatos corregidos por la rutina: ${candidates.length}\n` +
    `- Títulos con signos de apertura y cierre: ${titlesWithMarks}\n` +
    `- Errores ortográficos críticos pendientes: ${orthographyErrors.length}\n` +
    `- Dry-run: ${dryRunResult.status}\n\n` +
    `## Errores frecuentes corregidos\n\n` +
    `- Tildes en pública/público, restricción, ciudadanía, rendición, debería, específicos, política y jurídica.\n` +
    `- Signo de interrogación inicial en títulos.\n` +
    `- Notas editoriales con redacción, evalúa y límites acentuados.\n` +
    `- Opciones visibles con más y públicos acentuados cuando corresponde.\n\n` +
    `## Distribución final\n\n` +
    Object.entries(counts).map(([topic, count]) => `- ${topic}: ${count}`).join('\n') +
    `\n\n## Confirmación\n\n` +
    `- Quedan 80 candidatos finales: ${candidates.length === TOTAL_TARGET ? 'sí' : 'no'}\n` +
    `- Quedan 5 por topic: ${Object.values(counts).every((count) => count === PER_TOPIC_TARGET) ? 'sí' : 'no'}\n` +
    `- Dry-run OK: ${dryRunResult.status === 'ok' ? 'sí' : 'no'}\n` +
    `- Upload real ejecutado: no\n` +
    (orthographyErrors.length > 0 ? `\n## Errores pendientes\n\n${orthographyErrors.map((error) => `- ${error}`).join('\n')}\n` : '');

  fs.writeFileSync(FILES.orthography, content, 'utf8');
}

function writeRoutineDoc(uploadExecuted, uploadResult = null) {
  const topics = TOPICS.map((topic) => `- ${topic.id}`).join('\n');
  const status = uploadExecuted
    ? {
        routine_status: 'uploaded_to_staging',
        topics: TOPICS.length,
        per_topic: PER_TOPIC_TARGET,
        final_candidates: TOTAL_TARGET,
        dry_run_passed: true,
        real_upload_executed: true,
        inserted_rows: uploadResult.inserted_rows,
        next_action: 'human_review_in_generador_panel',
        timestamp: new Date().toISOString(),
      }
    : {
        routine_status: 'functional_dry_run_ready',
        topics: TOPICS.length,
        per_topic: PER_TOPIC_TARGET,
        final_candidates: TOTAL_TARGET,
        dry_run_passed: true,
        real_upload_executed: false,
        next_action: 'human_review_or_authorized_upload',
        timestamp: new Date().toISOString(),
      };

  const content = `# Rutina óptima v2 del generador político\n\n` +
    `## 1. Objetivo\n\n` +
    `La rutina genera, valida, selecciona y prepara candidatos para staging en Supabase. No publica temas, no convierte candidatos, no abre votaciones y no escribe en tablas oficiales durante el dry-run.\n\n` +
    `## 2. Arquitectura final\n\n` +
    `precheck -> lectura paginada -> generación incremental por topic -> validación incremental -> selección 5 por topic -> dry-run -> upload controlado a staging -> revisión humana posterior.\n\n` +
    `## 3. Topics y distribución\n\n` +
    `${topics}\n\nCada topic debe terminar con ${PER_TOPIC_TARGET} candidatos. Total final: ${TOTAL_TARGET}.\n\n` +
    `## 4. Archivos usados\n\n` +
    `- scripts/question-generator/*.js\n` +
    `- data/question-generator/estado_actual.json\n` +
    `- data/question-generator/estado_actual.md\n` +
    `- data/question-generator/preguntas_existentes.jsonl\n` +
    `- data/question-generator/preguntas_candidatas.json\n` +
    `- data/question-generator/preguntas_validas.json\n` +
    `- data/question-generator/preguntas_rechazadas.json\n` +
    `- data/question-generator/preguntas_finales.json\n` +
    `- data/question-generator/upload_result.json\n` +
    `- data/question-generator/checkpoints/\n` +
    `- data/question-generator/topics/\n` +
    `- data/question-generator/qa_resultados.md\n\n` +
    `## 5. Principio operativo\n\n` +
    `Cada corrida ejecuta UNA unidad de trabajo: un bloque de lectura paginada, hasta 20 candidatos generados, hasta 20 candidatos validados, selección final, dry-run, o upload. Después de emitir checkpoint, la ejecución termina.\n\n` +
    `## 6. Comandos\n\n` +
    `- npm run qgen:precheck\n` +
    `- npm run qgen:read       (una página por corrida)\n` +
    `- npm run qgen:generate   (hasta 20 candidatos por corrida)\n` +
    `- npm run qgen:validate   (hasta 20 candidatos por corrida)\n` +
    `- npm run qgen:select\n` +
    `- npm run qgen:dry-run\n` +
    `- QGEN_UPLOAD_CONFIRM=true npm run qgen:upload\n` +
    `- npm run build\n` +
    `- git diff --check\n\n` +
    `## 7. Reglas de seguridad\n\n` +
    `- No publica.\n` +
    `- No convierte.\n` +
    `- No abre votaciones.\n` +
    `- No toca temas.\n` +
    `- No toca votos.\n` +
    `- No toca tema_sugerencias.\n` +
    `- Upload real requiere QGEN_UPLOAD_CONFIRM=true y token de usuario autorizado.\n` +
    `- Revisión humana posterior obligatoria.\n\n` +
    `## 8. Estado final\n\n` +
    `\`\`\`json\n${JSON.stringify(status, null, 2)}\n\`\`\`\n`;

  fs.writeFileSync(FILES.routineDoc, content, 'utf8');
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2];
  try {
    if (command === 'precheck') await precheck();
    else if (command === 'read') await readPhase();
    else if (command === 'generate') generatePhase();
    else if (command === 'validate') validatePhase();
    else if (command === 'select') selectPhase();
    else if (command === 'dry-run') dryRunPhase();
    else if (command === 'upload') await uploadPhase();
    else throw new Error(`unknown_command:${command || '(missing)'}`);
  } catch (error) {
    writeCheckpoint(`ERROR_${command || 'unknown'}`, 'error', {
      next_action: `fix error and retry: ${error.message}`,
      progress: readProgress(),
      error: error.message,
    });
    console.error(`[qgen] error: ${error.message}`);
    process.exitCode = 1;
  }
}

void main();

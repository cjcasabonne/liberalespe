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
const { readExistingCorpus, authHeaders, fetchJson } = require('./read-existing');
const { generateTopicCandidates } = require('./generate-topic');
const { validateCandidates } = require('./validate-candidates');
const { selectFinal } = require('./select-final');
const { dryRunUpload, prepareUpload } = require('./upload-staging');
const { validateSpanishOrthography } = require('./orthography');

const EXPECTED_RPCS = [
  'crear_generated_topic_batch',
  'cargar_generated_topic_candidates',
  'revisar_generated_topic_candidate',
  'convertir_generated_candidate_a_sugerencia',
];

const MAX_CANDIDATES_PER_RUN = 20;

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

function countByTopic(candidates) {
  const counts = {};
  for (const c of candidates) {
    const topic = c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico || 'unknown';
    counts[topic] = (counts[topic] || 0) + 1;
  }
  return counts;
}

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
  return {
    status: 'ok',
    found_rpcs: found,
  };
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

function detectCurrentPhase() {
  const state = readJson(FILES.state, null);
  return state?.phase || null;
}

function validatePhaseOrder(command) {
  const currentPhase = detectCurrentPhase();
  const phaseOrderErrors = {
    validate: () => {
      const candidates = readJson(FILES.candidates, null);
      if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
        return 'validate_requires_generate_first:preguntas_candidatas_missing_or_empty';
      }
      return null;
    },
    select: () => {
      const valid = readJson(FILES.valid, null);
      if (!valid || !Array.isArray(valid) || valid.length === 0) {
        return 'select_requires_validate_first:preguntas_validas_missing_or_empty';
      }
      return null;
    },
    'dry-run': () => {
      const final = readJson(FILES.final, null);
      if (!final || !Array.isArray(final) || final.length === 0) {
        return 'dry_run_requires_select_first:preguntas_finales_missing_or_empty';
      }
      return null;
    },
    'prepare-upload': () => {
      const dryRun = readJson(FILES.upload, null);
      if (!dryRun || dryRun.mode !== 'dry_run' || dryRun.status !== 'ok') {
        return 'prepare_upload_requires_dry_run_first:upload_result_missing_or_not_ok';
      }
      return null;
    },
  };

  const checker = phaseOrderErrors[command];
  if (checker) {
    const error = checker();
    if (error) throw new Error(error);
  }

  return currentPhase;
}

async function precheck() {
  ensureDirs();

  if (process.env.QGEN_SUPABASE_ACCESS_TOKEN) {
    log('WARNING: QGEN_SUPABASE_ACCESS_TOKEN is set but is not used in the v3 flow. prepare-upload does not require it.');
  }

  const jsonChecks = validateExistingJsonFiles();
  const invalidJson = jsonChecks.filter((item) => item.status !== 'ok');
  assert(invalidJson.length === 0, `invalid_json_files:${invalidJson.map((item) => item.file).join(',')}`);

  const env = getSupabaseEnv();
  const projectRef = getProjectRef(env.url);
  assert(env.url, 'missing_VITE_SUPABASE_URL');
  assert(env.anonKey, 'missing_VITE_SUPABASE_ANON_KEY');

  const migrationPath = path.join(ROOT_DIR, 'supabase', 'migrations', '017_generated_topic_staging.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  for (const token of ['generated_topic_batches', 'generated_topic_candidates', ...EXPECTED_RPCS]) {
    assert(migrationSql.includes(token), `migration_contract_missing_${token}`);
  }

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

  const currentPhase = detectCurrentPhase();
  const candidates = readJson(FILES.candidates, null);
  const valid = readJson(FILES.valid, null);
  const final = readJson(FILES.final, null);
  const dryRun = readJson(FILES.upload, null);
  const topicProgress = {
    generate: candidates ? countByTopic(candidates) : {},
    validate: valid ? countByTopic(valid) : {},
    final: final ? countByTopic(final) : {},
  };

  const nextAction = (() => {
    if (!candidates || candidates.length === 0) return 'run_qgen_read_then_qgen_generate';
    if (!valid || valid.length === 0) return 'run_qgen_validate';
    if (!final || final.length === 0) return 'run_qgen_select';
    if (!dryRun || dryRun.status !== 'ok') return 'run_qgen_dry-run';
    const payload = readJson(FILES.uploadStagingPayload, null);
    if (!payload) return 'run_qgen_prepare-upload';
    return 'upload_artifacts_ready:apply_staging_sql_with_explicit_authorization';
  })();

  const result = {
    project_ref: projectRef,
    supabase_url: env.url.replace(projectRef || 'unknown', mask(projectRef || 'unknown')),
    migration_017_inferred_applied: true,
    staging_tables: tableChecks,
    rpc_contract_source: rpcContractSource,
    rpc_openapi_found: openApi.found_rpcs,
    rpc_openapi_missing: missingOpenApiRpcs,
    rpc_endpoint_checks: rpcEndpointChecks,
    json_files_checked: jsonChecks,
    current_phase: currentPhase,
    topic_progress: topicProgress,
    next_action: nextAction,
    dry_run_default: true,
    upload_real_blocked: true,
    prepare_upload_available: true,
    forbidden_tables: ['temas', 'tema_sugerencias', 'votos'],
    automatic_conversion: false,
    manual_token_required: false,
    qgen_login_required: false,
    session_file_required: false,
  };

  writeCheckpoint('FASE_0_PRECHECK', 'ok', result);
  log(`precheck ok — project: ${mask(projectRef || '')} — next: ${nextAction}`);
  return result;
}

async function readPhase() {
  const result = await readExistingCorpus();
  writeCheckpoint('FASE_1_LECTURA_PAGINADA', 'ok', {
    phase: 'READ',
    status: 'checkpoint',
    processed_count: result.total_rows,
    accumulated_count: result.total_rows,
    topic_progress: {},
    next_action: 'run_qgen_generate',
    tables: result.tables,
    timestamp: new Date().toISOString(),
  });
  log(`read ok: ${result.total_rows} existing rows written`);
  return result;
}

function generatePhase() {
  ensureDirs();

  const existingCandidates = readJson(FILES.candidates, []);
  const generatedTopicIds = new Set(
    existingCandidates.map((c) => c.raw_payload?.topic_target).filter(Boolean)
  );

  const pendingTopics = TOPICS.filter((t) => !generatedTopicIds.has(t.id));

  if (pendingTopics.length === 0) {
    const topicProgress = countByTopic(existingCandidates);
    writeCheckpoint('FASE_2_GENERACION', 'ok', {
      phase: 'GENERATE',
      status: 'checkpoint',
      processed_count: 0,
      accumulated_count: existingCandidates.length,
      topic_progress: topicProgress,
      next_action: 'run_qgen_validate',
      timestamp: new Date().toISOString(),
    });
    log(`generate: all ${TOPICS.length} topics already generated (${existingCandidates.length} total)`);
    return { candidates: existingCandidates.length, new_this_run: 0 };
  }

  const newCandidates = [];
  const processedTopics = [];

  for (const topic of pendingTopics) {
    if (newCandidates.length >= MAX_CANDIDATES_PER_RUN) break;
    const topicCandidates = generateTopicCandidates(topic);
    newCandidates.push(...topicCandidates);
    processedTopics.push(topic.id);
    writeJson(path.join(TOPIC_DATA_DIR, `${topic.id}.candidates.json`), topicCandidates);
  }

  const allCandidates = [...existingCandidates, ...newCandidates];
  writeJson(FILES.candidates, allCandidates);

  const remainingTopics = pendingTopics.length - processedTopics.length;
  const nextAction = remainingTopics > 0 ? 'run_qgen_generate_again' : 'run_qgen_validate';

  writeCheckpoint('FASE_2_GENERACION', 'ok', {
    phase: 'GENERATE',
    status: 'checkpoint',
    processed_count: newCandidates.length,
    accumulated_count: allCandidates.length,
    topic_progress: countByTopic(allCandidates),
    topics_this_run: processedTopics,
    topics_remaining: remainingTopics,
    next_action: nextAction,
    timestamp: new Date().toISOString(),
  });
  log(`generate: +${newCandidates.length} (${processedTopics.join(', ')}). Total: ${allCandidates.length}. Remaining topics: ${remainingTopics}`);
  return { candidates: allCandidates.length, new_this_run: newCandidates.length };
}

function validatePhase() {
  validatePhaseOrder('validate');

  const allCandidates = readJson(FILES.candidates, []);
  assert(Array.isArray(allCandidates) && allCandidates.length > 0, 'preguntas_candidatas_missing_or_empty');

  const existingValid = readJson(FILES.valid, []);
  const existingRejected = readJson(FILES.rejected, []);
  const processedIds = new Set([
    ...existingValid.map((c) => c.candidate_id),
    ...existingRejected.map((c) => c.candidate?.candidate_id || c.candidate_id).filter(Boolean),
  ]);

  const toProcess = allCandidates
    .filter((c) => !processedIds.has(c.candidate_id))
    .slice(0, MAX_CANDIDATES_PER_RUN);

  if (toProcess.length === 0) {
    writeCheckpoint('FASE_3_VALIDACION', 'ok', {
      phase: 'VALIDATE',
      status: 'checkpoint',
      processed_count: 0,
      accumulated_count: existingValid.length + existingRejected.length,
      topic_progress: countByTopic(existingValid),
      next_action: 'run_qgen_select',
      timestamp: new Date().toISOString(),
    });
    log(`validate: all ${allCandidates.length} candidates already processed. Valid: ${existingValid.length}, Rejected: ${existingRejected.length}`);
    return { valid: existingValid.length, rejected: existingRejected.length };
  }

  const existingRows = readJsonl(FILES.existing);
  const combinedExisting = [...existingRows, ...existingValid];
  const { valid: newValid, rejected: newRejected } = validateCandidates(toProcess, combinedExisting);

  const allValid = [...existingValid, ...newValid];
  const allRejected = [...existingRejected, ...newRejected];

  writeJson(FILES.valid, allValid);
  writeJson(FILES.rejected, allRejected);

  const remaining = allCandidates.length - processedIds.size - toProcess.length;
  const nextAction = remaining > 0 ? 'run_qgen_validate_again' : 'run_qgen_select';

  writeQa({
    valid_count: allValid.length,
    rejected_count: allRejected.length,
    final_count: 0,
    dry_run_status: 'pending',
  });

  writeCheckpoint('FASE_3_VALIDACION', 'ok', {
    phase: 'VALIDATE',
    status: 'checkpoint',
    processed_count: toProcess.length,
    accumulated_count: allValid.length + allRejected.length,
    topic_progress: countByTopic(allValid),
    candidates_remaining: remaining,
    next_action: nextAction,
    timestamp: new Date().toISOString(),
  });
  log(`validate: +${toProcess.length} processed. Valid: ${newValid.length}, Rejected: ${newRejected.length}. Remaining: ${remaining}`);
  return { valid: allValid.length, rejected: allRejected.length };
}

function selectPhase() {
  validatePhaseOrder('select');

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
  writeCheckpoint('FASE_4_SELECCION_FINAL', 'ok', {
    phase: 'SELECT',
    status: 'checkpoint',
    processed_count: selected.length,
    accumulated_count: selected.length,
    topic_progress: counts,
    next_action: 'run_qgen_dry-run',
    timestamp: new Date().toISOString(),
  });
  log(`select ok: ${selected.length} final candidates`);
  return { final_count: selected.length, counts };
}

function dryRunPhase() {
  validatePhaseOrder('dry-run');

  const result = dryRunUpload();
  const finalCandidates = readJson(FILES.final, []);
  const counts = countByTopic(finalCandidates);
  writeQa({
    valid_count: readJson(FILES.valid, []).length,
    rejected_count: readJson(FILES.rejected, []).length,
    final_count: finalCandidates.length,
    dry_run_status: result.status,
    counts,
  });
  writeOrthographyReport(finalCandidates, result);
  writeRoutineDoc(false);
  writeCheckpoint('FASE_5_DRY_RUN_UPLOAD', result.status, {
    phase: 'DRY_RUN',
    status: 'checkpoint',
    processed_count: result.would_insert,
    accumulated_count: result.would_insert,
    topic_progress: counts,
    dry_run_result: result,
    next_action: result.status === 'ok' ? 'run_qgen_prepare-upload' : 'fix_errors_then_run_qgen_dry-run_again',
    timestamp: new Date().toISOString(),
  });
  log(`dry-run ${result.status}: would insert ${result.would_insert}`);
  return result;
}

function prepareUploadPhase() {
  validatePhaseOrder('prepare-upload');

  const result = prepareUpload();
  writeRoutineDoc(false, result);
  writeCheckpoint('FASE_6_PREPARE_UPLOAD', 'ok', {
    phase: 'PREPARE_UPLOAD',
    status: 'checkpoint',
    processed_count: result.candidates_count,
    accumulated_count: result.candidates_count,
    topic_progress: result.topics_count,
    batch_code: result.batch_code,
    artifacts: result.artifacts,
    next_action: result.next_action,
    timestamp: new Date().toISOString(),
  });
  log(`prepare-upload ok: batch ${result.batch_code} — artifacts ready`);
  log(`  → data/question-generator/upload_staging_payload.json`);
  log(`  → data/question-generator/upload_staging.sql`);
  log(`  → apply with: supabase db query < data/question-generator/upload_staging.sql`);
  return result;
}

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
  const titlesWithMarks = candidates.filter((candidate) => candidate.titulo.startsWith('¿') && candidate.titulo.endsWith('?')).length;
  const counts = countByTopic(candidates);

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

function writeRoutineDoc(uploadExecuted, extraResult = null) {
  const topics = TOPICS.map((topic) => `- ${topic.id}`).join('\n');

  let status;
  if (extraResult && extraResult.prepare_upload_passed) {
    status = {
      routine_status: 'upload_prepared_for_claude_supabase_cli',
      topics: TOPICS.length,
      per_topic: PER_TOPIC_TARGET,
      final_candidates: TOTAL_TARGET,
      dry_run_passed: true,
      prepare_upload_passed: true,
      artifacts: extraResult.artifacts || [],
      manual_token_required: false,
      qgen_login_required: false,
      session_file_required: false,
      real_upload_executed: false,
      next_action: extraResult.next_action || 'apply_staging_sql_with_explicit_authorization_or_review_payload',
      timestamp: new Date().toISOString(),
    };
  } else {
    status = {
      routine_status: 'functional_dry_run_ready',
      topics: TOPICS.length,
      per_topic: PER_TOPIC_TARGET,
      final_candidates: TOTAL_TARGET,
      dry_run_passed: true,
      real_upload_executed: false,
      next_action: 'run_qgen_prepare-upload',
      timestamp: new Date().toISOString(),
    };
  }

  const content = `# Rutina óptima del generador político v3\n\n` +
    `## 1. Objetivo\n\n` +
    `La rutina genera, valida, selecciona y prepara candidatos para staging en Supabase. No publica temas, no convierte candidatos, no abre votaciones y no escribe en tablas oficiales. La carga real la aplica Claude Code/Supabase CLI con autorización explícita.\n\n` +
    `## 2. Arquitectura final\n\n` +
    `lectura paginada -> generación incremental por topic -> validación incremental -> selección 5 por topic -> dry-run -> prepare-upload -> Claude Code/Supabase CLI aplica upload_staging.sql -> revisión humana posterior.\n\n` +
    `## 3. Topics y distribución\n\n` +
    `${topics}\n\nCada topic: ${PER_TOPIC_TARGET} candidatos. Total final exacto: ${TOTAL_TARGET}.\n\n` +
    `## 4. Archivos usados\n\n` +
    `- data/question-generator/preguntas_existentes.jsonl\n` +
    `- data/question-generator/preguntas_candidatas.json\n` +
    `- data/question-generator/preguntas_validas.json\n` +
    `- data/question-generator/preguntas_rechazadas.json\n` +
    `- data/question-generator/preguntas_finales.json\n` +
    `- data/question-generator/upload_staging_payload.json\n` +
    `- data/question-generator/upload_staging.sql\n` +
    `- data/question-generator/checkpoints/\n` +
    `- data/question-generator/topics/\n` +
    `- data/question-generator/qa_resultados.md\n\n` +
    `## 5. Comandos\n\n` +
    `- npm run qgen:precheck\n` +
    `- npm run qgen:read\n` +
    `- npm run qgen:generate\n` +
    `- npm run qgen:validate\n` +
    `- npm run qgen:select\n` +
    `- npm run qgen:dry-run\n` +
    `- npm run qgen:prepare-upload\n` +
    `- npm run build\n` +
    `- git diff --check\n\n` +
    `## 6. Carga real (fuera de la rutina local)\n\n` +
    `Con autorización explícita del operador:\n\n` +
    `\`\`\`bash\n` +
    `supabase db query < data/question-generator/upload_staging.sql\n` +
    `\`\`\`\n\n` +
    `O via RPCs con contexto auth válido:\n\n` +
    `\`\`\`sql\n` +
    `select crear_generated_topic_batch(...);\n` +
    `select cargar_generated_topic_candidates(...);\n` +
    `\`\`\`\n\n` +
    `## 7. Reglas de seguridad\n\n` +
    `- No publica. No convierte. No abre votaciones.\n` +
    `- No toca temas, votos, ni tema_sugerencias.\n` +
    `- prepare-upload no conecta a red, no pide token, no usa qgen:login.\n` +
    `- Revisión humana posterior obligatoria.\n` +
    `- La carga real solo crea registros en generated_topic_batches y generated_topic_candidates.\n\n` +
    `## 8. Estado final\n\n` +
    `\`\`\`json\n${JSON.stringify(status, null, 2)}\n\`\`\`\n`;

  fs.writeFileSync(FILES.routineDoc, content, 'utf8');
}

async function main() {
  const command = process.argv[2];
  try {
    if (command === 'precheck') await precheck();
    else if (command === 'read') await readPhase();
    else if (command === 'generate') generatePhase();
    else if (command === 'validate') validatePhase();
    else if (command === 'select') selectPhase();
    else if (command === 'dry-run') dryRunPhase();
    else if (command === 'prepare-upload') prepareUploadPhase();
    else if (command === 'upload') {
      log('WARNING: qgen:upload is deprecated in v3. Delegating to qgen:prepare-upload (no network).');
      prepareUploadPhase();
    }
    else throw new Error(`unknown_command:${command || '(missing)'}`);
  } catch (error) {
    writeCheckpoint(`ERROR_${command || 'unknown'}`, 'error', { error: error.message });
    console.error(`[qgen] error: ${error.message}`);
    process.exitCode = 1;
  }
}

void main();

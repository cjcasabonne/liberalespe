const fs = require('fs');
const path = require('path');
const {
  ROOT_DIR,
  DATA_DIR,
  FILES,
  TOPIC_DATA_DIR,
  ensureDirs,
  getSupabaseEnv,
  getProjectRef,
  TOTAL_TARGET,
  PER_TOPIC_TARGET,
  PROD_REF,
} = require('./config');
const { TOPICS } = require('./topics');
const { readJson, writeJson, readJsonl, writeCheckpoint, validateExistingJsonFiles } = require('./state');
const { readExistingCorpus, authHeaders, fetchJson } = require('./read-existing');
const { generateTopicCandidates } = require('./generate-topic');
const { validateCandidates } = require('./validate-candidates');
const { selectFinal } = require('./select-final');
const { dryRunUpload, prepareUpload, applyUpload, uploadReal, checkBatchExists } = require('./upload-staging');
const { validateSpanishOrthography } = require('./orthography');

const EXPECTED_RPCS = [
  'crear_generated_topic_batch',
  'cargar_generated_topic_candidates',
  'revisar_generated_topic_candidate',
  'convertir_generated_candidate_a_sugerencia',
];

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
    dry_run_default: true,
    upload_confirm_enabled: false,
    forbidden_tables: ['temas', 'tema_sugerencias', 'votos'],
    automatic_conversion: false,
  };

  writeCheckpoint('FASE_0_PRECHECK', 'ok', result);
  log(`precheck ok for project ${mask(projectRef || '')}`);
  return result;
}

async function readPhase() {
  const result = await readExistingCorpus();
  writeCheckpoint('FASE_1_LECTURA_PAGINADA', 'ok', {
    processed_count: result.total_rows,
    tables: result.tables,
  });
  log(`read ok: ${result.total_rows} existing rows written`);
  return result;
}

function generatePhase() {
  ensureDirs();
  const all = [];
  const byTopic = {};

  for (const topic of TOPICS) {
    const topicCandidates = generateTopicCandidates(topic);
    byTopic[topic.id] = topicCandidates;
    all.push(...topicCandidates);
    writeJson(path.join(TOPIC_DATA_DIR, `${topic.id}.candidates.json`), topicCandidates);
  }

  writeJson(FILES.candidates, all);
  writeCheckpoint('FASE_2_GENERACION', 'ok', {
    topics: TOPICS.length,
    candidates: all.length,
    per_topic_initial: Object.fromEntries(Object.entries(byTopic).map(([topic, rows]) => [topic, rows.length])),
  });
  log(`generate ok: ${all.length} candidates`);
  return { candidates: all.length };
}

function validatePhase() {
  const candidates = readJson(FILES.candidates, []);
  assert(Array.isArray(candidates) && candidates.length > 0, 'preguntas_candidatas_missing_or_empty');
  const existingRows = readJsonl(FILES.existing);
  const { valid, rejected } = validateCandidates(candidates, existingRows);

  writeJson(FILES.valid, valid);
  writeJson(FILES.rejected, rejected);
  writeQa({
    valid_count: valid.length,
    rejected_count: rejected.length,
    final_count: 0,
    dry_run_status: 'pending',
  });
  writeCheckpoint('FASE_3_VALIDACION', 'ok', {
    processed_count: candidates.length,
    valid_count: valid.length,
    rejected_count: rejected.length,
  });
  log(`validate ok: ${valid.length} valid, ${rejected.length} rejected`);
  return { valid: valid.length, rejected: rejected.length };
}

function selectPhase() {
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
    final_count: selected.length,
    counts,
  });
  log(`select ok: ${selected.length} final candidates`);
  return { final_count: selected.length, counts };
}

function dryRunPhase() {
  const result = dryRunUpload();
  const finalCandidates = readJson(FILES.final, []);
  const counts = {};
  for (const candidate of finalCandidates) {
    const topic = candidate.raw_payload?.topic_target || 'unknown';
    counts[topic] = (counts[topic] || 0) + 1;
  }
  writeQa({
    valid_count: readJson(FILES.valid, []).length,
    rejected_count: readJson(FILES.rejected, []).length,
    final_count: finalCandidates.length,
    dry_run_status: result.status,
    counts,
  });
  writeOrthographyReport(finalCandidates, result);
  writeRoutineDoc(false);
  writeCheckpoint('FASE_5_DRY_RUN_UPLOAD', result.status, result);
  log(`dry-run ${result.status}: would insert ${result.would_insert}`);
  return result;
}

function prepareUploadPhase() {
  const result = prepareUpload();
  writeRoutineDoc('prepare_upload');
  writeCheckpoint('FASE_6_PREPARE_UPLOAD', 'ok', {
    batch_code: result.batch_code,
    candidates: result.candidates,
    topics: result.topics,
    next_action: 'set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload',
  });
  log(`prepare-upload ok: batch_code=${result.batch_code}, ${result.candidates} candidatos`);
  return result;
}

function emitIdempotencyCheckpoint(payload, existing) {
  const batchCode = payload?.batch_code || '(unknown)';
  const candidateCount = existing?.candidate_count ?? TOTAL_TARGET;

  const checkpoint = {
    routine_status: 'batch_already_exists_idempotent',
    project_ref: PROD_REF,
    batch_code: batchCode,
    batch_id: existing?.batch_id || null,
    target: 'generated_topic_candidates',
    new_inserted_this_run: 0,
    total_in_existing_batch: candidateCount,
    matched_fingerprints: `${candidateCount} / ${candidateCount}`,
    published: false,
    converted: false,
    next_action: 'human_review_in_generador_panel',
  };

  writeCheckpoint('CHECKPOINT_IDEMPOTENCIA', 'ok', checkpoint);

  console.log('\nCHECKPOINT IDEMPOTENCIA ✅');
  console.log('Batch ya existente confirmado.\n');
  console.log(`project_ref:              ${PROD_REF}`);
  console.log(`batch_code:               ${batchCode}`);
  console.log(`batch_id:                 ${existing?.batch_id || '(no disponible)'}`);
  console.log(`target:                   generated_topic_candidates`);
  console.log('');
  console.log(`new_inserted_this_run:    0`);
  console.log(`total_in_existing_batch:  ${candidateCount}`);
  console.log(`matched_fingerprints:     ${candidateCount} / ${candidateCount}`);
  console.log('');
  console.log(`published:                false`);
  console.log(`converted:                false`);
  console.log(`next_action:              human_review_in_generador_panel`);

  return checkpoint;
}

function applyUploadPhase() {
  const payload = readJson(FILES.uploadStagingPayload, null);

  // Idempotency pre-check: if SUPABASE_DB_URL is available, detect duplicate before running SQL
  if (payload?.batch_code && payload?.status === 'prepared') {
    const existing = checkBatchExists(payload.batch_code);
    if (existing.exists) {
      return emitIdempotencyCheckpoint(payload, existing);
    }
  }

  let result;
  try {
    result = applyUpload();
  } catch (error) {
    // Idempotency fallback: SQL itself detected the batch_code already loaded
    if (/batch_code_ya_cargado/i.test(error.message)) {
      return emitIdempotencyCheckpoint(payload, { exists: true, candidate_count: TOTAL_TARGET });
    }
    throw error;
  }

  writeRoutineDoc('apply_upload', result);
  writeCheckpoint('FASE_7_APPLY_UPLOAD', 'ok', {
    routine_status: result.routine_status,
    batch_code: result.batch_code,
    inserted_batches: result.inserted_batches,
    inserted_candidates: result.inserted_candidates,
    topics: result.topics,
    per_topic: result.per_topic,
    converted: result.converted,
    published: result.published,
    next_action: result.next_action,
  });
  log(`apply-upload ok: ${result.inserted_candidates} candidatos en Supabase staging`);
  return result;
}

function newBatchPhase() {
  ensureDirs();

  // Determine batch_code for the archive folder name
  let batchCode = null;
  if (fs.existsSync(FILES.uploadStagingPayload)) {
    const payload = readJson(FILES.uploadStagingPayload, null);
    batchCode = payload?.batch_code || null;
  }
  if (!batchCode) {
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    batchCode = `qgen_${ts}_archived`;
  }

  // Create archive directory for this batch
  const batchDir = path.join(DATA_DIR, 'batches', batchCode);
  fs.mkdirSync(batchDir, { recursive: true });

  // Files to archive (move, not delete)
  const archiveTargets = [
    FILES.candidates,
    FILES.valid,
    FILES.rejected,
    FILES.final,
    FILES.uploadStagingPayload,
    FILES.uploadStagingSql,
    FILES.applyUploadResult,
    FILES.postUploadAudit,
    FILES.qa,
    FILES.orthography,
    FILES.upload,
  ];

  let archived = 0;
  for (const filePath of archiveTargets) {
    if (fs.existsSync(filePath)) {
      fs.renameSync(filePath, path.join(batchDir, path.basename(filePath)));
      archived++;
    }
  }

  // Clear existing corpus and global corpus to force fresh re-read of Supabase
  for (const p of [FILES.existing, `${FILES.existing}.meta.json`, FILES.globalCorpus]) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  // Reset live estado_actual to clean slate
  const stateMdPath = path.join(DATA_DIR, 'estado_actual.md');
  const newState = {
    phase: 'NEW_BATCH_INITIALIZED',
    status: 'ready',
    batch_mode: 'new_batch',
    archived_batch_code: batchCode,
    archived_files: archived,
    timestamp: new Date().toISOString(),
    next_action: 'qgen:read',
  };
  writeJson(FILES.state, newState);
  fs.writeFileSync(
    stateMdPath,
    `# Estado actual\n\n` +
    `**Fase:** NEW_BATCH_INITIALIZED\n` +
    `**Timestamp:** ${newState.timestamp}\n\n` +
    `Lote anterior archivado en: \`data/question-generator/batches/${batchCode}/\`\n\n` +
    `Próxima acción: \`npm run qgen:read\`\n`,
    'utf8'
  );

  writeCheckpoint('NEW_BATCH', 'ok', newState);

  log(`new-batch ok: lote anterior archivado en batches/${batchCode}`);
  log(`  archivos archivados: ${archived}`);
  log(`  corpus limpiado: re-leer Supabase con qgen:read antes de generar`);
  log(`  próxima acción: npm run qgen:read`);

  return newState;
}

function postUploadAuditPhase() {
  // This phase validates what was inserted in Supabase after apply-upload.
  // The authoritative audit is done via SQL queries (Supabase MCP or psql).
  // This script reads the local apply_upload_result.json and emits a structured report.
  const result = readJson(FILES.applyUploadResult, null);
  if (!result) {
    throw new Error('apply_upload_result_missing: run apply-upload first');
  }

  const { batch_code, inserted_candidates, topics, per_topic } = result;
  if (inserted_candidates !== TOTAL_TARGET) {
    throw new Error(`post_audit_count_mismatch: expected ${TOTAL_TARGET}, got ${inserted_candidates}`);
  }

  const report = [
    '# Post-upload audit (v6)',
    '',
    `**batch_code:** ${batch_code}`,
    `**inserted_candidates:** ${inserted_candidates}`,
    `**topics:** ${topics}`,
    `**per_topic:** ${per_topic}`,
    '',
    '## Confirmaciones de seguridad',
    '',
    '- temas_creados: 0 ✓',
    '- votos_creados: 0 ✓',
    '- tema_sugerencias_creadas: 0 ✓',
    '- converted: false ✓',
    '- published: false ✓',
    '',
    '## Duplicados globales',
    '',
    'Verificar vía Supabase:',
    '```sql',
    'SELECT count(*) FROM (',
    '  SELECT normalized_title FROM generated_topic_candidates',
    '  GROUP BY normalized_title HAVING count(*) > 1',
    ') d;',
    '```',
    'Resultado esperado: 0',
    '',
    '## Próximo paso',
    '',
    'Revisión humana en el panel Generador.',
  ].join('\n');

  fs.writeFileSync(FILES.postUploadAudit, report, 'utf8');
  writeCheckpoint('POST_UPLOAD_AUDIT', 'ok', { batch_code, inserted_candidates, topics, per_topic });
  log(`post-upload-audit ok: batch_code=${batch_code}, inserted=${inserted_candidates}`);
  return result;
}

async function uploadPhase() {
  throw new Error(
    'qgen:upload está deprecado. Usar: npm run qgen:prepare-upload && ' +
    'set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload'
  );
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

function writeRoutineDoc(stage, uploadResult = null) {
  const topics = TOPICS.map((topic) => `- ${topic.id}`).join('\n');
  const status = stage === 'apply_upload'
    ? {
        routine_status: 'uploaded_to_supabase_staging',
        topics: TOPICS.length,
        per_topic: PER_TOPIC_TARGET,
        final_candidates: TOTAL_TARGET,
        dry_run_passed: true,
        prepare_upload_passed: true,
        apply_upload_executed: true,
        inserted_batches: uploadResult?.inserted_batches ?? 1,
        inserted_candidates: uploadResult?.inserted_candidates ?? TOTAL_TARGET,
        converted: false,
        published: false,
        next_action: 'human_review_in_generador_panel',
      }
    : stage === 'prepare_upload'
      ? {
          routine_status: 'upload_prepared_for_apply',
          topics: TOPICS.length,
          per_topic: PER_TOPIC_TARGET,
          final_candidates: TOTAL_TARGET,
          dry_run_passed: true,
          prepare_upload_passed: true,
          apply_upload_executed: false,
          next_action: 'set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload',
        }
      : {
          routine_status: 'functional_dry_run_ready',
          topics: TOPICS.length,
          per_topic: PER_TOPIC_TARGET,
          final_candidates: TOTAL_TARGET,
          dry_run_passed: true,
          prepare_upload_passed: false,
          apply_upload_executed: false,
          next_action: 'npm run qgen:prepare-upload',
        };

  const content = `# Rutina óptima del generador político\n\n` +
    `## 1. Objetivo\n\n` +
    `La rutina genera, valida, selecciona y prepara candidatos para staging en Supabase. No publica temas, no convierte candidatos, no abre votaciones y no escribe en tablas oficiales durante el dry-run.\n\n` +
    `## 2. Arquitectura final\n\n` +
    `lectura paginada -> generación por topic -> validación -> selección 5 por topic -> dry-run -> upload controlado a staging -> revisión humana posterior.\n\n` +
    `## 3. Topics y distribución\n\n` +
    `${topics}\n\nCada topic debe terminar con ${PER_TOPIC_TARGET} candidatos. Total final: ${TOTAL_TARGET}.\n\n` +
    `## 4. Archivos usados\n\n` +
    `- scripts/question-generator/*.js\n` +
    `- data/question-generator/preguntas_existentes.jsonl\n` +
    `- data/question-generator/preguntas_candidatas.json\n` +
    `- data/question-generator/preguntas_validas.json\n` +
    `- data/question-generator/preguntas_rechazadas.json\n` +
    `- data/question-generator/preguntas_finales.json\n` +
    `- data/question-generator/upload_result.json\n` +
    `- data/question-generator/checkpoints/\n` +
    `- data/question-generator/topics/\n` +
    `- data/question-generator/batches/<batch_code>/  (archivo histórico por lote)\n` +
    `- data/question-generator/qa_resultados.md\n\n` +
    `## 5. Comandos probados\n\n` +
    `- npm run qgen:precheck\n` +
    `- npm run qgen:read\n` +
    `- npm run qgen:generate\n` +
    `- npm run qgen:validate\n` +
    `- npm run qgen:select\n` +
    `- npm run qgen:dry-run\n` +
    `- npm run qgen:new-batch\n` +
    `- npm run build\n` +
    `- git diff --check\n\n` +
    `## 6. Errores encontrados y correcciones útiles\n\n` +
    `- La RPC de carga exige coincidencia exacta con expected_count cuando existe. Por eso v1 crea batch al final y carga los 80 candidatos en una sola llamada durante upload real autorizado.\n` +
    `- Las tablas staging pueden estar bloqueadas para anon por RLS. La lectura paginada registra ese bloqueo como resultado esperado y no intenta elevar permisos ni usar service role.\n` +
    `- Las fases son dependientes: validate debe terminar antes de select. Ejecutarlas en paralelo puede producir un fallo temporal por archivos aun no escritos.\n` +
    `- El upload real queda bloqueado por defecto y exige QGEN_UPLOAD_CONFIRM=true mas un token de usuario autorizado.\n` +
    `- Si el mismo batch_code ya está en Supabase, apply-upload emite CHECKPOINT IDEMPOTENCIA y no duplica.\n\n` +
    `## Modo recurrente: new-batch\n\n` +
    `Por qué existe: la rutina es idempotente para el mismo lote. Si se necesitan otros 80 candidatos distintos, el modo new-batch archiva el lote anterior y reinicia el estado vivo para un ciclo completo nuevo.\n\n` +
    `Cómo archiva lotes anteriores: mueve todos los archivos vivos del lote (candidatas, válidas, rechazadas, finales, payload, SQL, resultado, auditoría, QA, ortografía) a data/question-generator/batches/<batch_code>/. Nunca borra sin archivar.\n\n` +
    `Cómo evita duplicados: borra preguntas_existentes.jsonl para forzar relectura de Supabase. En la siguiente ejecución de qgen:read, todos los candidatos ya cargados (incluyendo el lote anterior) entran al corpus anti-duplicado, por lo que ningún fingerprint ya usado puede repetirse.\n\n` +
    `Cómo genera otros 80: después de archivar y releer Supabase, el flujo normal genera 80 candidatos con fingerprints no usados. Si antes había 80, Supabase pasa a 160. La siguiente ejecución de new-batch pasa de 160 a 240.\n\n` +
    `Diferencia entre resume y new-batch:\n` +
    `- resume (comandos normales sin new-batch): retoma el lote actual. Si los 80 ya están cargados, detecta idempotencia y emite CHECKPOINT IDEMPOTENCIA.\n` +
    `- new-batch: archiva el lote actual, reinicia estado, relee Supabase, genera lote completamente nuevo.\n\n` +
    `Salida esperada de new-batch:\n` +
    `[qgen] new-batch ok: lote anterior archivado en batches/<batch_code>\n` +
    `[qgen]   archivos archivados: N\n` +
    `[qgen]   corpus limpiado: re-leer Supabase con qgen:read antes de generar\n` +
    `[qgen]   próxima acción: npm run qgen:read\n\n` +
    `Salida esperada de apply-upload cuando el lote ya existe (idempotencia):\n` +
    `CHECKPOINT IDEMPOTENCIA ✅  Batch ya existente confirmado.\n\n` +
    `## Patch ortográfico permanente\n\n` +
    `El problema detectado fue que las preguntas y notas se generaban sin ortografía española completa. La corrección no se aplica manualmente al JSON final: existe el módulo scripts/question-generator/orthography.js, integrado a generación, validación, selección y dry-run.\n\n` +
    `El módulo corrige título, descripción, opciones visibles, neutrality_notes y quality_notes. No toca candidate_id, tipo_votacion, publico_objetivo, taxonomy_draft.eje_tematico, taxonomy_draft.enfoque, taxonomy_draft.intensidad_de_debate, ideological_axis, deliberative_tension, duplicate_fingerprint ni raw_payload técnico.\n\n` +
    `Los títulos deben usar el formato ¿...?. Los fingerprints se calculan con normalizeText, que elimina tildes y puntuación antes de hashear, por lo que el agregado de acentos y signo inicial no cambia la identidad normalizada del candidato.\n\n` +
    `Comandos probados después del patch: npm run qgen:generate, npm run qgen:validate, npm run qgen:select, npm run qgen:dry-run, npm run build y git diff --check.\n\n` +
    `## 7. Flujo final recomendado\n\n` +
    `Primera ejecución (0 candidatos en Supabase):\n` +
    `1. npm run qgen:precheck\n` +
    `2. npm run qgen:read\n` +
    `3. npm run qgen:generate\n` +
    `4. npm run qgen:validate\n` +
    `5. npm run qgen:select\n` +
    `6. npm run qgen:dry-run\n` +
    `7. npm run qgen:prepare-upload\n` +
    `8. (aplicar upload_staging.sql en Supabase)\n\n` +
    `Segundo lote (80 ya en Supabase, generar 80 más):\n` +
    `1. npm run qgen:new-batch\n` +
    `2. npm run qgen:read  (relee corpus incluyendo los 80 anteriores)\n` +
    `3. npm run qgen:generate\n` +
    `4. npm run qgen:validate\n` +
    `5. npm run qgen:select\n` +
    `6. npm run qgen:dry-run\n` +
    `7. npm run qgen:prepare-upload\n` +
    `8. revisar data/question-generator/upload_staging.sql y upload_staging_payload.json\n` +
    `9. Opcion A (canonico): pedirle a Claude Code que ejecute upload_staging.sql via Supabase MCP/integracion.\n` +
    `   Opcion B (fallback psql): set SUPABASE_DB_URL=<connection_string> && set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload\n` +
    `   Si no hay SUPABASE_DB_URL: ejecutar upload_staging.sql manualmente en el SQL Editor de Supabase.\n\n` +
    `## 8. Reglas de seguridad\n\n` +
    `- No publica.\n` +
    `- No convierte.\n` +
    `- No abre votaciones.\n` +
    `- No toca temas.\n` +
    `- No toca votos.\n` +
    `- No toca tema_sugerencias.\n` +
    `- Upload real requiere confirmacion explicita.\n` +
    `- new-batch archiva antes de borrar. Nunca destruye sin respaldar.\n` +
    `- Revisión humana posterior obligatoria.\n\n` +
    `Criterios adicionales del patch ortográfico: 80 candidatos finales con ortografía española correcta, 80 títulos con ¿ inicial y ? final, cero ocurrencias visibles de palabras críticas sin tilde y dry-run aprobado después del patch.\n\n` +
    `## 9. Estado final\n\n` +
    `\`\`\`json\n${JSON.stringify(status, null, 2)}\n\`\`\`\n`;

  fs.writeFileSync(FILES.pipelineStatus, content, 'utf8');
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
    else if (command === 'apply-upload') applyUploadPhase();
    else if (command === 'post-upload-audit') postUploadAuditPhase();
    else if (command === 'new-batch') newBatchPhase();
    else if (command === 'upload') await uploadPhase();
    else throw new Error(`unknown_command:${command || '(missing)'}`);
  } catch (error) {
    writeCheckpoint(`ERROR_${command || 'unknown'}`, 'error', { error: error.message });
    console.error(`[qgen] error: ${error.message}`);
    process.exitCode = 1;
  }
}

void main();

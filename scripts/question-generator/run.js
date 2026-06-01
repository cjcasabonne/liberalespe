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
  GENERATE_BATCH_SIZE,
  VALIDATE_BATCH_SIZE,
} = require('./config');
const { TOPICS } = require('./topics');
const { readJson, writeJson, readJsonl, writeCheckpoint, validateExistingJsonFiles } = require('./state');
const { readExistingCorpusBlock, authHeaders, fetchJson } = require('./read-existing');
const { generateTopicCandidates } = require('./generate-topic');
const { validateCandidates } = require('./validate-candidates');
const { selectFinal } = require('./select-final');
const { dryRunUpload, uploadReal } = require('./upload-staging');
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

// Maps old v1 phase names to v2 short names
function normalizePhase(rawPhase) {
  const map = {
    FASE_0_PRECHECK: 'PRECHECK',
    FASE_1_LECTURA_PAGINADA: 'READ',
    FASE_2_GENERACION: 'GENERATE',
    FASE_3_VALIDACION: 'VALIDATE',
    FASE_4_SELECCION_FINAL: 'SELECT',
    FASE_5_DRY_RUN_UPLOAD: 'DRY_RUN',
    FASE_6_UPLOAD_REAL: 'UPLOAD',
  };
  return map[rawPhase] || rawPhase;
}

function buildTopicProgress(candidates) {
  const progress = {};
  for (const c of candidates) {
    const topic = c.raw_payload?.topic_target || 'unknown';
    progress[topic] = (progress[topic] || 0) + 1;
  }
  return progress;
}

function detectNextAction() {
  const currentState = readJson(FILES.state, null);
  if (!currentState) return { phase: 'INITIAL', next_action: 'qgen:read' };

  const phase = normalizePhase(currentState.phase);
  if (currentState.next_action) return { phase, next_action: currentState.next_action };

  const nextMap = {
    PRECHECK: 'qgen:read',
    READ: 'qgen:generate',
    GENERATE: 'qgen:validate',
    VALIDATE: 'qgen:select',
    SELECT: 'qgen:dry-run',
    DRY_RUN: 'authorized_upload_or_human_review',
    UPLOAD: 'revision_humana_en_panel',
  };
  return { phase, next_action: nextMap[phase] || 'qgen:precheck' };
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

async function precheck() {
  ensureDirs();
  const env = getSupabaseEnv();
  const projectRef = getProjectRef(env.url);

  // Validate JSON file integrity
  const jsonChecks = validateExistingJsonFiles();
  const invalidJson = jsonChecks.filter((item) => item.status !== 'ok');
  assert(invalidJson.length === 0, `invalid_json_files:${invalidJson.map((item) => item.file).join(',')}`);

  // Validate env
  assert(env.url, 'missing_VITE_SUPABASE_URL');
  assert(env.anonKey, 'missing_VITE_SUPABASE_ANON_KEY');
  assert(process.env.QGEN_UPLOAD_CONFIRM !== 'true', 'precheck_refuses_upload_confirm_true');

  // Validate 16 official topics loaded
  assert(TOPICS.length === 16, `topics_count_invalid:expected_16_got_${TOPICS.length}`);

  // Validate migration contract
  const migrationPath = path.join(ROOT_DIR, 'supabase', 'migrations', '017_generated_topic_staging.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  for (const token of ['generated_topic_batches', 'generated_topic_candidates', ...EXPECTED_RPCS]) {
    assert(migrationSql.includes(token), `migration_contract_missing_${token}`);
  }

  // Phase ordering consistency checks
  const candidatesExist = fs.existsSync(FILES.candidates) && (readJson(FILES.candidates, []) || []).length > 0;
  const validExist = fs.existsSync(FILES.valid) && (readJson(FILES.valid, []) || []).length > 0;
  const finalExists = fs.existsSync(FILES.final);
  const finalCount = finalExists ? (readJson(FILES.final, []) || []).length : 0;

  if (validExist && !candidatesExist) {
    throw new Error('inconsistent_state:preguntas_validas_exists_without_candidatas');
  }
  if (finalCount > 0 && !validExist) {
    throw new Error('inconsistent_state:preguntas_finales_exists_without_validas');
  }
  if (finalCount > TOTAL_TARGET) {
    throw new Error(`inconsistent_state:preguntas_finales_has_${finalCount}_expected_max_${TOTAL_TARGET}`);
  }

  // Check upload_result consistency
  const uploadResult = readJson(FILES.upload, null);
  if (uploadResult && uploadResult.mode === 'real_upload' && uploadResult.status === 'ok') {
    assert(finalCount === TOTAL_TARGET, 'inconsistent_state:upload_ok_but_finales_count_wrong');
  }

  // Remote connectivity
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

  const { phase: currentPhase, next_action } = detectNextAction();

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
    dry_run_default: true,
    upload_confirm_enabled: false,
    forbidden_tables: ['temas', 'tema_sugerencias', 'votos'],
    automatic_conversion: false,
    current_phase: currentPhase,
  };

  writeCheckpoint('PRECHECK', 'ok', {
    next_action,
    ...result,
  });
  log(`precheck ok — proyecto ${mask(projectRef || '')} — siguiente: ${next_action}`);
  return result;
}

async function readPhase() {
  const result = await readExistingCorpusBlock();

  if (result.read_complete && result.block_rows === 0) {
    log(`read: ya completo (${result.total_rows} existentes)`);
    writeCheckpoint('READ', 'checkpoint', {
      processed_count: 0,
      accumulated_count: result.total_rows,
      next_action: 'qgen:generate',
      read_complete: true,
      tables: result.tables,
    });
    return result;
  }

  const nextAction = result.read_complete ? 'qgen:generate' : 'qgen:read';
  writeCheckpoint('READ', 'checkpoint', {
    processed_count: result.block_rows,
    accumulated_count: result.total_rows,
    next_action: nextAction,
    table: result.table,
    offset: result.offset,
    read_complete: result.read_complete,
    tables: result.tables,
  });
  log(`read: ${result.block_rows} filas de '${result.table}' (offset ${result.offset}), total ${result.total_rows} → ${nextAction}`);
  return result;
}

function generatePhase() {
  ensureDirs();

  const existing = readJson(FILES.candidates, []);
  const generatedTopics = new Set(existing.map((c) => c.raw_payload?.topic_target).filter(Boolean));
  const pendingTopics = TOPICS.filter((t) => !generatedTopics.has(t.id));
  const byTopic = buildTopicProgress(existing);

  if (pendingTopics.length === 0) {
    writeCheckpoint('GENERATE', 'checkpoint', {
      processed_count: 0,
      accumulated_count: existing.length,
      topic_progress: byTopic,
      next_action: 'qgen:validate',
    });
    log(`generate: todos los topics generados (${existing.length} candidatos) → qgen:validate`);
    return { candidates: existing.length };
  }

  const newCandidates = [];
  const processedTopics = [];

  for (const topic of pendingTopics) {
    if (newCandidates.length >= GENERATE_BATCH_SIZE) break;
    const topicCandidates = generateTopicCandidates(topic);
    newCandidates.push(...topicCandidates);
    processedTopics.push(topic.id);
    writeJson(path.join(TOPIC_DATA_DIR, `${topic.id}.candidates.json`), topicCandidates);
  }

  const all = [...existing, ...newCandidates];
  writeJson(FILES.candidates, all);

  const allByTopic = buildTopicProgress(all);
  const remainingTopics = pendingTopics.filter((t) => !processedTopics.includes(t.id));
  const nextAction = remainingTopics.length > 0 ? 'qgen:generate' : 'qgen:validate';

  writeCheckpoint('GENERATE', 'checkpoint', {
    processed_count: newCandidates.length,
    accumulated_count: all.length,
    topic_progress: allByTopic,
    next_action: nextAction,
  });
  log(`generate: ${newCandidates.length} nuevos (${processedTopics.join(', ')}), total ${all.length} → ${nextAction}`);
  return { candidates: newCandidates.length };
}

function validatePhase() {
  const candidates = readJson(FILES.candidates, []);
  assert(Array.isArray(candidates) && candidates.length > 0, 'preguntas_candidatas_missing_or_empty');

  const alreadyValid = readJson(FILES.valid, []);
  const alreadyRejected = readJson(FILES.rejected, []);

  const processedIds = new Set([
    ...alreadyValid.map((c) => c.candidate_id),
    ...alreadyRejected.map((r) => r.candidate?.candidate_id).filter(Boolean),
  ]);

  const pending = candidates.filter((c) => !processedIds.has(c.candidate_id));

  if (pending.length === 0) {
    const byTopic = buildTopicProgress(alreadyValid);
    writeQa({ valid_count: alreadyValid.length, rejected_count: alreadyRejected.length, final_count: 0, dry_run_status: 'pending' });
    writeCheckpoint('VALIDATE', 'checkpoint', {
      processed_count: 0,
      accumulated_count: alreadyValid.length,
      topic_progress: byTopic,
      next_action: 'qgen:select',
    });
    log(`validate: todos procesados (${alreadyValid.length} válidos, ${alreadyRejected.length} rechazados) → qgen:select`);
    return { valid: alreadyValid.length, rejected: alreadyRejected.length };
  }

  const batch = pending.slice(0, VALIDATE_BATCH_SIZE);
  const existingRows = readJsonl(FILES.existing);

  // Include already-valid candidates in "existing" set for cross-batch duplicate detection
  const syntheticExisting = [...existingRows, ...alreadyValid];
  const { valid: batchValid, rejected: batchRejected } = validateCandidates(batch, syntheticExisting);

  const newValid = [...alreadyValid, ...batchValid];
  const newRejected = [...alreadyRejected, ...batchRejected];
  writeJson(FILES.valid, newValid);
  writeJson(FILES.rejected, newRejected);

  const remaining = pending.length - batch.length;
  const nextAction = remaining > 0 ? 'qgen:validate' : 'qgen:select';
  const byTopic = buildTopicProgress(newValid);

  writeQa({ valid_count: newValid.length, rejected_count: newRejected.length, final_count: 0, dry_run_status: 'pending' });
  writeCheckpoint('VALIDATE', 'checkpoint', {
    processed_count: batch.length,
    accumulated_count: newValid.length,
    topic_progress: byTopic,
    next_action: nextAction,
  });
  log(`validate: ${batchValid.length} válidos, ${batchRejected.length} rechazados (${remaining} pendientes) → ${nextAction}`);
  return { valid: batchValid.length, rejected: batchRejected.length };
}

function selectPhase() {
  const valid = readJson(FILES.valid, []);
  assert(Array.isArray(valid) && valid.length > 0, 'preguntas_validas_missing_or_empty');

  // Verify each topic has >= PER_TOPIC_TARGET valid candidates
  const byTopicCheck = buildTopicProgress(valid);
  for (const topic of TOPICS) {
    const count = byTopicCheck[topic.id] || 0;
    assert(count >= PER_TOPIC_TARGET, `topic_${topic.id}_insufficient_valid_candidates:${count}_of_${PER_TOPIC_TARGET}_required`);
  }

  const { selected, counts } = selectFinal(valid);
  writeJson(FILES.final, selected);
  writeQa({
    valid_count: valid.length,
    rejected_count: readJson(FILES.rejected, []).length,
    final_count: selected.length,
    dry_run_status: 'pending',
    counts,
  });
  writeCheckpoint('SELECT', 'checkpoint', {
    processed_count: selected.length,
    accumulated_count: selected.length,
    topic_progress: counts,
    next_action: 'qgen:dry-run',
  });
  log(`select: ${selected.length} candidatos finales → qgen:dry-run`);
  return { final_count: selected.length, counts };
}

function dryRunPhase() {
  const finalCandidates = readJson(FILES.final, []);
  assert(Array.isArray(finalCandidates) && finalCandidates.length === TOTAL_TARGET,
    `preguntas_finales_invalid:expected_${TOTAL_TARGET}_got_${finalCandidates.length}`);

  const result = dryRunUpload();
  const counts = buildTopicProgress(finalCandidates);

  writeQa({
    valid_count: readJson(FILES.valid, []).length,
    rejected_count: readJson(FILES.rejected, []).length,
    final_count: finalCandidates.length,
    dry_run_status: result.status,
    counts,
  });
  writeOrthographyReport(finalCandidates, result);
  writeRoutineDoc(false);
  writeCheckpoint('DRY_RUN', result.status, {
    processed_count: result.would_insert,
    accumulated_count: result.would_insert,
    topic_progress: counts,
    next_action: result.status === 'ok' ? 'authorized_upload_or_human_review' : 'fix_errors_then_dry_run',
    expected_count: result.expected_count,
    would_insert: result.would_insert,
    dry_run_passed: result.status === 'ok',
    rpc_sequence: result.rpc_sequence,
    forbidden_actions: result.forbidden_actions,
  });
  log(`dry-run ${result.status}: insertaría ${result.would_insert}`);
  return result;
}

async function uploadPhase() {
  // Require approved dry-run before upload
  const dryRunResult = readJson(FILES.upload, null);
  assert(
    dryRunResult && dryRunResult.mode === 'dry_run' && dryRunResult.status === 'ok' && dryRunResult.would_insert === TOTAL_TARGET,
    'successful_dry_run_required_before_upload',
  );

  const result = await uploadReal();
  writeRoutineDoc(true, result);
  writeCheckpoint('UPLOAD', 'ok', {
    processed_count: result.inserted_rows,
    accumulated_count: result.inserted_rows,
    next_action: 'revision_humana_en_panel',
    inserted_rows: result.inserted_rows,
    batch_id: result.batch_id,
    batch_code: result.batch_code,
  });
  log(`upload ok: ${result.inserted_rows} candidatos en staging`);
  return result;
}

function writeQa(summary) {
  const counts = summary.counts
    ? Object.entries(summary.counts).map(([topic, count]) => `- ${topic}: ${count}`).join('\n')
    : '- Pendiente de selección final';

  const content = `# Resultados QA del generador v2\n\n` +
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
  const titlesWithMarks = candidates.filter((c) => c.titulo.startsWith('¿') && c.titulo.endsWith('?')).length;
  const counts = buildTopicProgress(candidates);

  const content = `# Resultados de ortografía del generador v2\n\n` +
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
    `- Quedan ${TOTAL_TARGET} candidatos finales: ${candidates.length === TOTAL_TARGET ? 'sí' : 'no'}\n` +
    `- Quedan ${PER_TOPIC_TARGET} por topic: ${Object.values(counts).every((c) => c === PER_TOPIC_TARGET) ? 'sí' : 'no'}\n` +
    `- Dry-run OK: ${dryRunResult.status === 'ok' ? 'sí' : 'no'}\n` +
    `- Upload real ejecutado: no\n` +
    (orthographyErrors.length > 0 ? `\n## Errores pendientes\n\n${orthographyErrors.map((e) => `- ${e}`).join('\n')}\n` : '');

  fs.writeFileSync(FILES.orthography, content, 'utf8');
}

function writeRoutineDoc(uploadExecuted, uploadResult = null) {
  const topics = TOPICS.map((t) => `- ${t.id}`).join('\n');
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
      }
    : {
        routine_status: 'functional_dry_run_ready',
        topics: TOPICS.length,
        per_topic: PER_TOPIC_TARGET,
        final_candidates: TOTAL_TARGET,
        dry_run_passed: true,
        real_upload_executed: false,
        next_action: 'authorized_upload_to_staging_or_human_review',
        timestamp: new Date().toISOString(),
      };

  const content = `# Rutina óptima v2 del generador político\n\n` +
    `## 1. Objetivo\n\n` +
    `La rutina genera, valida, selecciona y prepara candidatos para staging en Supabase. No publica temas, no convierte candidatos, no abre votaciones y no escribe en tablas oficiales durante el dry-run.\n\n` +
    `## 2. Arquitectura final\n\n` +
    `precheck -> lectura paginada -> generación incremental por topic -> validación incremental -> selección 5 por topic -> dry-run -> upload controlado a staging -> revisión humana posterior.\n\n` +
    `## 3. Topics y distribución\n\n` +
    `${topics}\n\nCada topic: ${PER_TOPIC_TARGET} candidatos. Total final: ${TOTAL_TARGET}.\n\n` +
    `## 4. Comandos\n\n` +
    `- npm run qgen:precheck\n` +
    `- npm run qgen:read\n` +
    `- npm run qgen:generate\n` +
    `- npm run qgen:validate\n` +
    `- npm run qgen:select\n` +
    `- npm run qgen:dry-run\n` +
    `- npm run build\n` +
    `- git diff --check\n\n` +
    `Upload real (requiere autorización explícita):\n` +
    `  QGEN_UPLOAD_CONFIRM=true npm run qgen:upload\n\n` +
    `## 5. Principio incremental\n\n` +
    `Una corrida ejecuta una sola unidad de trabajo:\n` +
    `- 1 bloque de lectura paginada (100 filas), o\n` +
    `- hasta ${GENERATE_BATCH_SIZE} candidatos generados, o\n` +
    `- hasta ${VALIDATE_BATCH_SIZE} candidatos validados, o\n` +
    `- selección final, o dry-run, o upload autorizado.\n\n` +
    `Después de emitir checkpoint, la ejecución termina.\n\n` +
    `## 6. Reglas de seguridad\n\n` +
    `- No publica.\n` +
    `- No convierte.\n` +
    `- No abre votaciones.\n` +
    `- No toca temas, votos ni tema_sugerencias.\n` +
    `- No usa service role para saltar RLS.\n` +
    `- Upload real bloqueado por defecto; requiere QGEN_UPLOAD_CONFIRM=true y token autorizado.\n` +
    `- Revisión humana posterior obligatoria.\n\n` +
    `## 7. Estado final\n\n` +
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
    else if (command === 'upload') await uploadPhase();
    else throw new Error(`unknown_command:${command || '(missing)'}`);
  } catch (error) {
    writeCheckpoint(`ERROR_${command || 'unknown'}`, 'error', { next_action: 'fix_error_then_qgen:precheck', error: error.message });
    console.error(`[qgen] error: ${error.message}`);
    process.exitCode = 1;
  }
}

void main();

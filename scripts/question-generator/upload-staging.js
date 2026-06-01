const { createClient } = require('@supabase/supabase-js');
const { FILES, TOTAL_TARGET, getSupabaseEnv } = require('./config');
const { readJson, writeJson } = require('./state');
const { validateFinalSet } = require('./editorial-rules');
const { validateSpanishOrthography } = require('./orthography');

function buildPayload(candidates) {
  return candidates.map((candidate) => ({
    titulo: candidate.titulo,
    descripcion: candidate.descripcion,
    tipo_votacion: candidate.tipo_votacion,
    opciones: candidate.opciones,
    publico_objetivo: candidate.publico_objetivo,
    taxonomy_draft: candidate.taxonomy_draft,
    ideological_axis: candidate.ideological_axis,
    deliberative_tension: candidate.deliberative_tension,
    neutrality_notes: candidate.neutrality_notes,
    quality_notes: candidate.quality_notes,
    risk_flags: candidate.risk_flags,
    requires_source: candidate.requires_source,
    source_required_reason: candidate.source_required_reason,
    human_review_required: candidate.human_review_required,
    duplicate_fingerprint: candidate.duplicate_fingerprint,
    raw_payload: candidate.raw_payload,
  }));
}

function dryRunUpload() {
  const candidates = readJson(FILES.final, []);
  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`dry_run_final_invalid:${validation.errors.join(',')}`);
  }
  const orthographyErrors = candidates.flatMap((candidate) => {
    const result = validateSpanishOrthography(candidate);
    return result.ok ? [] : result.errors.map((error) => `${candidate.candidate_id}:${error}`);
  });
  if (orthographyErrors.length > 0) {
    throw new Error(`dry_run_orthography_invalid:${orthographyErrors.join(',')}`);
  }

  const payload = buildPayload(candidates);
  const result = {
    mode: 'dry_run',
    target: 'generated_topic_candidates',
    expected_count: TOTAL_TARGET,
    would_insert: payload.length,
    status: payload.length === TOTAL_TARGET ? 'ok' : 'invalid_count',
    batch_code: `qgen-v2-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`,
    rpc_sequence: ['crear_generated_topic_batch', 'cargar_generated_topic_candidates'],
    forbidden_actions: ['revisar_generated_topic_candidate', 'convertir_generated_candidate_a_sugerencia', 'insert_temas', 'insert_votos'],
  };

  writeJson(FILES.upload, result);
  return result;
}

async function uploadReal() {
  if (process.env.QGEN_UPLOAD_CONFIRM !== 'true') {
    throw new Error('upload_blocked_requires_QGEN_UPLOAD_CONFIRM_true');
  }

  const dryRun = readJson(FILES.upload, null);
  if (!dryRun || dryRun.mode !== 'dry_run' || dryRun.status !== 'ok' || dryRun.would_insert !== TOTAL_TARGET) {
    throw new Error('successful_dry_run_required_before_upload');
  }

  const env = getSupabaseEnv();
  if (!env.url || !env.anonKey) {
    throw new Error('upload_requires_VITE_SUPABASE_URL_and_VITE_SUPABASE_ANON_KEY');
  }
  if (!env.accessToken) {
    throw new Error('upload_requires_access_token — ejecuta primero: npm run qgen:login');
  }

  const candidates = readJson(FILES.final, []);
  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`upload_final_invalid:${validation.errors.join(',')}`);
  }

  const client = createClient(env.url, env.anonKey, {
    global: { headers: { Authorization: `Bearer ${env.accessToken}` } },
  });

  const batchCode = dryRun.batch_code || `qgen-v2-${Date.now()}`;
  const { data: batchData, error: batchError } = await client.rpc('crear_generated_topic_batch', {
    p_batch_code: batchCode,
    p_expected_count: TOTAL_TARGET,
    p_source: 'question_generator_v2',
    p_ideological_profile: 'liberal_democratic',
    p_notes: 'Carga controlada de candidatos generados. No publica ni convierte.',
  });

  if (batchError) throw new Error(`crear_generated_topic_batch_failed:${batchError.message}`);
  const batchId = Array.isArray(batchData) ? batchData[0]?.batch_id : batchData?.batch_id;
  if (!batchId) throw new Error('batch_id_missing');

  const payload = buildPayload(candidates);
  const { data: loadData, error: loadError } = await client.rpc('cargar_generated_topic_candidates', {
    p_batch_id: batchId,
    p_candidates: payload,
  });

  if (loadError) throw new Error(`cargar_generated_topic_candidates_failed:${loadError.message}`);
  const loadResult = Array.isArray(loadData) ? loadData[0] : loadData;
  if (!loadResult || loadResult.inserted_rows !== TOTAL_TARGET || loadResult.candidate_ids?.length !== TOTAL_TARGET) {
    throw new Error('upload_inserted_rows_mismatch');
  }

  const result = {
    mode: 'real_upload',
    target: 'generated_topic_candidates',
    batch_id: batchId,
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    inserted_rows: loadResult.inserted_rows,
    candidate_ids: loadResult.candidate_ids,
    status: 'ok',
  };
  writeJson(FILES.upload, result);
  return result;
}

module.exports = { dryRunUpload, uploadReal, buildPayload };

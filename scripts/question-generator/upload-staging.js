const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const { FILES, DATA_DIR, TOTAL_TARGET, getSupabaseEnv } = require('./config');
const { readJson, writeJson } = require('./state');
const { validateFinalSet } = require('./editorial-rules');
const { validateSpanishOrthography } = require('./orthography');
const { TOPICS } = require('./topics');

const FILES_STAGING = {
  payload: path.join(DATA_DIR, 'upload_staging_payload.json'),
  sql: path.join(DATA_DIR, 'upload_staging.sql'),
  applyResult: path.join(DATA_DIR, 'apply_upload_result.json'),
  postAudit: path.join(DATA_DIR, 'post_upload_audit.md'),
};

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
    batch_code: `qgen-v1-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`,
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
  if (!env.url || !env.anonKey || !env.accessToken) {
    throw new Error('upload_requires_url_anon_key_and_QGEN_SUPABASE_ACCESS_TOKEN');
  }

  const candidates = readJson(FILES.final, []);
  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`upload_final_invalid:${validation.errors.join(',')}`);
  }

  const client = createClient(env.url, env.anonKey, {
    global: { headers: { Authorization: `Bearer ${env.accessToken}` } },
  });

  const batchCode = dryRun.batch_code || `qgen-v1-${Date.now()}`;
  const { data: batchData, error: batchError } = await client.rpc('crear_generated_topic_batch', {
    p_batch_code: batchCode,
    p_expected_count: TOTAL_TARGET,
    p_source: 'question_generator_v1',
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

const OFFICIAL_TOPICS = new Set(TOPICS.map((t) => t.id));
const FORBIDDEN_SQL_PATTERNS = ['DROP', 'ALTER', 'TRUNCATE', 'DELETE FROM'];
const ALLOWED_INSERT_TABLES = new Set(['generated_topic_batches', 'generated_topic_candidates']);
const ALLOWED_UPDATE_TABLES = new Set(['generated_topic_batches', 'generated_topic_candidates']);

function buildBatchCode(candidatesJson) {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const hash = crypto.createHash('sha256').update(candidatesJson).digest('hex').slice(0, 8);
  return `qgen_${ts}_${hash}`;
}

function buildStagingPayload(candidates, batchCode) {
  const topicCounts = {};
  for (const topic of OFFICIAL_TOPICS) topicCounts[topic] = 0;
  for (const c of candidates) {
    const topic = c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico;
    if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  return {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    source_file: 'data/question-generator/preguntas_finales.json',
    created_at: new Date().toISOString(),
    status: 'prepared',
    topics: topicCounts,
    candidates: buildPayload(candidates),
  };
}

function buildStagingSQL(candidates, batchCode) {
  const payload = buildPayload(candidates);
  const jsonStr = JSON.stringify(payload, null, 2);
  if (jsonStr.includes('$json_payload$')) {
    throw new Error('prepare_upload_json_contains_dollar_delimiter');
  }
  return `BEGIN;

-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := '${batchCode}';
  v_expected_count integer := ${TOTAL_TARGET};
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$${jsonStr}$json_payload$::jsonb;
BEGIN
  -- Aborta si batch_code ya existe
  IF EXISTS (SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code) THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;
  END IF;

  -- Inserta batch con status=draft
  INSERT INTO generated_topic_batches (batch_code, source, ideological_profile, status, expected_count, notes, created_at)
  VALUES (v_batch_code, 'question-generator', 'liberal_democratic', 'draft', v_expected_count, 'Carga automatica qgen. No publica ni convierte.', now())
  RETURNING id INTO v_batch_id;

  -- Inserta 80 candidatos desde el JSON
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,
    taxonomy_draft, ideological_axis, deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason, human_review_required,
    quality_score, neutrality_score, duplicate_fingerprint, raw_payload
  )
  SELECT
    v_batch_id,
    rec->>'titulo',
    rec->>'descripcion',
    rec->>'tipo_votacion',
    coalesce(rec->'opciones', '[]'::jsonb),
    rec->>'publico_objetivo',
    coalesce(rec->'taxonomy_draft', '{}'::jsonb),
    rec->>'ideological_axis',
    rec->>'deliberative_tension',
    rec->>'neutrality_notes',
    rec->>'quality_notes',
    coalesce(rec->'risk_flags', '[]'::jsonb),
    coalesce((rec->>'requires_source')::boolean, false),
    rec->>'source_required_reason',
    coalesce((rec->>'human_review_required')::boolean, true),
    null::integer,
    null::integer,
    rec->>'duplicate_fingerprint',
    rec->'raw_payload'
  FROM jsonb_array_elements(v_candidates) AS rec;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  -- Aborta si el conteo no cuadra
  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'conteo_invalido: insertados %, esperados %', v_inserted_count, v_expected_count;
  END IF;

  -- Aborta si hay duplicados por fingerprint dentro del batch
  SELECT count(*) INTO v_dup_count
  FROM (
    SELECT duplicate_fingerprint
    FROM generated_topic_candidates
    WHERE batch_id = v_batch_id
    GROUP BY duplicate_fingerprint
    HAVING count(*) > 1
  ) dups;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'duplicados_por_fingerprint: %', v_dup_count;
  END IF;

  -- Actualiza batch a status=loaded
  UPDATE generated_topic_batches
  SET status = 'loaded', inserted_count = v_inserted_count, updated_at = now()
  WHERE id = v_batch_id;

END $qgen$;

COMMIT;
`;
}

function validateSQLSecurity(sqlContent) {
  // Only check the SQL structure (outside dollar-quoted JSON payload) for forbidden patterns
  const sqlWithoutPayload = sqlContent.replace(/\$json_payload\$[\s\S]*?\$json_payload\$/g, '$json_payload$PAYLOAD_REMOVED$json_payload$');
  const upper = sqlWithoutPayload.toUpperCase();
  for (const forbidden of FORBIDDEN_SQL_PATTERNS) {
    const regex = new RegExp(`\\b${forbidden.replace(' ', '\\s+')}\\b`);
    if (regex.test(upper)) {
      throw new Error(`prepare_upload_sql_contains_forbidden_pattern:${forbidden}`);
    }
  }
  const insertMatches = sqlWithoutPayload.match(/INSERT\s+INTO\s+(\w+)/gi) || [];
  for (const match of insertMatches) {
    const table = match.replace(/INSERT\s+INTO\s+/i, '').trim();
    if (!ALLOWED_INSERT_TABLES.has(table)) {
      throw new Error(`prepare_upload_sql_inserts_into_forbidden_table:${table}`);
    }
  }
  const updateMatches = sqlWithoutPayload.match(/UPDATE\s+(\w+)/gi) || [];
  for (const match of updateMatches) {
    const table = match.replace(/UPDATE\s+/i, '').trim();
    if (!ALLOWED_UPDATE_TABLES.has(table)) {
      throw new Error(`prepare_upload_sql_updates_forbidden_table:${table}`);
    }
  }
}

function prepareUpload() {
  if (process.env.QGEN_SUPABASE_ACCESS_TOKEN) {
    throw new Error('prepare_upload_must_not_use_QGEN_SUPABASE_ACCESS_TOKEN');
  }

  const dryRunResult = readJson(FILES.upload, null);
  if (!dryRunResult || dryRunResult.mode !== 'dry_run' || dryRunResult.status !== 'ok' || dryRunResult.would_insert !== TOTAL_TARGET) {
    throw new Error('prepare_upload_requires_approved_dry_run');
  }

  const candidates = readJson(FILES.final, []);
  if (!Array.isArray(candidates) || candidates.length !== TOTAL_TARGET) {
    throw new Error(`prepare_upload_expected_${TOTAL_TARGET}_finales_got_${candidates.length}`);
  }

  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`prepare_upload_final_invalid:${validation.errors.join(',')}`);
  }

  const topicCounts = {};
  for (const c of candidates) {
    const topic = c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico;
    if (!topic || !OFFICIAL_TOPICS.has(topic)) throw new Error(`prepare_upload_invalid_topic:${topic}`);
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  const missingTopics = [...OFFICIAL_TOPICS].filter((t) => !topicCounts[t]);
  if (missingTopics.length > 0) throw new Error(`prepare_upload_missing_topics:${missingTopics.join(',')}`);
  const wrongCounts = Object.entries(topicCounts).filter(([, n]) => n !== 5);
  if (wrongCounts.length > 0) throw new Error(`prepare_upload_distribution_invalid:${wrongCounts.map(([t, n]) => `${t}=${n}`).join(',')}`);

  const fingerprints = candidates.map((c) => c.duplicate_fingerprint);
  const uniqueFingerprints = new Set(fingerprints);
  if (uniqueFingerprints.size !== candidates.length) throw new Error('prepare_upload_duplicate_fingerprints_detected');

  const candidatesJsonForHash = JSON.stringify(buildPayload(candidates));
  const batchCode = buildBatchCode(candidatesJsonForHash);

  const stagingPayload = buildStagingPayload(candidates, batchCode);
  const stagingSql = buildStagingSQL(candidates, batchCode);

  validateSQLSecurity(stagingSql);

  writeJson(FILES_STAGING.payload, stagingPayload);
  fs.writeFileSync(FILES_STAGING.sql, stagingSql, 'utf8');

  return {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    payload_file: FILES_STAGING.payload,
    sql_file: FILES_STAGING.sql,
    status: 'prepared',
    topics: stagingPayload.topics,
  };
}

async function applyUpload() {
  if (process.env.QGEN_APPLY_UPLOAD_CONFIRM !== 'true') {
    throw new Error('apply_upload_requires_QGEN_APPLY_UPLOAD_CONFIRM_true');
  }

  if (!fs.existsSync(FILES_STAGING.sql)) {
    throw new Error('apply_upload_requires_upload_staging_sql');
  }
  if (!fs.existsSync(FILES_STAGING.payload)) {
    throw new Error('apply_upload_requires_upload_staging_payload_json');
  }

  const payload = readJson(FILES_STAGING.payload, null);
  if (!payload || payload.status !== 'prepared') {
    throw new Error('apply_upload_payload_not_prepared');
  }
  if (!Array.isArray(payload.candidates) || payload.candidates.length !== TOTAL_TARGET) {
    throw new Error(`apply_upload_payload_must_have_${TOTAL_TARGET}_candidates`);
  }

  const sqlContent = fs.readFileSync(FILES_STAGING.sql, 'utf8');
  validateSQLSecurity(sqlContent);

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error('apply_upload_requires_SUPABASE_DB_URL_or_manual_sql_execution');
  }

  execSync(`psql "${dbUrl}" -f "${FILES_STAGING.sql}"`, { stdio: 'inherit' });

  const result = {
    mode: 'apply_upload',
    batch_code: payload.batch_code,
    expected_count: TOTAL_TARGET,
    status: 'ok',
    executed_at: new Date().toISOString(),
    method: 'psql',
  };
  writeJson(FILES_STAGING.applyResult, result);
  return result;
}

module.exports = { dryRunUpload, uploadReal, buildPayload, prepareUpload, applyUpload, FILES_STAGING };

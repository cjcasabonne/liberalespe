const fs = require('fs');
const crypto = require('crypto');
const { FILES, DATA_DIR, TOTAL_TARGET, PER_TOPIC_TARGET } = require('./config');
const { readJson, writeJson } = require('./state');
const { TOPICS } = require('./topics');
const { validateFinalSet } = require('./editorial-rules');
const { validateSpanishOrthography } = require('./orthography');

const OFFICIAL_TOPIC_IDS = new Set(TOPICS.map((t) => t.id));

function generateBatchCode() {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const hash = crypto.randomBytes(4).toString('hex');
  return `qgen_${ts}_${hash}`;
}

function getTopicForCandidate(candidate) {
  return candidate.raw_payload?.topic_target || candidate.topic || null;
}

function validatePreConditions(candidates, dryRunResult) {
  if (process.env.QGEN_SUPABASE_ACCESS_TOKEN) {
    throw new Error('prepare_upload_refuses_QGEN_SUPABASE_ACCESS_TOKEN');
  }

  const sessionFile = require('path').join(DATA_DIR, '.session.local.json');
  if (fs.existsSync(sessionFile)) {
    throw new Error('prepare_upload_refuses_session_local_json');
  }

  if (!dryRunResult || dryRunResult.mode !== 'dry_run' || dryRunResult.status !== 'ok') {
    throw new Error('prepare_upload_requires_approved_dry_run');
  }
  if (dryRunResult.would_insert !== TOTAL_TARGET) {
    throw new Error(`prepare_upload_dry_run_expected_count_mismatch:${dryRunResult.would_insert}`);
  }

  if (!Array.isArray(candidates) || candidates.length !== TOTAL_TARGET) {
    throw new Error(`prepare_upload_invalid_count:${candidates?.length ?? 0}`);
  }

  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`prepare_upload_final_set_invalid:${validation.errors.join(',')}`);
  }

  const orthographyErrors = candidates.flatMap((c) => {
    const result = validateSpanishOrthography(c);
    return result.ok ? [] : result.errors.map((e) => `${c.candidate_id}:${e}`);
  });
  if (orthographyErrors.length > 0) {
    throw new Error(`prepare_upload_orthography_invalid:${orthographyErrors.join(',')}`);
  }

  const topicCounts = {};
  for (const candidate of candidates) {
    const topic = getTopicForCandidate(candidate);
    if (!topic) throw new Error('prepare_upload_candidate_missing_topic');
    if (!OFFICIAL_TOPIC_IDS.has(topic)) throw new Error(`prepare_upload_invalid_topic:${topic}`);
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  for (const topicDef of TOPICS) {
    const count = topicCounts[topicDef.id] || 0;
    if (count !== PER_TOPIC_TARGET) {
      throw new Error(`prepare_upload_topic_count_mismatch:${topicDef.id}:${count}`);
    }
  }

  const fingerprints = new Set();
  for (const candidate of candidates) {
    const fp = candidate.duplicate_fingerprint;
    if (!fp) throw new Error('prepare_upload_missing_fingerprint');
    if (fingerprints.has(fp)) throw new Error(`prepare_upload_duplicate_fingerprint:${fp}`);
    fingerprints.add(fp);
  }

  for (const candidate of candidates) {
    if (!candidate.titulo?.startsWith('¿') || !candidate.titulo?.endsWith('?')) {
      throw new Error(`prepare_upload_titulo_format_invalid:${candidate.candidate_id}`);
    }
  }

  return topicCounts;
}

function buildPayloadCandidates(candidates) {
  return candidates.map((candidate) => ({
    topic: getTopicForCandidate(candidate),
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
    source_required_reason: candidate.source_required_reason ?? null,
    human_review_required: true,
    quality_score: candidate.quality_score ?? null,
    neutrality_score: candidate.neutrality_score ?? null,
    duplicate_fingerprint: candidate.duplicate_fingerprint,
    status: 'pending_review',
    raw_payload: candidate.raw_payload ?? {},
  }));
}

function buildStagingPayload(candidates, batchCode, topicCounts) {
  const topicsSummary = {};
  for (const topicDef of TOPICS) {
    topicsSummary[topicDef.id] = topicCounts[topicDef.id] ?? 0;
  }
  return {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    source_file: 'data/question-generator/preguntas_finales.json',
    created_at: new Date().toISOString(),
    status: 'prepared',
    topics: topicsSummary,
    candidates: buildPayloadCandidates(candidates),
  };
}

function buildStagingSQL(payload) {
  const batchCode = payload.batch_code;
  const expectedCount = payload.expected_count;
  const candidatesJson = JSON.stringify(payload.candidates, null, 2);

  if (candidatesJson.includes('$json_payload$')) {
    throw new Error('prepare_upload_json_contains_forbidden_dollar_quote_sequence');
  }

  return `-- upload_staging.sql
-- Generado por qgen prepare-upload (${new Date().toISOString()})
-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias
-- Batch: ${batchCode}
-- Candidatos: ${expectedCount}

BEGIN;

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := '${batchCode}';
  v_expected_count integer := ${expectedCount};
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$${candidatesJson}$json_payload$::jsonb;
BEGIN

  -- Aborta si batch_code ya existe
  IF EXISTS (SELECT 1 FROM public.generated_topic_batches WHERE batch_code = v_batch_code) THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;
  END IF;

  -- Inserta batch con status='draft'
  INSERT INTO public.generated_topic_batches (
    batch_code, source, ideological_profile, status, expected_count, notes, created_at
  )
  VALUES (
    v_batch_code,
    'question-generator',
    'liberal_democratic',
    'draft',
    v_expected_count,
    'Carga controlada de candidatos generados por qgen v4. Revision humana posterior obligatoria.',
    now()
  )
  RETURNING id INTO v_batch_id;

  -- Inserta ${expectedCount} candidatos desde el JSON
  INSERT INTO public.generated_topic_candidates (
    batch_id,
    titulo,
    descripcion,
    tipo_votacion,
    opciones,
    publico_objetivo,
    taxonomy_draft,
    ideological_axis,
    deliberative_tension,
    neutrality_notes,
    quality_notes,
    risk_flags,
    requires_source,
    source_required_reason,
    human_review_required,
    quality_score,
    neutrality_score,
    duplicate_fingerprint,
    raw_payload
  )
  SELECT
    v_batch_id,
    btrim(rec->>'titulo'),
    nullif(btrim(coalesce(rec->>'descripcion', '')), ''),
    btrim(rec->>'tipo_votacion'),
    coalesce(rec->'opciones', '[]'::jsonb),
    btrim(rec->>'publico_objetivo'),
    coalesce(rec->'taxonomy_draft', '{}'::jsonb),
    nullif(btrim(coalesce(rec->>'ideological_axis', '')), ''),
    nullif(btrim(coalesce(rec->>'deliberative_tension', '')), ''),
    nullif(btrim(coalesce(rec->>'neutrality_notes', '')), ''),
    nullif(btrim(coalesce(rec->>'quality_notes', '')), ''),
    coalesce(rec->'risk_flags', '[]'::jsonb),
    coalesce((rec->>'requires_source')::boolean, false),
    nullif(btrim(coalesce(rec->>'source_required_reason', '')), ''),
    true,
    CASE WHEN rec->>'quality_score' IS NOT NULL AND rec->>'quality_score' != 'null'
      THEN (rec->>'quality_score')::integer ELSE NULL END,
    CASE WHEN rec->>'neutrality_score' IS NOT NULL AND rec->>'neutrality_score' != 'null'
      THEN (rec->>'neutrality_score')::integer ELSE NULL END,
    btrim(rec->>'duplicate_fingerprint'),
    rec
  FROM jsonb_array_elements(v_candidates) AS rec;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  -- Aborta si el conteo no cuadra
  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'conteo_invalido: insertados %, esperados %', v_inserted_count, v_expected_count;
  END IF;

  -- Verifica que no hay duplicados por fingerprint dentro del batch
  SELECT COUNT(*) - COUNT(DISTINCT duplicate_fingerprint)
  INTO v_dup_count
  FROM public.generated_topic_candidates
  WHERE batch_id = v_batch_id;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'duplicados_por_fingerprint_en_batch: %', v_dup_count;
  END IF;

  -- Actualiza batch a status='loaded'
  UPDATE public.generated_topic_batches
  SET
    status = 'loaded',
    inserted_count = v_inserted_count,
    updated_at = now()
  WHERE id = v_batch_id;

END $qgen$;

COMMIT;
`;
}

function prepareUpload() {
  const dryRunResult = readJson(FILES.upload, null);
  const candidates = readJson(FILES.final, []);

  const topicCounts = validatePreConditions(candidates, dryRunResult);

  const batchCode = generateBatchCode();
  const stagingPayload = buildStagingPayload(candidates, batchCode, topicCounts);
  const stagingSql = buildStagingSQL(stagingPayload);

  writeJson(FILES.stagingPayload, stagingPayload);
  fs.writeFileSync(FILES.stagingSql, stagingSql, 'utf8');

  return {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    topics: TOPICS.length,
    per_topic: PER_TOPIC_TARGET,
    payload_file: 'data/question-generator/upload_staging_payload.json',
    sql_file: 'data/question-generator/upload_staging.sql',
    status: 'prepared',
  };
}

module.exports = { prepareUpload };

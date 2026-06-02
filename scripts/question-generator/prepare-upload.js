const crypto = require('crypto');
const fs = require('fs');
const { FILES, TOTAL_TARGET, PER_TOPIC_TARGET } = require('./config');
const { readJson, writeJson, writeCheckpoint } = require('./state');
const { TOPICS } = require('./topics');
const { validateFinalSet } = require('./editorial-rules');
const { fixVisibleCandidateText, validateSpanishOrthography } = require('./orthography');

const OFFICIAL_TOPICS = new Set(TOPICS.map((t) => t.id));

function buildBatchCode(candidates) {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const hash = crypto.createHash('sha256').update(JSON.stringify(candidates)).digest('hex').slice(0, 8);
  return `qgen_${ts}_${hash}`;
}

function buildSqlCandidate(c) {
  return {
    topic: c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico || '',
    titulo: c.titulo,
    descripcion: c.descripcion,
    tipo_votacion: c.tipo_votacion,
    opciones: c.opciones,
    publico_objetivo: c.publico_objetivo,
    taxonomy_draft: c.taxonomy_draft,
    ideological_axis: c.ideological_axis,
    deliberative_tension: c.deliberative_tension,
    neutrality_notes: c.neutrality_notes,
    quality_notes: c.quality_notes,
    risk_flags: c.risk_flags,
    requires_source: c.requires_source,
    source_required_reason: c.source_required_reason,
    human_review_required: c.human_review_required,
    quality_score: c.quality_score ?? null,
    neutrality_score: c.neutrality_score ?? null,
    duplicate_fingerprint: c.duplicate_fingerprint,
    status: 'pending_review',
    raw_payload: c.raw_payload ?? {},
  };
}

function generateSql(batchCode, sqlCandidates) {
  const jsonPayload = JSON.stringify(sqlCandidates, null, 2);

  if (jsonPayload.includes('$json_payload$')) {
    throw new Error('prepare_upload_sql_delimiter_collision');
  }

  return `-- upload_staging.sql — generado por qgen:prepare-upload
-- batch_code: ${batchCode}
-- expected_count: ${TOTAL_TARGET}
-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias

BEGIN;

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := '${batchCode}';
  v_expected_count integer := ${TOTAL_TARGET};
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$${jsonPayload}$json_payload$::jsonb;
BEGIN
  IF EXISTS (SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code) THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;
  END IF;

  INSERT INTO generated_topic_batches (batch_code, source, ideological_profile, status, expected_count, notes, created_at)
  VALUES (
    v_batch_code,
    'question-generator',
    'liberal_democratic',
    'draft',
    v_expected_count,
    'Carga controlada de candidatos generados por qgen v1. No publica ni convierte.',
    now()
  )
  RETURNING id INTO v_batch_id;

  INSERT INTO generated_topic_candidates (
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
    rec->>'titulo',
    NULLIF(btrim(COALESCE(rec->>'descripcion', '')), ''),
    rec->>'tipo_votacion',
    COALESCE(rec->'opciones', '[]'::jsonb),
    rec->>'publico_objetivo',
    COALESCE(rec->'taxonomy_draft', '{}'::jsonb),
    NULLIF(btrim(COALESCE(rec->>'ideological_axis', '')), ''),
    NULLIF(btrim(COALESCE(rec->>'deliberative_tension', '')), ''),
    NULLIF(btrim(COALESCE(rec->>'neutrality_notes', '')), ''),
    NULLIF(btrim(COALESCE(rec->>'quality_notes', '')), ''),
    COALESCE(rec->'risk_flags', '[]'::jsonb),
    COALESCE((rec->>'requires_source')::boolean, false),
    NULLIF(btrim(COALESCE(rec->>'source_required_reason', '')), ''),
    true,
    NULL,
    NULL,
    rec->>'duplicate_fingerprint',
    rec
  FROM jsonb_array_elements(v_candidates) AS rec;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'conteo_invalido: insertados %, esperados %', v_inserted_count, v_expected_count;
  END IF;

  SELECT COUNT(*) INTO v_dup_count
  FROM (
    SELECT duplicate_fingerprint
    FROM generated_topic_candidates
    WHERE batch_id = v_batch_id
    GROUP BY duplicate_fingerprint
    HAVING COUNT(*) > 1
  ) dups;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'duplicados_en_batch: %', v_dup_count;
  END IF;

  UPDATE generated_topic_batches
  SET status = 'loaded', inserted_count = v_inserted_count, updated_at = now()
  WHERE id = v_batch_id;

END $qgen$;

COMMIT;
`;
}

function prepareUpload() {
  const dryRun = readJson(FILES.upload, null);
  if (!dryRun || dryRun.mode !== 'dry_run' || dryRun.status !== 'ok' || dryRun.would_insert !== TOTAL_TARGET) {
    throw new Error('prepare_upload_requires_approved_dry_run');
  }

  const raw = readJson(FILES.final, null);
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('preguntas_finales_missing_or_invalid');
  }

  const candidates = raw.map(fixVisibleCandidateText);

  const orthographyErrors = candidates.flatMap((c) => {
    const r = validateSpanishOrthography(c);
    return r.ok ? [] : r.errors.map((e) => `${c.candidate_id}:${e}`);
  });
  if (orthographyErrors.length > 0) {
    throw new Error(`prepare_upload_orthography_invalid:${orthographyErrors.join(',')}`);
  }

  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`prepare_upload_final_invalid:${validation.errors.join(',')}`);
  }

  const countByTopic = {};
  for (const c of candidates) {
    const topic = c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico;
    countByTopic[topic] = (countByTopic[topic] || 0) + 1;
  }

  for (const topic of OFFICIAL_TOPICS) {
    const count = countByTopic[topic] ?? 0;
    if (count !== PER_TOPIC_TARGET) {
      throw new Error(`prepare_upload_topic_invalid:${topic}:got_${count}_expected_${PER_TOPIC_TARGET}`);
    }
  }

  const batchCode = buildBatchCode(candidates);
  const sqlCandidates = candidates.map(buildSqlCandidate);

  const payload = {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    source_file: 'data/question-generator/preguntas_finales.json',
    created_at: new Date().toISOString(),
    status: 'prepared',
    topics: countByTopic,
    candidates: sqlCandidates,
  };

  const sql = generateSql(batchCode, sqlCandidates);

  writeJson(FILES.uploadPayload, payload);
  fs.writeFileSync(FILES.uploadSql, sql, 'utf8');

  const checkpoint = writeCheckpoint('FASE_6_PREPARE_UPLOAD', 'checkpoint', {
    phase: 'PREPARE_UPLOAD',
    processed_count: TOTAL_TARGET,
    accumulated_count: TOTAL_TARGET,
    topic_progress: countByTopic,
    batch_code: batchCode,
    next_action: 'execute_upload_staging_sql_via_supabase_mcp_or_qgen_apply_upload',
  });

  return { batch_code: batchCode, expected_count: TOTAL_TARGET, checkpoint };
}

module.exports = { prepareUpload };

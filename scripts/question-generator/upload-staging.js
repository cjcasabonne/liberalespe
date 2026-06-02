const fs = require('fs');
const crypto = require('crypto');
const { FILES, TOTAL_TARGET, PER_TOPIC_TARGET, getSupabaseEnv } = require('./config');
const { TOPICS } = require('./topics');
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
    batch_code: `qgen-v1-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`,
    rpc_sequence: ['crear_generated_topic_batch', 'cargar_generated_topic_candidates'],
    forbidden_actions: ['revisar_generated_topic_candidate', 'convertir_generated_candidate_a_sugerencia', 'insert_temas', 'insert_votos'],
  };

  writeJson(FILES.upload, result);
  return result;
}

function buildStagingSql(batchCode, candidatesJson) {
  const dollarTag = '$qgen_candidates_v1$';
  return `BEGIN;\n\n` +
    `-- Artefacto generado por qgen:prepare-upload.\n` +
    `-- NO ejecutar sin autorización explícita del operador.\n` +
    `-- NO toca temas. NO toca votos. NO toca tema_sugerencias.\n` +
    `-- Solo inserta en generated_topic_batches y generated_topic_candidates.\n` +
    `-- La revisión humana ocurre después en el panel Generador.\n\n` +
    `DO $$\n` +
    `DECLARE\n` +
    `  v_batch_id uuid;\n` +
    `  v_batch_code text := '${batchCode}';\n` +
    `  v_expected_count integer := ${TOTAL_TARGET};\n` +
    `  v_inserted_count integer;\n` +
    `  v_duplicate_count integer;\n` +
    `BEGIN\n` +
    `  IF EXISTS (\n` +
    `    SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code\n` +
    `  ) THEN\n` +
    `    RAISE EXCEPTION 'Batch code ya cargado: %', v_batch_code;\n` +
    `  END IF;\n\n` +
    `  INSERT INTO generated_topic_batches (\n` +
    `    batch_code, status, expected_count, source, metadata, created_at\n` +
    `  )\n` +
    `  VALUES (\n` +
    `    v_batch_code,\n` +
    `    'pending_review',\n` +
    `    v_expected_count,\n` +
    `    'question-generator',\n` +
    `    jsonb_build_object(\n` +
    `      'prepared_by', 'qgen:prepare-upload',\n` +
    `      'review_flow', 'panel_generador',\n` +
    `      'does_not_touch', ARRAY['temas', 'votos', 'tema_sugerencias']\n` +
    `    ),\n` +
    `    now()\n` +
    `  )\n` +
    `  RETURNING id INTO v_batch_id;\n\n` +
    `  WITH candidates_data(candidate) AS (\n` +
    `    SELECT jsonb_array_elements(${dollarTag}\n` +
    `${candidatesJson}\n` +
    `${dollarTag}::jsonb)\n` +
    `  )\n` +
    `  INSERT INTO generated_topic_candidates (\n` +
    `    batch_id, topic, title, description, options,\n` +
    `    duplicate_fingerprint, status, raw_payload, created_at\n` +
    `  )\n` +
    `  SELECT\n` +
    `    v_batch_id,\n` +
    `    COALESCE(candidate->'raw_payload'->>'topic_target', candidate->'taxonomy_draft'->>'eje_tematico'),\n` +
    `    candidate->>'titulo',\n` +
    `    candidate->>'descripcion',\n` +
    `    candidate->'opciones',\n` +
    `    candidate->>'duplicate_fingerprint',\n` +
    `    'pending_review',\n` +
    `    candidate,\n` +
    `    now()\n` +
    `  FROM candidates_data;\n\n` +
    `  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;\n\n` +
    `  IF v_inserted_count <> v_expected_count THEN\n` +
    `    RAISE EXCEPTION 'Conteo inválido. Insertados %, esperados %', v_inserted_count, v_expected_count;\n` +
    `  END IF;\n\n` +
    `  SELECT COUNT(*) INTO v_duplicate_count\n` +
    `  FROM (\n` +
    `    SELECT duplicate_fingerprint\n` +
    `    FROM generated_topic_candidates\n` +
    `    WHERE batch_id = v_batch_id\n` +
    `    GROUP BY duplicate_fingerprint\n` +
    `    HAVING COUNT(*) > 1\n` +
    `  ) d;\n\n` +
    `  IF v_duplicate_count > 0 THEN\n` +
    `    RAISE EXCEPTION 'Duplicados detectados por batch/fingerprint: %', v_duplicate_count;\n` +
    `  END IF;\n\n` +
    `  UPDATE generated_topic_batches\n` +
    `  SET status = 'pending_review', inserted_count = v_inserted_count, updated_at = now()\n` +
    `  WHERE id = v_batch_id;\n` +
    `END $$;\n\n` +
    `COMMIT;\n`;
}

function prepareUpload() {
  if (process.env.QGEN_SUPABASE_ACCESS_TOKEN) {
    throw new Error('prepare_upload_aborted:QGEN_SUPABASE_ACCESS_TOKEN_not_allowed_in_prepare-upload');
  }

  const dryRunResult = readJson(FILES.upload, null);
  if (!dryRunResult || dryRunResult.mode !== 'dry_run' || dryRunResult.status !== 'ok') {
    throw new Error('prepare_upload_requires_approved_dry_run:run_qgen_dry-run_first');
  }
  const dryRunCount = dryRunResult.would_insert ?? dryRunResult.expected_count;
  if (dryRunCount !== TOTAL_TARGET) {
    throw new Error(`prepare_upload_dry_run_count_mismatch:expected_${TOTAL_TARGET}_got_${dryRunCount}`);
  }

  const candidates = readJson(FILES.final, null);
  if (!candidates) {
    throw new Error('prepare_upload_preguntas_finales_missing');
  }
  if (!Array.isArray(candidates) || candidates.length !== TOTAL_TARGET) {
    const got = Array.isArray(candidates) ? candidates.length : 'non-array';
    throw new Error(`prepare_upload_invalid_count:expected_${TOTAL_TARGET}_got_${got}`);
  }

  const officialTopicIds = TOPICS.map((t) => t.id);
  const byTopic = {};
  for (const candidate of candidates) {
    const topic = candidate.raw_payload?.topic_target || candidate.taxonomy_draft?.eje_tematico;
    if (!topic || !officialTopicIds.includes(topic)) {
      throw new Error(`prepare_upload_invalid_topic:${topic}:candidate_${candidate.candidate_id}`);
    }
    byTopic[topic] = (byTopic[topic] || 0) + 1;
  }
  for (const topicId of officialTopicIds) {
    const count = byTopic[topicId] || 0;
    if (count !== PER_TOPIC_TARGET) {
      throw new Error(`prepare_upload_topic_count_invalid:${topicId}=${count}_expected_${PER_TOPIC_TARGET}`);
    }
  }

  const fingerprints = new Set();
  for (const candidate of candidates) {
    if (!candidate.duplicate_fingerprint) {
      throw new Error(`prepare_upload_missing_fingerprint:${candidate.candidate_id}`);
    }
    if (fingerprints.has(candidate.duplicate_fingerprint)) {
      throw new Error(`prepare_upload_duplicate_fingerprint:${candidate.duplicate_fingerprint}`);
    }
    fingerprints.add(candidate.duplicate_fingerprint);
  }

  for (const candidate of candidates) {
    if (!candidate.titulo || !candidate.titulo.startsWith('¿') || !candidate.titulo.endsWith('?')) {
      throw new Error(`prepare_upload_invalid_title_format:${candidate.candidate_id}`);
    }
  }

  const orthographyErrors = candidates.flatMap((candidate) => {
    const result = validateSpanishOrthography(candidate);
    return result.ok ? [] : result.errors.map((e) => `${candidate.candidate_id}:${e}`);
  });
  if (orthographyErrors.length > 0) {
    throw new Error(`prepare_upload_orthography_invalid:${orthographyErrors.slice(0, 3).join(';')}`);
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
  const hashInput = candidates.map((c) => c.duplicate_fingerprint).sort().join(':');
  const shortHash = crypto.createHash('sha256').update(hashInput).digest('hex').slice(0, 8);
  const batchCode = `qgen_${dateStr}_${timeStr}_${shortHash}`;

  const topicCounts = {};
  for (const topicId of officialTopicIds) {
    topicCounts[topicId] = byTopic[topicId];
  }

  const stagingPayload = {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    source_file: 'data/question-generator/preguntas_finales.json',
    created_at: now.toISOString(),
    status: 'prepared',
    topics: topicCounts,
    candidates: candidates.map((c) => ({
      topic: c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico,
      title: c.titulo,
      description: c.descripcion,
      options: c.opciones,
      duplicate_fingerprint: c.duplicate_fingerprint,
      status: 'pending_review',
      raw_payload: c,
    })),
  };
  writeJson(FILES.uploadStagingPayload, stagingPayload);

  const candidatesJson = JSON.stringify(candidates, null, 2);
  const sql = buildStagingSql(batchCode, candidatesJson);
  fs.writeFileSync(FILES.uploadStagingSql, sql, 'utf8');

  return {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    candidates_count: candidates.length,
    topics_count: officialTopicIds.length,
    artifacts: [
      'data/question-generator/upload_staging_payload.json',
      'data/question-generator/upload_staging.sql',
    ],
    dry_run_passed: true,
    prepare_upload_passed: true,
    manual_token_required: false,
    qgen_login_required: false,
    session_file_required: false,
    real_upload_executed: false,
    next_action: 'apply_staging_sql_with_explicit_authorization_or_review_payload',
    status: 'prepared',
  };
}

// uploadReal is deprecated. The new flow uses qgen:prepare-upload.
// Claude Code / Supabase CLI applies upload_staging.sql with explicit authorization.
async function uploadReal() {
  throw new Error(
    'uploadReal_deprecated:use_qgen:prepare-upload_then_apply_upload_staging.sql_with_explicit_authorization'
  );
}

module.exports = { dryRunUpload, uploadReal, buildPayload, prepareUpload };

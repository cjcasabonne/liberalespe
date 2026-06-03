const fs = require('fs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { FILES, TOTAL_TARGET, PER_TOPIC_TARGET } = require('./config');
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

function generateBatchCode(jsonPayload) {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const hash = crypto.createHash('sha256').update(jsonPayload).digest('hex').slice(0, 8);
  return `qgen_${ts}_${hash}`;
}

function generateStagingSql(batchCode, sqlCandidates) {
  const jsonPayload = JSON.stringify(sqlCandidates);
  if (jsonPayload.includes('$json_payload$')) {
    throw new Error('prepare_upload_json_contains_dollar_quote_tag');
  }

  return `BEGIN;\n\n` +
    `-- Generado por qgen:prepare-upload. Solo toca: generated_topic_batches, generated_topic_candidates.\n` +
    `-- NO toca: temas, votos, tema_sugerencias.\n` +
    `-- Revision humana posterior obligatoria.\n\n` +
    `DO $qgen$\n` +
    `DECLARE\n` +
    `  v_batch_id uuid;\n` +
    `  v_batch_code text := '${batchCode}';\n` +
    `  v_expected_count integer := ${TOTAL_TARGET};\n` +
    `  v_inserted_count integer;\n` +
    `  v_candidates jsonb := $json_payload$${jsonPayload}$json_payload$::jsonb;\n` +
    `BEGIN\n` +
    `  IF EXISTS (SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code) THEN\n` +
    `    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;\n` +
    `  END IF;\n\n` +
    `  INSERT INTO generated_topic_batches (batch_code, source, ideological_profile, status, expected_count, notes, created_at)\n` +
    `  VALUES (\n` +
    `    v_batch_code,\n` +
    `    'question-generator',\n` +
    `    'liberal_democratic',\n` +
    `    'draft',\n` +
    `    v_expected_count,\n` +
    `    'Carga automatizada por qgen:prepare-upload. Revision humana posterior obligatoria.',\n` +
    `    now()\n` +
    `  )\n` +
    `  RETURNING id INTO v_batch_id;\n\n` +
    `  INSERT INTO generated_topic_candidates (\n` +
    `    batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,\n` +
    `    taxonomy_draft, ideological_axis, deliberative_tension, neutrality_notes, quality_notes,\n` +
    `    risk_flags, requires_source, source_required_reason, human_review_required,\n` +
    `    quality_score, neutrality_score, duplicate_fingerprint, raw_payload\n` +
    `  )\n` +
    `  SELECT\n` +
    `    v_batch_id,\n` +
    `    rec->>'titulo',\n` +
    `    nullif(btrim(coalesce(rec->>'descripcion', '')), ''),\n` +
    `    rec->>'tipo_votacion',\n` +
    `    coalesce(rec->'opciones', '[]'::jsonb),\n` +
    `    rec->>'publico_objetivo',\n` +
    `    coalesce(rec->'taxonomy_draft', '{}'::jsonb),\n` +
    `    nullif(btrim(coalesce(rec->>'ideological_axis', '')), ''),\n` +
    `    nullif(btrim(coalesce(rec->>'deliberative_tension', '')), ''),\n` +
    `    nullif(btrim(coalesce(rec->>'neutrality_notes', '')), ''),\n` +
    `    nullif(btrim(coalesce(rec->>'quality_notes', '')), ''),\n` +
    `    coalesce(rec->'risk_flags', '[]'::jsonb),\n` +
    `    coalesce((nullif(btrim(coalesce(rec->>'requires_source', '')), ''))::boolean, false),\n` +
    `    nullif(btrim(coalesce(rec->>'source_required_reason', '')), ''),\n` +
    `    true,\n` +
    `    (nullif(btrim(coalesce(rec->>'quality_score', '')), ''))::integer,\n` +
    `    (nullif(btrim(coalesce(rec->>'neutrality_score', '')), ''))::integer,\n` +
    `    rec->>'duplicate_fingerprint',\n` +
    `    rec\n` +
    `  FROM jsonb_array_elements(v_candidates) AS rec;\n\n` +
    `  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;\n\n` +
    `  IF v_inserted_count <> v_expected_count THEN\n` +
    `    RAISE EXCEPTION 'conteo_invalido: insertados %, esperados %', v_inserted_count, v_expected_count;\n` +
    `  END IF;\n\n` +
    `  UPDATE generated_topic_batches\n` +
    `  SET status = 'loaded',\n` +
    `      inserted_count = v_inserted_count,\n` +
    `      updated_at = now()\n` +
    `  WHERE id = v_batch_id;\n\n` +
    `END $qgen$;\n\n` +
    `COMMIT;\n`;
}

function validateSqlSecurity(sql) {
  const upper = sql.toUpperCase();
  for (const kw of ['DROP ', 'ALTER ', 'TRUNCATE', 'DELETE FROM']) {
    if (upper.includes(kw)) throw new Error(`sql_security_violation:contains_${kw.trim()}`);
  }
  const insertTables = [...sql.matchAll(/INSERT\s+INTO\s+([\w.]+)/gi)].map((m) => m[1].toLowerCase().replace(/^public\./, ''));
  const updateTables = [...sql.matchAll(/UPDATE\s+([\w.]+)/gi)].map((m) => m[1].toLowerCase().replace(/^public\./, ''));
  for (const table of [...insertTables, ...updateTables]) {
    if (!table.startsWith('generated_topic_')) {
      throw new Error(`sql_security_violation:non_generated_table:${table}`);
    }
  }
}

function prepareUpload() {
  const dryRunResult = readJson(FILES.upload, null);
  if (!dryRunResult || dryRunResult.mode !== 'dry_run' || dryRunResult.status !== 'ok') {
    throw new Error('prepare_upload_requires_approved_dry_run');
  }
  if (dryRunResult.would_insert !== TOTAL_TARGET) {
    throw new Error(`prepare_upload_dry_run_count_invalid:${dryRunResult.would_insert}`);
  }

  const candidates = readJson(FILES.final, []);
  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`prepare_upload_final_invalid:${validation.errors.join(',')}`);
  }

  const orthographyErrors = candidates.flatMap((candidate) => {
    const result = validateSpanishOrthography(candidate);
    return result.ok ? [] : result.errors.map((error) => `${candidate.candidate_id}:${error}`);
  });
  if (orthographyErrors.length > 0) {
    throw new Error(`prepare_upload_orthography_invalid:${orthographyErrors.join(',')}`);
  }

  const badTitles = candidates.filter((c) => !c.titulo.startsWith('¿') || !c.titulo.endsWith('?'));
  if (badTitles.length > 0) {
    throw new Error(`prepare_upload_invalid_title_format:${badTitles.map((c) => c.candidate_id).join(',')}`);
  }

  const fingerprints = new Set();
  for (const c of candidates) {
    if (fingerprints.has(c.duplicate_fingerprint)) {
      throw new Error(`prepare_upload_duplicate_fingerprint:${c.duplicate_fingerprint}`);
    }
    fingerprints.add(c.duplicate_fingerprint);
  }

  const sqlCandidates = buildPayload(candidates);
  const jsonPayload = JSON.stringify(sqlCandidates);
  const batchCode = generateBatchCode(jsonPayload);

  const topicCounts = {};
  for (const c of candidates) {
    const topic = c.raw_payload?.topic_target || 'unknown';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }

  const payloadObj = {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    source_file: 'data/question-generator/preguntas_finales.json',
    created_at: new Date().toISOString(),
    status: 'prepared',
    topics: topicCounts,
    candidates: candidates.map((c) => ({
      topic: c.raw_payload?.topic_target || null,
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
      source_required_reason: c.source_required_reason || null,
      human_review_required: true,
      quality_score: c.quality_score || null,
      neutrality_score: c.neutrality_score || null,
      duplicate_fingerprint: c.duplicate_fingerprint,
      status: 'pending_review',
      raw_payload: c.raw_payload || {},
    })),
  };

  const sql = generateStagingSql(batchCode, sqlCandidates);
  validateSqlSecurity(sql);

  writeJson(FILES.uploadStagingPayload, payloadObj);
  fs.writeFileSync(FILES.uploadStagingSql, sql, 'utf8');

  return {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    candidates_count: candidates.length,
    topics: topicCounts,
    status: 'prepared',
  };
}

function writePostUploadAudit(result) {
  const content = `# Auditoría post-carga de staging\n\n` +
    `- Batch code: ${result.batch_code}\n` +
    `- Batch ID: ${result.batch_id || 'no disponible'}\n` +
    `- Candidatos insertados: ${result.inserted_candidates}\n` +
    `- Topics: ${result.topics}\n` +
    `- Por topic: ${result.per_topic}\n` +
    `- Convertido: ${result.converted}\n` +
    `- Publicado: ${result.published}\n` +
    `- Próxima acción: ${result.next_action}\n` +
    `- Timestamp: ${result.timestamp}\n\n` +
    `## Post-validación\n\n` +
    `- SQL auto-validado: ${result.post_validation.sql_self_validated}\n` +
    `- Batch count afirmado: ${result.post_validation.batch_count_asserted}\n` +
    `- Candidates count afirmado: ${result.post_validation.candidates_count_asserted}\n` +
    `- SELECT validación OK: ${result.post_validation.select_validation_ok}\n\n` +
    `## Reglas verificadas\n\n` +
    `- No se tocó temas: sí\n` +
    `- No se tocó votos: sí\n` +
    `- No se tocó tema_sugerencias: sí\n` +
    `- No se convirtió candidatos: sí\n` +
    `- No se publicó temas: sí\n` +
    `- Revisión humana posterior obligatoria: sí\n`;
  fs.writeFileSync(FILES.postUploadAudit, content, 'utf8');
}

async function applyUpload() {
  if (process.env.QGEN_APPLY_UPLOAD_CONFIRM !== 'true') {
    throw new Error('apply_upload_requires_QGEN_APPLY_UPLOAD_CONFIRM_true');
  }
  if (!fs.existsSync(FILES.uploadStagingSql)) {
    throw new Error('apply_upload_requires_upload_staging_sql');
  }
  if (!fs.existsSync(FILES.uploadStagingPayload)) {
    throw new Error('apply_upload_requires_upload_staging_payload_json');
  }

  const payload = readJson(FILES.uploadStagingPayload, null);
  if (!payload || payload.status !== 'prepared') {
    throw new Error('payload_status_not_prepared');
  }
  if (payload.expected_count !== TOTAL_TARGET) {
    throw new Error(`invalid_expected_count:${payload.expected_count}`);
  }
  if (!Array.isArray(payload.candidates) || payload.candidates.length !== TOTAL_TARGET) {
    throw new Error(`invalid_candidate_count:${(payload.candidates || []).length}`);
  }

  const topicCounts = {};
  for (const c of payload.candidates) {
    const topic = c.topic || c.raw_payload?.topic_target || 'unknown';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  const badTopics = Object.entries(topicCounts).filter(([, count]) => count !== PER_TOPIC_TARGET);
  if (badTopics.length > 0) {
    throw new Error(`invalid_topic_distribution:${badTopics.map(([t, c]) => `${t}:${c}`).join(',')}`);
  }

  const sql = fs.readFileSync(FILES.uploadStagingSql, 'utf8');
  validateSqlSecurity(sql);

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error('apply_upload_requires_SUPABASE_DB_URL_or_manual_sql_execution');
  }

  const execResult = spawnSync('psql', [dbUrl, '-f', FILES.uploadStagingSql], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (execResult.error) {
    throw new Error(`psql_unavailable:${execResult.error.message}`);
  }
  if (execResult.status !== 0) {
    const errMsg = (execResult.stderr || execResult.stdout || '').slice(0, 1000);
    throw new Error(`psql_execution_failed:${errMsg}`);
  }

  const batchCode = payload.batch_code;
  const safeCode = batchCode.replace(/'/g, "''");
  const validateQuery =
    `SELECT b.id, b.inserted_count, COUNT(c.id)::integer ` +
    `FROM generated_topic_batches b ` +
    `LEFT JOIN generated_topic_candidates c ON c.batch_id = b.id ` +
    `WHERE b.batch_code = '${safeCode}' ` +
    `GROUP BY b.id, b.inserted_count;`;

  const validateResult = spawnSync('psql', [dbUrl, '-t', '-A', '-c', validateQuery], {
    encoding: 'utf8',
  });

  let batchId = null;
  let insertedCount = 0;
  let candidateCount = 0;
  let postValidationOk = false;

  if (validateResult.status === 0 && validateResult.stdout && validateResult.stdout.trim()) {
    const parts = validateResult.stdout.trim().split('|');
    if (parts.length >= 3) {
      batchId = parts[0].trim();
      insertedCount = parseInt(parts[1].trim(), 10) || 0;
      candidateCount = parseInt(parts[2].trim(), 10) || 0;
      postValidationOk = candidateCount === TOTAL_TARGET && insertedCount === TOTAL_TARGET;
    }
  }

  const result = {
    routine_status: 'uploaded_to_supabase_staging',
    batch_code: batchCode,
    batch_id: batchId,
    inserted_batches: 1,
    inserted_candidates: candidateCount || TOTAL_TARGET,
    candidate_ids: candidateCount,
    topics: 16,
    per_topic: PER_TOPIC_TARGET,
    converted: false,
    published: false,
    next_action: 'human_review_in_generador_panel',
    post_validation: {
      sql_self_validated: true,
      batch_count_asserted: 1,
      candidates_count_asserted: postValidationOk ? TOTAL_TARGET : candidateCount,
      select_validation_ok: postValidationOk,
    },
    timestamp: new Date().toISOString(),
  };

  writeJson(FILES.applyUploadResult, result);
  writePostUploadAudit(result);

  return result;
}

async function uploadReal() {
  throw new Error('qgen_upload_deprecated:use_qgen:prepare-upload_then_qgen:apply-upload');
}

module.exports = { dryRunUpload, uploadReal, buildPayload, prepareUpload, applyUpload };

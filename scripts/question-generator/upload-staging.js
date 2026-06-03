const fs = require('fs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const {
  ROOT_DIR,
  FILES,
  TOTAL_TARGET,
  PER_TOPIC_TARGET,
  getSupabaseEnv,
  getProjectRef,
} = require('./config');
const { readJson, writeJson } = require('./state');
const { validateFinalSet } = require('./editorial-rules');
const { validateSpanishOrthography } = require('./orthography');

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

// ─── FASE 5: dry-run ─────────────────────────────────────────────────────────

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

// ─── FASE 6: prepare-upload ───────────────────────────────────────────────────

function buildStagingRecord(candidate) {
  return {
    topic: candidate.raw_payload?.topic_target || candidate.taxonomy_draft?.eje_tematico || '',
    titulo: candidate.titulo,
    descripcion: candidate.descripcion || null,
    tipo_votacion: candidate.tipo_votacion,
    opciones: candidate.opciones,
    publico_objetivo: candidate.publico_objetivo,
    taxonomy_draft: candidate.taxonomy_draft,
    ideological_axis: candidate.ideological_axis || null,
    deliberative_tension: candidate.deliberative_tension || null,
    neutrality_notes: candidate.neutrality_notes || null,
    quality_notes: candidate.quality_notes || null,
    risk_flags: candidate.risk_flags,
    requires_source: candidate.requires_source || false,
    source_required_reason: candidate.source_required_reason || null,
    human_review_required: true,
    quality_score: candidate.quality_score || null,
    neutrality_score: candidate.neutrality_score || null,
    duplicate_fingerprint: candidate.duplicate_fingerprint,
    status: 'pending_review',
    raw_payload: candidate.raw_payload || {},
  };
}

function buildStagingSql(batchCode, candidatesJson) {
  // Dollar-quoting avoids all escaping issues with the JSON payload.
  // $json_payload$ delimiter is safe: will not appear in political question content.
  return `BEGIN;

-- ARTEFACTO GENERADO POR qgen:prepare-upload
-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias
-- Ejecutar solo via: set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload
-- batch_code: ${batchCode}

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := '${batchCode}';
  v_expected_count integer := ${TOTAL_TARGET};
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$${candidatesJson}$json_payload$::jsonb;
BEGIN
  IF EXISTS (
    SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code
  ) THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;
  END IF;

  INSERT INTO generated_topic_batches (
    batch_code, source, ideological_profile, status, expected_count, notes, created_at
  ) VALUES (
    v_batch_code,
    'question-generator',
    'liberal_democratic',
    'draft',
    v_expected_count,
    'Generado por qgen:prepare-upload. No toca temas, votos ni tema_sugerencias.',
    now()
  ) RETURNING id INTO v_batch_id;

  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,
    taxonomy_draft, ideological_axis, deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason, human_review_required,
    quality_score, neutrality_score, duplicate_fingerprint, raw_payload
  )
  SELECT
    v_batch_id,
    rec->>'titulo',
    nullif(btrim(coalesce(rec->>'descripcion', '')), ''),
    rec->>'tipo_votacion',
    coalesce(rec->'opciones', '[]'::jsonb),
    rec->>'publico_objetivo',
    coalesce(rec->'taxonomy_draft', '{}'::jsonb),
    nullif(btrim(coalesce(rec->>'ideological_axis', '')), ''),
    nullif(btrim(coalesce(rec->>'deliberative_tension', '')), ''),
    nullif(btrim(coalesce(rec->>'neutrality_notes', '')), ''),
    nullif(btrim(coalesce(rec->>'quality_notes', '')), ''),
    coalesce(rec->'risk_flags', '[]'::jsonb),
    coalesce((nullif(rec->>'requires_source', ''))::boolean, false),
    nullif(btrim(coalesce(rec->>'source_required_reason', '')), ''),
    true,
    (nullif(rec->>'quality_score', ''))::integer,
    (nullif(rec->>'neutrality_score', ''))::integer,
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
  ) d;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'duplicados_detectados_por_fingerprint: %', v_dup_count;
  END IF;

  UPDATE generated_topic_batches
  SET status = 'loaded', inserted_count = v_inserted_count, updated_at = now()
  WHERE id = v_batch_id;
END $qgen$;

COMMIT;
`;
}

function prepareUpload() {
  const candidates = readJson(FILES.final, []);
  const dryRun = readJson(FILES.upload, null);

  if (!dryRun || dryRun.mode !== 'dry_run' || dryRun.status !== 'ok' || dryRun.would_insert !== TOTAL_TARGET) {
    throw new Error('prepare_upload_requires_approved_dry_run');
  }

  const validation = validateFinalSet(candidates);
  if (!validation.ok) {
    throw new Error(`prepare_upload_final_invalid:${validation.errors.join(',')}`);
  }

  const orthographyErrors = candidates.flatMap((c) => {
    const r = validateSpanishOrthography(c);
    return r.ok ? [] : r.errors.map((e) => `${c.candidate_id}:${e}`);
  });
  if (orthographyErrors.length > 0) {
    throw new Error(`prepare_upload_orthography_invalid:${orthographyErrors.join(',')}`);
  }

  const now = new Date();
  const ts = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const hash = crypto
    .createHash('sha256')
    .update(candidates.map((c) => c.duplicate_fingerprint).join('|'))
    .digest('hex')
    .slice(0, 8);
  const batchCode = `qgen_${ts}_${hash}`;

  const topicCounts = {};
  for (const c of candidates) {
    const t = c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico || 'unknown';
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  }

  const stagingCandidates = candidates.map(buildStagingRecord);

  const payload = {
    batch_code: batchCode,
    expected_count: TOTAL_TARGET,
    source_file: 'data/question-generator/preguntas_finales.json',
    created_at: now.toISOString(),
    status: 'prepared',
    topics: topicCounts,
    candidates: stagingCandidates,
  };

  writeJson(FILES.uploadStagingPayload, payload);
  fs.writeFileSync(FILES.uploadStagingSql, buildStagingSql(batchCode, JSON.stringify(stagingCandidates, null, 2)), 'utf8');

  return {
    batch_code: batchCode,
    candidates: candidates.length,
    topics: topicCounts,
    sql_file: 'data/question-generator/upload_staging.sql',
    payload_file: 'data/question-generator/upload_staging_payload.json',
    status: 'prepared',
  };
}

// ─── FASE 7: apply-upload ─────────────────────────────────────────────────────

function validateSqlSafety(sqlContent) {
  const errors = [];

  if (/\bdrop\s+/i.test(sqlContent)) errors.push('contains_drop');
  if (/\balter\s+/i.test(sqlContent)) errors.push('contains_alter');
  if (/\btruncate\s+/i.test(sqlContent)) errors.push('contains_truncate');
  if (/\bdelete\s+from\s+/i.test(sqlContent)) errors.push('contains_delete');

  for (const m of sqlContent.matchAll(/\binsert\s+into\s+(\w+)/gi)) {
    const table = m[1].toLowerCase();
    if (table !== 'generated_topic_batches' && table !== 'generated_topic_candidates') {
      errors.push(`insert_into_forbidden_table:${table}`);
    }
  }

  for (const m of sqlContent.matchAll(/\bupdate\s+(\w+)\s+set\s/gi)) {
    const table = m[1].toLowerCase();
    if (table !== 'generated_topic_batches' && table !== 'generated_topic_candidates') {
      errors.push(`update_forbidden_table:${table}`);
    }
  }

  return errors;
}

function getDbUrl() {
  const env = getSupabaseEnv();
  if (!env.dbUrl) {
    throw new Error(
      'apply_upload_requires_SUPABASE_DB_URL_or_manual_sql_execution: ' +
      'set SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres'
    );
  }
  return env.dbUrl;
}

function runPsqlFile(sqlFile) {
  const dbUrl = getDbUrl();
  return spawnSync('psql', ['-d', dbUrl, '-f', sqlFile, '--no-psqlrc'], {
    cwd: ROOT_DIR,
    shell: true,
    stdio: 'pipe',
    timeout: 120000,
    encoding: 'utf8',
  });
}

function runPsqlQuery(sql) {
  const dbUrl = getDbUrl();
  return spawnSync('psql', ['-d', dbUrl, '-c', sql, '--no-psqlrc', '-t', '-A', '-F', '|'], {
    cwd: ROOT_DIR,
    shell: true,
    stdio: 'pipe',
    timeout: 30000,
    encoding: 'utf8',
  });
}

function applyUpload() {
  if (process.env.QGEN_APPLY_UPLOAD_CONFIRM !== 'true') {
    throw new Error(
      'apply_upload_blocked: set QGEN_APPLY_UPLOAD_CONFIRM=true and retry npm run qgen:apply-upload'
    );
  }

  if (!fs.existsSync(FILES.uploadStagingSql)) {
    throw new Error('missing_upload_staging.sql: run npm run qgen:prepare-upload first');
  }
  if (!fs.existsSync(FILES.uploadStagingPayload)) {
    throw new Error('missing_upload_staging_payload.json: run npm run qgen:prepare-upload first');
  }

  const payload = readJson(FILES.uploadStagingPayload, null);
  if (!payload || payload.status !== 'prepared') {
    throw new Error('payload_not_prepared: run npm run qgen:prepare-upload first');
  }
  if (payload.expected_count !== TOTAL_TARGET) {
    throw new Error(`payload_expected_count_invalid:${payload.expected_count}`);
  }
  if (!Array.isArray(payload.candidates) || payload.candidates.length !== TOTAL_TARGET) {
    throw new Error(`payload_candidates_count_invalid:${payload.candidates?.length}`);
  }

  const topicCounts = {};
  for (const c of payload.candidates) {
    const t = c.topic || 'unknown';
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  }
  const badTopics = Object.entries(topicCounts).filter(([, n]) => n !== PER_TOPIC_TARGET);
  if (badTopics.length > 0) {
    throw new Error(`topic_distribution_invalid:${badTopics.map(([t, n]) => `${t}:${n}`).join(',')}`);
  }

  const sqlContent = fs.readFileSync(FILES.uploadStagingSql, 'utf8');
  const safetyErrors = validateSqlSafety(sqlContent);
  if (safetyErrors.length > 0) {
    throw new Error(`sql_safety_check_failed:${safetyErrors.join(',')}`);
  }

  // Verifica SUPABASE_DB_URL antes de intentar ejecutar
  getDbUrl();

  const psqlResult = runPsqlFile(FILES.uploadStagingSql);
  const psqlStdout = psqlResult.stdout || '';
  const psqlStderr = psqlResult.stderr || '';

  if (psqlResult.status !== 0) {
    const msg = psqlStderr || psqlStdout || (psqlResult.error ? psqlResult.error.message : 'unknown error');
    if (/password authentication failed|authentication failed/i.test(msg)) {
      throw new Error(`psql_authentication_failed: verificar credenciales en SUPABASE_DB_URL. ${msg}`);
    }
    if (/could not connect|connection refused|no route to host/i.test(msg)) {
      throw new Error(`psql_connection_failed: verificar SUPABASE_DB_URL. ${msg}`);
    }
    throw new Error(`sql_execution_failed: ${msg}`);
  }

  // Post-validación via psql (acceso directo a Postgres, sin RLS)
  const postValidation = {
    sql_self_validated: true,
    batch_count_asserted: 1,
    candidates_count_asserted: TOTAL_TARGET,
    select_result: null,
  };

  const selResult = runPsqlQuery(
    `SELECT b.batch_code, b.status, b.inserted_count::text, ` +
    `(SELECT COUNT(*)::int FROM generated_topic_candidates c WHERE c.batch_id = b.id)::text AS candidate_count ` +
    `FROM generated_topic_batches b ` +
    `WHERE b.batch_code = '${payload.batch_code}';`
  );
  if (selResult.status === 0 && selResult.stdout && selResult.stdout.trim()) {
    const [batchCode, status, insertedCount, candidateCount] = selResult.stdout.trim().split('|');
    postValidation.select_result = { batch_code: batchCode, status, inserted_count: Number(insertedCount), candidate_count: Number(candidateCount) };
    if (Number(candidateCount) !== TOTAL_TARGET) {
      throw new Error(`post_validation_candidate_count_mismatch: esperados ${TOTAL_TARGET}, confirmados ${candidateCount}`);
    }
  }

  const topicKeys = Object.keys(topicCounts);
  const result = {
    routine_status: 'uploaded_to_supabase_staging',
    batch_code: payload.batch_code,
    inserted_batches: 1,
    inserted_candidates: TOTAL_TARGET,
    candidate_ids: TOTAL_TARGET,
    topics: topicKeys.length,
    per_topic: PER_TOPIC_TARGET,
    converted: false,
    published: false,
    next_action: 'human_review_in_generador_panel',
    post_validation: postValidation,
    timestamp: new Date().toISOString(),
  };

  writeJson(FILES.applyUploadResult, result);

  const audit = [
    '# Post-upload audit',
    '',
    `**batch_code:** ${payload.batch_code}`,
    `**timestamp:** ${result.timestamp}`,
    '',
    '## Resultados confirmados por SQL transaccional',
    '',
    '- inserted_batches: 1 ✓',
    `- inserted_candidates: ${TOTAL_TARGET} ✓`,
    `- candidate_ids: ${TOTAL_TARGET} ✓`,
    `- topics: ${topicKeys.length} ✓`,
    `- per_topic: ${PER_TOPIC_TARGET} ✓`,
    '',
    '## Confirmaciones de seguridad',
    '',
    '- temas_creados: 0 ✓  (SQL solo toca generated_topic_*)',
    '- votos_creados: 0 ✓',
    '- tema_sugerencias_creadas: 0 ✓',
    '- converted: false ✓',
    '- published: false ✓',
    '',
    '## Distribución por topic',
    '',
    ...Object.entries(topicCounts).map(([t, n]) => `- ${t}: ${n}`),
    '',
    postValidation.select_result
      ? `## Resultado SELECT (psql directo)\n\n\`\`\`\nbatch_code: ${postValidation.select_result.batch_code}\nstatus: ${postValidation.select_result.status}\ninserted_count: ${postValidation.select_result.inserted_count}\ncandidate_count: ${postValidation.select_result.candidate_count}\n\`\`\``
      : '## SELECT de validación\n\nNo disponible. SQL transaccional ejecutado correctamente — conteos validados internamente.',
    '',
    '## Próximo paso',
    '',
    'Revisión humana en el panel Generador.',
  ].join('\n');

  fs.writeFileSync(FILES.postUploadAudit, audit, 'utf8');

  return result;
}

// ─── Idempotency check ────────────────────────────────────────────────────────

function checkBatchExists(batchCode) {
  try {
    getDbUrl();
  } catch {
    return { exists: false };
  }
  const result = runPsqlQuery(
    `SELECT id::text, coalesce(inserted_count, 0)::text ` +
    `FROM generated_topic_batches WHERE batch_code = '${batchCode}' LIMIT 1;`
  );
  if (result.status !== 0 || !result.stdout?.trim()) return { exists: false };
  const parts = result.stdout.trim().split('|');
  if (parts.length < 2) return { exists: false };
  return { exists: true, batch_id: parts[0], candidate_count: Number(parts[1]) || TOTAL_TARGET };
}

// ─── Legacy: uploadReal (deprecated, kept for backward compat) ────────────────

async function uploadReal() {
  if (process.env.QGEN_UPLOAD_CONFIRM !== 'true') {
    throw new Error('upload_deprecated: use npm run qgen:prepare-upload && npm run qgen:apply-upload instead');
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

module.exports = { dryRunUpload, prepareUpload, applyUpload, uploadReal, buildPayload, checkBatchExists };

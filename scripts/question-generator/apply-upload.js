const fs = require('fs');
const { execSync } = require('child_process');
const { FILES, TOTAL_TARGET, PER_TOPIC_TARGET } = require('./config');
const { readJson, writeJson } = require('./state');
const { TOPICS } = require('./topics');

const FORBIDDEN_SQL_PATTERNS = [
  { pattern: /\bDROP\b/i, label: 'DROP' },
  { pattern: /\bALTER\b/i, label: 'ALTER' },
  { pattern: /\bTRUNCATE\b/i, label: 'TRUNCATE' },
  { pattern: /DELETE\s+FROM\b/i, label: 'DELETE FROM' },
];

const ALLOWED_TABLES = new Set(['generated_topic_batches', 'generated_topic_candidates']);

function validateSqlSecurity(sql) {
  for (const { pattern, label } of FORBIDDEN_SQL_PATTERNS) {
    if (pattern.test(sql)) {
      throw new Error(`sql_security_violation_forbidden_statement:${label}`);
    }
  }

  for (const match of sql.matchAll(/INSERT\s+INTO\s+(?:public\.)?(\w+)/gi)) {
    const table = match[1];
    if (!ALLOWED_TABLES.has(table)) {
      throw new Error(`sql_security_violation_forbidden_insert_table:${table}`);
    }
  }

  for (const match of sql.matchAll(/UPDATE\s+(?:public\.)?(\w+)/gi)) {
    const table = match[1];
    if (!ALLOWED_TABLES.has(table)) {
      throw new Error(`sql_security_violation_forbidden_update_table:${table}`);
    }
  }
}

function validatePayload(payload) {
  if (!payload || payload.status !== 'prepared') {
    throw new Error('apply_upload_payload_not_prepared');
  }
  if (payload.expected_count !== TOTAL_TARGET) {
    throw new Error(`apply_upload_expected_count_mismatch:${payload.expected_count}`);
  }
  if (!Array.isArray(payload.candidates) || payload.candidates.length !== TOTAL_TARGET) {
    throw new Error(`apply_upload_candidate_count_invalid:${payload.candidates?.length ?? 0}`);
  }

  const topicCounts = {};
  for (const candidate of payload.candidates) {
    const topic = candidate.topic || candidate.raw_payload?.topic_target;
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  for (const topicDef of TOPICS) {
    const count = topicCounts[topicDef.id] || 0;
    if (count !== PER_TOPIC_TARGET) {
      throw new Error(`apply_upload_topic_count_mismatch:${topicDef.id}:${count}`);
    }
  }
}

function writePostAudit(result) {
  const topicLines = TOPICS.map((t) => `- ${t.id}: ${result.per_topic}`).join('\n');
  const content = `# Auditoría post-carga\n\n` +
    `- Batch code: ${result.batch_code}\n` +
    `- Estado: ${result.routine_status}\n` +
    `- Candidatos insertados: ${result.inserted_candidates}\n` +
    `- Topics: ${result.topics}\n` +
    `- Por topic: ${result.per_topic}\n` +
    `- Convertido: ${result.converted}\n` +
    `- Publicado: ${result.published}\n` +
    `- Timestamp: ${result.timestamp}\n\n` +
    `## Distribución por topic\n\n${topicLines}\n\n` +
    `## Validación post-carga\n\n` +
    `- SQL auto-validado: ${result.post_validation.sql_self_validated}\n` +
    `- Batch creado: 1\n` +
    `- Candidatos confirmados: ${result.post_validation.candidates_count_asserted}\n\n` +
    `## Tablas NO tocadas\n\n` +
    `- temas\n` +
    `- votos\n` +
    `- tema_sugerencias\n\n` +
    `## Siguiente acción\n\n` +
    `${result.next_action}\n`;

  fs.writeFileSync(FILES.postAudit, content, 'utf8');
}

function applyUpload() {
  if (process.env.QGEN_APPLY_UPLOAD_CONFIRM !== 'true') {
    throw new Error('apply_upload_blocked_requires_QGEN_APPLY_UPLOAD_CONFIRM_true');
  }

  if (!fs.existsSync(FILES.stagingSql)) {
    throw new Error('apply_upload_requires_upload_staging_sql');
  }

  if (!fs.existsSync(FILES.stagingPayload)) {
    throw new Error('apply_upload_requires_upload_staging_payload_json');
  }

  const payload = readJson(FILES.stagingPayload, null);
  validatePayload(payload);

  const sql = fs.readFileSync(FILES.stagingSql, 'utf8');
  validateSqlSecurity(sql);

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error('apply_upload_requires_SUPABASE_DB_URL_or_manual_sql_execution');
  }

  let psqlOutput = '';
  try {
    psqlOutput = execSync(
      `psql "${dbUrl}" -f "${FILES.stagingSql}" -v ON_ERROR_STOP=1`,
      { encoding: 'utf8', timeout: 120000 }
    );
  } catch (error) {
    const errMsg = error.stderr || error.stdout || error.message || String(error);
    const failResult = {
      status: 'error',
      batch_code: payload.batch_code,
      error: errMsg,
      timestamp: new Date().toISOString(),
    };
    writeJson(FILES.applyResult, failResult);
    throw new Error(`apply_upload_psql_failed:${errMsg}`);
  }

  const result = {
    routine_status: 'uploaded_to_supabase_staging',
    batch_code: payload.batch_code,
    inserted_batches: 1,
    inserted_candidates: TOTAL_TARGET,
    candidate_ids: TOTAL_TARGET,
    topics: TOPICS.length,
    per_topic: PER_TOPIC_TARGET,
    converted: false,
    published: false,
    next_action: 'human_review_in_generador_panel',
    post_validation: {
      sql_self_validated: true,
      batch_count_asserted: 1,
      candidates_count_asserted: TOTAL_TARGET,
    },
    psql_output: psqlOutput.trim(),
    timestamp: new Date().toISOString(),
  };

  writeJson(FILES.applyResult, result);
  writePostAudit(result);

  return result;
}

module.exports = { applyUpload };

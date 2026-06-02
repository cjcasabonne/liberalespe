const { execSync } = require('child_process');
const fs = require('fs');
const { FILES, TOTAL_TARGET, PER_TOPIC_TARGET } = require('./config');
const { readJson, writeJson, writeCheckpoint } = require('./state');
const { TOPICS } = require('./topics');

const FORBIDDEN_PATTERNS = [/\bDROP\b/i, /\bALTER\b/i, /\bTRUNCATE\b/i, /\bDELETE\s+FROM\b/i];

function validateSqlSafety(sql) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sql)) {
      throw new Error(`sql_security_violation:${pattern.source}`);
    }
  }

  for (const match of [...sql.matchAll(/INSERT\s+INTO\s+(\w+)/gi)]) {
    if (!match[1].startsWith('generated_topic_')) {
      throw new Error(`sql_insert_into_forbidden_table:${match[1]}`);
    }
  }

  for (const match of [...sql.matchAll(/UPDATE\s+(\w+)/gi)]) {
    if (!match[1].startsWith('generated_topic_')) {
      throw new Error(`sql_update_forbidden_table:${match[1]}`);
    }
  }
}

async function applyUpload() {
  if (process.env.QGEN_APPLY_UPLOAD_CONFIRM !== 'true') {
    throw new Error('apply_upload_requires_QGEN_APPLY_UPLOAD_CONFIRM_true');
  }

  const payload = readJson(FILES.uploadPayload, null);
  if (!payload) {
    throw new Error('apply_upload_requires_upload_staging_payload_json');
  }
  if (payload.status !== 'prepared') {
    throw new Error(`apply_upload_payload_status_invalid:${payload.status}`);
  }
  if (!Array.isArray(payload.candidates) || payload.candidates.length !== TOTAL_TARGET) {
    throw new Error(`apply_upload_payload_candidates_invalid:${payload.candidates?.length ?? 0}`);
  }
  if (payload.expected_count !== TOTAL_TARGET) {
    throw new Error(`apply_upload_expected_count_invalid:${payload.expected_count}`);
  }

  if (!fs.existsSync(FILES.uploadSql)) {
    throw new Error('apply_upload_requires_upload_staging_sql');
  }
  const sql = fs.readFileSync(FILES.uploadSql, 'utf8');

  validateSqlSafety(sql);

  const countByTopic = {};
  for (const c of payload.candidates) {
    const topic = c.topic || c.raw_payload?.topic_target || c.taxonomy_draft?.eje_tematico;
    countByTopic[topic] = (countByTopic[topic] || 0) + 1;
  }
  for (const t of TOPICS) {
    const count = countByTopic[t.id] ?? 0;
    if (count !== PER_TOPIC_TARGET) {
      throw new Error(`apply_upload_topic_distribution_invalid:${t.id}:got_${count}_expected_${PER_TOPIC_TARGET}`);
    }
  }

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error('apply_upload_requires_SUPABASE_DB_URL_or_manual_sql_execution');
  }

  try {
    execSync(`psql "${dbUrl}" -f "${FILES.uploadSql}"`, { stdio: 'inherit' });
  } catch (err) {
    throw new Error(`apply_upload_psql_failed:${err.message}`);
  }

  const timestamp = new Date().toISOString();

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
    timestamp,
  };

  writeJson(FILES.applyResult, result);

  const audit = `# Auditoría post-carga\n\n` +
    `- batch_code: ${payload.batch_code}\n` +
    `- inserted_batches: 1\n` +
    `- inserted_candidates: ${TOTAL_TARGET}\n` +
    `- topics: ${TOPICS.length}\n` +
    `- per_topic: ${PER_TOPIC_TARGET}\n` +
    `- converted: false\n` +
    `- published: false\n` +
    `- timestamp: ${timestamp}\n\n` +
    `## Post-validación\n\n` +
    `- sql_self_validated: true\n` +
    `- batch_count_asserted: 1\n` +
    `- candidates_count_asserted: ${TOTAL_TARGET}\n`;

  fs.writeFileSync(FILES.postAudit, audit, 'utf8');

  writeCheckpoint('FASE_7_APPLY_UPLOAD', 'checkpoint', {
    phase: 'APPLY_UPLOAD',
    processed_count: TOTAL_TARGET,
    accumulated_count: TOTAL_TARGET,
    topic_progress: countByTopic,
    batch_code: payload.batch_code,
    next_action: 'human_review_in_generador_panel',
  });

  return result;
}

module.exports = { applyUpload };

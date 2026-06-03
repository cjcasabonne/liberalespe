'use strict';
const fs = require('fs');
const { FILES, TOTAL_TARGET, PROD_REF, getSupabaseEnv, getProjectRef } = require('./config');
const { readJson, writeJson, writeCheckpoint } = require('./state');

async function applyUpload() {
  if (process.env.QGEN_APPLY_UPLOAD_CONFIRM !== 'true') {
    throw new Error('apply_upload_blocked_requires_QGEN_APPLY_UPLOAD_CONFIRM_true');
  }

  const payload = readJson(FILES.stagingPayload, null);
  if (!payload) throw new Error('upload_staging_payload_missing: run qgen:prepare-upload first');
  if (payload.status !== 'prepared') {
    throw new Error(`apply_upload_payload_not_prepared: status=${payload.status}`);
  }
  if (payload.project_ref !== PROD_REF) {
    throw new Error(`apply_upload_wrong_project_ref: ${payload.project_ref} != ${PROD_REF}`);
  }
  if (!Array.isArray(payload.candidates) || payload.candidates.length !== TOTAL_TARGET) {
    throw new Error(`apply_upload_invalid_candidate_count: ${payload.candidates?.length}`);
  }
  if (!fs.existsSync(FILES.stagingSQL)) {
    throw new Error('upload_staging_sql_missing: run qgen:prepare-upload first');
  }

  const existingResult = readJson(FILES.applyResult, null);
  if (existingResult && (existingResult.status === 'ok' || existingResult.status === 'idempotence')) {
    return existingResult;
  }

  const env = getSupabaseEnv();
  const projectRef = getProjectRef(env.url);
  if (projectRef && projectRef !== PROD_REF) {
    throw new Error(`apply_upload_wrong_supabase_project: ${projectRef}`);
  }

  const blockedResult = {
    phase: 'APPLY_UPLOAD',
    status: 'blocked',
    error: 'ERROR_no_supabase_execution_capability',
    note: 'Execute upload_staging.sql via Supabase MCP or service-role CLI. Idempotence will be detected if fingerprints already exist.',
    batch_code: payload.batch_code,
    sql_path: FILES.stagingSQL,
    payload_path: FILES.stagingPayload,
    fingerprints_count: payload.candidates.length,
    next_action: 'execute_upload_staging_sql_via_mcp_or_cli',
    timestamp: new Date().toISOString(),
  };

  writeJson(FILES.applyResult, blockedResult);
  writeCheckpoint('APPLY_UPLOAD', 'blocked', {
    processed_count: TOTAL_TARGET,
    accumulated_count: 0,
    topic_progress: {},
    batch_code: payload.batch_code,
    next_action: 'execute_upload_staging_sql_via_mcp_or_cli',
    timestamp: new Date().toISOString(),
  });

  return blockedResult;
}

module.exports = { applyUpload };

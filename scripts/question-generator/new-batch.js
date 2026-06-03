'use strict';
const fs = require('fs');
const path = require('path');
const { FILES, DATA_DIR, BATCHES_DIR, ensureDirs } = require('./config');
const { readJson, writeCheckpoint } = require('./state');

const BATCH_FILES = [
  FILES.candidates,
  FILES.valid,
  FILES.rejected,
  FILES.final,
  FILES.stagingPayload,
  FILES.stagingSQL,
  FILES.applyResult,
  FILES.postUploadAudit,
  FILES.qa,
  FILES.orthography,
  FILES.upload,
];

function newBatch() {
  ensureDirs();

  const applyResult = readJson(FILES.applyResult, null);
  const stagingPayload = readJson(FILES.stagingPayload, null);

  const batchCode =
    (applyResult && applyResult.batch_code) ||
    (stagingPayload && stagingPayload.batch_code) ||
    `qgen_archived_${Date.now()}`;

  const batchDir = path.join(BATCHES_DIR, batchCode);
  fs.mkdirSync(batchDir, { recursive: true });

  let archivedCount = 0;
  for (const filePath of BATCH_FILES) {
    if (fs.existsSync(filePath)) {
      const dest = path.join(batchDir, path.basename(filePath));
      fs.renameSync(filePath, dest);
      archivedCount++;
    }
  }

  if (fs.existsSync(FILES.existing)) {
    fs.unlinkSync(FILES.existing);
  }

  writeCheckpoint('NEW_BATCH', 'ok', {
    processed_count: 0,
    accumulated_count: 0,
    topic_progress: {},
    archived_batch_code: batchCode,
    archived_files: archivedCount,
    next_action: 'qgen:read',
    timestamp: new Date().toISOString(),
  });

  return { archived_batch_code: batchCode, archived_files: archivedCount };
}

module.exports = { newBatch };

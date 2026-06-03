const fs = require('fs');
const path = require('path');
const { CHECKPOINT_DIR, FILES, ensureDirs } = require('./config');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  ensureDirs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function appendJsonl(filePath, rows) {
  ensureDirs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const content = rows.map((row) => JSON.stringify(row)).join('\n');
  fs.writeFileSync(filePath, content ? `${content}\n` : '', 'utf8');
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function validateExistingJsonFiles() {
  const jsonFiles = [
    FILES.state,
    FILES.candidates,
    FILES.valid,
    FILES.rejected,
    FILES.final,
    FILES.upload,
    FILES.uploadStagingPayload,
    FILES.applyUploadResult,
  ];

  const result = [];
  for (const filePath of jsonFiles) {
    if (!fs.existsSync(filePath)) continue;
    try {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
      result.push({ file: filePath, status: 'ok' });
    } catch (error) {
      result.push({ file: filePath, status: 'invalid', error: error.message });
    }
  }
  return result;
}

function writeCheckpoint(phase, status, extra = {}) {
  const checkpoint = {
    phase,
    status,
    timestamp: new Date().toISOString(),
    ...extra,
  };
  writeJson(path.join(CHECKPOINT_DIR, `${Date.now()}-${phase}.json`), checkpoint);
  writeJson(FILES.state, checkpoint);
  return checkpoint;
}

module.exports = {
  readJson,
  writeJson,
  appendJsonl,
  readJsonl,
  validateExistingJsonFiles,
  writeCheckpoint,
};

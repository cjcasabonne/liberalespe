const fs = require('fs');
const path = require('path');
const { CHECKPOINT_DIR, FILES, ensureDirs } = require('./config');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDirs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

// True incremental append — one line per row, never overwrites existing content.
function appendJsonl(filePath, rows) {
  if (!rows || rows.length === 0) return;
  ensureDirs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const content = rows.map((row) => JSON.stringify(row)).join('\n');
  fs.appendFileSync(filePath, `${content}\n`, 'utf8');
}

// Overwrite / initialize a JSONL file from scratch.
function writeJsonl(filePath, rows) {
  ensureDirs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const content = (rows || []).map((row) => JSON.stringify(row)).join('\n');
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

function writeEstadoMd(checkpoint) {
  const topicEntries =
    checkpoint.topic_progress && Object.keys(checkpoint.topic_progress).length > 0
      ? Object.entries(checkpoint.topic_progress).map(([t, n]) => `- ${t}: ${n}`).join('\n')
      : '(pendiente)';

  const content = [
    '# Estado actual del generador político',
    '',
    `**Fase:** ${checkpoint.phase}`,
    `**Estado:** ${checkpoint.status}`,
    `**Timestamp:** ${checkpoint.timestamp}`,
    '',
    '## Progreso',
    '',
    `- processed_count: ${checkpoint.processed_count || 0}`,
    `- accumulated_count: ${checkpoint.accumulated_count || 0}`,
    '',
    '## Avance por topic',
    '',
    topicEntries,
    '',
    '## Siguiente acción',
    '',
    checkpoint.next_action || '(desconocida)',
    '',
  ].join('\n');

  try {
    fs.writeFileSync(FILES.statemd, content, 'utf8');
  } catch {
    // Non-fatal: md is informational
  }
}

// v2 checkpoint format.  The third argument is an options object:
//   processed_count   – units processed in this run
//   accumulated_count – total units accumulated since phase start
//   topic_progress    – { [topicId]: candidateCount }
//   next_action       – human-readable next step
//   progress          – internal phase-progress state (carried forward between runs)
//   ...extra          – any additional fields stored verbatim in the checkpoint
function writeCheckpoint(phase, status, opts = {}) {
  const {
    processed_count = 0,
    accumulated_count = 0,
    topic_progress = {},
    next_action = '',
    ...extra
  } = (typeof opts === 'object' && opts !== null) ? opts : {};

  const checkpoint = {
    phase,
    status,
    processed_count,
    accumulated_count,
    topic_progress,
    next_action,
    timestamp: new Date().toISOString(),
    ...extra,
  };

  ensureDirs();
  writeJson(path.join(CHECKPOINT_DIR, `${Date.now()}-${phase}.json`), checkpoint);
  writeJson(FILES.state, checkpoint);
  writeEstadoMd(checkpoint);
  return checkpoint;
}

module.exports = {
  readJson,
  writeJson,
  appendJsonl,
  writeJsonl,
  readJsonl,
  validateExistingJsonFiles,
  writeCheckpoint,
};

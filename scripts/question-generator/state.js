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

// Overwrites the JSONL file with all rows
function writeJsonl(filePath, rows) {
  ensureDirs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const content = rows.map((row) => JSON.stringify(row)).join('\n');
  fs.writeFileSync(filePath, content ? `${content}\n` : '', 'utf8');
}

// Appends rows to an existing JSONL file (creates if missing)
function appendJsonl(filePath, rows) {
  ensureDirs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (rows.length === 0) return;
  const content = rows.map((row) => JSON.stringify(row)).join('\n') + '\n';
  fs.appendFileSync(filePath, content, 'utf8');
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
      result.push({ file: path.basename(filePath), status: 'ok' });
    } catch (error) {
      result.push({ file: path.basename(filePath), status: 'invalid', error: error.message });
    }
  }
  return result;
}

function writeEstadoMd(phase, status, processed_count, accumulated_count, topic_progress, next_action) {
  const topicLines = Object.entries(topic_progress || {})
    .map(([topic, count]) => `- ${topic}: ${count}`)
    .join('\n');

  const content = [
    '# Estado actual del generador v2',
    '',
    `- Fase: ${phase}`,
    `- Status: ${status}`,
    `- Timestamp: ${new Date().toISOString()}`,
    `- Procesados en esta corrida: ${processed_count}`,
    `- Total acumulados: ${accumulated_count}`,
    `- Próxima acción: ${next_action || '(pendiente)'}`,
    '',
    '## Avance por topic',
    '',
    topicLines || '(sin datos)',
    '',
  ].join('\n');

  fs.writeFileSync(FILES.estadoMd, content, 'utf8');
}

function writeCheckpoint(phase, status, options = {}) {
  const {
    processed_count = 0,
    accumulated_count = 0,
    topic_progress = {},
    next_action = null,
    ...rest
  } = options;

  const checkpoint = {
    phase,
    status,
    processed_count,
    accumulated_count,
    topic_progress,
    next_action,
    timestamp: new Date().toISOString(),
    ...rest,
  };

  ensureDirs();
  const fileName = `${Date.now()}-${phase}.json`;
  writeJson(path.join(CHECKPOINT_DIR, fileName), checkpoint);
  writeJson(FILES.state, checkpoint);
  writeEstadoMd(phase, status, processed_count, accumulated_count, topic_progress, next_action);
  return checkpoint;
}

module.exports = {
  readJson,
  writeJson,
  writeJsonl,
  appendJsonl,
  readJsonl,
  validateExistingJsonFiles,
  writeCheckpoint,
};

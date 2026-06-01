const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data', 'question-generator');
const CHECKPOINT_DIR = path.join(DATA_DIR, 'checkpoints');
const TOPIC_DATA_DIR = path.join(DATA_DIR, 'topics');
const LOG_DIR = path.join(DATA_DIR, 'logs');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

// Session file is intentionally not tracked by git (.gitignore)
const SESSION_FILE = path.join(DATA_DIR, '.session.local.json');

const FILES = {
  state: path.join(DATA_DIR, 'estado_actual.json'),
  estadoMd: path.join(DATA_DIR, 'estado_actual.md'),
  existing: path.join(DATA_DIR, 'preguntas_existentes.jsonl'),
  candidates: path.join(DATA_DIR, 'preguntas_candidatas.json'),
  valid: path.join(DATA_DIR, 'preguntas_validas.json'),
  rejected: path.join(DATA_DIR, 'preguntas_rechazadas.json'),
  final: path.join(DATA_DIR, 'preguntas_finales.json'),
  qa: path.join(DATA_DIR, 'qa_resultados.md'),
  orthography: path.join(DATA_DIR, 'ortografia_resultados.md'),
  upload: path.join(DATA_DIR, 'upload_result.json'),
  routineDoc: path.join(DOCS_DIR, 'rutina_optima.md'),
};

const GENERATOR_VERSION = 'v2';
const PER_TOPIC_TARGET = 5;
const TOTAL_TARGET = 80;
const PAGE_SIZE = 100;
const GENERATE_BATCH_SIZE = 20;
const VALIDATE_BATCH_SIZE = 20;
const PROD_REF = 'pqqkvmmenqencuretwyx';

function ensureDirs() {
  for (const dir of [DATA_DIR, CHECKPOINT_DIR, TOPIC_DATA_DIR, LOG_DIR, DOCS_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readDotEnv(fileName = '.env.local') {
  const envPath = path.join(ROOT_DIR, fileName);
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return acc;
    acc[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    return acc;
  }, {});
}

function getSupabaseEnv() {
  const envFile = readDotEnv();
  let accessToken = process.env.QGEN_SUPABASE_ACCESS_TOKEN || '';

  // Fallback: read from local session file saved by qgen:login
  if (!accessToken && fs.existsSync(SESSION_FILE)) {
    try {
      const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      accessToken = session.access_token || '';
    } catch {
      // Ignore corrupt session file
    }
  }

  return {
    url: process.env.VITE_SUPABASE_URL || envFile.VITE_SUPABASE_URL || '',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || envFile.VITE_SUPABASE_ANON_KEY || '',
    accessToken,
  };
}

function getProjectRef(url) {
  const match = String(url || '').match(/^https:\/\/([a-z0-9]+)\.supabase\.co$/);
  return match ? match[1] : null;
}

module.exports = {
  ROOT_DIR,
  DATA_DIR,
  CHECKPOINT_DIR,
  TOPIC_DATA_DIR,
  LOG_DIR,
  SESSION_FILE,
  FILES,
  GENERATOR_VERSION,
  PER_TOPIC_TARGET,
  TOTAL_TARGET,
  PAGE_SIZE,
  GENERATE_BATCH_SIZE,
  VALIDATE_BATCH_SIZE,
  PROD_REF,
  ensureDirs,
  readDotEnv,
  getSupabaseEnv,
  getProjectRef,
};

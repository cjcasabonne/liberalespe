// Inspeccion no destructiva del entorno Supabase.
// Lee archivos locales y muestra estado enmascarado. No conecta, no modifica nada.
// Uso: node scripts/check-supabase-env.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROD_REF = 'pqqkvmmenqencuretwyx';

function mask(value) {
  if (!value || value.length < 8) return '(vacio o muy corto)';
  return value.slice(0, 6) + '...' + value.slice(-4);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function parseEnv(content) {
  const result = {};
  if (!content) return result;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    result[key] = val;
  }
  return result;
}

function extractRef(url) {
  if (!url) return null;
  const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
  return match ? match[1] : null;
}

function gitBranch() {
  try {
    return execSync('git branch --show-current', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '(no disponible)';
  }
}

console.log('\n=== check-supabase-env ===\n');

// --- Git branch ---
const branch = gitBranch();
const isMain = branch === 'main';
console.log(`Rama actual:         ${branch}${isMain ? '  ⚠  RAMA MAIN' : ''}`);

// --- .env.local ---
const envLocal = parseEnv(readFile(path.join(ROOT, '.env.local')));
const envUrl = envLocal['VITE_SUPABASE_URL'] || '';
const envKey = envLocal['VITE_SUPABASE_ANON_KEY'] || '';
const envDni = envLocal['VITE_DNI_SERVICE_URL'] || '';
const envHook = envLocal['CLOUDFLARE_DEPLOY_HOOK_URL'] || '';
const refFromUrl = extractRef(envUrl);

console.log('\n--- .env.local ---');
console.log(`VITE_SUPABASE_URL:       ${envUrl ? envUrl.replace(/\/\/([^.]+)/, '//' + mask(refFromUrl || 'noref')) : '(no encontrado)'}`);
console.log(`VITE_SUPABASE_ANON_KEY:  ${envKey ? mask(envKey) : '(no encontrado)'}`);
console.log(`VITE_DNI_SERVICE_URL:    ${envDni || '(no encontrado)'}`);
console.log(`CLOUDFLARE_DEPLOY_HOOK:  ${envHook ? mask(envHook) : '(no configurado)'}`);

// --- supabase/.temp/project-ref ---
const tempRef = (readFile(path.join(ROOT, 'supabase', '.temp', 'project-ref')) || '').trim();
console.log('\n--- supabase/.temp ---');
console.log(`project-ref enlazado:    ${tempRef || '(no encontrado)'}`);

// --- Clasificacion ---
const isUrlProd = refFromUrl === PROD_REF;
const isTempProd = tempRef === PROD_REF;

console.log('\n--- Clasificacion de entorno ---');
console.log(`Project ref desde URL:   ${refFromUrl || '(no detectado)'}  ${isUrlProd ? '⛔ PRODUCCION' : '✓'}`);
console.log(`Project ref enlazado:    ${tempRef || '(no detectado)'}  ${isTempProd ? '⛔ PRODUCCION' : '✓'}`);
console.log(`Rama main detectada:     ${isMain ? '⚠  SI' : 'no'}`);

// --- Veredicto ---
const isProduction = isUrlProd || isTempProd;
console.log('\n=== VEREDICTO ===');
if (isProduction) {
  console.log('⛔  PRODUCCION DETECTADA');
  console.log('   Este workspace NO debe usarse para probar migraciones.');
  console.log('   No ejecutar: supabase db push, supabase db reset, supabase migration repair.');
  console.log('   Opciones seguras: Supabase local con Docker, o proyecto dev remoto distinto.');
} else if (!envUrl) {
  console.log('⚠  No se encontro VITE_SUPABASE_URL en .env.local.');
  console.log('   Crear .env.local con valores dev/local antes de continuar.');
} else {
  console.log('✓  Entorno parece ser dev/local. Verificar igualmente antes de ejecutar migraciones.');
  console.log('   Confirmar con: npx supabase status');
}

// --- Comandos de apoyo ---
console.log('\n--- Comandos de diagnostico adicional (no destructivos) ---');
console.log('   npx supabase status');
console.log('   npx supabase migration list');
console.log('   git branch --show-current');
console.log('');

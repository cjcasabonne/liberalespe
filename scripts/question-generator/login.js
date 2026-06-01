const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { SESSION_FILE, DATA_DIR, readDotEnv, getProjectRef } = require('./config');

function log(message) {
  console.log(`[qgen:login] ${message}`);
}

function mask(value) {
  if (!value) return '(missing)';
  if (value.length < 10) return '(masked)';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

async function login() {
  const envFile = readDotEnv();

  const url = process.env.VITE_SUPABASE_URL || envFile.VITE_SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || envFile.VITE_SUPABASE_ANON_KEY || '';
  const email = process.env.QGEN_LOGIN_EMAIL || '';
  const password = process.env.QGEN_LOGIN_PASSWORD || '';

  if (!url) throw new Error('missing_VITE_SUPABASE_URL — configura .env.local o la variable de entorno');
  if (!anonKey) throw new Error('missing_VITE_SUPABASE_ANON_KEY — configura .env.local o la variable de entorno');
  if (!email) throw new Error('missing_QGEN_LOGIN_EMAIL — ejecuta: set QGEN_LOGIN_EMAIL=correo_admin');
  if (!password) throw new Error('missing_QGEN_LOGIN_PASSWORD — ejecuta: set QGEN_LOGIN_PASSWORD=password_admin');

  const projectRef = getProjectRef(url);
  log(`conectando a ${url.replace(projectRef || '', mask(projectRef || ''))}`);
  log(`usuario: ${email}`);

  const client = createClient(url, anonKey);
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) throw new Error(`login_failed: ${error.message}`);
  if (!data?.session?.access_token) throw new Error('login_failed: no se devolvió sesión');

  const { session, user } = data;

  // Try to confirm admin/founder role (non-fatal; RPCs enforce authorization)
  let roleConfirmed = false;
  let roleNote = null;

  try {
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });

    const { data: profile, error: profileError } = await authClient
      .from('usuarios')
      .select('id, tipo_afiliacion, activo')
      .eq('id', user.id)
      .maybeSingle();

    if (!profileError && profile) {
      const isPrivileged = ['fundador', 'admin'].includes(profile.tipo_afiliacion) && profile.activo;
      if (isPrivileged) {
        roleConfirmed = true;
        roleNote = `perfil confirmado: ${profile.tipo_afiliacion} activo`;
      } else {
        roleNote = `perfil encontrado: tipo=${profile.tipo_afiliacion}, activo=${profile.activo} — las RPCs validarán autorización`;
      }
    } else {
      roleNote = 'no se pudo leer perfil de usuario — las RPCs validarán autorización';
    }
  } catch {
    roleNote = 'consulta de perfil omitida — las RPCs validarán autorización';
  }

  if (roleConfirmed) {
    log(roleNote);
  } else {
    log(`advertencia: ${roleNote}`);
  }

  // Save session to local file (not tracked by git)
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const sessionData = {
    access_token: session.access_token,
    expires_at: session.expires_at,
    user_id: user.id,
    user_email: user.email,
    project_ref: projectRef,
    saved_at: new Date().toISOString(),
  };
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2) + '\n', 'utf8');

  const expiresDate = new Date(session.expires_at * 1000).toISOString();
  log(`sesión guardada en data/question-generator/.session.local.json`);
  log(`access_token: ${mask(session.access_token)}`);
  log(`expires_at: ${expiresDate}`);
  log(`usuario: ${user.email} (${user.id})`);
  log(`proyecto: ${mask(projectRef || '(desconocido)')}`);
  if (roleConfirmed) log('rol admin/fundador confirmado ✓');
  log('listo — para cargar: QGEN_UPLOAD_CONFIRM=true npm run qgen:upload');

  return {
    user_id: user.id,
    user_email: user.email,
    expires_at: session.expires_at,
    project_ref: projectRef,
    role_confirmed: roleConfirmed,
  };
}

login().catch((err) => {
  console.error(`[qgen:login] error: ${err.message}`);
  process.exitCode = 1;
});

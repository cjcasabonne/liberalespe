import { createClient } from '@supabase/supabase-js';

type Env = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

export async function onRequestPost(context: PagesContext) {
  const { request, env } = context;
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'server_not_configured' }, 500);
  }

  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';

  if (!token) {
    return jsonResponse({ error: 'not_authorized' }, 401);
  }

  let payload: { userId?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const { userId, password } = payload;
  if (!userId || !password || password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) {
    return jsonResponse({ error: 'not_authorized' }, 401);
  }

  const actorId = authData.user.id;
  const { data: actorProfile, error: actorError } = await userClient
    .from('perfiles')
    .select('user_id,rol_sistema,estado')
    .eq('user_id', actorId)
    .single();

  if (
    actorError ||
    !actorProfile ||
    actorProfile.estado !== 'activo' ||
    !['administrador', 'fundador'].includes(actorProfile.rol_sistema)
  ) {
    return jsonResponse({ error: 'not_authorized' }, 403);
  }

  if (userId === actorId) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const { data: targetProfile, error: targetError } = await adminClient
    .from('perfiles')
    .select('id,user_id')
    .eq('user_id', userId)
    .single();

  if (targetError || !targetProfile) {
    return jsonResponse({ error: 'not_found' }, 404);
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, { password });
  if (updateError) {
    return jsonResponse({ error: 'password_policy_rejected' }, 400);
  }

  await adminClient.from('audit_log').insert({
    actor_id: actorId,
    sujeto_id: userId,
    accion: 'resetear_contrasena_manual',
    tabla: 'auth.users',
    registro_id: targetProfile.id,
    antes: null,
    despues: { usuario_id: targetProfile.id },
  });

  return jsonResponse({ ok: true });
}

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

type ResetPasswordError = 'not_authorized' | 'weak_password' | 'user_not_found' | 'unknown';

function errorResponse(error: ResetPasswordError, status = 400) {
  return jsonResponse({ error }, status);
}

function isWeakPasswordError(error: { message?: string; status?: number } | null) {
  if (!error) {
    return false;
  }

  const message = error.message?.toLowerCase() ?? '';
  return error.status === 422 || message.includes('password') || message.includes('contrase');
}

function getBearerToken(authorization: string) {
  return authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? '';
}

export async function onRequestPost(context: PagesContext) {
  const { request, env } = context;
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  console.info('[restablecer-password] request_start');

  try {
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.info('[restablecer-password] authorization_result', {
        authorized: false,
        reason: 'server_not_configured',
      });
      return errorResponse('unknown', 500);
    }

    const authorization = request.headers.get('authorization') ?? '';
    const token = getBearerToken(authorization);

    if (!token) {
      console.info('[restablecer-password] authorization_result', { authorized: false, reason: 'missing_token' });
      return errorResponse('not_authorized', 401);
    }

    let payload: { userId?: string; password?: string };
    try {
      payload = await request.json();
    } catch {
      return errorResponse('unknown', 400);
    }

    const { userId, password } = payload;
    if (!userId) {
      return errorResponse('unknown', 400);
    }

    if (!password || password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return errorResponse('weak_password', 400);
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

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) {
      console.info('[restablecer-password] authorization_result', { authorized: false, reason: 'invalid_token' });
      return errorResponse('not_authorized', 401);
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
      console.info('[restablecer-password] authorization_result', { authorized: false, reason: 'insufficient_role' });
      return errorResponse('not_authorized', 403);
    }

    console.info('[restablecer-password] authorization_result', { authorized: true, actorId });

    if (userId === actorId) {
      return errorResponse('not_authorized', 403);
    }

    const { data: targetProfile, error: targetError } = await adminClient
      .from('perfiles')
      .select('id,user_id')
      .eq('user_id', userId)
      .single();

    if (targetError || !targetProfile) {
      console.info('[restablecer-password] target_lookup_result', { found: false });
      return errorResponse('user_not_found', 404);
    }
    console.info('[restablecer-password] target_lookup_result', { found: true });

    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, { password });
    if (updateError) {
      const mappedError =
        updateError.status === 404 ? 'user_not_found' : isWeakPasswordError(updateError) ? 'weak_password' : 'unknown';
      console.info('[restablecer-password] updateUserById_result', { success: false, error: mappedError });
      return errorResponse(mappedError, mappedError === 'user_not_found' ? 404 : 400);
    }

    console.info('[restablecer-password] updateUserById_result', { success: true });

    const { error: auditError } = await adminClient.from('audit_log').insert({
      actor_id: actorId,
      sujeto_id: userId,
      accion: 'resetear_contrasena_manual',
      tabla: 'auth.users',
      registro_id: targetProfile.id,
      antes: null,
      despues: { usuario_id: targetProfile.id },
    });

    if (auditError) {
      console.info('[restablecer-password] audit_result', { success: false });
      return errorResponse('unknown', 500);
    }

    console.info('[restablecer-password] audit_result', { success: true });
    return jsonResponse({ success: true });
  } catch (unexpectedError) {
    console.info('[restablecer-password] request_result', {
      success: false,
      error: 'unknown',
      errorType: unexpectedError instanceof Error ? unexpectedError.name : typeof unexpectedError,
    });
    return errorResponse('unknown', 500);
  }
}

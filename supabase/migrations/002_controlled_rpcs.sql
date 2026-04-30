-- Controlled administrative RPCs for critical operational actions.
-- No critical state transition should be performed by direct frontend updates.

create or replace function public.audit_json_perfil(perfil public.perfiles)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', perfil.id,
    'user_id', perfil.user_id,
    'dni_masked', case
      when perfil.dni is null then null
      else '****' || right(perfil.dni, 4)
    end,
    'rol_sistema', perfil.rol_sistema,
    'tipo_miembro', perfil.tipo_miembro,
    'estado', perfil.estado,
    'validado_manualmente', perfil.validado_manualmente,
    'validado_por', perfil.validado_por,
    'validado_en', perfil.validado_en
  );
$$;

create or replace function public.audit_json_solicitud_afiliacion(solicitud public.solicitudes_afiliacion)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', solicitud.id,
    'usuario_id', solicitud.usuario_id,
    'estado', solicitud.estado,
    'comentario_operador', solicitud.comentario_operador,
    'revisado_por', solicitud.revisado_por,
    'revisado_en', solicitud.revisado_en
  );
$$;

create or replace function public.audit_json_solicitud_desafiliacion(solicitud public.solicitudes_desafiliacion)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', solicitud.id,
    'usuario_id', solicitud.usuario_id,
    'estado', solicitud.estado,
    'revisado_por', solicitud.revisado_por,
    'revisado_en', solicitud.revisado_en
  );
$$;

create or replace function public.validar_usuario(usuario_id uuid, observacion text default null)
returns public.perfiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.perfiles;
  after_row public.perfiles;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  select * into before_row
  from public.perfiles
  where id = usuario_id
  for update;

  if not found then
    raise exception 'perfil_not_found';
  end if;

  if before_row.estado <> 'activo' then
    raise exception 'perfil_not_active';
  end if;

  update public.perfiles
  set validado_manualmente = true,
      validado_por = actor,
      validado_en = now()
  where id = usuario_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    after_row.user_id,
    'validar_usuario',
    'perfiles',
    after_row.id,
    public.audit_json_perfil(before_row),
    public.audit_json_perfil(after_row) || jsonb_build_object('observacion', nullif(observacion, ''))
  );

  return after_row;
end;
$$;

create or replace function public.aprobar_afiliacion(solicitud_id uuid)
returns public.solicitudes_afiliacion
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_solicitud public.solicitudes_afiliacion;
  after_solicitud public.solicitudes_afiliacion;
  before_perfil public.perfiles;
  after_perfil public.perfiles;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  select * into before_solicitud
  from public.solicitudes_afiliacion
  where id = solicitud_id
  for update;

  if not found then
    raise exception 'solicitud_not_found';
  end if;

  if before_solicitud.estado <> 'pendiente' then
    raise exception 'solicitud_not_pending';
  end if;

  select * into before_perfil
  from public.perfiles
  where id = before_solicitud.usuario_id
  for update;

  if not found then
    raise exception 'perfil_not_found';
  end if;

  if before_perfil.estado <> 'activo' then
    raise exception 'perfil_not_active';
  end if;

  if before_perfil.validado_manualmente is not true then
    raise exception 'perfil_not_validated';
  end if;

  update public.perfiles
  set tipo_miembro = 'afiliado'
  where id = before_perfil.id
  returning * into after_perfil;

  update public.solicitudes_afiliacion
  set estado = 'aprobada',
      revisado_por = actor,
      revisado_en = now()
  where id = solicitud_id
  returning * into after_solicitud;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    after_perfil.user_id,
    'aprobar_afiliacion',
    'solicitudes_afiliacion',
    after_solicitud.id,
    jsonb_build_object(
      'solicitud', public.audit_json_solicitud_afiliacion(before_solicitud),
      'perfil', public.audit_json_perfil(before_perfil)
    ),
    jsonb_build_object(
      'solicitud', public.audit_json_solicitud_afiliacion(after_solicitud),
      'perfil', public.audit_json_perfil(after_perfil)
    )
  );

  return after_solicitud;
end;
$$;

create or replace function public.rechazar_afiliacion(solicitud_id uuid, comentario text)
returns public.solicitudes_afiliacion
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_solicitud public.solicitudes_afiliacion;
  after_solicitud public.solicitudes_afiliacion;
  perfil public.perfiles;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if nullif(comentario, '') is null then
    raise exception 'comentario_required';
  end if;

  select * into before_solicitud
  from public.solicitudes_afiliacion
  where id = solicitud_id
  for update;

  if not found then
    raise exception 'solicitud_not_found';
  end if;

  if before_solicitud.estado <> 'pendiente' then
    raise exception 'solicitud_not_pending';
  end if;

  select * into perfil
  from public.perfiles
  where id = before_solicitud.usuario_id;

  update public.solicitudes_afiliacion
  set estado = 'rechazada',
      comentario_operador = comentario,
      revisado_por = actor,
      revisado_en = now()
  where id = solicitud_id
  returning * into after_solicitud;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    perfil.user_id,
    'rechazar_afiliacion',
    'solicitudes_afiliacion',
    after_solicitud.id,
    public.audit_json_solicitud_afiliacion(before_solicitud),
    public.audit_json_solicitud_afiliacion(after_solicitud)
  );

  return after_solicitud;
end;
$$;

create or replace function public.aprobar_desafiliacion(solicitud_id uuid)
returns public.solicitudes_desafiliacion
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_solicitud public.solicitudes_desafiliacion;
  after_solicitud public.solicitudes_desafiliacion;
  before_perfil public.perfiles;
  after_perfil public.perfiles;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  select * into before_solicitud
  from public.solicitudes_desafiliacion
  where id = solicitud_id
  for update;

  if not found then
    raise exception 'solicitud_not_found';
  end if;

  if before_solicitud.estado <> 'pendiente' then
    raise exception 'solicitud_not_pending';
  end if;

  select * into before_perfil
  from public.perfiles
  where id = before_solicitud.usuario_id
  for update;

  if not found then
    raise exception 'perfil_not_found';
  end if;

  update public.perfiles
  set estado = 'desafiliado',
      tipo_miembro = 'adherente'
  where id = before_perfil.id
  returning * into after_perfil;

  update public.solicitudes_desafiliacion
  set estado = 'aprobada',
      revisado_por = actor,
      revisado_en = now()
  where id = solicitud_id
  returning * into after_solicitud;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    after_perfil.user_id,
    'aprobar_desafiliacion',
    'solicitudes_desafiliacion',
    after_solicitud.id,
    jsonb_build_object(
      'solicitud', public.audit_json_solicitud_desafiliacion(before_solicitud),
      'perfil', public.audit_json_perfil(before_perfil)
    ),
    jsonb_build_object(
      'solicitud', public.audit_json_solicitud_desafiliacion(after_solicitud),
      'perfil', public.audit_json_perfil(after_perfil)
    )
  );

  return after_solicitud;
end;
$$;

create or replace function public.anular_usuario(usuario_id uuid, motivo text)
returns public.perfiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.perfiles;
  after_row public.perfiles;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if nullif(motivo, '') is null then
    raise exception 'motivo_required';
  end if;

  select * into before_row
  from public.perfiles
  where id = usuario_id
  for update;

  if not found then
    raise exception 'perfil_not_found';
  end if;

  if before_row.user_id = actor then
    raise exception 'cannot_anular_self';
  end if;

  if before_row.rol_sistema = 'fundador' and not public.es_fundador() then
    raise exception 'cannot_anular_fundador';
  end if;

  update public.perfiles
  set estado = 'anulado',
      tipo_miembro = 'adherente'
  where id = usuario_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    after_row.user_id,
    'anular_usuario',
    'perfiles',
    after_row.id,
    public.audit_json_perfil(before_row),
    public.audit_json_perfil(after_row) || jsonb_build_object('motivo', motivo)
  );

  return after_row;
end;
$$;

create or replace function public.cambiar_rol_sistema(usuario_id uuid, nuevo_rol public.rol_sistema)
returns public.perfiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.perfiles;
  after_row public.perfiles;
begin
  if actor is null or not public.es_fundador() then
    raise exception 'not_authorized';
  end if;

  select * into before_row
  from public.perfiles
  where id = usuario_id
  for update;

  if not found then
    raise exception 'perfil_not_found';
  end if;

  if before_row.user_id = actor then
    raise exception 'cannot_change_own_role';
  end if;

  if before_row.estado <> 'activo' then
    raise exception 'perfil_not_active';
  end if;

  update public.perfiles
  set rol_sistema = nuevo_rol
  where id = usuario_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    after_row.user_id,
    'cambiar_rol_sistema',
    'perfiles',
    after_row.id,
    public.audit_json_perfil(before_row),
    public.audit_json_perfil(after_row)
  );

  return after_row;
end;
$$;

revoke all on function public.audit_json_perfil(public.perfiles) from public;
revoke all on function public.audit_json_solicitud_afiliacion(public.solicitudes_afiliacion) from public;
revoke all on function public.audit_json_solicitud_desafiliacion(public.solicitudes_desafiliacion) from public;

grant execute on function public.validar_usuario(uuid, text) to authenticated;
grant execute on function public.aprobar_afiliacion(uuid) to authenticated;
grant execute on function public.rechazar_afiliacion(uuid, text) to authenticated;
grant execute on function public.aprobar_desafiliacion(uuid) to authenticated;
grant execute on function public.anular_usuario(uuid, text) to authenticated;
grant execute on function public.cambiar_rol_sistema(uuid, public.rol_sistema) to authenticated;

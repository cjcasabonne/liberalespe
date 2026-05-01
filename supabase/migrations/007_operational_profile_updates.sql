-- Operational profile corrections and disaffiliation rejection.

create or replace function public.actualizar_perfil_operativo(
  usuario_id uuid,
  nuevos_nombres text,
  nuevo_telefono text,
  motivo text
)
returns public.perfiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.perfiles;
  after_row public.perfiles;
  normalized_names text := nullif(regexp_replace(btrim(nuevos_nombres), '\s+', ' ', 'g'), '');
  normalized_phone text := nullif(btrim(nuevo_telefono), '');
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if normalized_names is null or char_length(normalized_names) < 3 then
    raise exception 'invalid_names';
  end if;

  if normalized_phone is not null and char_length(normalized_phone) < 6 then
    raise exception 'invalid_phone';
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

  update public.perfiles
  set nombres = upper(normalized_names),
      telefono = normalized_phone
  where id = usuario_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    after_row.user_id,
    'actualizar_perfil_operativo',
    'perfiles',
    after_row.id,
    public.audit_json_perfil(before_row) || jsonb_build_object(
      'nombres_changed', before_row.nombres is distinct from after_row.nombres,
      'telefono_changed', before_row.telefono is distinct from after_row.telefono
    ),
    public.audit_json_perfil(after_row) || jsonb_build_object(
      'nombres_changed', before_row.nombres is distinct from after_row.nombres,
      'telefono_changed', before_row.telefono is distinct from after_row.telefono,
      'motivo', motivo
    )
  );

  return after_row;
end;
$$;

create or replace function public.rechazar_desafiliacion(solicitud_id uuid, comentario text)
returns public.solicitudes_desafiliacion
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_solicitud public.solicitudes_desafiliacion;
  after_solicitud public.solicitudes_desafiliacion;
  perfil public.perfiles;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if nullif(comentario, '') is null then
    raise exception 'comentario_required';
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

  select * into perfil
  from public.perfiles
  where id = before_solicitud.usuario_id;

  update public.solicitudes_desafiliacion
  set estado = 'rechazada',
      revisado_por = actor,
      revisado_en = now()
  where id = solicitud_id
  returning * into after_solicitud;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    perfil.user_id,
    'rechazar_desafiliacion',
    'solicitudes_desafiliacion',
    after_solicitud.id,
    public.audit_json_solicitud_desafiliacion(before_solicitud),
    public.audit_json_solicitud_desafiliacion(after_solicitud) || jsonb_build_object('comentario_operador', comentario)
  );

  return after_solicitud;
end;
$$;

grant execute on function public.actualizar_perfil_operativo(uuid, text, text, text) to authenticated;
grant execute on function public.rechazar_desafiliacion(uuid, text) to authenticated;

-- Controlled reactivation for disabled users.

create or replace function public.reactivar_usuario(usuario_id uuid, motivo text)
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

  if nullif(btrim(motivo), '') is null then
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
    raise exception 'cannot_reactivate_own_profile';
  end if;

  if before_row.estado = 'activo' then
    raise exception 'perfil_already_active';
  end if;

  if before_row.estado not in ('anulado', 'desafiliado') then
    raise exception 'invalid_profile_state';
  end if;

  update public.perfiles
  set estado = 'activo'
  where id = usuario_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    after_row.user_id,
    'reactivar_usuario',
    'perfiles',
    after_row.id,
    public.audit_json_perfil(before_row),
    public.audit_json_perfil(after_row) || jsonb_build_object('motivo', btrim(motivo))
  );

  return after_row;
end;
$$;

revoke all on function public.reactivar_usuario(uuid, text) from public;
grant execute on function public.reactivar_usuario(uuid, text) to authenticated;

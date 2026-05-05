-- V3 voting activation RPCs.
-- The UI uses these functions so eligibility, topic visibility, and result
-- disclosure stay controlled by the database instead of browser logic.

create or replace function public.crear_tema_controlado(p_titulo text, p_descripcion text default null)
returns public.temas
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  inserted_topic public.temas;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if char_length(btrim(coalesce(p_titulo, ''))) < 4 then
    raise exception 'titulo_required';
  end if;

  insert into public.temas(titulo, descripcion, estado, creado_por)
  values (btrim(p_titulo), nullif(btrim(coalesce(p_descripcion, '')), ''), 'borrador', actor)
  returning * into inserted_topic;

  return inserted_topic;
end;
$$;

create or replace function public.cambiar_estado_tema_controlado(p_tema_id uuid, p_estado public.estado_tema)
returns public.temas
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_topic public.temas;
  after_topic public.temas;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  select * into before_topic
  from public.temas
  where id = p_tema_id
  for update;

  if not found then
    raise exception 'tema_not_found';
  end if;

  if before_topic.estado in ('cerrado', 'anulado') then
    raise exception 'tema_final_state';
  end if;

  if before_topic.estado = 'borrador' and p_estado not in ('abierto', 'anulado') then
    raise exception 'invalid_topic_transition';
  end if;

  if before_topic.estado = 'abierto' and p_estado not in ('cerrado', 'anulado') then
    raise exception 'invalid_topic_transition';
  end if;

  update public.temas
  set estado = p_estado,
      abre_en = case
        when p_estado = 'abierto' and abre_en is null then now()
        else abre_en
      end,
      cierra_en = case
        when p_estado in ('cerrado', 'anulado') and cierra_en is null then now()
        else cierra_en
      end
  where id = p_tema_id
  returning * into after_topic;

  return after_topic;
end;
$$;

create or replace function public.emitir_voto_controlado(p_tema_id uuid, p_opcion text)
returns public.votos
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_profile public.perfiles;
  selected_topic public.temas;
  inserted_vote public.votos;
begin
  if actor is null then
    raise exception 'not_authorized';
  end if;

  if p_opcion not in ('si', 'no', 'abstencion') then
    raise exception 'invalid_vote_option';
  end if;

  select * into actor_profile
  from public.perfiles
  where user_id = actor
  for update;

  if not found then
    raise exception 'perfil_not_found';
  end if;

  if actor_profile.estado <> 'activo' or actor_profile.tipo_miembro <> 'afiliado' then
    raise exception 'not_eligible_to_vote';
  end if;

  select * into selected_topic
  from public.temas
  where id = p_tema_id
  for update;

  if not found then
    raise exception 'tema_not_found';
  end if;

  if selected_topic.estado <> 'abierto'
    or (selected_topic.abre_en is not null and selected_topic.abre_en > now())
    or (selected_topic.cierra_en is not null and selected_topic.cierra_en <= now()) then
    raise exception 'tema_not_open';
  end if;

  insert into public.votos(tema_id, usuario_id, opcion)
  values (p_tema_id, actor_profile.id, p_opcion)
  returning * into inserted_vote;

  return inserted_vote;
end;
$$;

create or replace function public.resumen_votos_tema(p_tema_id uuid)
returns table(opcion text, total bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  selected_topic public.temas;
begin
  if actor is null then
    raise exception 'not_authorized';
  end if;

  select * into selected_topic
  from public.temas
  where id = p_tema_id;

  if not found then
    raise exception 'tema_not_found';
  end if;

  if selected_topic.estado <> 'cerrado' and not public.es_admin() then
    raise exception 'results_not_available';
  end if;

  if selected_topic.estado in ('borrador', 'anulado') and not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  return query
  with opciones(opcion) as (
    values ('si'), ('no'), ('abstencion')
  )
  select opciones.opcion, count(v.id)::bigint
  from opciones
  left join public.votos v
    on v.tema_id = p_tema_id
    and v.opcion = opciones.opcion
  group by opciones.opcion
  order by case opciones.opcion
    when 'si' then 1
    when 'no' then 2
    else 3
  end;
end;
$$;

revoke insert, update on public.temas from authenticated;

revoke all on function public.crear_tema_controlado(text, text) from public;
revoke all on function public.cambiar_estado_tema_controlado(uuid, public.estado_tema) from public;
revoke all on function public.emitir_voto_controlado(uuid, text) from public;
revoke all on function public.resumen_votos_tema(uuid) from public;

grant execute on function public.crear_tema_controlado(text, text) to authenticated;
grant execute on function public.cambiar_estado_tema_controlado(uuid, public.estado_tema) to authenticated;
grant execute on function public.emitir_voto_controlado(uuid, text) to authenticated;
grant execute on function public.resumen_votos_tema(uuid) to authenticated;

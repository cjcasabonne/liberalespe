-- Add structured voting options to temas.
-- Before this migration, all topics were binary (si/no/abstencion).
-- After this migration, topics can be 'binaria' or 'opciones' with a text[] of choices.

-- 1. Add tipo_votacion and opciones columns to temas
alter table public.temas
add column if not exists tipo_votacion text not null default 'binaria';

alter table public.temas
drop constraint if exists temas_tipo_votacion_valido;

alter table public.temas
add constraint temas_tipo_votacion_valido
check (tipo_votacion in ('binaria', 'opciones'));

alter table public.temas
add column if not exists opciones text[] not null default '{}';

alter table public.temas
drop constraint if exists temas_opciones_consistente;

alter table public.temas
add constraint temas_opciones_consistente check (
  tipo_votacion = 'binaria'
  or array_length(opciones, 1) >= 2
);

-- 2. Relax votos opcion constraint to allow dynamic option values
alter table public.votos
drop constraint if exists votos_opcion_valida;

alter table public.votos
drop constraint if exists votos_opcion_no_vacia;

alter table public.votos
add constraint votos_opcion_no_vacia check (char_length(btrim(opcion)) > 0);

-- 3. Update emitir_voto_controlado to validate per topic type
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

  if selected_topic.publico_objetivo = 'fundadores' and actor_profile.rol_sistema <> 'fundador' then
    raise exception 'not_eligible_to_vote';
  end if;

  if selected_topic.tipo_votacion = 'binaria' then
    if p_opcion not in ('si', 'no', 'abstencion') then
      raise exception 'invalid_vote_option';
    end if;
  else
    if not (p_opcion = any(selected_topic.opciones)) then
      raise exception 'invalid_vote_option';
    end if;
  end if;

  insert into public.votos(tema_id, usuario_id, opcion)
  values (p_tema_id, actor_profile.id, p_opcion)
  returning * into inserted_vote;

  return inserted_vote;
end;
$$;

-- 4. Update resumen_votos_tema to aggregate by topic type
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

  if selected_topic.tipo_votacion = 'binaria' then
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
  else
    return query
    select u.opcion, count(v.id)::bigint
    from unnest(selected_topic.opciones) as u(opcion)
    left join public.votos v
      on v.tema_id = p_tema_id
      and v.opcion = u.opcion
    group by u.opcion
    order by array_position(selected_topic.opciones, u.opcion);
  end if;
end;
$$;

-- 5. Replace crear_tema_controlado with version that accepts tipo_votacion and opciones
revoke all on function public.crear_tema_controlado(text, text, text) from public, authenticated;
drop function if exists public.crear_tema_controlado(text, text, text);

create or replace function public.crear_tema_controlado(
  p_titulo text,
  p_descripcion text default null,
  p_publico_objetivo text default 'afiliados',
  p_tipo_votacion text default 'binaria',
  p_opciones text[] default '{}'
)
returns public.temas
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  normalized_audience text := coalesce(nullif(btrim(p_publico_objetivo), ''), 'afiliados');
  normalized_tipo text := coalesce(nullif(btrim(p_tipo_votacion), ''), 'binaria');
  normalized_opciones text[] := coalesce(p_opciones, '{}');
  inserted_topic public.temas;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if char_length(btrim(coalesce(p_titulo, ''))) < 4 then
    raise exception 'titulo_required';
  end if;

  if normalized_audience not in ('afiliados', 'fundadores') then
    raise exception 'invalid_topic_audience';
  end if;

  if normalized_tipo not in ('binaria', 'opciones') then
    raise exception 'invalid_vote_type';
  end if;

  if normalized_tipo = 'opciones' and array_length(normalized_opciones, 1) < 2 then
    raise exception 'options_required';
  end if;

  if normalized_tipo = 'binaria' then
    normalized_opciones := '{}';
  end if;

  insert into public.temas(titulo, descripcion, estado, creado_por, publico_objetivo, tipo_votacion, opciones)
  values (
    btrim(p_titulo),
    nullif(btrim(coalesce(p_descripcion, '')), ''),
    'borrador',
    actor,
    normalized_audience,
    normalized_tipo,
    normalized_opciones
  )
  returning * into inserted_topic;

  return inserted_topic;
end;
$$;

revoke all on function public.crear_tema_controlado(text, text, text, text, text[]) from public;
grant execute on function public.crear_tema_controlado(text, text, text, text, text[]) to authenticated;

-- 6. Update convertir_sugerencia_tema to preserve structured options
create or replace function public.convertir_sugerencia_tema(
  p_sugerencia_id uuid,
  p_publico_objetivo text default 'afiliados',
  p_revision_comentario text default null
)
returns public.temas
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.tema_sugerencias;
  updated_suggestion public.tema_sugerencias;
  inserted_topic public.temas;
  normalized_audience text := coalesce(nullif(btrim(p_publico_objetivo), ''), 'afiliados');
  normalized_opciones text[];
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if normalized_audience not in ('afiliados', 'fundadores') then
    raise exception 'invalid_topic_audience';
  end if;

  select * into before_row
  from public.tema_sugerencias
  where id = p_sugerencia_id
  for update;

  if not found then
    raise exception 'suggestion_not_found';
  end if;

  if before_row.estado not in ('pendiente', 'aprobado') then
    raise exception 'invalid_suggestion_state';
  end if;

  normalized_opciones := case
    when before_row.tipo_votacion_sugerido = 'opciones' then
      array(
        select value #>> '{}'
        from jsonb_array_elements(before_row.opciones_sugeridas)
      )
    else '{}'::text[]
  end;

  insert into public.temas(titulo, descripcion, estado, creado_por, publico_objetivo, tipo_votacion, opciones)
  values (
    before_row.titulo,
    nullif(btrim(coalesce(before_row.descripcion, '')), ''),
    'borrador',
    actor,
    normalized_audience,
    before_row.tipo_votacion_sugerido,
    normalized_opciones
  )
  returning * into inserted_topic;

  update public.tema_sugerencias
  set estado = 'convertido',
      revision_comentario = nullif(btrim(coalesce(p_revision_comentario, revision_comentario, '')), ''),
      reviewed_by = actor,
      reviewed_at = now(),
      tema_id_generado = inserted_topic.id
  where id = p_sugerencia_id
  returning * into updated_suggestion;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'convertir_sugerencia_tema',
    'tema_sugerencias',
    updated_suggestion.id,
    jsonb_build_object('estado', before_row.estado, 'tema_id_generado', before_row.tema_id_generado),
    jsonb_build_object('estado', updated_suggestion.estado, 'tema_id_generado', inserted_topic.id)
  );

  return inserted_topic;
end;
$$;

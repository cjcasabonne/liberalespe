-- Topic suggestions are separate from official voting topics.

create table if not exists public.tema_sugerencias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  tipo_votacion_sugerido text not null,
  opciones_sugeridas jsonb not null default '[]'::jsonb,
  created_by uuid not null references public.perfiles(id) on delete restrict,
  estado text not null default 'pendiente',
  revision_comentario text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  tema_id_generado uuid references public.temas(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint tema_sugerencias_titulo_minimo check (char_length(btrim(titulo)) >= 4),
  constraint tema_sugerencias_tipo_valido check (tipo_votacion_sugerido in ('binaria', 'opciones')),
  constraint tema_sugerencias_estado_valido check (estado in ('pendiente', 'aprobado', 'rechazado', 'convertido')),
  constraint tema_sugerencias_opciones_array check (jsonb_typeof(opciones_sugeridas) = 'array'),
  constraint tema_sugerencias_opciones_minimas check (
    tipo_votacion_sugerido = 'binaria'
    or jsonb_array_length(opciones_sugeridas) >= 2
  )
);

create index if not exists tema_sugerencias_created_by_idx on public.tema_sugerencias(created_by);
create index if not exists tema_sugerencias_estado_idx on public.tema_sugerencias(estado);
create index if not exists tema_sugerencias_created_at_idx on public.tema_sugerencias(created_at desc);
create index if not exists tema_sugerencias_tema_id_generado_idx on public.tema_sugerencias(tema_id_generado);

alter table public.tema_sugerencias enable row level security;

drop policy if exists "tema_sugerencias_select_own_or_admin" on public.tema_sugerencias;
create policy "tema_sugerencias_select_own_or_admin"
on public.tema_sugerencias
for select
to authenticated
using (
  public.es_admin()
  or exists (
    select 1
    from public.perfiles p
    where p.id = tema_sugerencias.created_by
      and p.user_id = auth.uid()
  )
);

drop policy if exists "tema_sugerencias_insert_active_affiliate" on public.tema_sugerencias;
create policy "tema_sugerencias_insert_active_affiliate"
on public.tema_sugerencias
for insert
to authenticated
with check (
  estado = 'pendiente'
  and revision_comentario is null
  and reviewed_by is null
  and reviewed_at is null
  and tema_id_generado is null
  and exists (
    select 1
    from public.perfiles p
    where p.id = created_by
      and p.user_id = auth.uid()
      and p.estado = 'activo'
      and p.tipo_miembro = 'afiliado'
  )
);

drop policy if exists "tema_sugerencias_update_admin" on public.tema_sugerencias;

grant select, insert on public.tema_sugerencias to authenticated;
revoke update, delete on public.tema_sugerencias from anon, authenticated;
revoke all on public.tema_sugerencias from anon;

create or replace function public.audit_tema_sugerencia_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  sujeto uuid;
begin
  select p.user_id into sujeto
  from public.perfiles p
  where p.id = new.created_by;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    sujeto,
    'crear_sugerencia_tema',
    'tema_sugerencias',
    new.id,
    null,
    jsonb_build_object(
      'id', new.id,
      'tipo_votacion_sugerido', new.tipo_votacion_sugerido,
      'estado', new.estado
    )
  );

  return new;
end;
$$;

drop trigger if exists tema_sugerencias_audit_insert on public.tema_sugerencias;
create trigger tema_sugerencias_audit_insert
after insert on public.tema_sugerencias
for each row
execute function public.audit_tema_sugerencia_insert();

create or replace function public.normalizar_opciones_sugeridas(p_tipo text, p_opciones jsonb)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  normalized jsonb;
begin
  if p_tipo = 'binaria' then
    return '[]'::jsonb;
  end if;

  if jsonb_typeof(coalesce(p_opciones, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_suggested_options';
  end if;

  select coalesce(jsonb_agg(to_jsonb(option_text)), '[]'::jsonb) into normalized
  from (
    select distinct btrim(value #>> '{}') as option_text
    from jsonb_array_elements(coalesce(p_opciones, '[]'::jsonb))
    where char_length(btrim(value #>> '{}')) >= 1
    limit 12
  ) options;

  if jsonb_array_length(normalized) < 2 then
    raise exception 'suggested_options_required';
  end if;

  return normalized;
end;
$$;

create or replace function public.crear_sugerencia_tema(
  p_titulo text,
  p_descripcion text default null,
  p_tipo_votacion_sugerido text default 'binaria',
  p_opciones_sugeridas jsonb default '[]'::jsonb
)
returns public.tema_sugerencias
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_profile public.perfiles;
  normalized_type text := coalesce(nullif(btrim(p_tipo_votacion_sugerido), ''), 'binaria');
  normalized_options jsonb;
  inserted_suggestion public.tema_sugerencias;
begin
  if actor is null then
    raise exception 'not_authorized';
  end if;

  select * into actor_profile
  from public.perfiles
  where user_id = actor;

  if not found or actor_profile.estado <> 'activo' or actor_profile.tipo_miembro <> 'afiliado' then
    raise exception 'not_eligible_to_suggest';
  end if;

  if char_length(btrim(coalesce(p_titulo, ''))) < 4 then
    raise exception 'titulo_required';
  end if;

  if normalized_type not in ('binaria', 'opciones') then
    raise exception 'invalid_vote_type';
  end if;

  normalized_options := public.normalizar_opciones_sugeridas(normalized_type, p_opciones_sugeridas);

  insert into public.tema_sugerencias(titulo, descripcion, tipo_votacion_sugerido, opciones_sugeridas, created_by)
  values (
    btrim(p_titulo),
    nullif(btrim(coalesce(p_descripcion, '')), ''),
    normalized_type,
    normalized_options,
    actor_profile.id
  )
  returning * into inserted_suggestion;

  return inserted_suggestion;
end;
$$;

create or replace function public.aprobar_sugerencia_tema(p_sugerencia_id uuid, p_revision_comentario text default null)
returns public.tema_sugerencias
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.tema_sugerencias;
  after_row public.tema_sugerencias;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  select * into before_row
  from public.tema_sugerencias
  where id = p_sugerencia_id
  for update;

  if not found then
    raise exception 'suggestion_not_found';
  end if;

  if before_row.estado <> 'pendiente' then
    raise exception 'suggestion_not_pending';
  end if;

  update public.tema_sugerencias
  set estado = 'aprobado',
      revision_comentario = nullif(btrim(coalesce(p_revision_comentario, '')), ''),
      reviewed_by = actor,
      reviewed_at = now()
  where id = p_sugerencia_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'aprobar_sugerencia_tema',
    'tema_sugerencias',
    after_row.id,
    jsonb_build_object('estado', before_row.estado),
    jsonb_build_object('estado', after_row.estado, 'reviewed_by', after_row.reviewed_by)
  );

  return after_row;
end;
$$;

create or replace function public.rechazar_sugerencia_tema(p_sugerencia_id uuid, p_revision_comentario text)
returns public.tema_sugerencias
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.tema_sugerencias;
  after_row public.tema_sugerencias;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if nullif(btrim(coalesce(p_revision_comentario, '')), '') is null then
    raise exception 'revision_comment_required';
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

  update public.tema_sugerencias
  set estado = 'rechazado',
      revision_comentario = btrim(p_revision_comentario),
      reviewed_by = actor,
      reviewed_at = now()
  where id = p_sugerencia_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'rechazar_sugerencia_tema',
    'tema_sugerencias',
    after_row.id,
    jsonb_build_object('estado', before_row.estado),
    jsonb_build_object('estado', after_row.estado, 'reviewed_by', after_row.reviewed_by)
  );

  return after_row;
end;
$$;

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
  conversion_note text;
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

  conversion_note := case
    when before_row.tipo_votacion_sugerido = 'opciones' then
      E'\n\nOpciones sugeridas:\n- ' || array_to_string(
        array(
          select value #>> '{}'
          from jsonb_array_elements(before_row.opciones_sugeridas)
        ),
        E'\n- '
      )
    else ''
  end;

  insert into public.temas(titulo, descripcion, estado, creado_por, publico_objetivo)
  values (
    before_row.titulo,
    nullif(concat_ws(E'\n\n', before_row.descripcion, nullif(conversion_note, '')), ''),
    'borrador',
    actor,
    normalized_audience
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

revoke all on function public.normalizar_opciones_sugeridas(text, jsonb) from public;
revoke all on function public.audit_tema_sugerencia_insert() from public;
revoke all on function public.crear_sugerencia_tema(text, text, text, jsonb) from public;
revoke all on function public.aprobar_sugerencia_tema(uuid, text) from public;
revoke all on function public.rechazar_sugerencia_tema(uuid, text) from public;
revoke all on function public.convertir_sugerencia_tema(uuid, text, text) from public;

grant execute on function public.crear_sugerencia_tema(text, text, text, jsonb) to authenticated;
grant execute on function public.aprobar_sugerencia_tema(uuid, text) to authenticated;
grant execute on function public.rechazar_sugerencia_tema(uuid, text) to authenticated;
grant execute on function public.convertir_sugerencia_tema(uuid, text, text) to authenticated;

-- Staging and human review layer for future generated political topics.
-- This migration does not generate content, seed candidates, or open votings.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generated_topic_jsonb_text_array_is_valid(value jsonb)
returns boolean
language sql
immutable
as $$
  select jsonb_typeof(coalesce(value, '[]'::jsonb)) = 'array'
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(value, '[]'::jsonb)) as item(value)
      where jsonb_typeof(item.value) <> 'string'
        or char_length(btrim(item.value #>> '{}')) = 0
    );
$$;

create table if not exists public.generated_topic_batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text unique not null,
  source text not null default 'future_generator',
  ideological_profile text not null default 'liberal_democratic',
  status text not null default 'draft',
  expected_count integer,
  inserted_count integer not null default 0,
  valid_count integer not null default 0,
  rejected_count integer not null default 0,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint generated_topic_batches_code_not_empty check (char_length(btrim(batch_code)) >= 3),
  constraint generated_topic_batches_source_not_empty check (char_length(btrim(source)) > 0),
  constraint generated_topic_batches_profile_not_empty check (char_length(btrim(ideological_profile)) > 0),
  constraint generated_topic_batches_status_valid check (
    status in ('draft', 'loaded', 'under_review', 'partially_reviewed', 'approved', 'rejected', 'archived')
  ),
  constraint generated_topic_batches_expected_nonnegative check (expected_count is null or expected_count >= 0),
  constraint generated_topic_batches_inserted_nonnegative check (inserted_count >= 0),
  constraint generated_topic_batches_valid_nonnegative check (valid_count >= 0),
  constraint generated_topic_batches_rejected_nonnegative check (rejected_count >= 0)
);

create table if not exists public.generated_topic_candidates (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.generated_topic_batches(id) on delete restrict,
  titulo text not null,
  descripcion text,
  tipo_votacion text not null,
  opciones jsonb not null default '[]'::jsonb,
  publico_objetivo text not null,
  taxonomy_draft jsonb not null default '{}'::jsonb,
  ideological_axis text,
  deliberative_tension text,
  neutrality_notes text,
  quality_notes text,
  risk_flags jsonb not null default '[]'::jsonb,
  requires_source boolean not null default false,
  source_required_reason text,
  human_review_required boolean not null default true,
  quality_score integer,
  neutrality_score integer,
  status text not null default 'pending_review',
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  converted_tema_sugerencia_id uuid references public.tema_sugerencias(id) on delete restrict,
  converted_tema_id uuid references public.temas(id) on delete restrict,
  duplicate_fingerprint text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint generated_topic_candidates_titulo_minimo check (char_length(btrim(titulo)) >= 4),
  constraint generated_topic_candidates_tipo_valido check (tipo_votacion in ('binaria', 'opciones')),
  constraint generated_topic_candidates_publico_valido check (publico_objetivo in ('afiliados', 'fundadores')),
  constraint generated_topic_candidates_status_valido check (
    status in (
      'pending_review',
      'needs_changes',
      'approved',
      'rejected',
      'converted_to_suggestion',
      'converted_to_topic',
      'archived'
    )
  ),
  constraint generated_topic_candidates_opciones_array check (jsonb_typeof(opciones) = 'array'),
  constraint generated_topic_candidates_opciones_texto check (public.generated_topic_jsonb_text_array_is_valid(opciones)),
  constraint generated_topic_candidates_opciones_consistentes check (
    (tipo_votacion = 'binaria' and jsonb_array_length(opciones) = 0)
    or (tipo_votacion = 'opciones' and jsonb_array_length(opciones) >= 2)
  ),
  constraint generated_topic_candidates_taxonomy_object check (jsonb_typeof(taxonomy_draft) = 'object'),
  constraint generated_topic_candidates_risk_flags_array check (jsonb_typeof(risk_flags) = 'array'),
  constraint generated_topic_candidates_risk_flags_texto check (public.generated_topic_jsonb_text_array_is_valid(risk_flags)),
  constraint generated_topic_candidates_quality_score_range check (quality_score is null or quality_score between 1 and 5),
  constraint generated_topic_candidates_neutrality_score_range check (neutrality_score is null or neutrality_score between 1 and 5),
  constraint generated_topic_candidates_source_reason_required check (
    not requires_source
    or nullif(btrim(coalesce(source_required_reason, '')), '') is not null
  ),
  constraint generated_topic_candidates_review_required check (human_review_required is true),
  constraint generated_topic_candidates_fingerprint_not_empty check (char_length(btrim(duplicate_fingerprint)) > 0),
  constraint generated_topic_candidates_single_conversion check (
    not (converted_tema_sugerencia_id is not null and converted_tema_id is not null)
  ),
  constraint generated_topic_candidates_suggestion_status_consistent check (
    status <> 'converted_to_suggestion' or converted_tema_sugerencia_id is not null
  ),
  constraint generated_topic_candidates_suggestion_id_status_consistent check (
    converted_tema_sugerencia_id is null or status = 'converted_to_suggestion'
  ),
  constraint generated_topic_candidates_topic_status_consistent check (
    status <> 'converted_to_topic' or converted_tema_id is not null
  ),
  constraint generated_topic_candidates_topic_id_status_consistent check (
    converted_tema_id is null or status = 'converted_to_topic'
  ),
  constraint generated_topic_candidates_rejection_reason_required check (
    status <> 'rejected'
    or nullif(btrim(coalesce(rejection_reason, '')), '') is not null
  ),
  constraint generated_topic_candidates_review_metadata_consistent check (
    status = 'pending_review'
    or (reviewed_by is not null and reviewed_at is not null)
  ),
  constraint generated_topic_candidates_unique_fingerprint_per_batch unique (batch_id, duplicate_fingerprint)
);

create index if not exists generated_topic_candidates_batch_idx on public.generated_topic_candidates(batch_id);
create index if not exists generated_topic_candidates_status_idx on public.generated_topic_candidates(status);
create index if not exists generated_topic_candidates_fingerprint_idx on public.generated_topic_candidates(duplicate_fingerprint);
create index if not exists generated_topic_candidates_ideological_axis_idx on public.generated_topic_candidates(ideological_axis);
create index if not exists generated_topic_candidates_created_at_idx on public.generated_topic_candidates(created_at desc);
create index if not exists generated_topic_candidates_reviewed_by_idx on public.generated_topic_candidates(reviewed_by);
create index if not exists generated_topic_candidates_converted_suggestion_idx on public.generated_topic_candidates(converted_tema_sugerencia_id);
create index if not exists generated_topic_candidates_converted_tema_idx on public.generated_topic_candidates(converted_tema_id);
create index if not exists generated_topic_batches_status_idx on public.generated_topic_batches(status);
create index if not exists generated_topic_batches_created_at_idx on public.generated_topic_batches(created_at desc);
create index if not exists generated_topic_batches_created_by_idx on public.generated_topic_batches(created_by);

drop trigger if exists generated_topic_batches_touch_updated_at on public.generated_topic_batches;
create trigger generated_topic_batches_touch_updated_at
before update on public.generated_topic_batches
for each row
execute function public.touch_updated_at();

drop trigger if exists generated_topic_candidates_touch_updated_at on public.generated_topic_candidates;
create trigger generated_topic_candidates_touch_updated_at
before update on public.generated_topic_candidates
for each row
execute function public.touch_updated_at();

alter table public.generated_topic_batches enable row level security;
alter table public.generated_topic_candidates enable row level security;

drop policy if exists "generated_topic_batches_select_admin" on public.generated_topic_batches;
create policy "generated_topic_batches_select_admin"
on public.generated_topic_batches
for select
to authenticated
using (public.es_admin());

drop policy if exists "generated_topic_candidates_select_admin" on public.generated_topic_candidates;
create policy "generated_topic_candidates_select_admin"
on public.generated_topic_candidates
for select
to authenticated
using (public.es_admin());

grant select on public.generated_topic_batches to authenticated;
grant select on public.generated_topic_candidates to authenticated;
revoke insert, update, delete on public.generated_topic_batches from anon, authenticated;
revoke insert, update, delete on public.generated_topic_candidates from anon, authenticated;
revoke all on public.generated_topic_batches from anon;
revoke all on public.generated_topic_candidates from anon;

create or replace function public.refresh_generated_topic_batch_counts(p_batch_id uuid)
returns public.generated_topic_batches
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_batch public.generated_topic_batches;
  total_count integer;
  valid_total integer;
  rejected_total integer;
  needs_changes_total integer;
  next_status text;
begin
  select * into selected_batch
  from public.generated_topic_batches
  where id = p_batch_id
  for update;

  if not found then
    raise exception 'generated_batch_not_found';
  end if;

  select
    count(*)::integer,
    count(*) filter (where status in ('approved', 'converted_to_suggestion', 'converted_to_topic'))::integer,
    count(*) filter (where status = 'rejected')::integer,
    count(*) filter (where status = 'needs_changes')::integer
  into total_count, valid_total, rejected_total, needs_changes_total
  from public.generated_topic_candidates
  where batch_id = p_batch_id;

  next_status := selected_batch.status;

  if selected_batch.status <> 'archived' then
    next_status := case
      when total_count = 0 then 'draft'
      when valid_total = 0 and rejected_total = 0 and needs_changes_total = 0 then 'loaded'
      when rejected_total = total_count then 'rejected'
      when valid_total = total_count then 'approved'
      else 'partially_reviewed'
    end;
  end if;

  update public.generated_topic_batches
  set inserted_count = total_count,
      valid_count = valid_total,
      rejected_count = rejected_total,
      status = next_status
  where id = p_batch_id
  returning * into selected_batch;

  return selected_batch;
end;
$$;

create or replace function public.crear_generated_topic_batch(
  p_batch_code text,
  p_expected_count integer default null,
  p_source text default 'future_generator',
  p_ideological_profile text default 'liberal_democratic',
  p_notes text default null
)
returns table(batch_id uuid, batch_code text, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  inserted_batch public.generated_topic_batches;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if char_length(btrim(coalesce(p_batch_code, ''))) < 3 then
    raise exception 'batch_code_required';
  end if;

  if p_expected_count is not null and p_expected_count < 0 then
    raise exception 'invalid_expected_count';
  end if;

  insert into public.generated_topic_batches(
    batch_code,
    source,
    ideological_profile,
    status,
    expected_count,
    notes,
    created_by
  )
  values (
    btrim(p_batch_code),
    coalesce(nullif(btrim(p_source), ''), 'future_generator'),
    coalesce(nullif(btrim(p_ideological_profile), ''), 'liberal_democratic'),
    'draft',
    p_expected_count,
    nullif(btrim(coalesce(p_notes, '')), ''),
    actor
  )
  returning * into inserted_batch;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'crear_generated_topic_batch',
    'generated_topic_batches',
    inserted_batch.id,
    null,
    jsonb_build_object(
      'batch_code', inserted_batch.batch_code,
      'status', inserted_batch.status,
      'expected_count', inserted_batch.expected_count
    )
  );

  return query
  select inserted_batch.id, inserted_batch.batch_code, inserted_batch.status;
end;
$$;

create or replace function public.cargar_generated_topic_candidates(
  p_batch_id uuid,
  p_candidates jsonb
)
returns table(inserted_rows integer, candidate_ids uuid[])
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  selected_batch public.generated_topic_batches;
  candidate jsonb;
  candidate_index integer := 0;
  candidate_count integer;
  candidate_title text;
  candidate_description text;
  candidate_type text;
  candidate_options jsonb;
  candidate_audience text;
  candidate_taxonomy jsonb;
  candidate_risk_flags jsonb;
  candidate_fingerprint text;
  candidate_quality_score integer;
  candidate_neutrality_score integer;
  candidate_requires_source boolean;
  candidate_human_review_required boolean;
  seen_fingerprints text[] := '{}';
  inserted_candidate_id uuid;
  inserted_ids uuid[] := '{}';
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if jsonb_typeof(coalesce(p_candidates, 'null'::jsonb)) <> 'array' then
    raise exception 'candidates_must_be_array';
  end if;

  candidate_count := jsonb_array_length(p_candidates);

  if candidate_count = 0 then
    raise exception 'candidates_required';
  end if;

  select * into selected_batch
  from public.generated_topic_batches
  where id = p_batch_id
  for update;

  if not found then
    raise exception 'generated_batch_not_found';
  end if;

  if selected_batch.status in ('approved', 'rejected', 'archived') then
    raise exception 'generated_batch_closed';
  end if;

  if selected_batch.expected_count is not null
    and selected_batch.inserted_count + candidate_count <> selected_batch.expected_count then
    raise exception 'expected_count_mismatch';
  end if;

  for candidate in select value from jsonb_array_elements(p_candidates)
  loop
    candidate_index := candidate_index + 1;

    if jsonb_typeof(candidate) <> 'object' then
      raise exception 'candidate_%_must_be_object', candidate_index;
    end if;

    candidate_title := btrim(coalesce(candidate->>'titulo', ''));
    candidate_description := nullif(btrim(coalesce(candidate->>'descripcion', '')), '');
    candidate_type := btrim(coalesce(candidate->>'tipo_votacion', ''));
    candidate_options := coalesce(candidate->'opciones', '[]'::jsonb);
    candidate_audience := btrim(coalesce(candidate->>'publico_objetivo', ''));
    candidate_taxonomy := coalesce(candidate->'taxonomy_draft', '{}'::jsonb);
    candidate_risk_flags := coalesce(candidate->'risk_flags', '[]'::jsonb);
    candidate_fingerprint := btrim(coalesce(candidate->>'duplicate_fingerprint', ''));
    candidate_quality_score := nullif(candidate->>'quality_score', '')::integer;
    candidate_neutrality_score := nullif(candidate->>'neutrality_score', '')::integer;
    candidate_requires_source := coalesce(nullif(candidate->>'requires_source', '')::boolean, false);
    candidate_human_review_required := coalesce(nullif(candidate->>'human_review_required', '')::boolean, true);

    if char_length(candidate_title) < 4 then
      raise exception 'candidate_%_titulo_required', candidate_index;
    end if;

    if candidate_type not in ('binaria', 'opciones') then
      raise exception 'candidate_%_invalid_vote_type', candidate_index;
    end if;

    if candidate_audience not in ('afiliados', 'fundadores') then
      raise exception 'candidate_%_invalid_audience', candidate_index;
    end if;

    if not public.generated_topic_jsonb_text_array_is_valid(candidate_options) then
      raise exception 'candidate_%_invalid_options', candidate_index;
    end if;

    if candidate_type = 'binaria' and jsonb_array_length(candidate_options) <> 0 then
      raise exception 'candidate_%_binary_options_must_be_empty', candidate_index;
    end if;

    if candidate_type = 'opciones' and jsonb_array_length(candidate_options) < 2 then
      raise exception 'candidate_%_options_required', candidate_index;
    end if;

    if jsonb_typeof(candidate_taxonomy) <> 'object' then
      raise exception 'candidate_%_taxonomy_must_be_object', candidate_index;
    end if;

    if jsonb_typeof(candidate_risk_flags) <> 'array' then
      raise exception 'candidate_%_risk_flags_must_be_array', candidate_index;
    end if;

    if not public.generated_topic_jsonb_text_array_is_valid(candidate_risk_flags) then
      raise exception 'candidate_%_invalid_risk_flags', candidate_index;
    end if;

    if candidate_quality_score is not null and candidate_quality_score not between 1 and 5 then
      raise exception 'candidate_%_invalid_quality_score', candidate_index;
    end if;

    if candidate_neutrality_score is not null and candidate_neutrality_score not between 1 and 5 then
      raise exception 'candidate_%_invalid_neutrality_score', candidate_index;
    end if;

    if candidate_requires_source
      and nullif(btrim(coalesce(candidate->>'source_required_reason', '')), '') is null then
      raise exception 'candidate_%_source_required_reason_required', candidate_index;
    end if;

    if candidate_human_review_required is not true then
      raise exception 'candidate_%_human_review_required', candidate_index;
    end if;

    if char_length(candidate_fingerprint) = 0 then
      raise exception 'candidate_%_fingerprint_required', candidate_index;
    end if;

    if candidate_fingerprint = any(seen_fingerprints) then
      raise exception 'candidate_%_duplicate_fingerprint_in_payload', candidate_index;
    end if;

    if exists (
      select 1
      from public.generated_topic_candidates existing
      where existing.batch_id = p_batch_id
        and existing.duplicate_fingerprint = candidate_fingerprint
    ) then
      raise exception 'candidate_%_duplicate_fingerprint_in_batch', candidate_index;
    end if;

    seen_fingerprints := array_append(seen_fingerprints, candidate_fingerprint);

    insert into public.generated_topic_candidates(
      batch_id,
      titulo,
      descripcion,
      tipo_votacion,
      opciones,
      publico_objetivo,
      taxonomy_draft,
      ideological_axis,
      deliberative_tension,
      neutrality_notes,
      quality_notes,
      risk_flags,
      requires_source,
      source_required_reason,
      human_review_required,
      quality_score,
      neutrality_score,
      duplicate_fingerprint,
      raw_payload
    )
    values (
      p_batch_id,
      candidate_title,
      candidate_description,
      candidate_type,
      candidate_options,
      candidate_audience,
      candidate_taxonomy,
      nullif(btrim(coalesce(candidate->>'ideological_axis', '')), ''),
      nullif(btrim(coalesce(candidate->>'deliberative_tension', '')), ''),
      nullif(btrim(coalesce(candidate->>'neutrality_notes', '')), ''),
      nullif(btrim(coalesce(candidate->>'quality_notes', '')), ''),
      candidate_risk_flags,
      candidate_requires_source,
      nullif(btrim(coalesce(candidate->>'source_required_reason', '')), ''),
      true,
      candidate_quality_score,
      candidate_neutrality_score,
      candidate_fingerprint,
      candidate
    )
    returning id into inserted_candidate_id;

    inserted_ids := array_append(inserted_ids, inserted_candidate_id);
  end loop;

  perform public.refresh_generated_topic_batch_counts(p_batch_id);

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'cargar_generated_topic_candidates',
    'generated_topic_batches',
    p_batch_id,
    jsonb_build_object('inserted_count', selected_batch.inserted_count, 'status', selected_batch.status),
    jsonb_build_object('inserted_rows', candidate_count, 'candidate_ids', to_jsonb(inserted_ids))
  );

  return query
  select candidate_count, inserted_ids;
end;
$$;

create or replace function public.revisar_generated_topic_candidate(
  p_candidate_id uuid,
  p_action text,
  p_rejection_reason text default null,
  p_quality_score integer default null,
  p_neutrality_score integer default null,
  p_quality_notes text default null,
  p_neutrality_notes text default null
)
returns public.generated_topic_candidates
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_candidate public.generated_topic_candidates;
  after_candidate public.generated_topic_candidates;
  normalized_action text := btrim(coalesce(p_action, ''));
  next_status text;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if normalized_action not in ('approve', 'reject', 'needs_changes') then
    raise exception 'invalid_review_action';
  end if;

  if p_quality_score is not null and p_quality_score not between 1 and 5 then
    raise exception 'invalid_quality_score';
  end if;

  if p_neutrality_score is not null and p_neutrality_score not between 1 and 5 then
    raise exception 'invalid_neutrality_score';
  end if;

  if normalized_action = 'reject' and nullif(btrim(coalesce(p_rejection_reason, '')), '') is null then
    raise exception 'rejection_reason_required';
  end if;

  select * into before_candidate
  from public.generated_topic_candidates
  where id = p_candidate_id
  for update;

  if not found then
    raise exception 'generated_candidate_not_found';
  end if;

  if before_candidate.status in ('converted_to_suggestion', 'converted_to_topic', 'archived') then
    raise exception 'generated_candidate_closed';
  end if;

  next_status := case normalized_action
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    else 'needs_changes'
  end;

  update public.generated_topic_candidates
  set status = next_status,
      rejection_reason = case
        when normalized_action in ('reject', 'needs_changes') then nullif(btrim(coalesce(p_rejection_reason, '')), '')
        else null
      end,
      quality_score = coalesce(p_quality_score, quality_score),
      neutrality_score = coalesce(p_neutrality_score, neutrality_score),
      quality_notes = coalesce(nullif(btrim(coalesce(p_quality_notes, '')), ''), quality_notes),
      neutrality_notes = coalesce(nullif(btrim(coalesce(p_neutrality_notes, '')), ''), neutrality_notes),
      reviewed_by = actor,
      reviewed_at = now()
  where id = p_candidate_id
  returning * into after_candidate;

  perform public.refresh_generated_topic_batch_counts(after_candidate.batch_id);

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'revisar_generated_topic_candidate',
    'generated_topic_candidates',
    after_candidate.id,
    jsonb_build_object('status', before_candidate.status, 'quality_score', before_candidate.quality_score, 'neutrality_score', before_candidate.neutrality_score),
    jsonb_build_object('status', after_candidate.status, 'quality_score', after_candidate.quality_score, 'neutrality_score', after_candidate.neutrality_score)
  );

  return after_candidate;
end;
$$;

create or replace function public.convertir_generated_candidate_a_sugerencia(p_candidate_id uuid)
returns table(candidate_id uuid, tema_sugerencia_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_profile public.perfiles;
  before_candidate public.generated_topic_candidates;
  after_candidate public.generated_topic_candidates;
  inserted_suggestion public.tema_sugerencias;
  normalized_options jsonb;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  select * into actor_profile
  from public.perfiles
  where user_id = actor;

  if not found
    or actor_profile.estado <> 'activo'
    or actor_profile.tipo_miembro <> 'afiliado'
    or actor_profile.rol_sistema not in ('administrador', 'fundador') then
    raise exception 'not_authorized';
  end if;

  select * into before_candidate
  from public.generated_topic_candidates
  where id = p_candidate_id
  for update;

  if not found then
    raise exception 'generated_candidate_not_found';
  end if;

  if before_candidate.status <> 'approved' then
    raise exception 'generated_candidate_not_approved';
  end if;

  if before_candidate.converted_tema_sugerencia_id is not null or before_candidate.converted_tema_id is not null then
    raise exception 'generated_candidate_already_converted';
  end if;

  if before_candidate.human_review_required is not true
    or before_candidate.reviewed_by is null
    or before_candidate.reviewed_at is null then
    raise exception 'human_review_required';
  end if;

  if before_candidate.tipo_votacion not in ('binaria', 'opciones') then
    raise exception 'invalid_vote_type';
  end if;

  if before_candidate.publico_objetivo not in ('afiliados', 'fundadores') then
    raise exception 'invalid_topic_audience';
  end if;

  if not public.generated_topic_jsonb_text_array_is_valid(before_candidate.opciones) then
    raise exception 'invalid_options';
  end if;

  if before_candidate.tipo_votacion = 'binaria' and jsonb_array_length(before_candidate.opciones) <> 0 then
    raise exception 'binary_options_must_be_empty';
  end if;

  if before_candidate.tipo_votacion = 'opciones' and jsonb_array_length(before_candidate.opciones) < 2 then
    raise exception 'options_required';
  end if;

  normalized_options := public.normalizar_opciones_sugeridas(
    before_candidate.tipo_votacion,
    before_candidate.opciones
  );

  if before_candidate.tipo_votacion = 'opciones' and jsonb_array_length(normalized_options) < 2 then
    raise exception 'options_required';
  end if;

  insert into public.tema_sugerencias(
    titulo,
    descripcion,
    tipo_votacion_sugerido,
    opciones_sugeridas,
    created_by
  )
  values (
    before_candidate.titulo,
    before_candidate.descripcion,
    before_candidate.tipo_votacion,
    normalized_options,
    actor_profile.id
  )
  returning * into inserted_suggestion;

  update public.generated_topic_candidates
  set status = 'converted_to_suggestion',
      converted_tema_sugerencia_id = inserted_suggestion.id
  where id = p_candidate_id
  returning * into after_candidate;

  perform public.refresh_generated_topic_batch_counts(after_candidate.batch_id);

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'convertir_generated_candidate_a_sugerencia',
    'generated_topic_candidates',
    after_candidate.id,
    jsonb_build_object('status', before_candidate.status, 'converted_tema_sugerencia_id', before_candidate.converted_tema_sugerencia_id),
    jsonb_build_object('status', after_candidate.status, 'converted_tema_sugerencia_id', after_candidate.converted_tema_sugerencia_id)
  );

  return query
  select after_candidate.id, inserted_suggestion.id, after_candidate.status;
end;
$$;

revoke all on function public.generated_topic_jsonb_text_array_is_valid(jsonb) from public;
revoke all on function public.refresh_generated_topic_batch_counts(uuid) from public;
revoke all on function public.touch_updated_at() from public;
revoke all on function public.crear_generated_topic_batch(text, integer, text, text, text) from public;
revoke all on function public.cargar_generated_topic_candidates(uuid, jsonb) from public;
revoke all on function public.revisar_generated_topic_candidate(uuid, text, text, integer, integer, text, text) from public;
revoke all on function public.convertir_generated_candidate_a_sugerencia(uuid) from public;

grant execute on function public.crear_generated_topic_batch(text, integer, text, text, text) to authenticated;
grant execute on function public.cargar_generated_topic_candidates(uuid, jsonb) to authenticated;
grant execute on function public.revisar_generated_topic_candidate(uuid, text, text, integer, integer, text, text) to authenticated;
grant execute on function public.convertir_generated_candidate_a_sugerencia(uuid) to authenticated;

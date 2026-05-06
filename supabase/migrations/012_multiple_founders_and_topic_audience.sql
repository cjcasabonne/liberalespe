-- Allow multiple founders and add vote audiences for affiliate/founder topics.

alter table public.temas
add column if not exists publico_objetivo text not null default 'afiliados';

alter table public.temas
drop constraint if exists temas_publico_objetivo_valido;

alter table public.temas
add constraint temas_publico_objetivo_valido
check (publico_objetivo in ('afiliados', 'fundadores'));

update public.perfiles
set tipo_miembro = 'afiliado'
where rol_sistema = 'fundador'
  and tipo_miembro <> 'afiliado';

drop function if exists public.crear_tema_controlado(text, text);

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
  set rol_sistema = nuevo_rol,
      tipo_miembro = case
        when nuevo_rol = 'fundador' then 'afiliado'::public.tipo_miembro
        else tipo_miembro
      end
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

create or replace function public.crear_tema_controlado(
  p_titulo text,
  p_descripcion text default null,
  p_publico_objetivo text default 'afiliados'
)
returns public.temas
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  normalized_audience text := coalesce(nullif(btrim(p_publico_objetivo), ''), 'afiliados');
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

  insert into public.temas(titulo, descripcion, estado, creado_por, publico_objetivo)
  values (btrim(p_titulo), nullif(btrim(coalesce(p_descripcion, '')), ''), 'borrador', actor, normalized_audience)
  returning * into inserted_topic;

  return inserted_topic;
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

  if selected_topic.publico_objetivo = 'fundadores' and actor_profile.rol_sistema <> 'fundador' then
    raise exception 'not_eligible_to_vote';
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

drop policy if exists "votos_insert_eligible" on public.votos;
create policy "votos_insert_eligible"
on public.votos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.perfiles p
    where p.id = usuario_id
      and p.user_id = auth.uid()
      and p.tipo_miembro = 'afiliado'
      and p.estado = 'activo'
  )
  and exists (
    select 1
    from public.temas t
    join public.perfiles p on p.id = usuario_id
    where t.id = tema_id
      and t.estado = 'abierto'
      and (t.abre_en is null or t.abre_en <= now())
      and (t.cierra_en is null or t.cierra_en > now())
      and (t.publico_objetivo = 'afiliados' or p.rol_sistema = 'fundador')
  )
);

revoke all on function public.crear_tema_controlado(text, text, text) from public;
grant execute on function public.crear_tema_controlado(text, text, text) to authenticated;

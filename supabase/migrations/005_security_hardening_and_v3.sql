-- Security hardening from external audit and v3 voting structure.

create or replace function public.audit_json_solicitud_desafiliacion(solicitud public.solicitudes_desafiliacion)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', solicitud.id,
    'usuario_id', solicitud.usuario_id,
    'estado', solicitud.estado,
    'motivo', solicitud.motivo,
    'revisado_por', solicitud.revisado_por,
    'revisado_en', solicitud.revisado_en
  );
$$;

drop function if exists public.aprobar_desafiliacion(uuid);

create or replace function public.aprobar_desafiliacion(solicitud_id uuid, observacion text default null)
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

  if before_perfil.estado <> 'activo' then
    raise exception 'perfil_not_active';
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
      'perfil', public.audit_json_perfil(after_perfil),
      'observacion', nullif(observacion, '')
    )
  );

  return after_solicitud;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_tema') then
    create type public.estado_tema as enum ('borrador', 'abierto', 'cerrado', 'anulado');
  end if;
end $$;

create table if not exists public.temas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  estado public.estado_tema not null default 'borrador',
  creado_por uuid not null references auth.users(id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  abre_en timestamptz,
  cierra_en timestamptz,
  constraint temas_titulo_minimo check (char_length(btrim(titulo)) >= 4),
  constraint temas_ventana_valida check (abre_en is null or cierra_en is null or cierra_en > abre_en)
);

create table if not exists public.votos (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas(id) on delete restrict,
  usuario_id uuid not null references public.perfiles(id) on delete restrict,
  opcion text not null,
  creado_en timestamptz not null default now(),
  constraint votos_opcion_valida check (opcion in ('si', 'no', 'abstencion')),
  constraint votos_unico_por_tema unique (tema_id, usuario_id)
);

create index if not exists temas_estado_idx on public.temas(estado);
create index if not exists temas_creado_en_idx on public.temas(creado_en desc);
create index if not exists temas_creado_por_idx on public.temas(creado_por);
create index if not exists votos_tema_idx on public.votos(tema_id);
create index if not exists votos_usuario_idx on public.votos(usuario_id);
create index if not exists votos_creado_en_idx on public.votos(creado_en desc);

drop trigger if exists temas_touch_actualizado_en on public.temas;
create trigger temas_touch_actualizado_en
before update on public.temas
for each row
execute function public.touch_actualizado_en();

alter table public.temas enable row level security;
alter table public.votos enable row level security;

drop policy if exists "temas_select_authenticated" on public.temas;
create policy "temas_select_authenticated"
on public.temas
for select
to authenticated
using (
  estado in ('abierto', 'cerrado')
  or public.es_admin()
);

drop policy if exists "temas_insert_admin" on public.temas;
create policy "temas_insert_admin"
on public.temas
for insert
to authenticated
with check (
  public.es_admin()
  and creado_por = auth.uid()
);

drop policy if exists "temas_update_admin" on public.temas;
create policy "temas_update_admin"
on public.temas
for update
to authenticated
using (public.es_admin())
with check (public.es_admin());

drop policy if exists "votos_select_own_or_admin" on public.votos;
create policy "votos_select_own_or_admin"
on public.votos
for select
to authenticated
using (
  public.es_admin()
  or exists (
    select 1
    from public.perfiles p
    where p.id = votos.usuario_id
      and p.user_id = auth.uid()
  )
);

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
    where t.id = tema_id
      and t.estado = 'abierto'
      and (t.abre_en is null or t.abre_en <= now())
      and (t.cierra_en is null or t.cierra_en > now())
  )
);

create or replace function public.audit_tema_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
    values (
      actor,
      new.creado_por,
      'crear_tema',
      'temas',
      new.id,
      null,
      jsonb_build_object('id', new.id, 'estado', new.estado, 'creado_por', new.creado_por)
    );
    return new;
  end if;

  if old.estado is distinct from new.estado then
    insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
    values (
      actor,
      new.creado_por,
      'cambiar_estado_tema',
      'temas',
      new.id,
      jsonb_build_object('id', old.id, 'estado', old.estado),
      jsonb_build_object('id', new.id, 'estado', new.estado)
    );
  end if;

  return new;
end;
$$;

create or replace function public.audit_voto_insert()
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
  where p.id = new.usuario_id;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    sujeto,
    'emitir_voto',
    'votos',
    new.id,
    null,
    jsonb_build_object('id', new.id, 'tema_id', new.tema_id, 'usuario_id', new.usuario_id)
  );

  return new;
end;
$$;

drop trigger if exists temas_audit_change on public.temas;
create trigger temas_audit_change
after insert or update on public.temas
for each row
execute function public.audit_tema_change();

drop trigger if exists votos_audit_insert on public.votos;
create trigger votos_audit_insert
after insert on public.votos
for each row
execute function public.audit_voto_insert();

grant select, insert, update on public.temas to authenticated;
grant select, insert on public.votos to authenticated;

revoke delete on public.temas from anon, authenticated;
revoke update, delete on public.votos from anon, authenticated;
revoke all on public.temas from anon;
revoke all on public.votos from anon;

revoke all on function public.audit_json_solicitud_desafiliacion(public.solicitudes_desafiliacion) from public;
revoke all on function public.audit_tema_change() from public;
revoke all on function public.audit_voto_insert() from public;
grant execute on function public.aprobar_desafiliacion(uuid, text) to authenticated;

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

  if nuevo_rol = 'fundador' and before_row.rol_sistema <> 'fundador' then
    perform 1
    from public.perfiles
    where rol_sistema = 'fundador'
      and estado = 'activo';

    if found then
      raise exception 'fundador_already_exists';
    end if;
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

grant execute on function public.cambiar_rol_sistema(uuid, public.rol_sistema) to authenticated;

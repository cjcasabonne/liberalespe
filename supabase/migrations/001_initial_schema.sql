-- Initial Supabase schema for the political registry system.
-- Source of truth for this execution pass: kickoff.md.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'rol_sistema') then
    create type public.rol_sistema as enum ('usuario', 'administrador', 'fundador');
  end if;

  if not exists (select 1 from pg_type where typname = 'tipo_miembro') then
    create type public.tipo_miembro as enum ('adherente', 'afiliado');
  end if;

  if not exists (select 1 from pg_type where typname = 'estado_usuario') then
    create type public.estado_usuario as enum ('activo', 'anulado', 'desafiliado');
  end if;

  if not exists (select 1 from pg_type where typname = 'estado_solicitud') then
    create type public.estado_solicitud as enum ('pendiente', 'aprobada', 'rechazada', 'cancelada');
  end if;
end $$;

create table if not exists public.perfiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dni text not null unique,
  nombres text not null,
  telefono text,
  rol_sistema public.rol_sistema not null default 'usuario',
  tipo_miembro public.tipo_miembro not null default 'adherente',
  estado public.estado_usuario not null default 'activo',
  validado_manualmente boolean not null default false,
  validado_por uuid references auth.users(id),
  validado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint perfiles_user_id_unique unique (user_id),
  constraint perfiles_dni_formato check (dni ~ '^[0-9]{8}$')
);

create table if not exists public.solicitudes_afiliacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  estado public.estado_solicitud not null default 'pendiente',
  comentario_usuario text,
  comentario_operador text,
  revisado_por uuid references auth.users(id),
  revisado_en timestamptz,
  creado_en timestamptz not null default now()
);

create table if not exists public.solicitudes_desafiliacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  estado public.estado_solicitud not null default 'pendiente',
  motivo text,
  revisado_por uuid references auth.users(id),
  revisado_en timestamptz,
  creado_en timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  sujeto_id uuid references auth.users(id),
  accion text not null,
  tabla text not null,
  registro_id uuid,
  antes jsonb,
  despues jsonb,
  creado_en timestamptz not null default now(),
  ip text,
  user_agent text,
  constraint audit_log_antes_size check (antes is null or octet_length(antes::text) <= 12000),
  constraint audit_log_despues_size check (despues is null or octet_length(despues::text) <= 12000)
);

create index if not exists idx_perfiles_user_id on public.perfiles(user_id);
create index if not exists perfiles_dni_idx on public.perfiles(dni);
create index if not exists perfiles_estado_idx on public.perfiles(estado);
create index if not exists perfiles_tipo_miembro_idx on public.perfiles(tipo_miembro);
create index if not exists perfiles_rol_sistema_idx on public.perfiles(rol_sistema);
create index if not exists perfiles_validado_idx on public.perfiles(validado_manualmente);
create index if not exists perfiles_creado_en_idx on public.perfiles(creado_en desc);
create index if not exists perfiles_busqueda_nombre_idx on public.perfiles using gin (to_tsvector('spanish', nombres));

create index if not exists solicitudes_afiliacion_estado_idx on public.solicitudes_afiliacion(estado);
create index if not exists solicitudes_afiliacion_usuario_idx on public.solicitudes_afiliacion(usuario_id);
create index if not exists solicitudes_afiliacion_creado_en_idx on public.solicitudes_afiliacion(creado_en desc);

create index if not exists solicitudes_desafiliacion_estado_idx on public.solicitudes_desafiliacion(estado);
create index if not exists solicitudes_desafiliacion_usuario_idx on public.solicitudes_desafiliacion(usuario_id);
create index if not exists solicitudes_desafiliacion_creado_en_idx on public.solicitudes_desafiliacion(creado_en desc);

create index if not exists audit_log_actor_idx on public.audit_log(actor_id);
create index if not exists audit_log_sujeto_idx on public.audit_log(sujeto_id);
create index if not exists audit_log_creado_en_idx on public.audit_log(creado_en desc);
create index if not exists audit_log_accion_idx on public.audit_log(accion);

create or replace function public.touch_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists perfiles_touch_actualizado_en on public.perfiles;
create trigger perfiles_touch_actualizado_en
before update on public.perfiles
for each row
execute function public.touch_actualizado_en();

alter table public.perfiles enable row level security;
alter table public.solicitudes_afiliacion enable row level security;
alter table public.solicitudes_desafiliacion enable row level security;
alter table public.audit_log enable row level security;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfiles
    where user_id = auth.uid()
      and rol_sistema in ('administrador', 'fundador')
      and estado = 'activo'
  );
$$;

create or replace function public.es_fundador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfiles
    where user_id = auth.uid()
      and rol_sistema = 'fundador'
      and estado = 'activo'
  );
$$;

drop policy if exists "perfiles_select_own_or_admin" on public.perfiles;
create policy "perfiles_select_own_or_admin"
on public.perfiles
for select
to authenticated
using (user_id = auth.uid() or public.es_admin());

drop policy if exists "perfiles_insert_own_default" on public.perfiles;
create policy "perfiles_insert_own_default"
on public.perfiles
for insert
to authenticated
with check (
  user_id = auth.uid()
  and rol_sistema = 'usuario'
  and tipo_miembro = 'adherente'
  and estado = 'activo'
  and validado_manualmente = false
  and validado_por is null
  and validado_en is null
);

-- No direct update policy for perfiles in the kickoff schema.
-- Contact edits and administrative transitions must be added later through controlled RPC.

drop policy if exists "solicitudes_afiliacion_select_own_or_admin" on public.solicitudes_afiliacion;
create policy "solicitudes_afiliacion_select_own_or_admin"
on public.solicitudes_afiliacion
for select
to authenticated
using (
  public.es_admin()
  or exists (
    select 1 from public.perfiles p
    where p.id = solicitudes_afiliacion.usuario_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "solicitudes_afiliacion_insert_own" on public.solicitudes_afiliacion;
create policy "solicitudes_afiliacion_insert_own"
on public.solicitudes_afiliacion
for insert
to authenticated
with check (
  estado = 'pendiente'
  and revisado_por is null
  and revisado_en is null
  and exists (
    select 1 from public.perfiles p
    where p.id = usuario_id
      and p.user_id = auth.uid()
      and p.estado = 'activo'
  )
);

-- No direct update policy for affiliation requests.
-- Approval/rejection must be implemented through controlled RPC.

drop policy if exists "solicitudes_desafiliacion_select_own_or_admin" on public.solicitudes_desafiliacion;
create policy "solicitudes_desafiliacion_select_own_or_admin"
on public.solicitudes_desafiliacion
for select
to authenticated
using (
  public.es_admin()
  or exists (
    select 1 from public.perfiles p
    where p.id = solicitudes_desafiliacion.usuario_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "solicitudes_desafiliacion_insert_own" on public.solicitudes_desafiliacion;
create policy "solicitudes_desafiliacion_insert_own"
on public.solicitudes_desafiliacion
for insert
to authenticated
with check (
  estado = 'pendiente'
  and revisado_por is null
  and revisado_en is null
  and exists (
    select 1 from public.perfiles p
    where p.id = usuario_id
      and p.user_id = auth.uid()
      and p.estado = 'activo'
  )
);

-- No direct update policy for disaffiliation requests.
-- Processing must be implemented through controlled RPC.

drop policy if exists "audit_log_select_admin" on public.audit_log;
create policy "audit_log_select_admin"
on public.audit_log
for select
to authenticated
using (public.es_admin());

-- No insert/update/delete policies for audit_log from client roles.
-- Audit writes must be performed later through controlled RPC/security-definer functions.

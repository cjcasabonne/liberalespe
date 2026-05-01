-- Manual access recovery queue and limited contact update.

create table if not exists public.solicitudes_recuperacion (
  id uuid primary key default gen_random_uuid(),
  dni text not null,
  telefono_contacto text not null,
  comentario_usuario text,
  perfil_id uuid references public.perfiles(id) on delete set null,
  estado public.estado_solicitud not null default 'pendiente',
  comentario_operador text,
  revisado_por uuid references auth.users(id),
  revisado_en timestamptz,
  creado_en timestamptz not null default now(),
  constraint solicitudes_recuperacion_dni_formato check (dni ~ '^[0-9]{8}$'),
  constraint solicitudes_recuperacion_telefono_minimo check (char_length(btrim(telefono_contacto)) >= 6)
);

create index if not exists solicitudes_recuperacion_estado_idx on public.solicitudes_recuperacion(estado);
create index if not exists solicitudes_recuperacion_dni_idx on public.solicitudes_recuperacion(dni);
create index if not exists solicitudes_recuperacion_perfil_idx on public.solicitudes_recuperacion(perfil_id);
create index if not exists solicitudes_recuperacion_creado_en_idx on public.solicitudes_recuperacion(creado_en desc);

alter table public.solicitudes_recuperacion enable row level security;

create or replace function public.link_solicitud_recuperacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select p.id into new.perfil_id
  from public.perfiles p
  where p.dni = new.dni
  limit 1;

  new.estado = 'pendiente';
  new.revisado_por = null;
  new.revisado_en = null;
  new.comentario_operador = null;
  return new;
end;
$$;

drop trigger if exists solicitudes_recuperacion_link_profile on public.solicitudes_recuperacion;
create trigger solicitudes_recuperacion_link_profile
before insert on public.solicitudes_recuperacion
for each row
execute function public.link_solicitud_recuperacion();

drop policy if exists "solicitudes_recuperacion_insert_public" on public.solicitudes_recuperacion;
create policy "solicitudes_recuperacion_insert_public"
on public.solicitudes_recuperacion
for insert
to anon, authenticated
with check (
  estado = 'pendiente'
  and revisado_por is null
  and revisado_en is null
  and comentario_operador is null
);

drop policy if exists "solicitudes_recuperacion_select_admin" on public.solicitudes_recuperacion;
create policy "solicitudes_recuperacion_select_admin"
on public.solicitudes_recuperacion
for select
to authenticated
using (public.es_admin());

create or replace function public.resolver_recuperacion(
  solicitud_id uuid,
  nuevo_estado public.estado_solicitud,
  comentario text
)
returns public.solicitudes_recuperacion
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  before_row public.solicitudes_recuperacion;
  after_row public.solicitudes_recuperacion;
  sujeto uuid;
begin
  if actor is null or not public.es_admin() then
    raise exception 'not_authorized';
  end if;

  if nuevo_estado not in ('aprobada', 'rechazada', 'cancelada') then
    raise exception 'invalid_estado';
  end if;

  if nullif(comentario, '') is null then
    raise exception 'comentario_required';
  end if;

  select * into before_row
  from public.solicitudes_recuperacion
  where id = solicitud_id
  for update;

  if not found then
    raise exception 'solicitud_not_found';
  end if;

  if before_row.estado <> 'pendiente' then
    raise exception 'solicitud_not_pending';
  end if;

  select p.user_id into sujeto
  from public.perfiles p
  where p.id = before_row.perfil_id;

  update public.solicitudes_recuperacion
  set estado = nuevo_estado,
      comentario_operador = comentario,
      revisado_por = actor,
      revisado_en = now()
  where id = solicitud_id
  returning * into after_row;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    sujeto,
    'resolver_recuperacion',
    'solicitudes_recuperacion',
    after_row.id,
    jsonb_build_object(
      'id', before_row.id,
      'dni_masked', '****' || right(before_row.dni, 4),
      'estado', before_row.estado,
      'perfil_id', before_row.perfil_id
    ),
    jsonb_build_object(
      'id', after_row.id,
      'dni_masked', '****' || right(after_row.dni, 4),
      'estado', after_row.estado,
      'perfil_id', after_row.perfil_id,
      'comentario_operador', after_row.comentario_operador
    )
  );

  return after_row;
end;
$$;

drop policy if exists "perfiles_update_own_phone" on public.perfiles;
create policy "perfiles_update_own_phone"
on public.perfiles
for update
to authenticated
using (
  user_id = auth.uid()
  and estado = 'activo'
)
with check (
  user_id = auth.uid()
  and estado = 'activo'
);

create or replace function public.audit_perfil_contact_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if old.telefono is distinct from new.telefono then
    insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
    values (
      actor,
      new.user_id,
      'actualizar_telefono',
      'perfiles',
      new.id,
      public.audit_json_perfil(old) || jsonb_build_object('telefono_changed', old.telefono is not null),
      public.audit_json_perfil(new) || jsonb_build_object('telefono_changed', new.telefono is not null)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists perfiles_audit_contact_update on public.perfiles;
create trigger perfiles_audit_contact_update
after update of telefono on public.perfiles
for each row
execute function public.audit_perfil_contact_update();

grant usage on schema public to anon;
grant insert on public.solicitudes_recuperacion to anon, authenticated;
grant select on public.solicitudes_recuperacion to authenticated;
grant update(telefono) on public.perfiles to authenticated;

revoke update, delete on public.solicitudes_recuperacion from anon, authenticated;
revoke all on function public.link_solicitud_recuperacion() from public;
revoke all on function public.audit_perfil_contact_update() from public;
grant execute on function public.resolver_recuperacion(uuid, public.estado_solicitud, text) to authenticated;

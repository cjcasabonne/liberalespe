-- Operational guards for request creation.
-- The database must reject duplicate pending requests and enforce membership rules.

create unique index if not exists solicitudes_afiliacion_usuario_pendiente_unique
on public.solicitudes_afiliacion(usuario_id)
where estado = 'pendiente';

create unique index if not exists solicitudes_desafiliacion_usuario_pendiente_unique
on public.solicitudes_desafiliacion(usuario_id)
where estado = 'pendiente';

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
      and p.tipo_miembro = 'adherente'
  )
);

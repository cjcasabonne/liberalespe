-- Controlled export audit RPC.
-- The frontend can request an export, but the database verifies founder status
-- and writes the audit entry through this security definer function.

create or replace function public.registrar_exportacion_usuarios(
  justificacion text,
  filtros jsonb,
  cantidad integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or not public.es_fundador() then
    raise exception 'not_authorized';
  end if;

  if nullif(btrim(justificacion), '') is null then
    raise exception 'justificacion_required';
  end if;

  if cantidad is null or cantidad <= 0 or cantidad > 10 then
    raise exception 'invalid_export_size';
  end if;

  insert into public.audit_log(actor_id, sujeto_id, accion, tabla, registro_id, antes, despues)
  values (
    actor,
    null,
    'exportar_usuarios_filtrados',
    'perfiles',
    null,
    null,
    jsonb_build_object(
      'justificacion', btrim(justificacion),
      'filtros', coalesce(filtros, '{}'::jsonb),
      'cantidad', cantidad
    )
  );
end;
$$;

grant execute on function public.registrar_exportacion_usuarios(text, jsonb, integer) to authenticated;

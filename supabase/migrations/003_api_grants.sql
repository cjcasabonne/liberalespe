-- Minimal API grants for Supabase/PostgREST roles.
-- RLS remains the real authorization layer. No direct UPDATE/DELETE grants here.

grant usage on schema public to authenticated;

grant select, insert on public.perfiles to authenticated;
grant select, insert on public.solicitudes_afiliacion to authenticated;
grant select, insert on public.solicitudes_desafiliacion to authenticated;
grant select on public.audit_log to authenticated;

revoke update, delete on public.perfiles from anon, authenticated;
revoke update, delete on public.solicitudes_afiliacion from anon, authenticated;
revoke update, delete on public.solicitudes_desafiliacion from anon, authenticated;
revoke insert, update, delete on public.audit_log from anon, authenticated;

revoke all on public.perfiles from anon;
revoke all on public.solicitudes_afiliacion from anon;
revoke all on public.solicitudes_desafiliacion from anon;
revoke all on public.audit_log from anon;

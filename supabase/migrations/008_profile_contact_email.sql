-- Contact email for operational founder communication.

alter table public.perfiles
add column if not exists correo_contacto text;

alter table public.perfiles
drop constraint if exists perfiles_correo_contacto_formato;

alter table public.perfiles
add constraint perfiles_correo_contacto_formato
check (
  correo_contacto is null
  or correo_contacto ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);

create index if not exists perfiles_correo_contacto_idx
on public.perfiles (correo_contacto)
where correo_contacto is not null;

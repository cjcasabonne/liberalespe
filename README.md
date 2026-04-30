# Liberales PE

Sistema operativo de padron politico para democracia directa.

La fuente de verdad de arquitectura es [`arquitectura.md`](./arquitectura.md). Este README solo cubre ejecucion, configuracion y despliegue.

## Stack

- React + Vite + TypeScript.
- Cloudflare Pages para frontend.
- Supabase como backend del sistema:
  - Auth.
  - PostgreSQL.
  - RLS.
  - RPC.
- Servicio DNI externo en Render:
  - `https://busqueda-dni.onrender.com/api/buscar-dni`.
  - Health check: `https://busqueda-dni.onrender.com/health`.

## Variables de entorno

Crear `.env.local` para desarrollo:

```bash
VITE_SUPABASE_URL=https://pqqkvmmenqencuretwyx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com
```

Reglas:

- Nunca usar `service_role` en frontend.
- Nunca commitear `.env.local`.
- Usar una sola URL canonica para el servicio DNI.

## Desarrollo local

```bash
npm install
npm run dev
```

URL local:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

El resultado queda en `dist/`.

## Supabase

Las migraciones viven en:

```text
supabase/migrations/
```

Aplicar cambios:

```bash
npx supabase db push
```

Restricciones obligatorias:

- Todas las tablas expuestas al frontend deben tener RLS activo.
- Acciones criticas deben ejecutarse por RPC.
- El frontend no debe hacer `UPDATE` directo para cambios de rol, estado, validacion o afiliacion.
- `auth.users` es la fuente de verdad de autenticacion.
- `perfiles` es extension operativa del usuario.

## Cloudflare Pages

Configuracion recomendada:

```text
Build command: npm run build
Build output directory: dist
Root directory: /
```

Variables de produccion:

```text
VITE_SUPABASE_URL=https://pqqkvmmenqencuretwyx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com
```

El repo incluye:

- `public/_redirects` para fallback SPA.
- `public/_headers` para headers basicos de seguridad.
- `public/manifest.webmanifest` y `public/sw.js` para PWA base.

## Validacion operativa

Antes de usar datos reales:

- Confirmar que Supabase Auth permite email/password sin verificacion obligatoria de email.
- Confirmar que el fundador puede iniciar sesion.
- Confirmar que un usuario comun solo ve su perfil.
- Confirmar que el panel solo aparece para `administrador` o `fundador`.
- Confirmar que validar, anular y aprobar afiliacion generan registros en `audit_log`.
- Confirmar que el registro funciona aunque falle el servicio DNI.

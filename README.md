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

Variable operativa opcional para disparar deploy manual desde entorno local:

```bash
CLOUDFLARE_DEPLOY_HOOK_URL=<cloudflare-pages-deploy-hook>
```

Reglas:

- Nunca usar `service_role` en frontend.
- Nunca commitear `.env.local`.
- Usar una sola URL canonica para el servicio DNI.
- No commitear hooks reales de deploy.

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

Deploy manual:

- Push a `main` dispara el pipeline Git configurado en Cloudflare Pages.
- Si existe `CLOUDFLARE_DEPLOY_HOOK_URL` en `.env.local`, puede dispararse un deploy manual con `POST` al hook.

## Estado actual sincronizado

Implementado en el frontend actual:

- Registro y login con DNI + contrasena mediante email tecnico interno.
- Integracion con Supabase Auth, RLS y RPC administrativas.
- Perfil propio, solicitudes operativas y panel basico para administradores/fundador.
- Listado paginado de usuarios, filtros, detalle de usuario y auditoria por usuario.
- Recuperacion manual de acceso.
- Actualizacion de telefono propio permitida por RLS.
- Acciones de contacto para fundador con enlaces nativos `mailto:` y `wa.me`, sin Gmail web ni `window.open`.
- Votaciones V3 con temas, voto de afiliados activos, resultados controlados y administracion minima.
- PWA base, headers, redirects y build estatico para Cloudflare Pages.
- Revision de castellano visible: tildes, `ñ`, signos de apertura y textos de auditoria renderizados en UTF-8.

Validado manualmente para cierre v1:

- RLS con usuario comun, administrador y fundador.
- Flujo DNI activo, DNI caido y DNI duplicado.
- Panel minimo y trazabilidad end-to-end.
- Deploy real en Cloudflare Pages.

Pendiente operativo recurrente:

- Validar Cloudflare Pages despues de cada release.
- Aplicar migraciones nuevas de Supabase antes de usar funcionalidades V3 en produccion.

Nota para cuentas existentes:

- Los ajustes finales de v1 son frontend/documentacion y no requieren recrear usuarios.
- No se debe borrar ni reinsertar cuentas ya registradas para validar v1.
- Cualquier prueba destructiva debe hacerse con cuentas de prueba identificadas y autorizadas.

Nota de textos:

- El sitio usa UTF-8 (`index.html` declara `<meta charset="UTF-8" />`).
- En JSX y strings TypeScript se usan caracteres reales (`á`, `é`, `í`, `ó`, `ú`, `ñ`) porque React los renderiza correctamente.
- No usar entidades HTML como `&iacute;` dentro de strings TypeScript; se mostrarian literalmente.

## Validacion operativa

Antes de usar datos reales:

- Confirmar que Supabase Auth permite email/password sin verificacion obligatoria de email.
- Confirmar que el fundador puede iniciar sesion.
- Confirmar que un usuario comun solo ve su perfil.
- Confirmar que el panel solo aparece para `administrador` o `fundador`.
- Confirmar que validar, anular y aprobar afiliacion generan registros en `audit_log`.
- Confirmar que el registro funciona aunque falle el servicio DNI.

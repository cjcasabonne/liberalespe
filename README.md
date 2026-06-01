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

Crear `.env.local` para desarrollo. Para pruebas locales/dev, no usar la URL de produccion; reemplazar estos valores por el proyecto dev o por las URLs locales de Supabase:

```bash
VITE_SUPABASE_URL=https://<dev-project-ref>.supabase.co
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

Antes de aplicar migraciones, revisar [`docs/supabase-entornos-seguros.md`](./docs/supabase-entornos-seguros.md). No usar este workspace para pruebas de migracion si esta enlazado a produccion.

Las migraciones viven en:

```text
supabase/migrations/
```

Aplicar cambios solo contra un entorno local descartable o un proyecto dev remoto confirmado:

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
- Perfil propio, solicitudes operativas y panel operativo para administradores/fundadores.
- Listado paginado de usuarios, filtros, detalle de usuario y auditoria por usuario.
- Recuperacion de acceso: solicitud publica y restablecimiento administrativo de contrasena operativos, con contrasena temporal generada automaticamente, auditoria completa y registro en `audit_log`.
- Actualizacion de telefono propio permitida por RLS (column-level grant).
- Acciones de contacto para fundador con enlaces nativos `mailto:` y `wa.me`, sin Gmail web ni `window.open`.
- Votaciones V3 con temas por publico objetivo (`afiliados` o `fundadores`), votaciones binarias y por opciones multiples (`tipo_votacion`, `opciones[]`), voto de afiliados activos segun grupo.
- Modulo de participacion reestructurado: votaciones agrupadas en pendientes / ya votadas (compactas) / cerradas con barras de resultado y porcentajes / anuladas compactas; paginacion simple con "Ver mas"; resumen rapido de participacion.
- Sugerencias de temas separadas de votaciones oficiales: afiliados activos proponen, administradores/fundadores revisan y convierten manualmente en temas reales; panel de sugerencias separado en grupos (en proceso / convertidas / rechazadas).
- Solo afiliados activos pueden tener rol administrador o fundador (regla aplicada en frontend y en base de datos).
- Reactivacion administrativa controlada de usuarios anulados o desafiliados, con motivo obligatorio y auditoria.
- PWA base, headers, redirects y build estatico para Cloudflare Pages.
- Castellano estandar: tildes, `ñ`, signos de apertura, textos renderizados en UTF-8.

Migraciones aplicadas en produccion:

- `001`–`012`: esquema base, RLS, solicitudes, auditoria, votaciones V3.
- `013`: sistema de sugerencias de temas (`tema_sugerencias`) con RPC completa.
- `014`: votaciones por opciones multiples (`tipo_votacion`, `opciones[]` en `temas`).
- `015`-`016`: archivado controlado de temas.
- `017`: staging de candidatos generados, revision humana y conversion controlada a `tema_sugerencias`.

Validado manualmente:

- RLS con usuario comun, administrador y fundador.
- Flujo DNI activo, DNI caido y DNI duplicado.
- Panel operativo y trazabilidad end-to-end.
- Deploy real en Cloudflare Pages.

Pendiente operativo recurrente:

- Validar Cloudflare Pages despues de cada release.
- Aplicar nuevas migraciones de Supabase antes de activar funcionalidades en produccion.

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

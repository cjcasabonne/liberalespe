# Scaffolding de implementacion

Este documento guia la construccion del sistema respetando `arquitectura.md` como fuente de verdad. No reemplaza la arquitectura: aterriza el orden practico de implementacion.

## 1. Estado actual del proyecto

### Ya definido

- Arquitectura base:
  - React + Vite + TypeScript.
  - PWA.
  - Cloudflare Pages.
  - Supabase como backend del sistema.
  - Supabase Auth.
  - Supabase PostgreSQL.
  - Row Level Security.
  - Supabase RPC para acciones controladas.
  - Servicio Node en Render solo para busqueda DNI.
- Autenticacion:
  - DNI + contrasena.
  - Supabase Auth con email interno derivado del DNI.
  - Sin email verification.
  - Sin magic links.
  - Sin SMS OTP.
- Modelo operativo:
  - validacion manual desde panel.
  - `rol_sistema`, `tipo_miembro` y `estado` separados.
  - auditoria obligatoria para acciones criticas.
- Servicio DNI:
  - produccion: `https://busqueda-dni.onrender.com/api/buscar-dni`.
  - health check: `https://busqueda-dni.onrender.com/health`.
  - scraping HTML.
  - rate limiting en backend Render.
  - cache por DNI.
  - fallback manual obligatorio.

### Ya desplegado en produccion

- Servicio DNI en Render:
  - `POST https://busqueda-dni.onrender.com/api/buscar-dni`.
  - `GET https://busqueda-dni.onrender.com/health`.

### Pendiente de construir

- Frontend React/Vite/TypeScript.
- Configuracion PWA.
- Proyecto Supabase y migraciones.
- Tablas operativas.
- RLS.
- RPC administrativas.
- Panel operativo.
- Flujos de registro, login, afiliacion y desafiliacion.
- Auditoria de acciones criticas.
- Deploy frontend en Cloudflare Pages.

## 2. Componentes del sistema

### Frontend

Responsabilidades:

- Pantallas de registro y login.
- Helper `dniToAuthEmail(dni)`.
- Integracion con Supabase Auth.
- Integracion con Supabase DB mediante cliente oficial.
- Integracion con servicio DNI solo para autocompletar nombres.
- Panel operativo.
- Paginacion, busqueda y filtros.
- Fallback manual de nombres.

Variables:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com
```

### Supabase

Supabase es el backend del sistema. No existe backend propio para CRUD ni para reglas de negocio generales.

Responsabilidades:

- Auth con email/password.
- PostgreSQL como fuente de verdad.
- RLS como capa de seguridad real.
- Constraints para integridad.
- Indices para operacion.
- RPC para acciones criticas.
- Auditoria.

Incluye:

- Auth.
- PostgreSQL.
- RLS.
- RPC.

No se debe reinterpretar Supabase como un complemento del frontend. Es la capa backend efectiva donde viven datos, permisos y operaciones criticas.

### Servicio DNI

Responsabilidades:

- Recibir DNI.
- Hacer scraping.
- Devolver nombre autocompletado si existe.
- Aplicar rate limiting backend.
- Cachear respuestas por DNI.
- Exponer `/health`.

Este es el unico servicio externo del sistema. No reemplaza a Supabase, no funciona como backend propio y no debe crecer hacia CRUD, permisos ni operacion del padron.

No debe:

- validar identidad.
- crear usuarios.
- aprobar afiliaciones.
- cambiar estados.
- bloquear el registro si falla.

## 3. Estado actual sincero

Implementado:

- No existe backend CRUD propio; Supabase sigue siendo el backend efectivo.
- Existe frontend Vite + React + TypeScript.
- Existe cliente Supabase centralizado.
- Existen migraciones versionadas para esquema, RLS, RPC administrativas, auditoria, recuperacion, contacto y estructura futura de votaciones.
- Existe UI de registro/login con DNI + contrasena.
- Existe integracion con servicio DNI con fallback manual.
- Existe panel operativo basico con usuarios, solicitudes, acciones administrativas y auditoria.
- Existe flujo manual de recuperacion de acceso.
- Existe PWA base, headers, redirects y build para Cloudflare Pages.
- Existe modulo de acciones de contacto para fundador con `mailto:` y `wa.me`.

Pendiente o requiere validacion manual:

- Pruebas completas de permisos/RLS con usuario comun, administrador y fundador.
- Validacion end-to-end de auditoria para cada accion critica.
- Pruebas manuales de registro con servicio DNI activo, fallando y con DNI duplicado.
- Confirmacion operativa de deploy real en Cloudflare Pages despues de cada release.
- Suite automatizada minima de pruebas de permisos.

## 4. Orden de implementacion recomendado

### Paso 1: Crear base del frontend

- Inicializar Vite + React + TypeScript.
- Configurar estructura de carpetas.
- Configurar variables `VITE_*`.
- Instalar cliente Supabase.
- Crear wrapper unico de Supabase client.

No crear backend propio.

### Paso 2: Configurar Supabase Auth

- Habilitar email/password.
- Deshabilitar confirmacion obligatoria por email.
- No usar magic links.
- No usar SMS OTP.
- Configurar URLs permitidas de desarrollo, preview y produccion.
- Confirmar que `service_role` no aparezca en frontend.

### Paso 3: Crear migraciones de base de datos

Implementar:

- enums:
  - `rol_sistema`;
  - `tipo_miembro`;
  - `estado_usuario`;
  - `estado_solicitud`.
- tablas:
  - `perfiles`;
  - `solicitudes_afiliacion`;
  - `solicitudes_desafiliacion`;
  - `audit_log`.
- tablas futuras recomendadas para compatibilidad v3:
  - `temas`;
  - `votos`.
- constraints:
  - DNI de 8 digitos;
  - `user_id` obligatorio con FK a `auth.users(id)`;
  - `unique(user_id)`;
  - unicidad de DNI;
- indices criticos.
  - `idx_perfiles_user_id`.

`auth_email` es un valor derivado para Supabase Auth. Se genera durante registro y no debe validarse mediante constraint SQL en `perfiles`. Supabase Auth gestiona emails en `auth.users`; `perfiles` solo extiende al usuario autenticado mediante `user_id`.

Las tablas `temas` y `votos` no se usan en las fases iniciales, no deben bloquear la implementacion actual y no requieren UI en v1/v2. Se incluyen como estructura futura para que democracia directa pueda incorporarse en v3 sin reescritura del modelo base.

### Paso 4: Implementar RLS base

Activar RLS en todas las tablas operativas.

Crear helpers:

- `es_admin()`;
- `es_fundador()`.

Politicas minimas:

- usuario lee su perfil.
- usuario actualiza solo campos permitidos.
- usuario no modifica rol, tipo, estado ni validacion.
- administradores/fundadores revisan perfiles.
- auditoria no se edita desde cliente.

### Paso 5: Implementar registro

Flujo:

1. Capturar DNI.
2. Validar formato local.
3. Consultar servicio DNI con timeout de 12 segundos para tolerar cold start de Render.
4. Si falla, demora o responde degradado, activar captura manual.
5. Capturar contrasena y telefono.
6. Generar `auth_email`.
7. Crear usuario en Supabase Auth.
8. Crear perfil en `perfiles` con `user_id = auth.users.id`.
9. Si DNI ya existe o Supabase Auth rechaza el email interno por duplicado, mostrar mensaje neutral.

La creacion de perfil no es automatica por defecto. En v1 debe implementarse creacion manual durante registro, salvo que se decida explicitamente usar un trigger controlado en base de datos.

Mensaje neutral recomendado:

```text
No se pudo completar el registro. Si ya tienes una cuenta o necesitas recuperar acceso, solicita revision manual.
```

No revelar si el DNI existe, esta anulado, validado o desafiliado.

### Paso 6: Implementar login

Flujo:

1. Capturar DNI.
2. Capturar contrasena.
3. Validar DNI.
4. Convertir DNI a email interno.
5. Login con Supabase Auth.
6. Cargar perfil segun RLS.

Helper:

```ts
function dniToAuthEmail(dni: string) {
  return `dni-${dni}@liberalespe.example.com`;
}
```

### Paso 7: Implementar panel operativo

Prioridad:

1. Gestion de usuarios.
2. Bandeja de validacion.
3. Bandeja de afiliacion.
4. Bandeja de desafiliacion.
5. Auditoria por usuario.
6. Acciones de contacto para fundador sobre datos ya autorizados por RLS.

Reglas:

- paginacion obligatoria.
- busqueda por DNI como camino principal.
- filtros ejecutados en base de datos.
- no cargar el padron completo.
- no exportar masivamente sin permiso y auditoria.
- no implementar permisos nuevos en componentes de contacto.
- usar `mailto:` y `wa.me` para contacto, sin Gmail web ni popups.

### Paso 8: Implementar RPC administrativas

Crear funciones transaccionales:

- `validar_usuario(usuario_id, observacion)`;
- `aprobar_afiliacion(solicitud_id)`;
- `rechazar_afiliacion(solicitud_id, comentario)`;
- `aprobar_desafiliacion(solicitud_id)`;
- `anular_usuario(usuario_id, motivo)`;
- `cambiar_rol_sistema(usuario_id, nuevo_rol)`.

Cada RPC debe:

- validar permisos.
- validar estado actual.
- aplicar cambio.
- insertar en `audit_log`.
- evitar autoelevacion de privilegios.

### Paso 9: Implementar recuperacion manual de acceso

No implementar recuperacion automatica.

Proceso:

- usuario solicita revision manual.
- operador busca DNI desde panel.
- operador aplica procedimiento interno.
- operador registra motivo.
- operador resetea contrasena con herramienta administrativa autorizada.
- registrar auditoria.

### Paso 10: Deploy

Frontend:

- configurar Cloudflare Pages.
- agregar variables de entorno.
- probar preview.
- validar redirect URLs en Supabase.
- publicar produccion.

Supabase:

- aplicar migraciones.
- verificar RLS.
- crear primer usuario fundador mediante procedimiento controlado.

Servicio DNI:

- verificar `GET https://busqueda-dni.onrender.com/health`.
- probar `POST https://busqueda-dni.onrender.com/api/buscar-dni`.
- verificar respuesta ante rate limit.

## 5. Reglas estrictas de implementacion

- No crear backend CRUD.
- Supabase es el backend: Auth, PostgreSQL, RLS y RPC.
- No introducir NestJS, Express CRUD ni microservicios nuevos.
- No crear backend propio para compensar reglas mal modeladas en RLS/RPC.
- No usar Docker/Kubernetes.
- No duplicar reglas de permisos en frontend.
- No confiar en el frontend para seguridad.
- No exponer `service_role`.
- No usar el servicio DNI como fuente de verdad.
- No bloquear registro por falla del servicio DNI.
- No mezclar `rol_sistema`, `tipo_miembro` y `estado`.
- No permitir cambios criticos sin auditoria.
- No cargar el padron completo en memoria.
- No permitir autoelevacion de rol.
- No mostrar estados internos al usuario durante errores de registro.

## 6. Integracion con servicio DNI

Endpoint:

```http
POST https://busqueda-dni.onrender.com/api/buscar-dni
Content-Type: application/json
```

Request:

```json
{
  "dni": "12345678"
}
```

Health check:

```http
GET https://busqueda-dni.onrender.com/health
```

Comportamiento esperado:

- timeout frontend de 12 segundos para tolerar cold start de Render.
- mostrar estado de carga durante consulta.
- tolerar cold start de Render.
- permitir un retry controlado de un solo intento adicional para fallos transitorios.
- activar fallback manual ante:
  - error;
  - timeout;
  - respuesta degradada;
  - HTTP 429;
  - servicio caido.

Reglas:

- rate limiting ocurre en backend Render.
- HTTP 429 significa exceso de consultas.
- cache por DNI existe para reducir scraping repetido.
- la respuesta solo autocompleta nombres.
- el nombre debe poder editarse o ingresarse manualmente.

## 7. Riesgos durante implementacion

### Inconsistencias de datos

Riesgos:

- crear usuario en Auth pero fallar al crear `perfiles`.
- generar `auth_email` de forma inconsistente durante registro.
- crear mas de un perfil para el mismo `auth.users.id`.
- duplicados por carreras de registro.
- estados mezclados con roles.

Controles:

- constraints en DB.
- `unique(dni)` y `unique(user_id)`.
- `idx_perfiles_user_id`.
- mensajes neutrales en duplicados.
- scripts de revision para cuentas Auth sin perfil.
- no permitir que el frontend escriba campos sensibles.

### Errores de autenticacion

Riesgos:

- usar DNI directo como email.
- permitir email real del usuario.
- activar magic links por accidente.
- exponer diferencias entre DNI inexistente y contrasena incorrecta.

Controles:

- helper unico `dniToAuthEmail`.
- UI solo muestra DNI + contrasena.
- errores publicos neutrales.
- Supabase Auth configurado solo para email/password.

### Mal uso de RLS

Riesgos:

- politicas demasiado amplias.
- administrar desde frontend con updates directos.
- permitir que usuarios cambien `rol_sistema`, `tipo_miembro` o `estado`.
- auditoria editable.

Controles:

- RLS activado desde el inicio.
- RPC para cambios criticos.
- pruebas manuales con usuario comun, administrador y fundador.
- revisar cada policy antes de produccion.

### Servicio DNI

Riesgos:

- cold start.
- rate limit.
- scraping roto.
- datos incorrectos.

Controles:

- fallback manual obligatorio.
- timeout 12 segundos.
- health check.
- no usar resultado como validacion de identidad.

## 8. Checklist de avance

### Base

- [x] Crear frontend Vite + React + TypeScript.
- [x] Configurar PWA.
- [x] Configurar Supabase client.
- [x] Configurar variables `VITE_*`.

### Supabase

- [x] Crear enums.
- [x] Crear tablas.
- [x] Agregar `user_id` en `perfiles` como FK unica a `auth.users(id)`.
- [x] Crear tablas futuras `temas` y `votos` si se decide preparar v3 desde el inicio.
- [x] Crear constraints.
- [x] Crear indices.
- [x] Crear indice `idx_perfiles_user_id`.
- [x] Activar RLS.
- [x] Crear helpers `es_admin()` y `es_fundador()`.
- [x] Crear policies.
- [x] Crear RPC administrativas.
- [x] Crear auditoria.

### Auth

- [x] Configurar email/password.
- [x] Deshabilitar confirmacion obligatoria por email.
- [x] No usar magic links.
- [x] No usar SMS OTP.
- [x] Implementar `dniToAuthEmail`.
- [x] Implementar registro.
- [x] Implementar login.
- [x] Manejar DNI duplicado con mensaje neutral.
- [x] Definir recuperacion manual.

### Servicio DNI

- [x] Configurar `VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com`.
- [x] Probar `GET /health`.
- [x] Probar `POST /api/buscar-dni`.
- [x] Implementar timeout 12 segundos.
- [x] Implementar fallback manual.
- [x] Manejar `429`.
- [x] Manejar cold start.

### Panel operativo

- [x] Gestion de usuarios.
- [x] Busqueda por DNI.
- [x] Paginacion obligatoria.
- [x] Bandeja de validacion.
- [x] Bandeja de afiliacion.
- [x] Bandeja de desafiliacion.
- [x] Auditoria por usuario.
- [x] Acciones de contacto para fundador con `mailto:` y `wa.me`.
- [x] Masking de DNI donde corresponda.
  - Verificacion: bandejas resumidas muestran DNI enmascarado; perfil propio, busqueda, tabla operativa y detalle conservan DNI completo por necesidad operativa.
- [x] Exportaciones restringidas.
  - Verificacion: no existe UI ni codigo de exportacion masiva en `src`.

### Verificacion

- [ ] Usuario comun no puede cambiar campos sensibles.
- [ ] Usuario comun no puede leer otros perfiles.
- [ ] Administrador puede revisar solicitudes.
- [ ] Fundador controla roles administrativos.
- [x] Acciones criticas generan `audit_log`.
- [x] Falla del servicio DNI no bloquea registro.
- [x] DNI duplicado no expone estado interno.
- [x] Deploy frontend en Cloudflare Pages.

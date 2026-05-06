# Auditoria del flujo de restablecimiento de contrasena

Fecha: 2026-05-05  
Repositorio: `D:\Documentos\New project 2`  
Commit auditado: `1028f30 Fix password reset error handling`  
Alcance: flujo existente de restablecimiento manual de contrasena desde UI administrativa hasta endpoint `/api/restablecer-password`, validacion JWT, uso de Supabase Admin API, respuesta backend -> frontend, auditoria y riesgos operativos.

## Actualizacion 2026-05-06

Estado vigente: la recuperacion/restablecimiento administrativo de contrasenas queda pendiente de arreglo y validacion funcional. Aunque se aplicaron mejoras de robustez en frontend y endpoint, no debe considerarse cerrado hasta confirmar en produccion que:

- un fundador/admin activo puede restablecer la contrasena de un usuario objetivo;
- el usuario objetivo puede iniciar sesion con la contrasena temporal;
- `audit_log` registra el evento sensible;
- los fallos de red/backend liberan la UI y muestran error controlado;
- Cloudflare Pages y Functions ejecutan el commit esperado.

Mitigaciones ya aplicadas en codigo local posterior a esta auditoria:

- `audit_log.insert` se valida explicitamente y el endpoint devuelve `unknown` si la auditoria falla despues del cambio de contrasena.
- `handleManualPasswordReset` usa `try/catch/finally` y valida body `{ success: true }`.
- La contrasena temporal incluye simbolo con formato `Temporal${suffix}7!`.
- El parser Bearer acepta capitalizacion y espacios mediante regex.
- Se agregaron logs internos diferenciados para lookup de perfil objetivo y resultado de auditoria.

Pendiente critico: ejecutar pruebas end-to-end contra Supabase/Cloudflare reales y corregir cualquier fallo remanente del flujo de recuperacion.

## Resumen ejecutivo

El flujo local auditado esta alineado parcialmente con el objetivo de correccion quirurgica:

- El frontend envia `Authorization: Bearer <access_token>` y `userId` tomado de `perfiles.user_id`.
- El endpoint valida el JWT con `supabase.auth.getUser(token)` usando cliente anon autenticado, no service role.
- El endpoint usa service role para `updateUserById`.
- El backend ya normaliza errores a `not_authorized`, `weak_password`, `user_not_found` y `unknown`.
- El frontend ya mapea esos tres errores controlados a mensajes especificos.
- El build local pasa.

Sin embargo, el flujo no debe considerarse cerrado hasta completar validacion funcional en produccion. Riesgos residuales originales y estado:

1. Escritura en `audit_log`: mitigado en codigo local, pendiente validar contra produccion.
2. Excepciones de red de `fetch`: mitigado en codigo local, pendiente validar contra produccion.
3. `user_not_found` sigue siendo operacionalmente ambiguo si hay mismatch de ambientes Supabase o Auth user inexistente.
4. Contrasena temporal sin simbolo: mitigado en codigo local con `Temporal${suffix}7!`.
5. Mensaje viejo `No se encontro el usuario seleccionado.`: si aparece, indica bundle/deploy/cache anterior.

## Archivos revisados

- `src/App.tsx`
- `src/RegisterScreen.tsx`
- `src/ContactActions.tsx`
- `src/lib/supabase.ts`
- `src/lib/auth.ts`
- `functions/api/restablecer-password.ts`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/003_api_grants.sql`
- `supabase/migrations/005_security_hardening_and_v3.sql`
- `supabase/migrations/006_recovery_and_contact.sql`
- `public/_headers`
- `public/_redirects`
- `public/sw.js`
- `.env.example`
- `README.md`

## Mapa del flujo actual

### 1. UI administrativa

Ubicacion principal: `src/App.tsx`.

Elementos relevantes:

- `generateTemporaryPassword()` genera la clave temporal con formato `Temporal${suffix}7`.
- `passwordResetUserId` guarda el valor seleccionado en el formulario.
- `passwordResetUser` resuelve el usuario visible con `adminUsers.find((user) => user.user_id === passwordResetUserId)`.
- El selector de usuarios usa `<option value={user.user_id} key={user.id}>`.
- `handleManualPasswordReset()` envia `POST /api/restablecer-password`.
- La contrasena temporal se muestra en un input readonly y se reutiliza en los enlaces de correo/WhatsApp mediante `ContactActions`.

Payload enviado:

```json
{
  "userId": "perfiles.user_id",
  "password": "temporaryPassword"
}
```

Headers enviados:

```http
authorization: Bearer <session.access_token>
content-type: application/json
```

### 2. Endpoint serverless

Ubicacion: `functions/api/restablecer-password.ts`.

Secuencia actual:

1. Lee variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Extrae token de `Authorization: Bearer ...`.
3. Valida payload.
4. Crea:
   - `adminClient` con service role.
   - `userClient` con anon key y header `Authorization`.
5. Valida token con `userClient.auth.getUser(token)`.
6. Usa `authData.user.id` para consultar `perfiles`.
7. Autoriza solo `administrador` o `fundador` activos.
8. Bloquea reset de la propia cuenta (`userId === actorId`).
9. Busca perfil objetivo con `adminClient.from('perfiles').eq('user_id', userId).single()`.
10. Ejecuta `adminClient.auth.admin.updateUserById(userId, { password })`.
11. Inserta evento en `audit_log`.
12. Devuelve `{ success: true }`.

### 3. Base de datos y RLS

Puntos relevantes:

- `perfiles.user_id` es `uuid not null references auth.users(id) on delete cascade`.
- `perfiles.user_id` tiene constraint unique.
- La politica `perfiles_select_own_or_admin` permite ver perfil propio o perfiles si `public.es_admin()`.
- `public.es_admin()` exige rol `administrador` o `fundador` y `estado = 'activo'`.
- `audit_log` tiene RLS activo.
- `audit_log_select_admin` permite lectura a administradores.
- No hay politicas cliente para insertar/modificar `audit_log`.
- El endpoint usa service role, por lo que deberia poder insertar auditoria si la key y el entorno son correctos.

## Verificacion contra los objetivos originales

### Objetivo 1: normalizar respuesta del backend

Estado: cumple en la ruta local auditada.

Respuestas actuales:

- Exito: `{ success: true }`
- `not_authorized`
- `weak_password`
- `user_not_found`
- `unknown`

Observacion:

- Ya no se devuelven mensajes crudos de Supabase al cliente.
- Errores no esperados quedan capturados como `unknown`.

### Objetivo 2: mapear errores en frontend

Estado: cumple en el codigo local auditado.

Mapeo actual:

- `not_authorized` -> `Tu sesion no tiene permisos para esta accion`
- `weak_password` -> `La contrasena generada no cumple la politica`
- `user_not_found` -> `Usuario no encontrado`
- default -> `No se pudo restablecer la contrasena.`

Observacion critica:

- El mensaje viejo `No se encontro el usuario seleccionado.` no existe en `src`, `functions` ni en el build local nuevo como cadena fuente propia.
- Si ese mensaje aparece en produccion, el navegador o Cloudflare esta sirviendo codigo anterior, o el deploy todavia no termino/no tomo el commit.

### Objetivo 3: validacion JWT critica

Estado: cumple en lo esencial.

El endpoint valida identidad con:

```ts
const { data: authData, error: authError } = await userClient.auth.getUser(token);
```

Luego usa:

```ts
const actorId = authData.user.id;
```

Ese `actorId` se usa para consultar `perfiles`.

Service role no se usa para determinar quien ejecuta la accion. El service role se usa para:

- consultar perfil objetivo sin depender de RLS del actor;
- ejecutar `updateUserById`;
- insertar auditoria.

### Objetivo 4: logging controlado

Estado: cumple parcialmente.

Logs actuales:

- inicio de request: `request_start`
- resultado de autorizacion: `authorization_result`
- resultado de `updateUserById`: `updateUserById_result`
- error inesperado: `request_result`

No se loguean contrasenas.

Riesgo:

- El log exitoso de autorizacion incluye `actorId`. No es una contrasena ni secreto, pero es identificador personal interno. Si la politica de logs exige minimizacion estricta, conviene loguear solo `authorized: true` o un hash/ultimos caracteres.
- No hay log explicito del resultado de busqueda del perfil objetivo. Esto dificulta diferenciar `target_profile_not_found` de `auth_user_not_found` sin exponer datos sensibles.

### Objetivo 5: no cambiar UI/flujo

Estado: cumple.

No se redisenaron pantallas ni se cambio el flujo principal. Solo se actualizo el mapeo de errores.

## Hallazgos

### H1 - Alta: la auditoria de reset puede fallar silenciosamente despues de cambiar la contrasena

Estado 2026-05-06: mitigado en codigo local; pendiente validacion funcional en produccion.

Ubicacion: `functions/api/restablecer-password.ts`, bloque posterior a `updateUserById`.

La funcion ejecuta:

```ts
await adminClient.from('audit_log').insert({ ... });
return jsonResponse({ success: true });
```

El cliente Supabase normalmente devuelve `{ data, error }`; no lanza excepcion para errores PostgREST ordinarios. Como el resultado se ignora, si `audit_log.insert` falla por permisos, constraint, red, esquema o mismatch de columnas, el endpoint puede devolver `{ success: true }` aunque el evento sensible no haya quedado auditado.

Impacto:

- Se podria cambiar una contrasena sin registro persistente en `audit_log`.
- El operador recibiria confirmacion exitosa.
- La investigacion posterior dependeria solo de logs de Cloudflare/Supabase Auth, no de la auditoria funcional del sistema.

Recomendacion minima:

- Capturar el resultado del insert.
- Loguear `audit_result` sin datos sensibles.
- Decidir politica:
  - opcion conservadora: si falla auditoria, devolver `unknown` aunque la contrasena ya fue cambiada, documentando que no hay rollback posible con Admin API;
  - opcion operativa: devolver exito pero loguear fallo critico y crear alerta/registro alterno. Esta opcion no cumple tan bien la exigencia de auditoria obligatoria.

### H2 - Alta: el frontend no maneja excepciones de red o caidas del endpoint

Estado 2026-05-06: mitigado en codigo local; pendiente validacion funcional en produccion.

Ubicacion: `src/App.tsx`, `handleManualPasswordReset`.

El `fetch('/api/restablecer-password', ...)` no esta dentro de `try/catch/finally`.

Impacto:

- Si hay error de red, timeout, CORS, fallo de Cloudflare Function, navegador offline o excepcion antes de recibir `response`, la funcion aborta.
- `setPanelLoading(false)` no se ejecuta.
- El usuario puede quedar con boton bloqueado/spinner y sin mensaje util.
- Este caso no entra al mapeo `not_authorized/weak_password/user_not_found`.

Recomendacion minima:

- Envolver el `fetch` en `try/catch/finally`.
- En `catch`, mostrar `No se pudo restablecer la contrasena.`
- Mantener exactamente la UI y flujo existentes.

### H3 - Media/Alta: `user_not_found` es operacionalmente ambiguo

Ubicacion: `functions/api/restablecer-password.ts`.

Actualmente `user_not_found` puede originarse en dos puntos:

1. No existe perfil objetivo:
   ```ts
   adminClient.from('perfiles').eq('user_id', userId).single()
   ```
2. `updateUserById` devuelve 404:
   ```ts
   updateError.status === 404
   ```

Impacto:

- Para el usuario final el mensaje unico esta bien.
- Para soporte/operacion no permite distinguir:
  - perfil inexistente;
  - usuario Auth inexistente;
  - variables de entorno apuntando a otro proyecto Supabase;
  - service role de otro proyecto;
  - deploy viejo;
  - dato seleccionado que no corresponde al Auth del ambiente actual.

Recomendacion minima:

- Mantener respuesta frontend `user_not_found`.
- Agregar logs server-side diferenciados, sin valores sensibles:
  - `target_lookup_result: found false`
  - `updateUserById_result: error user_not_found`
- No devolver esta distincion al frontend.

### H4 - Media: la contrasena temporal generada puede no cumplir politicas reales mas estrictas

Estado 2026-05-06: mitigado en codigo local con caracter especial; pendiente validar politica real de Supabase.

Ubicacion: `src/App.tsx`, `generateTemporaryPassword`.

La contrasena generada tiene:

- longitud suficiente;
- minusculas;
- mayusculas;
- digitos;
- no incluye simbolos.

Formato actual:

```ts
Temporal${suffix}7
```

Impacto:

- Si Supabase Auth esta configurado para exigir simbolos u otra regla adicional, `updateUserById` puede rechazar contrasenas generadas por la propia UI.
- El mapeo mostrara `La contrasena generada no cumple la politica`, pero el operador quedara obligado a pulsar `Generar otra`, que genera el mismo patron sin simbolos. Eso podria crear un bucle sin salida si la politica exige simbolo.

Recomendacion minima:

- Alinear generador con la politica real de Supabase.
- Si se exige simbolo, agregar uno fijo y seguro, por ejemplo `!`, sin cambiar UI:
  - `Temporal${suffix}7!`
- Mantener validacion backend consistente con la politica minima o mapear correctamente rechazo de Supabase.

### H5 - Media: la extraccion de Bearer token es estricta y sensible a formato

Estado 2026-05-06: mitigado en codigo local con parser regex case-insensitive.

Ubicacion: `functions/api/restablecer-password.ts`.

El endpoint exige:

```ts
authorization.startsWith('Bearer ')
```

Impacto:

- Funciona con el frontend actual.
- No tolera `bearer`, espacios extra o capitalizacion distinta, aunque el esquema HTTP Bearer normalmente se trata de forma case-insensitive.

Recomendacion minima:

- Normalizar con regex:
  - `/^Bearer\s+(.+)$/i`
- No es urgente porque el frontend actual siempre envia `Bearer`.

### H6 - Media: el endpoint no implementa respuesta controlada para metodos distintos de POST

Ubicacion: `functions/api/restablecer-password.ts`.

Solo existe `onRequestPost`.

Impacto:

- La plataforma puede responder 404/405/otro comportamiento para GET/PUT/OPTIONS.
- No afecta el flujo UI actual.
- Si se audita el endpoint como contrato completo, los metodos no POST no tienen respuesta normalizada.

Recomendacion minima:

- Opcional: agregar `onRequest` o handlers para metodos no permitidos con error controlado.
- Como la restriccion original era flujo existente y POST desde UI, no es bloqueante.

### H7 - Media: el exito del frontend no valida el body `{ success: true }`

Estado 2026-05-06: mitigado en codigo local; pendiente validacion funcional en produccion.

Ubicacion: `src/App.tsx`, `handleManualPasswordReset`.

El frontend considera exitoso cualquier `response.ok`.

Impacto:

- Si Cloudflare o un proxy devuelve 200 con HTML, respuesta vacia o payload inesperado, el usuario vera exito.
- En el flujo normal no deberia ocurrir.

Recomendacion minima:

- Parsear JSON en respuestas OK y confirmar `result?.success === true`.
- Si no, mostrar fallback generico.

### H8 - Baja/Media: el endpoint captura errores inesperados como `unknown` pero no registra causa interna

Ubicacion: `functions/api/restablecer-password.ts`, `catch`.

El catch hace:

```ts
console.info('[restablecer-password] request_result', { success: false, error: 'unknown' });
```

Impacto:

- Cumple con no filtrar detalles al frontend.
- Pero para diagnostico server-side pierde la causa tecnica.

Recomendacion minima:

- Loguear una categoria interna segura, no el mensaje crudo si puede contener detalles sensibles.
- Si se loguea el error, sanitizar y nunca incluir payload ni password.

### H9 - Baja: `server_not_configured` se colapsa a `unknown`

Ubicacion: `functions/api/restablecer-password.ts`.

Esto cumple el contrato pedido, pero reduce visibilidad del operador.

Impacto:

- Frontend mostrara fallback generico.
- Logs server-side si distinguen `server_not_configured`.

Recomendacion:

- Mantener como esta para no ampliar contrato frontend.
- Asegurar monitoreo de logs de Cloudflare para detectar esta condicion.

### H10 - Baja: el service worker puede contribuir a confusion de cache en shell HTML

Ubicacion: `public/sw.js`.

El service worker cachea `/`, `manifest`, icono y logo; no cachea assets JS versionados directamente.

Impacto:

- El fetch handler intenta red primero y cae a cache en offline.
- No deberia servir JS viejo si hay red.
- En offline o estado raro de SW, puede presentar shell anterior.

Recomendacion:

- Para pruebas post-deploy, pedir recarga dura y/o unregister service worker si persisten mensajes viejos.
- Si se busca mayor control, versionar `CACHE_NAME` en deploys con cambios de auth/seguridad.

## Analisis del mensaje reportado: "No se encontro el usuario seleccionado."

Resultado de busqueda local:

- No aparece en `src`.
- No aparece en `functions`.
- No aparece como cadena propia en el build nuevo.

Interpretacion:

1. Si el mensaje exacto aparece en navegador, se esta ejecutando un bundle anterior.
2. El backend anterior devolvia `not_found`; el frontend anterior mapeaba `not_found` a ese texto.
3. El commit actual cambia ese contrato a `user_not_found` y el texto a `Usuario no encontrado`.

Pasos recomendados de verificacion:

1. Confirmar que Cloudflare Pages desplego commit `1028f30`.
2. Abrir DevTools -> Network.
3. Ejecutar reset.
4. Revisar respuesta de `/api/restablecer-password`:
   - si responde `{ "error": "not_found" }`, el endpoint viejo sigue desplegado;
   - si responde `{ "error": "user_not_found" }`, el frontend viejo sigue ejecutandose o hay cache;
   - si responde `{ "success": true }`, el reset funciono;
   - si responde HTML/otro, hay problema de routing/deploy de Functions.
5. Hacer hard reload, borrar storage/service worker o probar ventana privada.

## Posibles causas reales de `user_not_found` despues del deploy correcto

Aunque `perfiles.user_id` tiene FK a `auth.users(id)`, todavia puede aparecer `user_not_found` si:

1. Cloudflare Function apunta a un Supabase diferente al frontend:
   - `VITE_SUPABASE_URL` en build frontend no coincide con `VITE_SUPABASE_URL` en Functions.
   - `SUPABASE_SERVICE_ROLE_KEY` pertenece a otro proyecto.
2. El usuario visible proviene de un proyecto Supabase y `updateUserById` se ejecuta contra otro.
3. El service role key es invalido, expirado o no corresponde al proyecto, y Supabase devuelve un error que se mapea ambiguamente.
4. El usuario Auth fue eliminado fuera del flujo normal y la FK no se reflejo por ambiente, dump o migracion manual.
5. El deploy todavia ejecuta codigo anterior.

Consulta diagnostica sugerida en Supabase SQL para un DNI afectado:

```sql
select id, user_id, dni, nombres, estado, rol_sistema
from public.perfiles
where dni = '<DNI>';
```

Luego comparar `user_id` con el usuario en Supabase Auth del mismo proyecto. Desde SQL directo no siempre es deseable consultar `auth.users` en produccion desde herramientas no controladas, pero para diagnostico administrativo se puede validar en el dashboard de Auth.

## Validaciones funcionales recomendadas

### Caso A: fundador/admin activo puede resetear a usuario normal

Esperado:

- `POST /api/restablecer-password` responde HTTP 200.
- Body: `{ "success": true }`.
- Login del usuario objetivo funciona con la contrasena temporal.
- `audit_log` contiene accion `resetear_contrasena_manual`.
- `actor_id` es el Auth ID del operador.
- `sujeto_id` es el Auth ID del usuario objetivo.
- `registro_id` es `perfiles.id` del usuario objetivo.
- No se almacena la contrasena en `audit_log`.

### Caso B: usuario normal intenta resetear

Esperado:

- HTTP 403 o 401.
- Body: `{ "error": "not_authorized" }`.
- UI: `Tu sesion no tiene permisos para esta accion`.
- No hay cambio de contrasena.
- No hay evento `resetear_contrasena_manual`.

### Caso C: token ausente/invalido

Esperado:

- HTTP 401.
- Body: `{ "error": "not_authorized" }`.
- No hay cambio de contrasena.

### Caso D: contrasena debil

Esperado:

- HTTP 400.
- Body: `{ "error": "weak_password" }`.
- UI: `La contrasena generada no cumple la politica`.
- No hay cambio de contrasena.

### Caso E: usuario objetivo inexistente en Auth

Esperado:

- HTTP 404.
- Body: `{ "error": "user_not_found" }`.
- UI: `Usuario no encontrado`.
- Log server-side permite distinguir si fallo el lookup de perfil o el update en Auth.

### Caso F: fallo de auditoria

Estado actual esperado:

- Riesgo: podria responder exito aunque no se inserte `audit_log`.

Comportamiento deseado:

- Debe quedar registro de auditoria o al menos log critico controlado.
- Claude Code deberia decidir si el endpoint debe devolver `unknown` cuando la auditoria falla despues del update.

### Caso G: fallo de red en frontend

Estado actual esperado:

- Riesgo: excepcion no capturada y loading persistente.

Comportamiento deseado:

- Loading se libera.
- UI muestra fallback generico.

## Revision de seguridad

### Fortalezas

- El service role no esta en frontend.
- El frontend usa anon key publica.
- El endpoint valida JWT antes de usar `updateUserById`.
- La autorizacion final depende de `perfiles` y rol activo.
- El endpoint bloquea reset de la propia cuenta.
- La respuesta al frontend no expone mensajes crudos de Supabase.
- La contrasena temporal no se guarda en frontend persistente ni en DB por este flujo.
- Los enlaces de contacto se generan solo despues de seleccionar usuario.

### Riesgos

- Auditoria no verificada.
- Diagnostico limitado para `user_not_found`.
- Fallos de red frontend no capturados.
- La contrasena temporal se muestra en pantalla y se envia por canales externos; esto es parte del flujo existente, pero debe tratarse como riesgo operativo.
- `actorId` se loguea completo en Cloudflare.
- No hay rate limit explicito en el endpoint.
- No hay proteccion adicional contra multiples resets consecutivos por el mismo operador mas alla de rol y confirmacion.

## Recomendaciones priorizadas

### Prioridad 0 - Cerrar antes de dar por finalizado

1. Ejecutar validacion end-to-end del reset en produccion o staging conectado al mismo Supabase.
2. Confirmar que `audit_log` registra el evento despues del reset real.
3. Confirmar login del usuario objetivo con la contrasena temporal.
4. Confirmar que Cloudflare Pages/Functions ejecutan el commit esperado y limpiar cache/service worker si aparece texto viejo.

### Prioridad 1 - Mejorar diagnostico sin cambiar contrato

1. Agregar logs internos diferenciados para:
   - perfil objetivo no encontrado;
   - Auth user no encontrado;
   - auditoria fallida;
   - config faltante.
2. Mantener respuestas externas normalizadas.

### Prioridad 2 - Robustez operativa

1. Alinear generador de contrasena con la politica real de Supabase.
2. Validar body `{ success: true }` en frontend.
3. Normalizar parser de Bearer token.
4. Considerar rate limit o cooldown por operador/usuario si el abuso operativo es una preocupacion.

## Checklist para Claude Code

- [ ] Confirmar que el deploy ejecuta `functions/api/restablecer-password.ts` del commit `1028f30`.
- [ ] Confirmar que el frontend desplegado contiene el mapeo `user_not_found -> Usuario no encontrado`.
- [ ] Probar un reset con fundador/admin activo.
- [ ] Probar un reset con usuario normal.
- [ ] Probar reset con password debil.
- [ ] Probar usuario objetivo inexistente o inconsistente.
- [ ] Verificar que `audit_log` se escribe en exito.
- [ ] Forzar fallo de auditoria en entorno de prueba y confirmar comportamiento.
- [ ] Forzar fallo de red o endpoint caido y confirmar que UI no queda bloqueada.
- [ ] Confirmar que login del usuario objetivo funciona con la clave temporal.
- [ ] Confirmar que login normal de otros usuarios no se rompe.

## Evidencia de comandos locales ejecutados

Comandos relevantes ejecutados durante la correccion/auditoria:

```powershell
rg -n "restablecer-password|updateUserById|No se pudo restablecer|reset" .
npm.cmd run build
rg -n "No se encontró el usuario seleccionado|Usuario no encontrado|not_found|user_not_found|password_policy_rejected" src dist functions
git push origin main
```

Resultado relevante:

- `npm.cmd run build` paso correctamente.
- `git push origin main` publico `1028f30`.
- La cadena vieja `No se encontro el usuario seleccionado.` no esta en el codigo local auditado.

## Conclusion

El flujo quedo mejor que el estado inicial: la validacion JWT se hace con cliente anon autenticado, el service role se limita a operaciones administrativas, y el contrato backend/frontend ya no depende de mensajes crudos de Supabase.

No obstante, no recomiendo cerrar la funcionalidad como totalmente auditada hasta validar end-to-end:

1. cambio real de contrasena mediante `/api/restablecer-password`;
2. login posterior del usuario objetivo;
3. escritura persistente en `audit_log`;
4. comportamiento controlado ante fallos de red/backend.

El error reportado por el usuario con el texto antiguo apunta principalmente a deploy/cache anterior. Si despues de confirmar commit desplegado aparece `Usuario no encontrado`, la investigacion debe centrarse en mismatch de ambiente Supabase o en 404 de `updateUserById` para el `perfiles.user_id` seleccionado.

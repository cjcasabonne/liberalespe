# Auditoría de Seguridad — Liberales PE Padrón Político

**Fecha:** 2026-04-30  
**Estado del sistema:** Fase de fundación (scaffold completo, frontend sin implementar)  
**Stack:** React 19 + Vite + TypeScript + Supabase + PostgreSQL + Cloudflare Pages  
**Revisado por:** Claude Code

---

## Alcance

| Capa | Estado |
|------|--------|
| Esquema DB + RLS | Auditado |
| Funciones RPC | Auditado |
| Grants + permisos | Auditado |
| Infraestructura (headers, config) | Auditado |
| Frontend | No implementado — no auditable |
| DNI service integration | Auditado |

---

## 🔴 Errores Críticos

### C1 — `_headers` malformado: headers de seguridad NO están activos

**Archivo:** `public/_headers:1`

El archivo usa sintaxis de comentario CSS (`/* */`). Cloudflare Pages no reconoce este formato — el único comentario válido es `#`. Todo el contenido está dentro de un bloque comentado.

```
/*
  X-Frame-Options: DENY          ← no se aplica
  X-Content-Type-Options: nosniff ← no se aplica
  ...
*/
```

**Consecuencia:** X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy no se aplican en producción. La aplicación corre sin headers de seguridad.

**Corrección:**

```
# Seguridad global
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:
```

---

### C2 — TOCTOU en `aprobar_desafiliacion`: transición `anulado → desafiliado` posible

**Archivo:** `supabase/migrations/002_controlled_rpcs.sql:283-287`

`aprobar_desafiliacion` bloquea la solicitud con `FOR UPDATE` pero no verifica el estado actual del perfil antes de escribir.

`aprobar_afiliacion` sí lo hace:
```sql
-- aprobar_afiliacion ✓
if before_perfil.estado <> 'activo' then
  raise exception 'perfil_not_active';
end if;
```

`aprobar_desafiliacion` no:
```sql
-- aprobar_desafiliacion ✗
select * into before_perfil ... for update;
-- sin verificación de estado
update public.perfiles set estado = 'desafiliado' ...
```

**Secuencia de explotación:**
1. Usuario activo crea solicitud de desafiliación (`estado = pendiente`)
2. Admin lo anula por otro motivo → `estado = anulado`
3. Admin procesa la solicitud pendiente → `estado = desafiliado` (sobreescribe la anulación)

Un usuario anulado puede limpiar su estado vía una solicitud previa. La transición `anulado → desafiliado` no existe en el modelo de estados definido en `arquitectura.md`.

**Corrección:** Agregar verificación de estado en `aprobar_desafiliacion` antes del `UPDATE`:

```sql
if before_perfil.estado <> 'activo' then
  raise exception 'perfil_not_active';
end if;
```

---

## 🟡 Riesgos Importantes

### R1 — Política de contraseñas inadecuada para padrón político

**Archivo:** `supabase/config.toml:177-180`

```toml
minimum_password_length = 6
password_requirements = ""
```

Passwords como `123456` o `dnidni` son válidas. El sistema usa DNI como identificador visible y único — información semipública en Perú. Conocido el DNI, solo se necesitan adivinar 6 caracteres sin restricciones.

El rate limiting de Supabase Auth mitiga fuerza bruta directa, pero no ataques de credenciales filtradas o diccionario básico.

**Corrección:**
```toml
minimum_password_length = 10
password_requirements = "lower_upper_letters_digits"
```

---

### R2 — `cambiar_rol_sistema` permite crear fundadores sin límite

**Archivo:** `supabase/migrations/002_controlled_rpcs.sql:374-424`

Un fundador puede elevar a cualquier usuario activo al rol `fundador`. No existe verificación del número de fundadores existentes. Si una cuenta fundador es comprometida, el atacante puede crear fundadores arbitrarios. La acción aparece en `audit_log` pero no hay alertas activas.

El modelo de arquitectura no define cuántos fundadores puede haber. Si la respuesta es "uno", este control falta.

**Corrección sugerida:** Agregar un guard en `cambiar_rol_sistema`:
```sql
if nuevo_rol = 'fundador' then
  perform 1 from public.perfiles
  where rol_sistema = 'fundador' and estado = 'activo';
  if found then
    raise exception 'fundador_already_exists';
  end if;
end if;
```
(Solo si la arquitectura define un único fundador.)

---

### R3 — Frontend es un stub: 40% del modelo de seguridad no existe

`src/App.tsx` tiene 1 línea. `src/main.tsx` solo registra el service worker.

El modelo de seguridad depende de tres capas: DB (auditada), frontend (inexistente), y DNI service (integrado). La capa frontend controla:

- Que el error de DNI duplicado no revele estado de la cuenta
- Que el flujo de registro use `dniToAuthEmail()` correctamente
- Que el fallback del DNI service sea mandatorio (no omitible)
- Que las rutas admin no sean accesibles sin verificación de rol en UI

Todo esto está sin implementar. Cualquier desviación en la implementación convierte los controles de DB en la única barrera.

---

### R4 — Sin Content-Security-Policy en ningún punto

`public/_headers` no incluye CSP (y además el archivo está malformado per C1). Sin CSP, ataques XSS pueden exfiltrar el token de sesión de Supabase desde `localStorage`. El anon key es público por diseño, pero el token de sesión JWT del usuario autenticado no lo es. Robo de token = suplantación completa de identidad dentro del sistema.

---

## 🟢 Mejoras

### M1 — `aprobar_desafiliacion` no registra comentario del operador

`rechazar_afiliacion` registra `comentario_operador` en la solicitud. `aprobar_desafiliacion` no guarda ninguna observación del operador en el audit. Inconsistencia que reduce la trazabilidad administrativa.

---

### M2 — `audit_json_solicitud_desafiliacion` no incluye motivo del usuario

El snapshot de auditoría de la solicitud de desafiliación no captura el motivo declarado por el usuario. Si existe campo `motivo` en la tabla, debería estar en el JSON de auditoría para trazabilidad completa.

---

### M3 — Un fundador puede anular a otro fundador

**Archivo:** `supabase/migrations/002_controlled_rpcs.sql:349`

```sql
if before_row.rol_sistema = 'fundador' and not public.es_fundador() then
  raise exception 'cannot_anular_fundador';
end if;
```

Un fundador puede anular a otro fundador. Puede ser intencional (el fundador1 puede neutralizar al fundador2 comprometido), pero si no lo es, es una laguna de gobernanza entre fundadores. Debe documentarse explícitamente como decisión de arquitectura.

---

### M4 — `_headers` no especifica paths explícitos

Cuando se corrija C1, el archivo debería usar `/*` para cubrir todas las rutas de la SPA explícitamente, no depender de la aplicación global del header por Cloudflare.

---

## Hallazgos Positivos

Aspectos del sistema que funcionan correctamente y no requieren cambios.

| Área | Detalle |
|------|---------|
| RLS | Habilitado en todas las tablas críticas. Políticas correctas por rol |
| Grants | `UPDATE/DELETE` revocados a nivel de grant (defensa en profundidad) |
| RPCs | `security definer` + `set search_path = public` en todas las funciones críticas |
| Audit helpers | `revoke all from public` aplicado a `audit_json_*` — no invocables directamente |
| Anti-auto-acción | `cannot_anular_self`, `cannot_change_own_role` implementados |
| Escalación de privilegios | Admin no puede anular fundador — verificado en código |
| Enums | Todos los estados modelados como enums PostgreSQL — transiciones inválidas imposibles a nivel DB |
| Audit logging | DNI enmascarado (`****5678`), snapshots antes/después, tamaño limitado a 12KB |
| Request guards | Índices únicos parciales — imposible crear dos solicitudes pendientes simultáneas |
| DNI service | Timeout 3s, manejo de HTTP 429, degraded mode, AbortController — defensivo |
| Credenciales en git | `.env.local` en `.gitignore`, nunca commiteado — verificado con `git log` |
| Service role | Nunca expuesto en frontend — solo `anon key` en `VITE_*` |
| `es_admin()` / `es_fundador()` | Helpers centralizados, `security definer`, reutilizados consistentemente |

---

## Plan de Corrección

Acciones ordenadas por urgencia antes de continuar con la siguiente fase.

| # | Prioridad | Acción | Archivo |
|---|-----------|--------|---------|
| 1 | Inmediata | Corregir formato `_headers` con paths y sintaxis válida para Cloudflare | `public/_headers` |
| 2 | Inmediata | Agregar CSP header | `public/_headers` |
| 3 | Inmediata | Agregar verificación `estado = activo` en `aprobar_desafiliacion` | `002_controlled_rpcs.sql` |
| 4 | Antes de deploy | Aumentar `minimum_password_length` a 10 + agregar `password_requirements` | `supabase/config.toml` |
| 5 | Decisión de arquitectura | Definir si puede haber múltiples fundadores y, si no, agregar guard | `002_controlled_rpcs.sql` |
| 6 | Siguiente fase | Implementar frontend siguiendo estrictamente `scaffolding.md` | `src/` |

---

## 📊 Veredicto Final

```
INESTABLE
```

**Capa de base de datos:** Sólida. RLS correcto, RPCs con `security definer` + `set search_path`, grants defensivos, audit logging con enmascaramiento. Un único error lógico (C2) que requiere corrección antes de producción.

**Capa de infraestructura:** Rota. Los headers de seguridad definidos no se aplican por error de formato (C1). Corrección trivial, consecuencia no trivial.

**Capa de frontend:** Inexistente. No auditable. Hasta que se implemente, el sistema no puede clasificarse como producción-ready.

El sistema no debe avanzar a producción sin resolver C1 y C2. Una vez corregidos, la clasificación puede subir a **OPERABLE CON RIESGOS** mientras el frontend se implementa.

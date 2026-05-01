# Perspectiva tecnica sobre la auditoria de seguridad

**Fecha:** 2026-04-30  
**Documento revisado:** `Documentation/auditoria_seguridad.md`  
**Objetivo:** evaluar las sugerencias externas contra el estado actual del repositorio y priorizar acciones.

## Resumen ejecutivo

La auditoria externa acierta en los puntos de mayor riesgo: los headers de Cloudflare no se estan aplicando correctamente y `aprobar_desafiliacion` permite una transicion de estado que no deberia existir. Ambos hallazgos deben tratarse como bloqueantes antes de produccion.

Hay un punto desactualizado: la auditoria indica que el frontend es un stub, pero actualmente `src/App.tsx` ya implementa registro, login, solicitudes y panel operativo basico. Eso no invalida los riesgos de frontend; cambia su naturaleza. Ya no es "no auditable", sino "auditable parcialmente y todavia con controles de UX/seguridad por endurecer".

Tambien hay un hallazgo no cubierto por la auditoria: el mapeo `dni -> email interno` debe usar un dominio aceptado por Supabase Auth. Ya se corrigio de `@auth.local` a `@liberalespe.example.com`, y el remoto fue ajustado para autoconfirmar emails.

## Evaluacion por hallazgo

### C1 - `_headers` malformado

**Mi postura:** correcto y critico.

El archivo `public/_headers` usa:

```text
/*
  X-Frame-Options: DENY
  ...
```

En Cloudflare Pages, `/*` debe ser el path matcher, no un bloque de comentario. Tal como esta, el archivo queda ambiguo y probablemente no aplica los headers esperados. Ademas falta cerrar el bloque si se interpreta como comentario CSS, lo que refuerza que el archivo no esta en un formato confiable.

**Recomendacion:** corregirlo como prioridad inmediata y agregar CSP en el mismo cambio. La version minima deberia tener un path explicito:

```text
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co https://busqueda-dni.onrender.com; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

La CSP debe incluir el servicio DNI porque el frontend llama a Render desde `buscarDni`.

### C2 - TOCTOU en `aprobar_desafiliacion`

**Mi postura:** correcto y critico.

La funcion bloquea la solicitud pendiente y luego bloquea el perfil, pero no verifica que el perfil siga `activo` antes de cambiarlo a `desafiliado`. Si un perfil fue anulado despues de crear la solicitud, aprobar esa solicitud puede sobrescribir `anulado`.

**Recomendacion:** agregar:

```sql
if before_perfil.estado <> 'activo' then
  raise exception 'perfil_not_active';
end if;
```

Esto debe ir despues del `select ... into before_perfil ... for update` y antes del `update public.perfiles`.

### R1 - Politica de contrasenas debil

**Mi postura:** correcto.

El frontend y `supabase/config.toml` deben exigir una contrasena mas fuerte que el minimo por defecto. Para un sistema basado en DNI + contrasena, el DNI funciona como identificador semipublico; la contrasena tiene que cargar mas peso.

**Recomendacion:** mantener el minimo remoto y local en 10 como minimo. La regla `lower_upper_letters_digits` mejora resistencia, aunque puede afectar usabilidad. Una alternativa razonable es minimo 12 sin composicion estricta, pero Supabase CLI ya ofrece la regla sugerida y es defendible.

La validacion de `src/App.tsx` debe permanecer alineada con esa politica.

### R2 - Fundadores multiples

**Mi postura:** requiere decision de gobernanza, no es automaticamente un bug.

La arquitectura habla de rol `fundador`, pero no define si debe ser unico. La auditoria propone impedir que exista mas de un fundador activo. Eso puede ser correcto si el modelo organizativo quiere una raiz unica, pero tambien puede ser fragil operativamente: una sola cuenta fundador es un punto unico de fallo.

**Recomendacion:** documentar una de estas dos decisiones:

- **Fundador unico:** agregar guard en `cambiar_rol_sistema` y procedimiento de recuperacion fuera de la app.
- **Multiples fundadores controlados:** mantener la capacidad, pero agregar reglas operativas, alertas y revision de auditoria para cualquier cambio a `fundador`.

Mi preferencia pragmatica: permitir mas de un fundador solo si hay al menos dos personas responsables y si el cambio queda auditado y revisado manualmente. Si no existe ese proceso, aplicar fundador unico por ahora.

### R3 - Frontend inexistente

**Mi postura:** desactualizado.

El frontend ya no es un stub. `src/App.tsx` contiene flujos reales de registro, login, carga de perfil, solicitudes, RPC administrativas y panel basico.

El riesgo actualizado es distinto:

- el registro muestra un error neutral, correcto para no enumerar DNI;
- el DNI service es opcional, correcto porque no bloquea registro manual;
- el panel se oculta por rol en UI, pero la seguridad real depende de RLS/RPC, como corresponde;
- las acciones administrativas usan `window.prompt`, que es funcional pero debil para operacion seria;
- no hay confirmaciones fuertes en UI para acciones como anulacion o aprobacion de desafiliacion.

**Recomendacion:** reemplazar este hallazgo por una auditoria frontend real. Priorizar confirmaciones explicitas, estados de carga por accion y manejo de errores sin filtrar detalles internos.

### R4 - Falta de CSP

**Mi postura:** correcto y debe resolverse junto con C1.

Sin CSP, cualquier XSS tendria una ruta mas simple para robar tokens de sesion de Supabase. Como el sistema opera directamente desde frontend contra Supabase, la sesion del usuario es el activo principal del navegador.

**Recomendacion:** agregar CSP restrictiva desde Cloudflare. No conviene hacerla demasiado amplia por comodidad. Debe permitir solo:

- `self`;
- Supabase del proyecto;
- servicio DNI en Render;
- `data:` para imagenes si la app lo necesita.

### M1 - Comentario del operador en `aprobar_desafiliacion`

**Mi postura:** mejora valida, no bloqueante.

La aprobacion de desafiliacion hoy no recibe comentario. Para trazabilidad administrativa, conviene permitir una observacion opcional y guardarla en el audit log. No lo trataria como requisito previo a produccion si C1/C2/R1 estan pendientes.

### M2 - Motivo ausente en audit de desafiliacion

**Mi postura:** correcto.

`audit_json_solicitud_desafiliacion` no incluye `motivo`, aunque la tabla lo tiene y el frontend lo captura. Esto reduce la utilidad del audit log.

**Recomendacion:** incluir `motivo` en el JSON de auditoria, cuidando que no contenga datos excesivos o sensibles innecesarios. Si preocupa longitud o contenido, truncar o normalizar.

### M3 - Un fundador puede anular a otro fundador

**Mi postura:** decision de gobernanza.

Permitirlo puede ser necesario si un fundador esta comprometido. Prohibirlo evita abuso entre fundadores, pero tambien puede bloquear respuesta a incidentes.

**Recomendacion:** documentarlo. Si se mantienen multiples fundadores, conviene que la anulacion de fundador requiera un procedimiento externo o una segunda aprobacion. Si la app no tendra doble control, al menos debe quedar muy visible en auditoria.

### M4 - Paths explicitos en `_headers`

**Mi postura:** correcto.

Usar `/*` como path matcher es la forma clara para cubrir toda la SPA en Cloudflare Pages. Debe corregirse junto con C1.

## Hallazgos adicionales desde esta revision

### A1 - Email interno para Supabase Auth

El dominio `@auth.local` fue rechazado por Supabase Auth con `email_address_invalid`. El helper ya fue cambiado a:

```ts
dni-${dni}@liberalespe.example.com
```

Esto es aceptable porque `example.com` esta reservado y el email es solo un identificador tecnico. El sistema no debe depender de recibir correos en ese dominio.

### A2 - Config remota de Auth debe mantenerse alineada

El flujo de registro necesita que Supabase Auth autoconfirme el email. Si `enable_confirmations` vuelve a `true`, `signUp` puede crear usuario sin sesion y luego fallara el insert en `perfiles` por RLS.

**Recomendacion:** tratar `supabase/config.toml` como fuente de verdad y usar `supabase config push` despues de cambios de Auth relevantes.

### A3 - Datos de prueba creados durante diagnostico

Existe un registro ficticio creado para validar el flujo:

```text
DNI: 99990003
Nombre: PRUEBA DIAGNOSTICO
```

Debe eliminarse antes de usar el sistema con datos reales, pero la eliminacion requiere una accion destructiva controlada.

## Prioridad recomendada

1. Corregir `public/_headers` y agregar CSP.
2. Agregar guard `estado = activo` en `aprobar_desafiliacion`.
3. Endurecer contrasenas en Supabase y alinear validacion frontend.
4. Decidir politica de fundadores y documentarla.
5. Mejorar auditoria de desafiliacion con `motivo` y observacion opcional.
6. Reauditar frontend actual, porque la auditoria externa lo evaluo como inexistente.
7. Limpiar datos ficticios de diagnostico antes de produccion.

## Veredicto

Mi veredicto actual es **operable para pruebas controladas, no listo para produccion**.

La base de datos esta razonablemente bien planteada, pero C1 y C2 son reales. El registro ya funciona despues del ajuste de email interno y Auth remoto, pero todavia falta endurecer la superficie de navegador, cerrar la transicion invalida de desafiliacion y definir reglas de gobernanza para fundadores.

## Estado de implementacion posterior

Se implementaron las prioridades principales mediante `supabase/migrations/005_security_hardening_and_v3.sql`, `public/_headers`, `supabase/config.toml` y ajustes de frontend:

- CSP agregada a headers de Cloudflare.
- `aprobar_desafiliacion` ahora valida que el perfil siga `activo`.
- `audit_json_solicitud_desafiliacion` incluye `motivo`.
- Politica de contrasena endurecida a minimo 10 con minuscula, mayuscula y numero.
- Gobernanza conservadora: un solo fundador activo.
- Estructura v3 creada para `temas` y `votos`, con voto unico, RLS de elegibilidad e inmutabilidad de votos.
- Panel operativo ampliado con filtros, confirmaciones y auditoria por usuario.
- Recuperacion manual de acceso implementada con cola publica neutral, revision administrativa y auditoria.
- Actualizacion de telefono propio limitada por RLS y auditada.
- Correccion operativa de nombres/telefono por administradores implementada por RPC auditada.
- Rechazo de solicitudes de desafiliacion implementado por RPC auditada.

Pendiente antes de produccion:

- limpiar el registro ficticio de diagnostico `99990003`;
- ejecutar pruebas manuales completas con usuario comun, administrador y fundador;
- validar Cloudflare Pages despues de deploy real;
- definir si el modelo de fundador unico se mantiene a largo plazo.

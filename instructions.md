# Instrucciones estrictas de implementacion

Este documento define reglas obligatorias para implementar el sistema sin romper la arquitectura acordada.

## 1. Principios obligatorios

- No crear backend adicional para CRUD.
- No introducir servicios pagos.
- No agregar microservicios fuera del servicio DNI existente.
- Supabase es el backend del sistema.
- Usar Supabase Auth, PostgreSQL y RLS como base operativa.
- La seguridad vive en base de datos, RLS, constraints y RPC.
- El frontend controla UX, no permisos.
- No duplicar logica critica entre frontend y base de datos.
- Usar una sola URL canonica para el servicio DNI: `https://busqueda-dni.onrender.com`.
- Ejecutar operaciones pesadas on-demand, con paginacion y filtros.
- No cargar el padron completo en cliente.
- No modificar decisiones de `arquitectura.md` ni saltarse el orden de `scaffolding.md`.

## 2. Reglas de base de datos

- Toda tabla debe tener ownership claro.
- Toda tabla operativa debe tener RLS activado antes de usarse desde frontend.
- Toda tabla accesible desde frontend debe tener RLS activo.
- Ninguna tabla sensible debe quedar accesible sin politicas RLS.
- Prohibido usar tablas sin RLS en produccion si son accesibles desde frontend.
- Los campos criticos deben tener constraints.
- Los campos de busqueda, filtro y auditoria deben tener indices.
- `dni` debe ser unico.
- `perfiles.user_id` debe ser obligatorio.
- `perfiles.user_id` debe referenciar `auth.users(id)`.
- `perfiles.user_id` debe ser unico.
- Debe existir `idx_perfiles_user_id`.
- `auth_email` es derivado y no debe validarse con constraint SQL.
- `auth_email` no es fuente de verdad.
- Supabase Auth gestiona emails en `auth.users`.
- `perfiles` es extension del usuario autenticado, no sistema de autenticacion paralelo.
- No exponer DNI completo sin control de rol.
- Usar masking de DNI cuando el caso de uso no requiera verlo completo.
- Restringir exportaciones con DNI completo.
- Auditar exportaciones sensibles si se implementan.
- `audit_log` debe ser append-only desde la perspectiva del cliente.
- Ningun usuario comun debe leer `audit_log`.
- `audit_log` no debe almacenar datos sensibles completos si no es necesario.
- `audit_log.antes` y `audit_log.despues` deben limitarse a cambios necesarios, preferiblemente resumidos o con masking.
- Auditoria no debe convertirse en fuga de datos.
- No permitir updates directos de campos sensibles desde frontend.
- Las tablas futuras `temas` y `votos` deben disenarse desde el inicio si se prepara v3.
- Cuando se implemente v3, `votos` debe impedir mas de un voto por usuario y tema con `unique(usuario_id, tema_id)`.

Campos sensibles que no debe modificar el usuario:

- `rol_sistema`.
- `tipo_miembro`.
- `estado`.
- `validado_manualmente`.
- `validado_por`.
- `validado_en`.

## 3. Reglas de autenticacion

- El DNI es el identificador logico visible para el usuario.
- Supabase Auth debe usarse con email/password interno.
- `auth.users` es la fuente de verdad para autenticacion.
- Nunca duplicar logica de Auth en `perfiles`.
- El usuario nunca debe escribir ni conocer el email interno.
- La UI debe mostrar DNI + contrasena.
- La transformacion DNI -> email interno debe ser unica y consistente.
- Usar helper unico para esa transformacion.

Helper canonico:

```ts
function dniToAuthEmail(dni: string) {
  return `dni-${dni}@auth.local`;
}
```

- No depender de email para flujos criticos.
- No usar email verification.
- No usar magic links.
- No usar SMS OTP.
- No implementar validacion automatica de identidad.
- Autenticacion no equivale a identidad validada.
- Autenticacion ≠ identidad.
- Login correcto no otorga derechos politicos.
- Los derechos politicos dependen de `tipo_miembro`, `estado` y validacion manual.
- DNI duplicado debe responder con mensaje neutral.
- No revelar si un DNI existe, esta anulado, esta validado o esta desafiliado.
- Recuperacion de acceso debe ser manual y auditada.

## 4. Reglas de seguridad

- Prohibido implementar permisos reales en frontend.
- Prohibido confiar en datos enviados por el cliente.
- Prohibido exponer `service_role` en frontend.
- Prohibido permitir autoelevacion de privilegios.
- Prohibido administrar roles con updates directos desde UI.
- Toda accion critica debe validarse en DB o RPC.
- Aprobar afiliacion, anular usuarios y cambiar roles deben ejecutarse mediante RPC o mecanismos controlados en base de datos.
- Prohibido permitir `UPDATE` directo desde frontend para aprobar afiliacion, anular usuarios, cambiar roles, cambiar `tipo_miembro` o cambiar `estado`.
- Toda accion critica debe registrar auditoria.
- Toda RPC critica debe validar:
  - actor;
  - permisos;
  - estado actual;
  - transicion permitida;
  - sujeto afectado.
- Los errores publicos deben ser neutrales.
- No exponer detalles internos de Auth, RLS, estados o scraping.
- No registrar DNI completo en logs publicos.
- No enviar datos personales a analytics o herramientas no definidas.
- La base de datos es la unica fuente de verdad.
- El frontend no puede inferir ni fijar estados criticos.
- El frontend no puede decidir validacion manual, afiliacion, anulacion, desafiliacion ni roles.

Acciones criticas:

- validar usuario.
- aprobar afiliacion.
- rechazar afiliacion.
- aprobar desafiliacion.
- anular usuario.
- cambiar rol.
- cambiar tipo de miembro.
- cambiar estado.
- resetear contrasena.
- exportar datos sensibles.

## 5. Reglas de votaciones futuras

- La funcionalidad de votacion pertenece a v3.
- No implementar UI de votacion en v1/v2.
- `temas` representan unidades de decision.
- `votos` representan decisiones emitidas sobre temas.
- Solo usuarios con `tipo_miembro = afiliado` y `estado = activo` pueden votar.
- El frontend no decide si un usuario puede votar.
- La elegibilidad para votar debe implementarse en RLS, constraints o RPC controlada.
- Prohibido implementar logica de votacion en frontend sin control de base de datos.
- Un usuario no puede votar mas de una vez por tema.
- Los votos deben ser inmutables despues de emitidos.
- Cada voto debe quedar registrado con trazabilidad.
- La auditoria aplica a votos y cambios de estado de temas.
- No usar `rol_sistema` para determinar derecho a voto.
- No permitir que usuarios anulados o desafiliados voten.

## 6. Reglas de integracion con servicio DNI

- Usar siempre `VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com`.
- Endpoint canonico: `POST https://busqueda-dni.onrender.com/api/buscar-dni`.
- Health check: `GET https://busqueda-dni.onrender.com/health`.
- El servicio DNI solo autocompleta nombres.
- El servicio DNI no valida identidad.
- El servicio DNI no crea usuarios.
- El servicio DNI no cambia estados.
- El servicio DNI no decide afiliaciones.
- Implementar timeout frontend de 2 a 3 segundos.
- Mostrar estado de carga durante consulta.
- Tolerar cold start de Render.
- Permitir como maximo retry controlado.
- No hacer bucles agresivos de reintento.
- Activar fallback manual ante:
  - error;
  - timeout;
  - respuesta degradada;
  - HTTP 429;
  - servicio caido.
- No bloquear registro si el servicio DNI falla.
- Rate limiting ocurre en backend Render, no en frontend.
- HTTP 429 debe tratarse como exceso de consultas y activar fallback manual.
- No usar la respuesta del servicio como fuente de verdad.
- El nombre autocompletado debe poder corregirse manualmente.

## 7. Reglas del panel operativo

- El panel es el nucleo operativo del sistema.
- Toda lista debe tener paginacion obligatoria.
- Todo filtro debe ejecutarse en base de datos.
- No filtrar el padron completo en memoria.
- Priorizar busqueda por DNI.
- Usar limites de pagina explicitos.
- No hacer cargas completas de usuarios, solicitudes o auditoria.
- Acciones de alto riesgo deben pedir confirmacion.
- Toda accion critica debe pasar por RPC o control equivalente en DB.
- Prohibido ejecutar cambios criticos con `update()` directo desde componentes frontend.
- Toda accion critica debe generar `audit_log`.
- Mostrar DNI completo solo a roles autorizados.
- Usar masking cuando corresponda.
- No permitir exportaciones masivas sin permiso, justificacion y auditoria.
- Administradores no deben poder degradar fundadores.
- Administradores no deben poder convertirse a si mismos en fundadores.

## 8. Reglas de codigo

- Centralizar cliente Supabase.
- Centralizar `dniToAuthEmail`.
- Centralizar validacion de formato DNI.
- Centralizar llamadas al servicio DNI.
- Centralizar manejo de errores publicos.
- No duplicar queries complejas en multiples componentes.
- No duplicar reglas de rol en componentes UI.
- No duplicar transiciones de estado en frontend.
- No duplicar en frontend reglas ya definidas en RLS, constraints o RPC.
- No mezclar nombres de conceptos:
  - `rol_sistema` controla permisos.
  - `tipo_miembro` controla derechos politicos.
  - `estado` controla vigencia.
- Mantener naming consistente con la base de datos.
- No inventar nombres alternativos para campos ya definidos.
- No crear campos equivalentes que dupliquen estado.
- No crear flujos fuera de `arquitectura.md` y `scaffolding.md`.
- No dejar TODOs en seguridad, RLS, auditoria o autenticacion.
- Todo cambio sensible debe tener una ruta de prueba manual.

## Reglas de rechazo automatico

Una implementacion debe rechazarse si:

- crea un backend CRUD nuevo;
- mueve permisos reales al frontend;
- usa el servicio DNI como validacion de identidad;
- permite registro sin fallback manual;
- permite acciones criticas sin auditoria;
- consulta tablas sensibles sin RLS;
- carga el padron completo;
- expone `service_role`;
- mezcla `rol_sistema`, `tipo_miembro` y `estado`;
- depende de email, magic link o SMS para un flujo critico;
- usa una URL distinta para el servicio DNI sin actualizar la configuracion canonica.

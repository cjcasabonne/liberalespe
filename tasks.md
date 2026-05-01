# Tasks de implementacion

Roadmap ejecutable para construir el sistema sin improvisar ni romper la arquitectura definida.

Reglas de avance:

- No saltar fases.
- Validar cada paso antes de continuar.
- No implementar features fuera del alcance.
- No crear backend adicional.
- No mover permisos al frontend.
- No usar servicios pagos.

## Fase 1 — Setup

- [ ] Crear proyecto en Supabase.
  - Verificacion: existe `SUPABASE_URL` y `anon key` del proyecto.

- [ ] Configurar Supabase Auth con email/password.
  - Verificacion: email/password esta habilitado.

- [ ] Deshabilitar confirmacion obligatoria por email.
  - Verificacion: un usuario puede iniciar sesion sin verificar email real.

- [ ] Confirmar que magic links no forman parte del flujo principal.
  - Verificacion: registro/login solo usan DNI + contrasena.

- [ ] Confirmar que SMS OTP no se usa.
  - Verificacion: no hay proveedor SMS ni flujo OTP.

- [ ] Definir URL canonica del servicio DNI.
  - Valor: `https://busqueda-dni.onrender.com`.
  - Verificacion: no hay otra URL DNI en configuracion.

- [ ] Configurar variables de entorno del frontend.
  - Variables:
    - `VITE_SUPABASE_URL`.
    - `VITE_SUPABASE_ANON_KEY`.
    - `VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com`.
  - Verificacion: el frontend lee las variables desde entorno.

- [ ] Verificar health check del servicio DNI.
  - Endpoint: `GET https://busqueda-dni.onrender.com/health`.
  - Verificacion: responde correctamente o se registra incidencia operativa.

- [ ] Crear estructura base del frontend.
  - Verificacion: proyecto React + Vite + TypeScript compila.

- [ ] Crear cliente Supabase centralizado.
  - Verificacion: no hay multiples inicializaciones dispersas.

## Fase 2 — Base de datos

- [ ] Crear enum `rol_sistema`.
  - Valores: `usuario`, `administrador`, `fundador`.
  - Verificacion: enum existe en PostgreSQL.

- [ ] Crear enum `tipo_miembro`.
  - Valores: `adherente`, `afiliado`.
  - Verificacion: enum existe en PostgreSQL.

- [ ] Crear enum `estado_usuario`.
  - Valores: `activo`, `anulado`, `desafiliado`.
  - Verificacion: enum existe en PostgreSQL.

- [ ] Crear enum `estado_solicitud`.
  - Valores: `pendiente`, `aprobada`, `rechazada`, `cancelada`.
  - Verificacion: enum existe en PostgreSQL.

- [ ] Crear tabla `perfiles`.
  - Campos minimos: `id`, `user_id`, `dni`, `nombres`, `telefono`, `rol_sistema`, `tipo_miembro`, `estado`, `validado_manualmente`, `validado_por`, `validado_en`, timestamps.
  - Verificacion: tabla existe y `user_id` referencia `auth.users(id)`.

- [ ] Agregar `user_id` obligatorio en `perfiles`.
  - Regla: `user_id uuid not null references auth.users(id)`.
  - Verificacion: no se puede crear perfil sin usuario Auth.

- [ ] Agregar unicidad de `user_id`.
  - Regla: `unique(user_id)`.
  - Verificacion: un usuario Auth no puede tener mas de un perfil.

- [ ] Agregar constraint de formato DNI.
  - Regla: `^[0-9]{8}$`.
  - Verificacion: la base rechaza DNI invalido.

- [ ] Confirmar que no existe constraint SQL para `auth_email`.
  - Regla: `auth_email` es derivado durante registro, no fuente de verdad.
  - Verificacion: no hay constraint que ate `auth_email` al DNI dentro de `perfiles`.

- [ ] Agregar unicidad de `dni`.
  - Verificacion: la base rechaza DNI duplicado.

- [ ] Confirmar que Supabase Auth gestiona unicidad del email interno.
  - Verificacion: la DB operativa no duplica logica de Auth en `perfiles`.

- [ ] Crear tabla `solicitudes_afiliacion`.
  - Verificacion: tiene relacion con `perfiles(id)`.

- [ ] Crear tabla `solicitudes_desafiliacion`.
  - Verificacion: tiene relacion con `perfiles(id)`.

- [ ] Crear tabla `audit_log`.
  - Verificacion: contiene actor, sujeto, accion, tabla, registro, antes, despues y timestamp.

- [ ] Crear indices de `perfiles`.
  - Campos: `user_id`, `dni`, `estado`, `tipo_miembro`, `rol_sistema`, `validado_manualmente`, `creado_en`, busqueda por `nombres`.
  - Verificacion: indices existen.

- [ ] Crear indice `idx_perfiles_user_id`.
  - Verificacion: lookup por usuario autenticado esta indexado.

- [ ] Crear indices de solicitudes.
  - Campos: `estado`, `usuario_id`, `creado_en`.
  - Verificacion: indices existen.

- [ ] Crear indices de `audit_log`.
  - Campos: `actor_id`, `sujeto_id`, `creado_en`, `accion`.
  - Verificacion: indices existen.

- [ ] Validar relaciones principales.
  - Verificacion: no se puede crear solicitud para usuario inexistente.

## Fase 3 — Seguridad

Esta fase es una compuerta completa. No avanzar a autenticacion, integracion DNI ni UI funcional hasta validar RLS y policies basicas.

- [ ] Activar RLS en `perfiles`.
  - Verificacion: sin policy, un usuario comun no puede leer registros arbitrarios.

- [ ] Activar RLS en `solicitudes_afiliacion`.
  - Verificacion: acceso bloqueado hasta crear policies.

- [ ] Activar RLS en `solicitudes_desafiliacion`.
  - Verificacion: acceso bloqueado hasta crear policies.

- [ ] Activar RLS en `audit_log`.
  - Verificacion: usuario comun no puede leer auditoria.

- [ ] Crear funcion `es_admin()`.
  - Verificacion: devuelve true solo para `administrador` o `fundador` activo.

- [ ] Crear funcion `es_fundador()`.
  - Verificacion: devuelve true solo para `fundador` activo.

- [ ] Crear policy para lectura de perfil propio.
  - Verificacion: usuario comun lee solo su `perfiles.id`.

- [x] Crear policy para actualizacion limitada del perfil propio.
  - Verificacion: usuario puede actualizar telefono si esta permitido.

- [ ] Bloquear cambios de campos sensibles por usuario comun.
  - Campos: `rol_sistema`, `tipo_miembro`, `estado`, `validado_manualmente`.
  - Verificacion: update directo falla.

- [ ] Crear policies administrativas de lectura.
  - Verificacion: administrador/fundador pueden revisar usuarios segun RLS.

- [ ] Crear policies de solicitudes propias.
  - Verificacion: usuario ve y crea solo sus solicitudes.

- [ ] Crear policies administrativas para solicitudes.
  - Verificacion: administrador/fundador ve solicitudes pendientes.

- [ ] Bloquear update/delete directo de `audit_log`.
  - Verificacion: cliente no puede modificar ni borrar auditoria.

- [ ] Probar matriz de permisos.
  - Casos: usuario comun, administrador, fundador.
  - Verificacion: cada rol ve solo lo permitido.

- [ ] Validar que no hay tablas accesibles desde frontend sin RLS.
  - Verificacion: revision completa de tablas expuestas al cliente.

- [ ] Validar que no hay fuga de datos sensibles.
  - Verificacion: usuario comun no puede leer otros perfiles, auditoria ni campos administrativos.

## Fase 4 — Autenticacion

- [ ] Confirmar principio de implementacion: autenticacion ≠ identidad.
  - Verificacion: login correcto no cambia `validado_manualmente`, `tipo_miembro`, `estado` ni derechos politicos.

- [ ] Implementar helper `dniToAuthEmail`.
  - Regla: `dni-<dni>@liberalespe.example.com`.
  - Verificacion: `12345678` produce `dni-12345678@liberalespe.example.com`.

- [ ] Centralizar validacion de DNI.
  - Regla: 8 digitos numericos.
  - Verificacion: entradas invalidas no avanzan.

- [ ] Implementar registro con DNI + contrasena.
  - Verificacion: se crea usuario en Supabase Auth.

- [ ] Crear perfil despues del registro Auth.
  - Verificacion: existe fila en `perfiles` con `user_id = auth.users.id`.

- [ ] Definir mecanismo explicito de creacion de perfil.
  - Opcion v1 recomendada: insertar perfil manualmente durante registro.
  - Alternativa: trigger controlado al insertar en `auth.users`.
  - Verificacion: login sin perfil valido no se considera flujo correcto.

- [ ] Asignar defaults de perfil.
  - Valores:
    - `rol_sistema = usuario`.
    - `tipo_miembro = adherente`.
    - `estado = activo`.
    - `validado_manualmente = false`.
  - Verificacion: usuario nuevo queda sin validacion manual.

- [ ] Manejar DNI duplicado con mensaje neutral.
  - Mensaje: "No se pudo completar el registro. Si ya tienes una cuenta o necesitas recuperar acceso, solicita revision manual."
  - Verificacion: no revela si el DNI existe.

- [ ] Implementar login con DNI + contrasena.
  - Verificacion: login usa `dniToAuthEmail`.

- [ ] Cargar perfil despues del login.
  - Verificacion: RLS solo devuelve perfil permitido.

- [ ] Bloquear uso de email real en UI.
  - Verificacion: no hay campo email en registro/login.

- [x] Definir recuperacion manual de acceso.
  - Verificacion: no existe flujo automatico por email, magic link o SMS.

## Fase 5 — Integracion DNI

- [ ] Confirmar prerequisito: registro basico funciona sin servicio DNI.
  - Verificacion: se puede crear cuenta y perfil ingresando nombres manualmente.

- [ ] Confirmar prerequisito: base de datos validada contra `arquitectura.md`.
  - Verificacion: tablas, constraints, indices, RLS y defaults coinciden con el documento.

- [ ] Confirmar que la integracion DNI no inicia antes de cumplir prerequisitos.
  - Verificacion: no hay llamada al servicio DNI en el flujo obligatorio antes del registro manual funcional.

- [ ] Crear cliente centralizado del servicio DNI.
  - Verificacion: todas las llamadas usan el mismo modulo.

- [ ] Usar endpoint canonico.
  - Endpoint: `POST https://busqueda-dni.onrender.com/api/buscar-dni`.
  - Verificacion: no hay endpoint alternativo.

- [ ] Implementar timeout de 2 a 3 segundos.
  - Verificacion: una respuesta lenta activa fallback manual.

- [ ] Mostrar estado de carga.
  - Verificacion: usuario ve que la consulta esta en curso.

- [ ] Tolerar cold start de Render.
  - Verificacion: no se marca error antes del timeout definido.

- [ ] Implementar retry controlado.
  - Verificacion: no hay bucles agresivos.

- [ ] Implementar fallback manual por error.
  - Verificacion: si falla la request, usuario puede escribir nombres.

- [ ] Implementar fallback manual por timeout.
  - Verificacion: timeout permite continuar manualmente.

- [ ] Implementar fallback manual por respuesta degradada.
  - Verificacion: `ok=false` permite continuar manualmente.

- [ ] Implementar manejo de HTTP 429.
  - Verificacion: 429 no bloquea registro y activa fallback.

- [ ] Confirmar que el servicio DNI no valida identidad.
  - Verificacion: ningun campo de validacion manual cambia por respuesta DNI.

## Fase 6 — Frontend base

- [ ] Validar modelo de datos contra `arquitectura.md` antes de implementar UI.
  - Verificacion: enums, tablas, relaciones, constraints, indices, RLS y defaults fueron revisados.

- [ ] Crear formulario de registro.
  - Campos: DNI, nombres, telefono, contrasena.
  - Verificacion: formulario permite flujo completo.

- [ ] Crear formulario de login.
  - Campos: DNI, contrasena.
  - Verificacion: login no pide email.

- [ ] Validar inputs de registro.
  - Verificacion: DNI invalido, telefono invalido o contrasena vacia no avanzan.

- [ ] Conectar formulario de registro a Supabase Auth.
  - Verificacion: usuario Auth se crea.

- [ ] Conectar creacion de perfil a Supabase DB.
  - Verificacion: perfil se crea con defaults correctos.

- [ ] Conectar formulario de login a Supabase Auth.
  - Verificacion: sesion inicia correctamente.

- [ ] Crear vista de perfil propio.
  - Verificacion: usuario ve sus datos permitidos.

- [ ] Manejar errores publicos neutrales.
  - Verificacion: errores no exponen estados internos ni detalles de RLS/Auth.

- [x] Implementar PWA base.
  - Verificacion: build genera assets PWA.

## Fase 7 — Panel minimo

- [ ] Crear ruta protegida de panel.
  - Verificacion: usuario comun sin rol no accede a funciones administrativas.

- [ ] Restringir acceso del panel a `administrador` y `fundador`.
  - Verificacion: RLS/RPC bloquea acceso operativo a usuarios con `rol_sistema = usuario`.

- [ ] Validar permisos del panel mediante RLS, no por frontend.
  - Verificacion: ocultar botones no es el control principal; llamadas no autorizadas fallan en DB/RPC.

- [ ] Crear listado paginado de usuarios.
  - Verificacion: listado usa limite por pagina.

- [ ] Implementar busqueda por DNI.
  - Verificacion: consulta se ejecuta en base de datos.

- [ ] Implementar filtros basicos.
  - Campos: `estado`, `tipo_miembro`, `rol_sistema`, `validado_manualmente`.
  - Verificacion: filtros no cargan padron completo.

- [x] Implementar vista de detalle de usuario.
  - Verificacion: muestra estado, tipo, rol y validacion manual segun permisos.

- [x] Crear bandeja de solicitudes de afiliacion.
  - Verificacion: administrador/fundador ve solicitudes pendientes.

- [x] Implementar RPC `aprobar_afiliacion`.
  - Verificacion: solicitud pasa a aprobada y usuario queda `afiliado`.

- [x] Confirmar que aprobar afiliacion no usa update directo desde frontend.
  - Verificacion: el cambio ocurre mediante RPC o mecanismo controlado en DB.

- [x] Implementar RPC `rechazar_afiliacion`.
  - Verificacion: solicitud pasa a rechazada con comentario.

- [x] Implementar RPC `anular_usuario`.
  - Verificacion: usuario pasa a `estado = anulado`.

- [x] Confirmar que anular cuenta no usa update directo desde frontend.
  - Verificacion: el cambio ocurre mediante RPC o mecanismo controlado en DB.

- [x] Bloquear acciones administrativas no permitidas.
  - Verificacion: usuario comun no puede ejecutar RPC administrativas.

- [x] Evitar carga completa de usuarios.
  - Verificacion: no existe query sin limite en listados.

## Fase 8 — Auditoria

- [x] Insertar auditoria al validar usuario.
  - Verificacion: `audit_log` registra actor, sujeto, accion y cambios.

- [x] Insertar auditoria al aprobar afiliacion.
  - Verificacion: `audit_log` registra cambio a `afiliado`.

- [x] Insertar auditoria al rechazar afiliacion.
  - Verificacion: `audit_log` registra decision y comentario.

- [x] Insertar auditoria al anular cuenta.
  - Verificacion: `audit_log` registra cambio de estado.

- [x] Insertar auditoria al aprobar desafiliacion.
  - Verificacion: `audit_log` registra cambio a `desafiliado`.

- [x] Insertar auditoria al cambiar rol.
  - Verificacion: `audit_log` registra rol anterior y nuevo.

- [x] Insertar auditoria al resetear contrasena manualmente.
  - Verificacion: `audit_log` registra operador, sujeto y motivo.

- [x] Crear vista administrativa de auditoria por usuario.
  - Verificacion: administrador/fundador puede revisar trazabilidad.

- [x] Bloquear lectura de auditoria para usuario comun.
  - Verificacion: usuario comun no puede consultar `audit_log`.

- [ ] Validar trazabilidad end-to-end.
  - Verificacion: toda accion critica deja registro completo.

## Cierre de implementacion

- [ ] Ejecutar pruebas manuales de RLS.
  - Verificacion: usuario comun, administrador y fundador tienen permisos correctos.

- [ ] Ejecutar prueba de registro con servicio DNI activo.
  - Verificacion: autocompleta nombre y permite crear cuenta.

- [ ] Ejecutar prueba de registro con servicio DNI fallando.
  - Verificacion: fallback manual permite crear cuenta.

- [ ] Ejecutar prueba de DNI duplicado.
  - Verificacion: mensaje neutral y sin exposicion de estado interno.

- [ ] Ejecutar prueba de panel minimo.
  - Verificacion: listar, aprobar afiliacion y anular cuenta funcionan con auditoria.

- [ ] Configurar deploy en Cloudflare Pages.
  - Verificacion: variables de entorno existen en produccion.

- [ ] Validar build final.
  - Verificacion: build frontend finaliza sin errores.

## Fase 9 — Preparacion para v3 (estructura de votaciones)

Esta fase prepara estructura futura. No habilita UI ni flujo de votacion en v1/v2.

- [x] Crear tabla `temas`.
  - Verificacion: estructura creada aunque no se use en UI.

- [x] Crear tabla `votos`.
  - Verificacion: existe relacion con `temas` y `perfiles`.

- [x] Definir constraint de voto unico.
  - Regla: un usuario no puede votar mas de una vez por tema.
  - Verificacion futura: `unique(usuario_id, tema_id)` o equivalente bloquea duplicados.
  - Nota: no implementar en la fase actual de kickoff.

- [x] Definir RLS basica para insertar votos.
  - Regla: solo usuarios con `tipo_miembro = afiliado` y `estado = activo` pueden insertar votos.
  - Verificacion: adherente, anulado y desafiliado no pueden votar.

- [x] Bloquear updates de votos emitidos.
  - Verificacion: un voto insertado no puede modificarse desde frontend.

- [x] Bloquear deletes de votos emitidos.
  - Verificacion: un voto insertado no puede borrarse desde frontend.

- [x] Registrar trazabilidad de votos.
  - Verificacion: emision de voto y cambios de estado de temas quedan auditados.

- [x] Confirmar que el frontend no decide elegibilidad de voto.
  - Verificacion: intento no autorizado falla en RLS/RPC aunque la UI sea manipulada.

- [x] NO implementar UI de votacion.
  - Verificacion: no existe pantalla de votacion en frontend.

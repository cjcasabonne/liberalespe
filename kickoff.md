# Kickoff de implementacion corregido

Este kickoff inicia ejecucion controlada sin cambiar la arquitectura base. Corrige detalles tecnicos para que Supabase Auth, `perfiles` y el esquema inicial funcionen de forma consistente en produccion.

## 1. Validacion inicial

Documentos base:

- `arquitectura.md`: fuente de verdad arquitectonica. No se modifica en este kickoff.
- `scaffolding.md`: orden de construccion.
- `instructions.md`: reglas obligatorias.
- `tasks.md`: roadmap ejecutable.

Correcciones aplicadas para ejecucion:

- `auth_email` no debe validarse con constraint SQL.
- `perfiles` debe vincularse a `auth.users` mediante `user_id`.
- Debe existir mecanismo explicito de creacion de perfil.
- `audit_log` no debe convertirse en fuga de datos sensibles.
- v3 queda preparado conceptualmente, pero no se implementa en esta fase.

## 2. Estado real del sistema

Ya existe:

- documentacion base;
- servicio DNI productivo:
  - `POST https://busqueda-dni.onrender.com/api/buscar-dni`;
  - `GET https://busqueda-dni.onrender.com/health`.

No existe aun:

- proyecto Supabase configurado para produccion;
- migraciones SQL;
- enums;
- tablas;
- RLS;
- policies;
- RPC;
- auditoria ejecutable;
- frontend;
- registro;
- login;
- panel;
- integracion DNI en frontend.

## 3. Punto de inicio

Primer bloque ejecutable:

```text
Supabase setup + DB schema
```

Motivo:

- Supabase es el backend del sistema.
- `auth.users` es la fuente de verdad para autenticacion.
- `perfiles` extiende al usuario autenticado.
- RLS depende de tablas existentes.
- Auth funcional depende de `perfiles`.
- Frontend depende de DB + RLS.
- Servicio DNI no se integra hasta que el registro manual funcione.

## 4. Correccion critica: auth_email

`auth_email` es un valor derivado.

Reglas:

- se genera durante el registro;
- se usa para crear/iniciar sesion en Supabase Auth;
- no se valida con constraint SQL;
- no es fuente de verdad;
- no debe usarse para permisos;
- no debe sustituir a `auth.users`;
- no debe duplicar logica de autenticacion en `perfiles`.

Supabase Auth gestiona el email real interno en `auth.users`. La consistencia `DNI -> email interno` se mantiene en la logica de registro mediante un helper unico, no con constraint de base de datos.

Helper canonico:

```ts
function dniToAuthEmail(dni: string) {
  return `dni-${dni}@auth.local`;
}
```

## 5. Relacion perfiles y auth.users

`perfiles` es extension de `auth.users`, no entidad de autenticacion independiente.

Estructura corregida:

```sql
create table perfiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dni text not null unique,
  nombres text not null,
  telefono text,
  rol_sistema rol_sistema not null default 'usuario',
  tipo_miembro tipo_miembro not null default 'adherente',
  estado estado_usuario not null default 'activo',
  validado_manualmente boolean not null default false,
  validado_por uuid references auth.users(id),
  validado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint perfiles_user_id_unique unique (user_id),
  constraint dni_formato check (dni ~ '^[0-9]{8}$')
);
```

Reglas:

- un registro en `auth.users` puede tener como maximo un perfil;
- `user_id` es obligatorio;
- `user_id` referencia `auth.users(id)`;
- `unique(user_id)` es obligatorio;
- `dni` sigue siendo unico;
- `auth.users` autentica;
- `perfiles` contiene datos politico-operativos.

Indice obligatorio:

```sql
create index idx_perfiles_user_id on perfiles(user_id);
```

Uso:

- lookup del perfil del usuario autenticado;
- policies RLS basadas en `auth.uid() = user_id`;
- consultas del panel y RPC que parten desde usuario autenticado.

## 6. Creacion de perfil

No se debe asumir que Supabase crea `perfiles` automaticamente.

Debe implementarse uno de estos mecanismos:

### Opcion A: creacion manual durante registro

Recomendada para v1.

Flujo:

1. generar `auth_email` desde DNI;
2. crear usuario en Supabase Auth;
3. obtener `auth.users.id`;
4. insertar fila en `perfiles` con `user_id = auth.users.id`;
5. asignar defaults operativos.

Defaults:

- `rol_sistema = usuario`;
- `tipo_miembro = adherente`;
- `estado = activo`;
- `validado_manualmente = false`.

### Opcion B: trigger al insertar en auth.users

Valida si se necesita automatizacion posterior.

Regla:

- si se usa trigger, debe recibir o resolver datos minimos requeridos sin exponer secretos ni asumir validacion de identidad.

Condicion critica:

- si no se implementa creacion manual ni trigger, el sistema falla;
- login sin perfil valido rompe flujos;
- el frontend no debe continuar si no existe perfil asociado.

## 7. Fase 1: Supabase setup

- [ ] Crear proyecto Supabase.
  - Verificacion: existe URL del proyecto y `anon key`.

- [ ] Configurar Auth con email/password.
  - Verificacion: email/password habilitado.

- [ ] Deshabilitar confirmacion obligatoria de email.
  - Verificacion: el flujo no depende de email real.

- [ ] Confirmar que magic links no forman parte del flujo.
  - Verificacion: no hay login por link.

- [ ] Confirmar que SMS OTP no forma parte del flujo.
  - Verificacion: no hay proveedor SMS ni OTP.

- [ ] Registrar variables futuras de frontend.
  - `VITE_SUPABASE_URL`.
  - `VITE_SUPABASE_ANON_KEY`.
  - `VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com`.
  - Verificacion: no se usa `service_role` en cliente.

## 8. Fase 2: DB schema

- [ ] Crear enums.
  - `rol_sistema`.
  - `tipo_miembro`.
  - `estado_usuario`.
  - `estado_solicitud`.
  - Verificacion: enums existen.

- [ ] Crear tabla `perfiles` con `user_id`.
  - Verificacion: `user_id` es `not null`, FK a `auth.users(id)` y unico.

- [ ] Crear constraint de DNI.
  - Regla: `^[0-9]{8}$`.
  - Verificacion: DNI invalido falla.

- [ ] Crear indice `idx_perfiles_user_id`.
  - Verificacion: indice existe.

- [ ] Crear indices operativos de `perfiles`.
  - `dni`.
  - `estado`.
  - `tipo_miembro`.
  - `rol_sistema`.
  - `validado_manualmente`.
  - `creado_en`.
  - Verificacion: indices existen.

- [ ] Crear tabla `solicitudes_afiliacion`.
  - Verificacion: referencia a `perfiles(id)`.

- [ ] Crear tabla `solicitudes_desafiliacion`.
  - Verificacion: referencia a `perfiles(id)`.

- [ ] Crear tabla `audit_log`.
  - Verificacion: contiene actor, sujeto, accion, tabla, registro, cambios resumidos y fecha.

- [ ] Crear indices de solicitudes y auditoria.
  - Verificacion: indices existen.

No crear constraint SQL para:

```sql
auth_email = 'dni-' || dni || '@auth.local'
```

Esa regla queda fuera de la base de datos.

## 9. audit_log seguro

`audit_log` debe permitir trazabilidad sin exponer informacion sensible completa.

Reglas:

- evitar guardar DNI completo si no es necesario;
- evitar guardar telefonos completos si no es necesario;
- no almacenar contrasenas ni tokens;
- limitar el tamano de `antes` y `despues`;
- guardar diffs o resumenes cuando sea suficiente;
- restringir lectura a administradores/fundadores;
- bloquear update/delete desde cliente;
- no convertir auditoria en copia completa de datos personales.

Campos `antes` y `despues`:

- deben contener solo lo necesario para entender el cambio;
- pueden usar masking para DNI/telefono;
- deben evitar payloads grandes o datos irrelevantes.

## 10. Checkpoint de seguridad

Antes de pasar a autenticacion:

- [ ] RLS activado en todas las tablas accesibles desde frontend.
- [ ] `perfiles` usa `user_id` para vincularse con `auth.users`.
- [ ] `unique(user_id)` existe.
- [ ] `idx_perfiles_user_id` existe.
- [ ] No existe constraint SQL sobre `auth_email`.
- [ ] `service_role` no aparece en cliente.
- [ ] `audit_log` no es legible por usuario comun.
- [ ] `audit_log` no se puede actualizar ni borrar desde cliente.
- [ ] Usuario comun no puede leer perfiles ajenos.

## 11. Condiciones para fases siguientes

Antes de autenticacion:

- DB schema aplicado.
- RLS base activado.
- Policy de perfil propio basada en `user_id = auth.uid()`.
- Mecanismo de creacion de perfil definido.

Antes de integracion DNI:

- registro basico funciona sin servicio DNI;
- creacion de usuario Auth funciona;
- creacion de perfil funciona;
- login con perfil existente funciona;
- fallback manual esta definido.

Antes de frontend:

- modelo validado contra este kickoff;
- RLS probado con usuario comun;
- no hay tablas expuestas sin RLS;
- no hay permisos implementados solo en UI.

## 12. Preparacion v3

No implementar votaciones en esta fase.

Cuando se implemente v3:

```sql
alter table votos
add constraint votos_usuario_tema_unique unique (usuario_id, tema_id);
```

Reglas:

- `temas` y `votos` no bloquean v1/v2;
- no se implementa UI de votacion ahora;
- la elegibilidad de voto se validara en RLS/RPC;
- los votos seran inmutables despues de emitidos.

## Decision de kickoff

Se ejecuta:

```text
Supabase setup -> DB schema corregido -> RLS base
```

No se ejecuta todavia:

- frontend;
- integracion DNI;
- panel;
- datos reales;
- votaciones v3.

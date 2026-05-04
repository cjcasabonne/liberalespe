# Arquitectura del sistema

## 1. Diagnostico del problema real

El sistema no es una pagina institucional ni un formulario de captacion. Es una plataforma operativa para gestionar un padron politico en Peru, con usuarios reales, datos personales, estados administrativos y decisiones internas que deben quedar trazadas.

El problema central no es mostrar informacion, sino operar un ciclo de vida politico-administrativo:

- registrar personas interesadas;
- validar manualmente datos sensibles;
- aprobar o rechazar afiliaciones;
- anular cuentas cuando corresponda;
- procesar desafiliaciones;
- habilitar derechos politicos internos, como voto, solo cuando exista aprobacion operativa.

La arquitectura debe maximizar funcionalidad con infraestructura minima. Por eso el sistema delega autenticacion, persistencia, reglas de acceso y storage transaccional a Supabase, y evita un backend CRUD tradicional. La seguridad no depende del frontend: la base de datos es el punto de control.

El servicio de busqueda por DNI es una ayuda de captura, no una autoridad. Puede fallar, cambiar de HTML, bloquearse o devolver datos incompletos. La identidad politica y administrativa solo se valida desde el panel operativo.

## 2. Arquitectura completa

### Componentes

```text
Usuario final / operador
        |
        v
React + Vite + TypeScript + PWA
Cloudflare Pages
        |
        | Supabase JS client
        v
Supabase
- Auth
- PostgreSQL
- RLS
- funciones SQL/RPC controladas
- audit logs
        ^
        |
        | solo para autocompletar nombre
        |
Servicio Node en Render
https://busqueda-dni.onrender.com/api/buscar-dni
- scraping HTML
- CSRF token
- respuesta no autoritativa
- health check: https://busqueda-dni.onrender.com/health
```

### Flujo general

1. El usuario accede a la PWA desplegada en Cloudflare Pages.
2. La autenticacion se realiza con Supabase Auth usando DNI + contrasena, mapeado internamente a email/password.
3. La aplicacion consume directamente Supabase usando el cliente oficial.
4. PostgreSQL almacena el padron, solicitudes, auditoria y configuracion operativa.
5. RLS decide que puede leer o modificar cada usuario segun su identidad y rol.
6. El servicio DNI en Render se llama solo durante registro o edicion asistida para autocompletar nombres.
7. El panel operativo ejecuta acciones criticas mediante funciones SQL/RPC o mutaciones controladas con RLS.
8. Cada accion critica genera un registro de auditoria.

### Flujo de registro actualizado

1. El usuario ingresa DNI.
2. El frontend valida formato basico: 8 digitos numericos.
3. El sistema consulta `https://busqueda-dni.onrender.com/api/buscar-dni` para intentar autocompletar nombres.
4. Si el servicio falla, el usuario debe poder continuar con captura manual obligatoria de nombres.
5. El usuario define una contrasena.
6. El usuario ingresa telefono.
7. El frontend construye la credencial interna para Supabase Auth a partir del DNI.
8. Se crea la cuenta en Supabase Auth con email interno y contrasena.
9. Se crea el perfil en `perfiles` con:
   - `dni` ingresado;
   - `nombres` autocompletados o declarados;
   - `telefono`;
   - `rol_sistema = usuario`;
   - `tipo_miembro = adherente`;
   - `estado = activo`;
   - `validado_manualmente = false`.
10. El usuario queda registrado, pero no validado como identidad legitima.

### Flujo cuando el DNI ya existe

Si el DNI ya existe en `perfiles` o el email interno ya existe en Supabase Auth, el registro debe bloquearse.

Reglas de respuesta:

- mostrar un mensaje controlado: "No se pudo completar el registro. Si ya tienes una cuenta o necesitas recuperar acceso, solicita revision manual.";
- no exponer si el DNI existe, si la cuenta esta anulada, si esta desafiliada, si esta validada o si pertenece a otro usuario;
- no indicar si fallo Supabase Auth o la insercion en `perfiles`;
- registrar el intento de duplicado si existe una tabla de eventos operativos o logs tecnicos;
- derivar el caso a recuperacion manual desde panel operativo.

El objetivo es evitar enumeracion de DNIs y proteger estados internos del padron. La unicidad real se aplica en base de datos con `unique(dni)` y `unique(auth_email)`.

### Flujo de login actualizado

1. El usuario ingresa DNI.
2. El usuario ingresa contrasena.
3. El frontend valida formato basico del DNI.
4. El frontend convierte el DNI al email interno esperado por Supabase Auth.
5. Se ejecuta login con Supabase Auth usando email interno + contrasena.
6. Despues del login, RLS determina que datos puede leer o modificar.
7. El panel y las funciones administrativas consideran `rol_sistema`, `tipo_miembro`, `estado` y `validado_manualmente`; no consideran el login como validacion de identidad.

### Recuperacion de acceso

No existe recuperacion automatica por email, magic link ni SMS OTP.

Proceso operativo:

1. El usuario solicita recuperacion indicando DNI y telefono de contacto.
2. El operador busca el DNI desde el panel, usando permisos administrativos.
3. El operador aplica el procedimiento interno de verificacion definido por el partido.
4. Si procede, el operador ejecuta reseteo administrativo de contrasena.
5. El sistema registra auditoria del reseteo:
   - operador;
   - usuario afectado;
   - fecha;
   - motivo;
   - metodo de verificacion usado;
   - resultado.
6. El usuario define o recibe una contrasena temporal segun el procedimiento operativo.

Trade-off: este enfoque aumenta carga manual de soporte, pero elimina dependencia de canales pagos o limitados. Es consistente con el principio central: autenticacion no equivale a validacion de identidad, y los casos sensibles se resuelven desde el panel.

## 3. Decisiones y trade-offs

### Sin backend CRUD tradicional

Decision: no usar NestJS, Express CRUD, Laravel, Django ni otro backend generalista para operaciones basicas.

Motivo: Supabase ya provee autenticacion, base de datos, politicas de acceso y API. Agregar un backend completo duplicaria reglas, costo y superficie de mantenimiento.

Trade-off: la complejidad se traslada al diseno de esquema, RLS, funciones SQL y migraciones. Esto exige disciplina en la base de datos.

### Seguridad en base de datos

Decision: toda regla sensible vive en PostgreSQL mediante RLS, constraints, triggers y funciones `security definer` cuando sea necesario.

Motivo: el frontend no es confiable. Cualquier usuario puede inspeccionar llamadas o modificar requests.

Trade-off: requiere pruebas explicitas de permisos y una separacion clara entre tablas publicas, privadas y operativas.

### Servicio DNI como dependencia debil

Decision: mantener el servicio Node en Render solo para `https://busqueda-dni.onrender.com/api/buscar-dni`.

Motivo: scraping es fragil y no debe contaminar la arquitectura principal. El servicio DNI es punto unico de fallo solo para autocompletado, no para registro, autenticacion, validacion manual ni operacion del padron.

Trade-off: la experiencia de registro puede degradarse si falla el scraping o si Render tiene cold start, pero el sistema sigue funcionando porque el usuario puede ingresar datos manualmente y la validacion real es posterior.

### Cloud low-cost

Decision: Cloudflare Pages + Supabase + Render.

Motivo: reduce operacion, servidores, backups manuales, monitoreo de infraestructura y costos fijos.

Trade-off: se depende de proveedores externos. La portabilidad debe cuidarse manteniendo datos en PostgreSQL estandar y evitando logica critica en servicios propietarios cuando no sea necesario.

### Autenticacion DNI + contrasena

Decision: autenticar con DNI + contrasena, usando Supabase Auth como motor real de sesiones.

Motivo: el sistema debe operar con costo cero y no puede depender de verificacion de email, magic links ni SMS OTP. En este contexto, DNI + contrasena es el mecanismo mas predecible, barato y operable.

No se usa verificacion de email porque:

- introduce dependencia de entregabilidad;
- puede estar limitada por cuota del proveedor;
- obliga al usuario a tener correo funcional;
- no valida identidad politica ni titularidad real del DNI.

No se usan magic links porque:

- dependen del envio de email;
- tienen limites operativos y de proveedor;
- pueden fallar por spam, bloqueo o expiracion;
- no resuelven la validacion manual requerida.

No se usa SMS OTP porque:

- tiene costo variable;
- requiere proveedor externo;
- agrega complejidad de soporte;
- tampoco prueba por si solo que el DNI pertenezca a la persona.

Trade-off: una persona podria registrar un DNI que no le pertenece si conoce el numero. Ese riesgo no se resuelve con autenticacion; se mitiga con validacion manual, estados, auditoria y bloqueo de derechos politicos hasta aprobacion operativa.

## 4. Configuracion critica

### Frontend

Variables requeridas en Cloudflare Pages:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_DNI_SERVICE_URL=https://busqueda-dni.onrender.com
```

Reglas:

- `VITE_SUPABASE_ANON_KEY` puede estar en frontend, pero debe estar protegida por RLS.
- Nunca exponer `service_role` en Cloudflare Pages.
- Nunca guardar secretos administrativos en la PWA.
- Configurar dominios permitidos en Supabase Auth.
- Configurar redirect URLs para produccion y ambientes de preview.

URLs recomendadas:

```text
Produccion frontend:
https://app.<dominio-politico>.pe

Supabase:
https://<project-ref>.supabase.co

Servicio DNI:
https://busqueda-dni.onrender.com/api/buscar-dni

Health check DNI:
https://busqueda-dni.onrender.com/health
```

### Supabase Auth

Configuracion base:

- email/password habilitado;
- confirmacion de email deshabilitada;
- magic links deshabilitados para el flujo principal;
- SMS OTP no utilizado;
- redirect URLs cerradas;
- JWT con claims minimos;
- roles del sistema resueltos desde tabla propia, no desde metadata editable por usuario.

La identidad politica no se infiere por Auth. Supabase Auth solo responde: "esta sesion pertenece a una cuenta que conoce la contrasena asociada a este identificador interno".

### Mapeo DNI a credencial Supabase

Supabase Auth se mantiene como proveedor de sesion. Como Supabase Auth opera naturalmente con email/password, el DNI se transforma en un email interno deterministico:

```text
dni: 12345678
email interno: dni-12345678@liberalespe.example.com
```

Reglas:

- el usuario nunca necesita conocer ni escribir el email interno;
- la UI muestra "DNI" y "contrasena";
- el email interno no debe usarse para comunicaciones;
- el dominio interno debe ser reservado para autenticacion tecnica;
- el mismo DNI siempre produce la misma credencial interna;
- el DNI sigue almacenado explicitamente en `perfiles.dni` como dato operativo;
- `perfiles.dni` debe ser unico.

La transformacion puede vivir en un helper del frontend porque no es un secreto ni una regla de autorizacion. Lo que no debe exponerse en frontend es la logica sensible: roles, estados, aprobaciones, validaciones manuales, cambios de membresia y auditoria. Todo eso permanece en RLS, constraints y funciones SQL.

Ejemplo conceptual:

```ts
function dniToAuthEmail(dni: string) {
  return `dni-${dni}@liberalespe.example.com`;
}
```

Validaciones minimas antes de autenticar:

- DNI con formato `^[0-9]{8}$`;
- contrasena con longitud minima;
- no registrar dos perfiles con el mismo DNI;
- no permitir que el frontend asigne `rol_sistema`, `tipo_miembro`, `estado` ni `validado_manualmente`.

El uso de email interno no convierte al email en dato de identidad. Es solo una adaptacion tecnica para aprovechar Supabase Auth sin pagar ni depender de canales externos.

### Recuperacion y reseteo de contrasena

La recuperacion automatica queda deshabilitada para el flujo principal. No se deben ofrecer pantallas de "olvide mi contrasena" que dependan de email, magic links o SMS OTP.

El reseteo debe ser administrativo y auditado. En terminos operativos, el panel debe permitir registrar la solicitud y el resultado; la ejecucion del cambio de contrasena puede hacerse con las herramientas administrativas de Supabase por operadores autorizados o mediante una funcion controlada si el proyecto incorpora una capacidad segura para ello sin agregar backend general.

Reglas:

- no resetear contrasenas solo porque alguien conoce un DNI;
- no mostrar si el DNI existe durante la solicitud publica;
- exigir motivo del reseteo;
- auditar la accion;
- limitar esta capacidad a administradores/fundadores segun politica interna;
- revisar periodicamente los reseteos como evento sensible.

## 5. Modelo de datos con ownership claro

### Principios

- `auth.users` pertenece a Supabase Auth.
- El perfil politico-administrativo vive en tablas propias.
- El DNI no valida identidad por si mismo.
- `rol_sistema`, `tipo_miembro` y `estado` son dimensiones separadas.
- Toda transicion critica debe quedar auditada.

### Enumeraciones

```sql
create type rol_sistema as enum ('usuario', 'administrador', 'fundador');
create type tipo_miembro as enum ('adherente', 'afiliado');
create type estado_usuario as enum ('activo', 'anulado', 'desafiliado');
create type estado_solicitud as enum ('pendiente', 'aprobada', 'rechazada', 'cancelada');
```

### Tabla `perfiles`

Ownership: datos principales del usuario dentro del sistema politico.

```sql
create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  dni text not null unique,
  auth_email text not null unique,
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
  constraint dni_formato check (dni ~ '^[0-9]{8}$'),
  constraint auth_email_formato check (auth_email = 'dni-' || dni || '@liberalespe.example.com')
);
```

Reglas:

- `rol_sistema` controla permisos internos.
- `tipo_miembro` controla derechos politicos internos.
- `estado` controla vigencia de la cuenta.
- `validado_manualmente` indica revision operativa, no resultado del servicio DNI.
- `auth_email` permite auditar el mapeo tecnico usado por Supabase Auth, pero no debe mostrarse como dato de contacto.

### Tabla `solicitudes_afiliacion`

Ownership: ciclo de solicitud para pasar de adherente a afiliado.

```sql
create table solicitudes_afiliacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfiles(id),
  estado estado_solicitud not null default 'pendiente',
  comentario_usuario text,
  comentario_operador text,
  revisado_por uuid references auth.users(id),
  revisado_en timestamptz,
  creado_en timestamptz not null default now()
);
```

Reglas:

- Un usuario activo puede crear una solicitud.
- Solo administradores o fundadores pueden aprobar o rechazar.
- Al aprobar, el sistema cambia `tipo_miembro` a `afiliado`.
- La aprobacion no debe hacerse desde frontend sin control de RLS/RPC.

### Tabla `solicitudes_desafiliacion`

Ownership: solicitud formal de salida.

```sql
create table solicitudes_desafiliacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfiles(id),
  estado estado_solicitud not null default 'pendiente',
  motivo text,
  revisado_por uuid references auth.users(id),
  revisado_en timestamptz,
  creado_en timestamptz not null default now()
);
```

Al aprobarse, el perfil pasa a:

```text
estado = desafiliado
tipo_miembro = adherente
```

La desafiliacion no debe borrar historial.

### Tabla `audit_log`

Ownership: trazabilidad inmutable de acciones criticas.

```sql
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  sujeto_id uuid references auth.users(id),
  accion text not null,
  tabla text not null,
  registro_id uuid,
  antes jsonb,
  despues jsonb,
  creado_en timestamptz not null default now(),
  ip text,
  user_agent text
);
```

Reglas:

- Los usuarios comunes no pueden leer auditoria.
- Administradores pueden leer auditoria operativa.
- Nadie debe actualizar o borrar auditoria desde el cliente.
- Si se requiere borrado legal de datos personales, preservar eventos con seudonimizacion cuando aplique.

### Indices criticos

Los indices deben cubrir busquedas operativas, bandejas de revision y filtros frecuentes. No se debe cargar el padron completo para filtrar en frontend.

```sql
create index perfiles_dni_idx on perfiles (dni);
create index perfiles_estado_idx on perfiles (estado);
create index perfiles_tipo_miembro_idx on perfiles (tipo_miembro);
create index perfiles_rol_sistema_idx on perfiles (rol_sistema);
create index perfiles_validado_idx on perfiles (validado_manualmente);
create index perfiles_creado_en_idx on perfiles (creado_en desc);
create index perfiles_busqueda_nombre_idx on perfiles using gin (to_tsvector('spanish', nombres));

create index solicitudes_afiliacion_estado_idx on solicitudes_afiliacion (estado);
create index solicitudes_afiliacion_usuario_idx on solicitudes_afiliacion (usuario_id);
create index solicitudes_afiliacion_creado_en_idx on solicitudes_afiliacion (creado_en desc);

create index solicitudes_desafiliacion_estado_idx on solicitudes_desafiliacion (estado);
create index solicitudes_desafiliacion_usuario_idx on solicitudes_desafiliacion (usuario_id);
create index solicitudes_desafiliacion_creado_en_idx on solicitudes_desafiliacion (creado_en desc);

create index audit_log_actor_idx on audit_log (actor_id);
create index audit_log_sujeto_idx on audit_log (sujeto_id);
create index audit_log_creado_en_idx on audit_log (creado_en desc);
create index audit_log_accion_idx on audit_log (accion);
```

Los indices `unique` de `dni` y `auth_email` ya quedan cubiertos por las restricciones `unique` de la tabla `perfiles`.

## 6. Seguridad basada en RLS

### Funciones auxiliares

```sql
create function public.es_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from perfiles
    where id = auth.uid()
      and rol_sistema in ('administrador', 'fundador')
      and estado = 'activo'
  );
$$;

create function public.es_fundador()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from perfiles
    where id = auth.uid()
      and rol_sistema = 'fundador'
      and estado = 'activo'
  );
$$;
```

### Politicas esperadas

`perfiles`:

- el usuario puede leer su propio perfil;
- el usuario puede actualizar campos permitidos de su propio perfil, como telefono;
- el usuario no puede cambiar su `rol_sistema`, `tipo_miembro`, `estado` ni `validado_manualmente`;
- administradores y fundadores pueden revisar perfiles;
- solo fundadores pueden asignar o quitar rol de administrador;
- ningun usuario puede autoelevar privilegios.

Visibilidad del DNI:

- el usuario puede ver su propio DNI;
- administradores y fundadores pueden ver DNI completo cuando sea necesario para operacion;
- vistas de listado pueden mostrar DNI completo solo a roles autorizados;
- para operadores con permisos reducidos o vistas no criticas, usar masking opcional, por ejemplo `****5678`;
- exportaciones con DNI completo deben estar restringidas, justificadas y auditadas;
- no exponer DNI completo en logs de frontend, analytics o errores publicos.

`solicitudes_afiliacion`:

- el usuario puede crear y leer sus propias solicitudes;
- administradores y fundadores pueden leer solicitudes pendientes;
- administradores y fundadores pueden aprobar o rechazar mediante funcion controlada.

`solicitudes_desafiliacion`:

- el usuario puede crear su solicitud;
- administradores y fundadores pueden procesarla;
- el cambio de estado debe auditarse.

`audit_log`:

- insert solo por funciones controladas o triggers;
- read solo para administradores/fundadores;
- update/delete bloqueados.

### RPC para acciones criticas

Las acciones administrativas deben centralizarse en funciones transaccionales:

- `aprobar_afiliacion(solicitud_id)`;
- `rechazar_afiliacion(solicitud_id, comentario)`;
- `anular_usuario(usuario_id, motivo)`;
- `aprobar_desafiliacion(solicitud_id)`;
- `validar_usuario(usuario_id, observacion)`;
- `cambiar_rol_sistema(usuario_id, nuevo_rol)`.

Cada funcion debe:

1. validar que `auth.uid()` tenga permiso;
2. bloquear estados invalidos;
3. actualizar los registros necesarios;
4. insertar en `audit_log`;
5. ejecutar todo en una transaccion.

## 7. Integracion con servicio DNI

### Contrato

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

Response exitosa:

```json
{
  "ok": true,
  "dni": "12345678",
  "nombres": "NOMBRE APELLIDO"
}
```

Response degradada:

```json
{
  "ok": false,
  "error": "No se pudo consultar el DNI"
}
```

### Reglas de uso

- El servicio solo autocompleta nombres.
- No crea usuarios.
- No valida identidad.
- No cambia `validado_manualmente`.
- No cambia `tipo_miembro`.
- No decide afiliacion.
- Su falla no debe bloquear por completo el registro.
- El fallback manual de nombres es obligatorio.
- El health check operativo es `GET https://busqueda-dni.onrender.com/health`.

### Manejo de fragilidad

El frontend debe:

- aplicar timeout de 12 segundos para tolerar cold start de Render;
- mostrar captura manual obligatoria si falla, demora demasiado o responde degradado;
- activar fallback manual cuando haya error, timeout o respuesta degradada;
- mostrar estado de carga mientras espera respuesta;
- tolerar cold start de Render: el primer request puede tardar varios segundos y no debe tratarse como error inmediato antes del timeout definido;
- permitir un retry controlado, sin bucles automaticos agresivos;
- evitar reintentos agresivos;
- limitar llamadas por DNI;
- no asumir que el nombre devuelto es correcto.

El servicio Node debe:

- validar formato de DNI;
- limitar frecuencia por IP;
- aplicar rate limiting real en servidor, no solo en frontend;
- responder `429 Too Many Requests` cuando se exceda el limite;
- proteger contra abuso automatizado y scraping inverso del propio servicio;
- usar ventanas cortas por IP y, si es posible, por DNI consultado;
- degradar con error controlado sin revelar detalles del scraping;
- manejar cambios de CSRF/token;
- devolver errores claros;
- registrar errores tecnicos suficientes para diagnostico;
- evitar guardar DNI completo en logs cuando no sea necesario;
- no exponer datos personales en logs publicos;
- permitir diagnostico sin comprometer privacidad;
- no almacenar datos salvo logs tecnicos minimos y cache operativo;
- evitar exponer HTML crudo del origen.
- exponer `GET /health` para monitoreo simple desde Render o revisiones manuales.
- cachear respuestas por DNI con TTL corto para reducir scraping repetido y mejorar disponibilidad.

### Cache por DNI

Se recomienda cache por DNI en el servicio Node de Render.

Reglas:

- cachear solo respuestas exitosas y normalizadas;
- usar TTL corto, por ejemplo 24 horas o menos segun criterio operativo;
- no tratar el cache como fuente de verdad;
- invalidar o ignorar cache si hay sospecha de dato incorrecto;
- no almacenar mas datos que DNI consultado, nombre devuelto, timestamp y estado tecnico;
- proteger logs para no exponer DNI completo innecesariamente.

El cache reduce llamadas repetidas al origen scrapeado, baja latencia y disminuye bloqueos por exceso de consultas. No cambia el principio de validacion: el dato sigue siendo solo autocompletado.

## 8. Panel operativo

El panel es el nucleo del sistema. No es una pantalla decorativa de administracion.

### Vistas principales

#### Bandeja de validacion

Objetivo: revisar usuarios registrados y confirmar datos.

Debe mostrar:

- DNI;
- nombres declarados/autocompletados;
- telefono;
- fecha de registro;
- estado de validacion;
- historial de cambios;
- acciones disponibles.

Acciones:

- validar usuario;
- marcar observacion;
- anular cuenta;
- editar datos permitidos bajo auditoria.

#### Bandeja de afiliacion

Objetivo: procesar solicitudes para convertir adherentes en afiliados.

Debe mostrar:

- usuario solicitante;
- estado actual;
- fecha de solicitud;
- datos de contacto;
- validacion manual;
- historial previo.

Acciones:

- aprobar afiliacion;
- rechazar con comentario;
- dejar pendiente;
- ver auditoria del usuario.

#### Bandeja de desafiliacion

Objetivo: procesar salidas.

Acciones:

- aprobar desafiliacion;
- rechazar si corresponde por procedimiento interno;
- registrar motivo y operador.

#### Gestion de usuarios

Objetivo: operar el padron.

Filtros minimos:

- DNI;
- nombres;
- telefono;
- rol_sistema;
- tipo_miembro;
- estado;
- validacion manual;
- fecha de registro.

Reglas de carga:

- paginacion obligatoria en todas las bandejas y listados;
- busqueda por DNI como camino principal de soporte;
- filtros ejecutados en base de datos, no en memoria del navegador;
- limites explicitos por pagina, por ejemplo 25, 50 o 100 registros;
- ordenamiento estable por `creado_en` o prioridad operativa;
- no cargar el padron completo;
- no permitir exportaciones masivas sin permiso, justificacion y auditoria.

Acciones:

- ver perfil;
- revisar historial;
- anular;
- cambiar rol segun permisos;
- corregir datos auditados.
- contactar por correo o WhatsApp cuando la base entregue datos de contacto al fundador.

### Reglas operativas

- Un administrador no debe poder convertirse a si mismo en fundador.
- Un administrador no debe poder degradar a un fundador.
- Acciones de alto riesgo deben requerir confirmacion explicita.
- Cambios masivos deben evitarse en v1 salvo que existan controles y auditoria robusta.
- El panel debe priorizar busqueda, filtros y resolucion de pendientes.

### Acciones de contacto

El contacto operativo es una comodidad de UI, no una regla de autorizacion. El frontend solo renderiza los datos que recibe desde Supabase bajo RLS/policies existentes.

Reglas:

- no usar Gmail web;
- no usar `window.open`;
- no usar APIs externas para enviar mensajes;
- correo mediante `mailto:`;
- WhatsApp mediante `https://wa.me/<telefono>?text=<mensaje>`;
- telefono normalizado a Peru con prefijo `51`;
- visibilidad basada en la misma condicion de fundador que ya protege datos sensibles en UI.

### Castellano y codificacion de textos

La interfaz debe mostrarse en castellano correcto, con tildes, `ñ` y signos de apertura donde correspondan.

Reglas:

- `index.html` debe mantener `UTF-8`;
- JSX puede usar caracteres Unicode reales directamente;
- strings TypeScript deben usar caracteres reales, no entidades como `&iacute;`, porque React renderizaria la entidad como texto literal;
- no cambiar nombres tecnicos de tablas, columnas, enums ni RPC para corregir textos visibles;
- cuando se muestre auditoria o nombres tecnicos al operador, traducirlos solo en la capa visual.

## 9. Trazabilidad

Toda accion critica debe registrar:

- quien ejecuta: `actor_id`;
- sobre quien actua: `sujeto_id`;
- cuando: `creado_en`;
- que cambio: `antes` y `despues`;
- que accion fue: `accion`;
- donde ocurrio: `tabla` y `registro_id`;
- contexto tecnico razonable: IP y user agent cuando este disponible.

Acciones criticas:

- validacion manual;
- aprobacion de afiliacion;
- rechazo de afiliacion;
- solicitud y aprobacion de desafiliacion;
- anulacion de cuenta;
- cambio de rol_sistema;
- cambio de tipo_miembro;
- cambio de estado;
- correccion de DNI, nombres o telefono;
- acceso administrativo a perfiles sensibles si se decide auditar lectura.

La auditoria debe ser append-only. Si un dato se corrige, se registra la correccion; no se borra la historia operativa.

## 10. Riesgos reales

### Scraping DNI

Riesgo: el origen cambia HTML, CSRF, rate limits o bloquea Render. Ademas, `https://busqueda-dni.onrender.com/api/buscar-dni` es un punto unico de fallo solo para el autocompletado de nombres.

Mitigacion:

- tratarlo como dependencia debil;
- fallback manual obligatorio para nombres ante error, timeout o respuesta degradada;
- nunca bloquear registro por falla del servicio DNI;
- permitir reemplazar el servicio DNI sin afectar la arquitectura principal;
- monitorear tasa de error;
- monitorear `GET https://busqueda-dni.onrender.com/health`;
- aplicar cache por DNI con TTL corto;
- no usarlo para validar identidad;
- aislarlo en un servicio pequeno reemplazable.

### Datos personales

Riesgo: DNI, telefono y afiliacion politica son datos sensibles.

Mitigacion:

- RLS estricta;
- minimo dato visible por rol;
- auditoria de cambios;
- backups controlados;
- no exportaciones abiertas;
- masking de DNI cuando no sea imprescindible mostrarlo completo;
- exportaciones restringidas a administradores/fundadores y auditadas;
- politicas internas de acceso;
- retencion definida para logs.

### Abuso de registro

Riesgo: bots o usuarios registrando DNIs ajenos.

Mitigacion:

- rate limit real en el servicio Node de Render;
- respuesta HTTP `429 Too Many Requests` ante exceso de consultas;
- controles visuales o de UX en frontend solo como ayuda, no como seguridad;
- unicidad estricta por DNI;
- validacion manual antes de otorgar derechos;
- deteccion de duplicados por DNI;
- bloqueo/anulacion auditada.

En v2 puede agregarse un rate limit global por ventana de tiempo si el volumen o abuso lo exige, manteniendo el mismo servicio Node en Render.

### Suplantacion por DNI + contrasena

Riesgo: una persona puede crear una cuenta con un DNI que no le pertenece, definir una contrasena y ocupar ese identificador dentro del sistema.

Mitigacion:

- no asumir que registro equivale a identidad validada;
- mantener `validado_manualmente = false` por defecto;
- mantener `tipo_miembro = adherente` por defecto;
- bloquear voto y derechos politicos hasta aprobacion manual;
- permitir anulacion auditada si se detecta suplantacion;
- registrar quien valida, anula o corrige datos;
- usar el panel operativo como punto real de control;
- definir procedimiento interno para reclamos por DNI ya registrado.

### Recuperacion de acceso

Riesgo: sin email verification, magic links ni SMS OTP, la recuperacion automatica de contrasena no es confiable ni gratuita.

Mitigacion:

- recuperacion manual desde panel operativo;
- verificacion interna segun procedimiento del partido;
- reseteo administrativo de contrasena usando herramientas de Supabase solo por operadores autorizados;
- auditoria obligatoria del reseteo;
- no permitir recuperacion automatica basada solo en DNI;
- mostrar mensajes publicos neutrales que no confirmen si el DNI existe.

Trade-off: el soporte manual es mas lento y requiere disciplina operativa, pero evita depender de proveedores pagos o canales limitados. Para un sistema politico con validacion manual, ese costo operativo es aceptable y coherente.

### Autoelevacion de privilegios

Riesgo: usuario modifica requests desde navegador.

Mitigacion:

- RLS;
- funciones SQL con validacion de permisos;
- campos sensibles no actualizables por usuario comun;
- pruebas de permisos.

### Operacion interna debil

Riesgo: el sistema tecnico es correcto, pero el equipo opera sin criterios claros.

Mitigacion:

- bandejas de trabajo;
- estados explicitos;
- comentarios obligatorios en rechazos/anulaciones;
- auditoria consultable;
- permisos separados por rol.

### Dependencia de proveedores

Riesgo: cambios de costo, limites o caidas en Cloudflare, Supabase o Render.

Mitigacion:

- PostgreSQL como base portable;
- exportaciones periodicas;
- migraciones versionadas;
- no acoplar logica critica al scraping;
- mantener fallback manual obligatorio si Render o el origen scrapeado fallan;
- documentar variables y dominios.

## 11. Estrategia de despliegue cloud low-cost

### Cloudflare Pages

Uso:

- hosting estatico del frontend;
- builds desde Git;
- previews por rama;
- PWA servida por HTTPS;
- cache de assets.

Pipeline:

```text
git push
  -> build Vite
  -> deploy preview
  -> validacion
  -> merge a main
  -> deploy produccion
```

El deploy tambien puede dispararse por hook de Cloudflare Pages cuando exista `CLOUDFLARE_DEPLOY_HOOK_URL` en el entorno local o de CI. El hook real no debe versionarse.

### Supabase

Uso:

- Auth;
- PostgreSQL;
- RLS;
- funciones SQL;
- migraciones;
- backups segun plan.

Practicas:

- migraciones versionadas;
- ambientes separados para staging y produccion si el presupuesto lo permite;
- pruebas de RLS antes de releases sensibles;
- backups exportables;
- no operar cambios manuales sin registro.

### Render

Uso:

- servicio Node minimo para scraping DNI;
- endpoint productivo `https://busqueda-dni.onrender.com/api/buscar-dni`;
- health check `https://busqueda-dni.onrender.com/health`;
- logs tecnicos;
- variables de entorno del scraping.

Practicas:

- servicio stateless;
- timeout bajo;
- rate limiting obligatorio en el propio servicio;
- respuesta `429` para exceso de consultas;
- cache por DNI con TTL corto para respuestas exitosas;
- considerar cold start: el primer request puede tardar varios segundos;
- logs tecnicos de errores sin DNI completo cuando sea posible;
- no exponer datos personales en logs publicos;
- health check en `/health`;
- deploy independiente;
- monitoreo basico de errores.

### Separacion recomendada por ambientes

```text
Desarrollo local:
- Vite local
- Supabase project dev o local si aplica
- Render dev opcional

Staging:
- Cloudflare Pages preview
- Supabase staging
- Render staging

Produccion:
- Cloudflare Pages production
- Supabase production
- Render production
```

Si el costo impide staging completo, como minimo se debe tener:

- rama de preview en Cloudflare;
- migraciones revisadas;
- base de produccion con backups;
- pruebas manuales de RLS antes de aplicar cambios.

## 12. Fases de evolucion

### v1: Operacion segura del padron

Objetivo: sistema productivo con flujo completo y bajo costo.

Incluye:

- registro con DNI y autocompletado debil;
- login con DNI + contrasena mediante Supabase Auth;
- perfil de usuario;
- `rol_sistema`, `tipo_miembro` y `estado` separados;
- panel operativo;
- validacion manual;
- solicitud y aprobacion de afiliacion;
- solicitud y procesamiento de desafiliacion;
- RLS estricta;
- auditoria de acciones criticas;
- despliegue en Cloudflare Pages, Supabase y Render.

No incluye:

- backend CRUD;
- microservicios;
- automatizacion de identidad;
- votacion compleja si aun no existe padron validado.

### v2: Robustez operativa y control

Objetivo: reducir errores humanos y mejorar supervision.

Incluye:

- dashboards operativos;
- metricas de pendientes;
- filtros avanzados;
- exportaciones controladas;
- motivos normalizados para anulaciones y rechazos;
- alertas por actividad sospechosa;
- pruebas automatizadas de RLS;
- bitacora mejorada con IP/user agent;
- colas internas de revision si el volumen crece.

Posibles mejoras:

- Edge Functions solo para operaciones que realmente no encajen en SQL;
- verificacion operativa adicional de telefono si el proceso interno lo requiere;
- rate limiting mas formal para registro y DNI.

#### Alertas operativas v2

Las alertas deben orientar supervision, no bloquear automaticamente operaciones. Cualquier bloqueo real debe vivir en RLS, constraints o RPC.

Umbrales iniciales recomendados:

- validaciones pendientes: alerta si hay mas de 20 usuarios pendientes;
- solicitudes de recuperacion: alerta si hay mas de 5 pendientes;
- solicitudes de afiliacion o desafiliacion: alerta si una bandeja supera 10 pendientes;
- cambios de rol: cualquier cambio de rol debe revisarse en auditoria reciente;
- anulaciones: alerta si hay 3 o mas anulaciones en una misma jornada;
- rechazos: alerta si se acumulan 5 o mas rechazos de afiliacion/desafiliacion en una jornada.

Reglas:

- las alertas son informativas en v2;
- no deben enviar datos sensibles a servicios externos;
- no deben reemplazar confirmaciones ni auditoria;
- deben poder calcularse desde datos ya disponibles para administradores/fundador.

#### Bitacora extendida v2

La bitacora actual registra actor, sujeto, accion, tabla, registro y cambios. En v2 puede extenderse con contexto de request si aporta trazabilidad sin exponer datos excesivos.

Decision inicial:

- no agregar IP/user agent a la UI publica;
- evaluar guardar contexto tecnico solo en `audit_log.despues` o en una tabla separada `audit_context`;
- preferir tabla separada si el contexto crece o requiere politicas de retencion distintas;
- no enviar IP/user agent a servicios externos;
- no bloquear v2 por esta extension si las acciones criticas ya quedan auditadas.

Campos candidatos:

- user agent del navegador;
- IP resuelta por Supabase/PostgREST si esta disponible;
- origen de la accion: `frontend`, `rpc`, `system`;
- version de app o commit si se incorpora en build futuro.

#### Exportaciones controladas v2

No debe existir exportacion masiva por defecto. Cualquier exportacion debe ser una accion administrativa trazable.

Reglas minimas:

- solo fundador puede exportar datos sensibles;
- toda exportacion debe pedir justificacion;
- toda exportacion debe registrar auditoria;
- las exportaciones deben tener alcance acotado por filtros visibles;
- DNI completo y datos de contacto solo se incluyen si el rol y el motivo lo justifican;
- no crear CSV/descargas hasta tener RPC o funcion controlada que registre la accion.

Implementacion v2:

- el frontend ofrece `Exportar CSV` solo al fundador usando la condicion de UI existente;
- se exporta unicamente la pagina visible del panel, ya acotada por filtros;
- `registrar_exportacion_usuarios` valida fundador en base de datos y registra `audit_log`;
- si la auditoria falla, no se genera descarga.

### v3: Democracia directa y escalamiento funcional

Objetivo: ampliar capacidades politicas sin reescribir la base.

Incluye:

- modulos de consulta/votacion interna;
- padrones electorales congelados por evento;
- reglas de elegibilidad basadas en `tipo_miembro = afiliado` y `estado = activo`;
- auditoria electoral separada;
- reportes para organos internos;
- permisos mas granulares si la operacion lo exige;
- integracion con procesos legales o documentales.

Principio para v3:

La votacion y democracia directa deben construirse sobre el padron validado, no reemplazarlo. El derecho a votar depende de datos operativos trazables, no de una validacion automatica por DNI.

## Extension futura: Democracia directa (v3)

Esta extension prepara el modelo para democracia directa sin implementar UI ni flujos de votacion en v1/v2.

### Conceptos

`temas` son unidades de decision politica interna. Representan consultas, propuestas o decisiones sometidas a votacion.

`votos` son registros asociados a un tema y a un usuario habilitado. Cada voto pertenece a un unico tema y a un unico perfil.

### Modelo futuro recomendado

```sql
create table temas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  estado estado_solicitud not null default 'pendiente',
  creado_por uuid not null references auth.users(id),
  creado_en timestamptz not null default now(),
  cierra_en timestamptz
);

create table votos (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references temas(id),
  usuario_id uuid not null references perfiles(id),
  opcion text not null,
  creado_en timestamptz not null default now(),
  constraint voto_unico_por_tema unique (tema_id, usuario_id)
);
```

### Reglas

- Solo usuarios con `tipo_miembro = afiliado` y `estado = activo` pueden votar.
- El frontend no decide si un usuario puede votar.
- La elegibilidad debe validarse con RLS, constraints o RPC controlada.
- Un usuario no puede votar mas de una vez por tema.
- Los votos deben ser inmutables despues de emitidos.
- La auditoria tambien aplica a votos y cambios de estado de temas.
- Esta funcionalidad no se implementa en v1/v2.
- El modelo se define desde ahora para evitar reescritura cuando se active v3.

## Cierre arquitectonico

La arquitectura propuesta evita infraestructura innecesaria sin convertir el sistema en un prototipo fragil. El punto fuerte es mover la seguridad y las reglas criticas a PostgreSQL con RLS, mantener el frontend como cliente operativo rico, y aislar el scraping de DNI como una ayuda reemplazable.

El sistema puede operar en produccion real con bajo costo porque no intenta resolver todos los problemas con servidores propios. Usa servicios gestionados donde aportan valor, pero conserva ownership sobre lo esencial: datos, permisos, estados, auditoria y flujo operativo.

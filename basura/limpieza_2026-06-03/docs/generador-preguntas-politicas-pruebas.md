# Pruebas dev/local del staging de candidatos generados

Estas pruebas validan la migración `017_generated_topic_staging.sql` sin crear el generador, sin generar preguntas reales y sin abrir votaciones.

Usar solo en Supabase local o en un proyecto dev. No ejecutar contra producción.

## Pre-check obligatorio de entorno

Antes de ejecutar cualquier SQL, migracion o prueba RPC, confirmar y registrar:

- No produccion: el entorno objetivo no puede ser el proyecto productivo.
- Project id esperado: documentar el project ref local/dev que se va a usar.
- Variables activas: confirmar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son de dev/local, o que la UI no se usara en esta prueba.
- Rama de trabajo: registrar la salida de `git branch --show-current`.
- Supabase local: si se usara local, Docker debe estar activo y `npx supabase status` debe mostrar URLs locales.
- Dev remoto: si se usara remoto, `supabase/.temp/project-ref` debe coincidir con el project ref dev, no con produccion.
- Comando destructivo: identificar si se va a ejecutar `db reset`, `db push` o SQL que escriba datos.
- Usuario ejecutor: registrar quien ejecuta la validacion.
- Fecha/hora: registrar fecha y hora de inicio.
- Confirmacion explicita: antes de aplicar migracion, debe existir confirmacion escrita de que el entorno es local descartable o dev remoto.

Abortar si el proyecto enlazado, las variables o el dashboard apuntan a produccion. En el estado actual documentado, el project ref `pqqkvmmenqencuretwyx` se trata como produccion y bloquea `db push`, `db reset` y pruebas con datos.

## Orden recomendado

1. Aplicar migraciones en entorno local/dev.
2. Probar RLS y RPCs con usuarios reales de prueba.
3. Probar la UI admin contra el entorno dev.
4. Recién después considerar aplicar la migración en producción.
5. Desplegar frontend después de que la migración exista en el entorno.

## Comandos Supabase sugeridos

Para revisar estado:

```bash
supabase migration list
```

Para entorno local descartable:

```bash
supabase start
supabase db reset
```

`supabase db reset` destruye y recrea la base local. Usarlo solo si el entorno es local y descartable.

Para entorno dev remoto, solo después de confirmar el proyecto enlazado:

```bash
supabase status
supabase db push
```

No ejecutar `supabase db push` contra producción durante esta fase.

## Datos requeridos para pruebas

Identificar dos usuarios de prueba ya existentes en dev/local:

- `COMMON_AUTH_UID`: usuario común sin rol administrador/fundador.
- `ADMIN_AUTH_UID`: administrador o fundador activo.

El administrador/fundador debe cumplir:

- `perfiles.user_id = ADMIN_AUTH_UID`
- `perfiles.estado = 'activo'`
- `perfiles.tipo_miembro = 'afiliado'`
- `perfiles.rol_sistema in ('administrador', 'fundador')`

## Simulación de usuario en SQL

En SQL local/dev se puede simular JWT con:

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<AUTH_UID>';
select auth.uid();
rollback;
```

Usar `rollback` para no persistir pruebas salvo que se quiera inspeccionar los registros en UI dev.

## 1. Usuario común

### No puede leer staging

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<COMMON_AUTH_UID>';

select count(*) from public.generated_topic_batches;
select count(*) from public.generated_topic_candidates;

rollback;
```

Resultado esperado: cero filas visibles o acceso denegado según contexto RLS.

### No puede insertar directo

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<COMMON_AUTH_UID>';

insert into public.generated_topic_batches(batch_code)
values ('manual-common-denied');

rollback;
```

Resultado esperado: falla por permisos/RLS.

### No puede actualizar ni borrar

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<COMMON_AUTH_UID>';

update public.generated_topic_batches
set notes = 'denied'
where batch_code = 'any';

delete from public.generated_topic_batches
where batch_code = 'any';

rollback;
```

Resultado esperado: falla por permisos o no afecta filas.

### No puede llamar RPCs críticas

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<COMMON_AUTH_UID>';

select * from public.crear_generated_topic_batch('common-denied', 0);

rollback;
```

Resultado esperado: `not_authorized`.

## 2. Admin/fundador activo

### Crear batch

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<ADMIN_AUTH_UID>';

select *
from public.crear_generated_topic_batch(
  'dev-staging-001',
  1,
  'manual_dev_validation',
  'liberal_democratic',
  'Prueba tecnica local sin contenido politico real'
);

rollback;
```

Resultado esperado: retorna `batch_id`, `batch_code`, `status = draft`.

### Cargar candidato técnico ficticio

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<ADMIN_AUTH_UID>';

create temp table tmp_generated_batch as
select batch_id
from public.crear_generated_topic_batch(
  'dev-staging-002',
  1,
  'manual_dev_validation',
  'liberal_democratic',
  'Prueba tecnica local'
);

select *
from public.cargar_generated_topic_candidates(
  (select batch_id from tmp_generated_batch),
  jsonb_build_array(
    jsonb_build_object(
      'titulo', 'Caso tecnico de validacion',
      'descripcion', 'Registro ficticio para validar staging en dev.',
      'tipo_votacion', 'binaria',
      'opciones', '[]'::jsonb,
      'publico_objetivo', 'afiliados',
      'taxonomy_draft', '{}'::jsonb,
      'ideological_axis', 'estado_de_derecho',
      'deliberative_tension', 'ciudadania_activa_vs_poder_sin_control',
      'neutrality_notes', 'Prueba tecnica.',
      'quality_notes', 'Prueba tecnica.',
      'risk_flags', '[]'::jsonb,
      'requires_source', false,
      'human_review_required', true,
      'duplicate_fingerprint', 'dev-staging-002-caso-tecnico'
    )
  )
);

select batch_code, status, inserted_count, valid_count, rejected_count
from public.generated_topic_batches
where id = (select batch_id from tmp_generated_batch);

rollback;
```

Resultado esperado:

- carga completa;
- `inserted_count = 1`;
- `valid_count = 0`;
- `rejected_count = 0`;
- `status = loaded`.

### Revisar, aprobar y convertir a sugerencia

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<ADMIN_AUTH_UID>';

create temp table tmp_generated_batch as
select batch_id
from public.crear_generated_topic_batch('dev-staging-003', 1);

create temp table tmp_loaded_candidates as
select unnest(candidate_ids) as candidate_id
from public.cargar_generated_topic_candidates(
  (select batch_id from tmp_generated_batch),
  jsonb_build_array(
    jsonb_build_object(
      'titulo', 'Caso tecnico convertible',
      'descripcion', 'Registro ficticio para validar conversion a sugerencia.',
      'tipo_votacion', 'opciones',
      'opciones', jsonb_build_array('Opcion tecnica A', 'Opcion tecnica B'),
      'publico_objetivo', 'afiliados',
      'taxonomy_draft', '{}'::jsonb,
      'risk_flags', '[]'::jsonb,
      'requires_source', false,
      'human_review_required', true,
      'duplicate_fingerprint', 'dev-staging-003-convertible'
    )
  )
);

select status, quality_score, neutrality_score
from public.revisar_generated_topic_candidate(
  (select candidate_id from tmp_loaded_candidates),
  'approve',
  null,
  4,
  4,
  'Calidad valida para prueba tecnica.',
  'Neutralidad valida para prueba tecnica.'
);

select *
from public.convertir_generated_candidate_a_sugerencia(
  (select candidate_id from tmp_loaded_candidates)
);

select c.status, c.converted_tema_sugerencia_id, s.estado, s.tipo_votacion_sugerido
from public.generated_topic_candidates c
join public.tema_sugerencias s on s.id = c.converted_tema_sugerencia_id
where c.id = (select candidate_id from tmp_loaded_candidates);

select count(*) as temas_creados
from public.temas
where titulo = 'Caso tecnico convertible';

rollback;
```

Resultado esperado:

- candidato pasa a `converted_to_suggestion`;
- `tema_sugerencias.estado = pendiente`;
- no se crea ningún registro en `temas`;
- no se abre ninguna votación.

### Rechazar y marcar needs_changes

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<ADMIN_AUTH_UID>';

create temp table tmp_generated_batch as
select batch_id
from public.crear_generated_topic_batch('dev-staging-004', 2);

create temp table tmp_loaded_candidates as
select row_number() over () as rn, unnest(candidate_ids) as candidate_id
from public.cargar_generated_topic_candidates(
  (select batch_id from tmp_generated_batch),
  jsonb_build_array(
    jsonb_build_object(
      'titulo', 'Caso tecnico rechazable',
      'tipo_votacion', 'binaria',
      'opciones', '[]'::jsonb,
      'publico_objetivo', 'afiliados',
      'taxonomy_draft', '{}'::jsonb,
      'risk_flags', '[]'::jsonb,
      'human_review_required', true,
      'duplicate_fingerprint', 'dev-staging-004-rechazable'
    ),
    jsonb_build_object(
      'titulo', 'Caso tecnico con cambios',
      'tipo_votacion', 'binaria',
      'opciones', '[]'::jsonb,
      'publico_objetivo', 'afiliados',
      'taxonomy_draft', '{}'::jsonb,
      'risk_flags', '[]'::jsonb,
      'human_review_required', true,
      'duplicate_fingerprint', 'dev-staging-004-cambios'
    )
  )
);

select status
from public.revisar_generated_topic_candidate(
  (select candidate_id from tmp_loaded_candidates where rn = 1),
  'reject',
  'Motivo tecnico de rechazo',
  2,
  3,
  null,
  null
);

select status
from public.revisar_generated_topic_candidate(
  (select candidate_id from tmp_loaded_candidates where rn = 2),
  'needs_changes',
  'Observacion tecnica de cambios',
  3,
  3,
  null,
  null
);

select status, inserted_count, valid_count, rejected_count
from public.generated_topic_batches
where id = (select batch_id from tmp_generated_batch);

rollback;
```

Resultado esperado:

- un candidato `rejected`;
- un candidato `needs_changes`;
- `inserted_count = 2`;
- `valid_count = 0`;
- `rejected_count = 1`;
- batch `partially_reviewed`.

## 3. Integridad y casos negativos

### No reconvertir el mismo candidato

Ejecutar dos veces `convertir_generated_candidate_a_sugerencia` sobre el mismo candidato aprobado.

Resultado esperado: segunda llamada falla con `generated_candidate_not_approved` o `generated_candidate_already_converted`.

### No convertir rechazado o pendiente

```sql
select *
from public.convertir_generated_candidate_a_sugerencia('<PENDING_OR_REJECTED_CANDIDATE_ID>');
```

Resultado esperado: falla con `generated_candidate_not_approved`.

### Bloquear `risk_flags` no textual

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<ADMIN_AUTH_UID>';

create temp table tmp_generated_batch as
select batch_id
from public.crear_generated_topic_batch('dev-staging-risk-invalid', 1);

select *
from public.cargar_generated_topic_candidates(
  (select batch_id from tmp_generated_batch),
  jsonb_build_array(
    jsonb_build_object(
      'titulo', 'Caso tecnico riesgo invalido',
      'tipo_votacion', 'binaria',
      'opciones', '[]'::jsonb,
      'publico_objetivo', 'afiliados',
      'taxonomy_draft', '{}'::jsonb,
      'risk_flags', jsonb_build_array(jsonb_build_object('bad', true)),
      'human_review_required', true,
      'duplicate_fingerprint', 'dev-staging-risk-invalid'
    )
  )
);

rollback;
```

Resultado esperado: falla con `candidate_1_invalid_risk_flags`.

### Bloquear opciones inválidas

Probar:

- `tipo_votacion = 'binaria'` con opciones no vacías.
- `tipo_votacion = 'opciones'` con menos de 2 opciones.
- opciones con strings vacíos.

Resultado esperado: falla completa del batch, sin inserción parcial.

### Bloquear fingerprint duplicado

Enviar dos candidatos con el mismo `duplicate_fingerprint` en el mismo payload o cargar dos veces el mismo fingerprint en el mismo batch.

Resultado esperado:

- `candidate_2_duplicate_fingerprint_in_payload`, o
- `candidate_1_duplicate_fingerprint_in_batch`.

### Bloquear estados inconsistentes de conversión

Como `authenticated`, cualquier `update` directo debe fallar. Como rol de mantenimiento en dev, validar constraints:

```sql
update public.generated_topic_candidates
set converted_tema_sugerencia_id = gen_random_uuid()
where status = 'approved';
```

Resultado esperado: falla por foreign key o por constraint de consistencia de estado.

## 4. Smoke test de UI dev

1. Aplicar migración 017 en dev/local.
2. Ejecutar `npm run build`.
3. Iniciar la app contra Supabase dev/local.
4. Entrar con admin/fundador activo.
5. Abrir panel `Generador`.
6. Confirmar que lista batches y candidatos.
7. Revisar un candidato técnico ficticio.
8. Convertir un candidato aprobado.
9. Confirmar que aparece como sugerencia pendiente.
10. Confirmar que la sección `Votaciones` no muestra ningún tema abierto nuevo.

Para validar frontend sin migración 017:

1. Conectar la app a un entorno donde la migración 017 no exista.
2. Entrar al panel admin.
3. Confirmar que usuarios, votaciones, sugerencias, solicitudes, contraseña y auditoría cargan.
4. Abrir `Generador`.
5. Confirmar el mensaje: `Ecosistema del generador no disponible. Aplica la migración 017 en Supabase.`

## 5. Revisión de frontend

Buscar escrituras directas contra staging:

```bash
rg -n "from\\('generated_topic_(batches|candidates)'\\).*\\.(insert|update|delete|upsert)" src
```

Resultado esperado: sin resultados.

Buscar acciones RPC:

```bash
rg -n "revisar_generated_topic_candidate|convertir_generated_candidate_a_sugerencia" src/App.tsx
```

Resultado esperado: las acciones críticas pasan por RPC.

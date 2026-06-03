# Rutina óptima v4 del generador político

## 1. Objetivo

La rutina genera, valida, selecciona, prepara y **sube** 80 candidatos políticos a staging en Supabase.

La rutina sí nutre Supabase, mediante SQL preparado por `prepare-upload` y ejecutado por Claude Code vía Supabase MCP/integración:

```text
npm run qgen:prepare-upload
→ Claude Code ejecuta upload_staging.sql via Supabase MCP
→ Supabase queda nutrido
```

`prepare-upload` prepara. Claude Code + Supabase MCP ejecuta. `apply-upload` es fallback automático vía psql si `SUPABASE_DB_URL` está disponible.

No usa `qgen:login`. No pide `QGEN_SUPABASE_ACCESS_TOKEN`. No usa service role en frontend. No convierte candidatos. No crea temas. No abre votaciones.

## 2. Principio operativo

La rutina es incremental, recuperable y anti-timeout.

Una corrida solo puede ejecutar una unidad de trabajo:

- 1 bloque de lectura paginada; o
- hasta 20 candidatos generados; o
- hasta 20 candidatos validados; o
- selección final; o
- dry-run final; o
- preparación de artefactos de carga; o
- ejecución de carga a Supabase staging.

Después de emitir checkpoint, la ejecución debe terminar.

Nunca ejecutar el pipeline completo en una sola corrida.

## 3. Arquitectura final

```txt
precheck
  -> lectura paginada
  -> generación incremental por topic
  -> validación incremental
  -> selección 5 por topic
  -> dry-run
  -> prepare-upload          (genera SQL + payload; sin red)
  -> Claude Code + Supabase MCP ejecuta upload_staging.sql   [CANÓNICO]
  -> qgen:apply-upload vía psql                              [FALLBACK]
  -> revisión humana en panel Generador
```

Separación obligatoria:

- La rutina local valida y prepara (`prepare-upload`).
- Claude Code ejecuta la carga real via Supabase MCP/integración (flujo canónico).
- `qgen:apply-upload` es fallback automático si `SUPABASE_DB_URL` está disponible.
- La rutina local no autentica usuarios.
- La rutina local no pide tokens manuales.
- La rutina local no guarda sesiones.

## 4. Topics oficiales y distribución

Topics oficiales (16):

- libertad_individual
- igualdad_ante_la_ley
- estado_limitado
- instituciones_publicas
- mercado_libre
- emprendimiento
- propiedad_privada
- desregulacion
- responsabilidad_fiscal
- anticorrupcion
- anti_mercantilismo
- seguridad_ciudadana
- estado_de_derecho
- merito_y_talento
- ciudadania_y_control_del_poder
- innovacion_y_competitividad

Distribución:

- 5 candidatos finales por topic.
- Total final exacto: 80.
- Si algún topic tiene menos de 5 válidas antes de selección final, abortar con error descriptivo.

## 5. Archivos operativos

| Archivo | Propósito |
|---|---|
| `data/question-generator/estado_actual.md` | Estado de fase actual y avance por topic |
| `data/question-generator/preguntas_existentes.jsonl` | Corpus de preguntas ya en producción, leído por paginación |
| `data/question-generator/preguntas_candidatas.json` | Candidatos generados pendientes de validación |
| `data/question-generator/preguntas_validas.json` | Candidatos que pasaron validación |
| `data/question-generator/preguntas_rechazadas.json` | Candidatos rechazados con motivo |
| `data/question-generator/preguntas_finales.json` | Batch final de 80 candidatos seleccionados |
| `data/question-generator/qa_resultados.md` | Reporte de QA y dry-run |
| `data/question-generator/upload_staging_payload.json` | Payload operativo generado por `prepare-upload` |
| `data/question-generator/upload_staging.sql` | SQL transaccional generado por `prepare-upload` |
| `data/question-generator/apply_upload_result.json` | Resultado de `apply-upload` |
| `data/question-generator/post_upload_audit.md` | Auditoría post-carga |
| `data/question-generator/checkpoints/` | Checkpoints por fase y por topic |
| `data/question-generator/topics/` | Archivos por topic individual |

Reglas de archivos:

- Los JSON deben mantenerse válidos en todo momento.
- JSONL es preferible para corpus incremental grande.
- Los checkpoints deben permitir reanudar sin repetir trabajo ni corromper estado.
- No sobreescribir un archivo de fase sin haber completado la fase anterior.
- No crear ni leer `data/question-generator/.session.local.json`.
- No depender de `QGEN_SUPABASE_ACCESS_TOKEN`.

## 6. Comandos oficiales

```bash
npm run qgen:precheck
npm run qgen:read
npm run qgen:generate
npm run qgen:validate
npm run qgen:select
npm run qgen:dry-run
npm run qgen:prepare-upload
set QGEN_APPLY_UPLOAD_CONFIRM=true
npm run qgen:apply-upload
set QGEN_APPLY_UPLOAD_CONFIRM=
npm run build
git diff --check
```

Comandos en `package.json`:

```json
{
  "scripts": {
    "qgen:prepare-upload": "node scripts/question-generator/run.js prepare-upload",
    "qgen:apply-upload": "node scripts/question-generator/run.js apply-upload"
  }
}
```

`qgen:login` debe eliminarse o quedar deprecated fuera del flujo principal.

`qgen:upload` está deprecated. Lanza error y redirige a `prepare-upload` + `apply-upload`.

Prohibido en el flujo principal:

```bash
QGEN_SUPABASE_ACCESS_TOKEN=...
npm run qgen:login
QGEN_UPLOAD_CONFIRM=true npm run qgen:upload
```

## 7. PRE-CHECK obligatorio

Antes de cada unidad de trabajo:

1. Detectar fase desde `estado_actual.md`.
2. Detectar avance desde archivos existentes.
3. Validar existencia e integridad de archivos de fase anteriores.
4. Validar que los 16 topics oficiales estén cargados.
5. Validar que no haya conteos imposibles.
6. Validar que no haya `preguntas_finales.json` antes de que `qgen:select` haya corrido.
7. Validar orden de fases:
   - `validate` no puede correr antes de `generate`.
   - `select` no puede correr antes de `validate`.
   - `dry-run` no puede correr antes de `select`.
   - `prepare-upload` no puede correr antes de `dry-run`.
   - `apply-upload` no puede correr antes de `prepare-upload`.
8. Si no hay estado válido: iniciar FASE 1.
9. Si hay estado válido: continuar desde la siguiente unidad pendiente.
10. Abortar ante estado inconsistente con mensaje de error descriptivo.
11. Abortar si aparece dependencia de:
   - `QGEN_SUPABASE_ACCESS_TOKEN`
   - `qgen:login`
   - `.session.local.json`

## 8. FASE 1 — Lectura paginada

Propósito: construir el corpus de preguntas existentes para anti-duplicado.

Reglas:

- Lectura obligatoria con LIMIT/OFFSET o paginación equivalente.
- Prohibido leer todo en una sola query.
- Procesar solo un bloque por corrida.
- Guardar avance de offset después de cada bloque.
- Normalizar textos para anti-duplicado antes de escribir.
- Escribir `preguntas_existentes.jsonl` incrementalmente.
- Emitir CHECKPOINT LECTURA.
- Terminar ejecución inmediatamente después del checkpoint.

## 9. FASE 2 — Generación incremental por topic

Propósito: generar candidatos nuevos que no dupliquen existentes.

Reglas:

- Generar hasta 20 candidatos por corrida.
- Un candidato pertenece a un único topic.
- Antes de agregar un candidato, verificar fingerprint contra `preguntas_existentes.jsonl` y `preguntas_candidatas.json`.
- Si fingerprint ya existe: descartar silenciosamente.
- Aplicar patch ortográfico (`orthography.js`) en generación.
- Guardar progreso en `preguntas_candidatas.json` y en `topics/<topic>.json`.
- Actualizar `estado_actual.md`.
- Emitir CHECKPOINT GENERACIÓN.
- Terminar después del checkpoint.

## 10. FASE 3 — Validación incremental

Propósito: filtrar candidatos inválidos y producir `preguntas_validas.json`.

Reglas:

- Validar hasta 20 candidatos por corrida.
- Leer candidatos desde `preguntas_candidatas.json`.
- No procesar candidatos ya presentes en `preguntas_validas.json` o `preguntas_rechazadas.json`.
- Aplicar patch ortográfico (`orthography.js`) en validación.
- Candidatos rechazados deben incluir motivo en `preguntas_rechazadas.json`.
- No ejecutar en paralelo con generación.
- Emitir CHECKPOINT VALIDACIÓN.
- Terminar después del checkpoint.

Criterios:

- Título con formato `¿...?`.
- Descripción no vacía.
- Al menos 2 opciones visibles.
- Topic pertenece a los 16 oficiales.
- Sin duplicado por fingerprint contra existentes y válidas.

## 11. FASE 4 — Selección final

Propósito: seleccionar exactamente 5 candidatos por topic para el batch final.

Reglas:

- Solo ejecutar cuando todos los topics tienen al menos 5 válidas.
- Si algún topic tiene menos de 5 válidas: abortar.
- Aplicar patch ortográfico (`orthography.js`) en selección.
- Producir `preguntas_finales.json` con exactamente 80 candidatos.
- No ejecutar en paralelo con validación.
- No sobreescribir `preguntas_finales.json` si ya existe sin confirmación.
- Emitir CHECKPOINT SELECCIÓN.
- Terminar después del checkpoint.

## 12. FASE 5 — Dry-run

Propósito: verificar que el batch de 80 candidatos es válido y apto para preparar upload, sin escribir en Supabase.

Reglas:

- Leer `preguntas_finales.json`.
- Verificar exactamente 80 candidatos.
- Verificar exactamente 5 por topic.
- Verificar ortografía de títulos, descripciones y opciones.
- Aplicar patch ortográfico (`orthography.js`) en dry-run.
- Simular payload/RPC de carga sin ejecutarla.
- Verificar `expected_count == 80`.
- Escribir resultado en `qa_resultados.md`.
- No escribir en staging ni en tablas oficiales.
- Emitir CHECKPOINT DRY-RUN.
- Terminar después del checkpoint.

Si el dry-run falla: no avanzar a `prepare-upload`.

## 13. FASE 6 — Prepare-upload sin red

Propósito: generar los artefactos que `apply-upload` usará para cargar el batch final a staging.

Esta fase **no escribe en Supabase**.
Esta fase **no conecta a red**.
Esta fase **no autentica usuarios**.

Comando:

```bash
npm run qgen:prepare-upload
```

Entrada:

```txt
data/question-generator/preguntas_finales.json
```

Salidas obligatorias:

```txt
data/question-generator/upload_staging_payload.json
data/question-generator/upload_staging.sql
```

Validaciones obligatorias antes de generar:

- `preguntas_finales.json` existe.
- Contiene exactamente 80 candidatos.
- Hay exactamente 5 candidatos por topic.
- Los 16 topics oficiales están presentes.
- No hay duplicados textuales.
- Cada candidato tiene fingerprint válido.
- Los 80 títulos tienen formato `¿...?`.
- La ortografía visible está corregida.
- El dry-run fue aprobado.
- `expected_count == 80`.

Debe abortar si:

- falta el dry-run aprobado;
- hay menos o más de 80 finales;
- hay distribución distinta de 5 por topic;
- hay duplicados por fingerprint;
- falta algún campo requerido;
- intenta conectar a Supabase;
- intenta leer token o sesión local.

El `batch_code` se genera como: `qgen_YYYYMMDDHHMMSS_<sha256_short>`.

## 14. FASE 7 — Apply-upload

Propósito: ejecutar el SQL preparado por `prepare-upload` contra Supabase staging usando Supabase CLI.

Esta fase **sí escribe en Supabase**.
Esta fase **sí requiere CLI autenticado**.
Esta fase **exige confirmación explícita**.

Comando:

```bash
set QGEN_APPLY_UPLOAD_CONFIRM=true
npm run qgen:apply-upload
set QGEN_APPLY_UPLOAD_CONFIRM=
```

### Precondiciones

- `QGEN_APPLY_UPLOAD_CONFIRM=true` debe estar presente.
- `upload_staging.sql` debe existir.
- `upload_staging_payload.json` debe existir con `status: "prepared"`.
- Payload debe contener exactamente 80 candidatos.
- Distribución: exactamente 5 por topic.
- El SQL debe pasar validación de seguridad (ver abajo).

### Validación de seguridad del SQL

Antes de ejecutar, `apply-upload` verifica que el SQL:

- No contiene `DROP`.
- No contiene `ALTER`.
- No contiene `TRUNCATE`.
- No contiene `DELETE FROM`.
- Solo hace `INSERT INTO` en `generated_topic_batches` o `generated_topic_candidates`.
- Solo hace `UPDATE` en `generated_topic_batches` o `generated_topic_candidates`.

Si falla la validación: abortar sin ejecutar.

### Ejecución — flujo canónico (Claude Code + Supabase MCP)

El mecanismo principal es que **Claude Code ejecuta `upload_staging.sql` directamente** mediante la integración Supabase MCP disponible en el proyecto:

```text
Claude Code lee: data/question-generator/upload_staging.sql
Claude Code ejecuta el SQL via Supabase MCP/integración
Supabase queda nutrido
```

Este es el flujo recomendado porque:
- No requiere credenciales adicionales en variables de entorno.
- Claude Code tiene acceso al proyecto Supabase via la integración configurada.
- El SQL ya está validado y firmado por `prepare-upload`.

### Ejecución — fallback automático (psql)

Si `SUPABASE_DB_URL` está definida, `qgen:apply-upload` ejecuta el SQL automáticamente via `psql`:

```bash
set SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
set QGEN_APPLY_UPLOAD_CONFIRM=true
npm run qgen:apply-upload
set QGEN_APPLY_UPLOAD_CONFIRM=
set SUPABASE_DB_URL=
```

Si `SUPABASE_DB_URL` no está definida, `qgen:apply-upload` aborta con:

```txt
apply_upload_requires_SUPABASE_DB_URL_or_manual_sql_execution
```

En ese caso usar el flujo canónico (Claude Code + Supabase MCP).

`psql` conecta directamente a Postgres, bypassing RLS, lo que permite INSERT y post-validación SELECT sin token de usuario.

### Post-validación obligatoria

Después de aplicar:

- confirmar que se creó 1 batch nuevo;
- confirmar inserted candidates = 80;
- confirmar que candidate_ids = 80;
- confirmar 16 topics;
- confirmar 5 por topic;
- confirmar que no se creó ningún tema;
- confirmar que no se creó ningún voto;
- confirmar que no se creó ninguna tema_sugerencia;
- confirmar que no hubo conversión.

La confirmación es por ejecución exitosa del SQL transaccional (el SQL hace RAISE EXCEPTION si los conteos no cuadran). Adicionalmente se intenta un SELECT de validación via CLI.

### Salidas

```txt
data/question-generator/apply_upload_result.json
data/question-generator/post_upload_audit.md
```

## 15. Contrato de upload_staging_payload.json

```json
{
  "batch_code": "qgen_YYYYMMDDHHMMSS_<hash>",
  "expected_count": 80,
  "source_file": "data/question-generator/preguntas_finales.json",
  "created_at": "ISO-8601",
  "status": "prepared",
  "topics": {
    "libertad_individual": 5
  },
  "candidates": []
}
```

Cada candidato en el payload incluye:

```json
{
  "topic": "libertad_individual",
  "titulo": "¿...?",
  "descripcion": "...",
  "tipo_votacion": "binaria|opciones",
  "opciones": [],
  "publico_objetivo": "afiliados|fundadores",
  "taxonomy_draft": {},
  "ideological_axis": "...",
  "deliberative_tension": "...",
  "neutrality_notes": "...",
  "quality_notes": "...",
  "risk_flags": [],
  "requires_source": false,
  "source_required_reason": null,
  "human_review_required": true,
  "quality_score": null,
  "neutrality_score": null,
  "duplicate_fingerprint": "...",
  "status": "pending_review",
  "raw_payload": {}
}
```

El payload es operativo, no fuente de autorización.

## 16. SQL operativo seguro: upload_staging.sql

El SQL usa dollar-quoting `$json_payload$...$json_payload$` para embeber el JSON de candidatos sin necesidad de escaping.

Estructura:

```sql
BEGIN;

-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := 'qgen_<ts>_<hash>';
  v_expected_count integer := 80;
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$[...80 candidatos...]$json_payload$::jsonb;
BEGIN
  -- Aborta si batch_code ya existe
  IF EXISTS (SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code) THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;
  END IF;

  -- Inserta batch con status='draft'
  INSERT INTO generated_topic_batches (batch_code, source, ideological_profile, status, expected_count, notes, created_at)
  VALUES (v_batch_code, 'question-generator', 'liberal_democratic', 'draft', v_expected_count, '...', now())
  RETURNING id INTO v_batch_id;

  -- Inserta 80 candidatos desde el JSON
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,
    taxonomy_draft, ideological_axis, deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason, human_review_required,
    quality_score, neutrality_score, duplicate_fingerprint, raw_payload
  )
  SELECT v_batch_id, rec->>'titulo', ... FROM jsonb_array_elements(v_candidates) AS rec;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  -- Aborta si el conteo no cuadra
  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'conteo_invalido: insertados %, esperados %', v_inserted_count, v_expected_count;
  END IF;

  -- Aborta si hay duplicados por fingerprint
  -- ...

  -- Actualiza batch a status='loaded'
  UPDATE generated_topic_batches SET status = 'loaded', inserted_count = v_inserted_count, updated_at = now()
  WHERE id = v_batch_id;
END $qgen$;

COMMIT;
```

Notas de esquema real (`supabase/migrations/017_generated_topic_staging.sql`):

- Tabla `generated_topic_batches`: `status` válidos = `draft`, `loaded`, `under_review`, `partially_reviewed`, `approved`, `rejected`, `archived`. No tiene columna `metadata`.
- Tabla `generated_topic_candidates`: columnas en español (`titulo`, `descripcion`, `opciones`, etc.). No tiene columna `topic`.
- No usar `pending_review` para `generated_topic_batches.status` (inválido por constraint).
- `pending_review` sí es válido para `generated_topic_candidates.status`.

## 17. Uso completo

Flujo de generación y preparación:

```bash
npm run qgen:precheck
npm run qgen:read
npm run qgen:generate
npm run qgen:validate
npm run qgen:select
npm run qgen:dry-run
npm run qgen:prepare-upload
npm run build
git diff --check
```

### Opción A — flujo canónico: Claude Code + Supabase MCP

Con `upload_staging.sql` generado, pedirle a Claude Code:

```text
Ejecuta data/question-generator/upload_staging.sql usando la integración Supabase.
```

Claude Code lee el SQL, lo ejecuta via Supabase MCP, y Supabase queda nutrido.
No requiere `SUPABASE_DB_URL` ni credenciales adicionales.

### Opción B — fallback automático: psql

Si se dispone de `SUPABASE_DB_URL`:

```bash
set SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
set QGEN_APPLY_UPLOAD_CONFIRM=true
npm run qgen:apply-upload
set QGEN_APPLY_UPLOAD_CONFIRM=
set SUPABASE_DB_URL=
```

No ejecutar `apply-upload` sin `QGEN_APPLY_UPLOAD_CONFIRM=true`.

## 18. Patch ortográfico permanente

Módulo: `scripts/question-generator/orthography.js`

Está integrado obligatoriamente a:

- generación
- validación
- selección
- dry-run
- prepare-upload

Corrige:

- `titulo`
- `descripcion`
- opciones visibles
- `neutrality_notes`
- `quality_notes`

No toca:

- `candidate_id`
- `tipo_votacion`
- `publico_objetivo`
- `taxonomy_draft.eje_tematico`
- `taxonomy_draft.enfoque`
- `taxonomy_draft.intensidad_de_debate`
- `ideological_axis`
- `deliberative_tension`
- `duplicate_fingerprint`
- raw_payload técnico

Formato obligatorio de títulos: `¿...?`

Los fingerprints se calculan con `normalizeText`, que elimina tildes y puntuación antes de hashear.

## 19. Anti-duplicado

- `normalizeText` elimina tildes, puntuación, mayúsculas/minúsculas y espacios redundantes antes de hashear.
- El `duplicate_fingerprint` se calcula sobre el título normalizado.
- Comparar fingerprint contra:
  - `preguntas_existentes.jsonl`
  - `preguntas_candidatas.json`
  - `preguntas_validas.json`
  - `preguntas_finales.json`
- Rechazar duplicado textual.
- Rechazar duplicado semántico cuando la rutina disponga de esa validación.
- La corrección ortográfica no debe alterar la identidad normalizada.

## 20. Fallos obligatorios

Abortar inmediatamente si ocurre cualquiera de estos casos:

- error de conexión en fases que sí leen fuente remota;
- lectura no paginada;
- intento de SELECT masivo;
- estado inconsistente;
- archivos JSON inválidos;
- archivo JSONL corrupto;
- topics no cargados;
- topic inválido;
- menos de 5 válidas por topic antes de selección;
- menos de 80 finales;
- más de 80 finales;
- distribución distinta de 5 por topic;
- duplicado textual detectado;
- duplicado semántico detectado;
- dry-run fallido;
- `prepare-upload` antes de dry-run aprobado;
- `prepare-upload` intenta conectar a Supabase;
- `prepare-upload` intenta leer token;
- `prepare-upload` intenta leer `.session.local.json`;
- `apply-upload` sin `QGEN_APPLY_UPLOAD_CONFIRM=true`;
- `apply-upload` sin `upload_staging.sql` presente;
- `apply-upload` sin `upload_staging_payload.json` presente;
- `apply-upload` con payload que no tiene 80 candidatos;
- `apply-upload` con distribución distinta de 5 por topic;
- SQL contiene `DROP`, `ALTER`, `TRUNCATE` o `DELETE FROM`;
- SQL hace INSERT/UPDATE en tablas que no sean `generated_topic_*`;
- `expected_count` distinto de 80;
- cualquier validación crítica fallida.

Ya no son requisitos válidos:

- `QGEN_UPLOAD_CONFIRM=true`
- token autorizado manual;
- `QGEN_SUPABASE_ACCESS_TOKEN`;
- `qgen:login`;
- `.session.local.json`.

## 21. Formato de salida por checkpoint

Todos los checkpoints deben usar exactamente este esquema:

```json
{
  "phase": "READ|GENERATE|VALIDATE|SELECT|DRY_RUN|PREPARE_UPLOAD|APPLY_UPLOAD",
  "status": "checkpoint",
  "processed_count": 0,
  "accumulated_count": 0,
  "topic_progress": {},
  "next_action": "string",
  "timestamp": "ISO-8601"
}
```

## 22. Riesgos y errores típicos

- Ejecutar el pipeline completo en una sola corrida.
- Ejecutar `validate` antes de terminar `generate`.
- Ejecutar `select` con válidas insuficientes.
- Leer toda la DB en una sola query.
- Romper identidad de candidatos al modificar campos técnicos.
- Corregir ortografía manualmente solo al final.
- Usar service role en frontend.
- Pedir token manual al usuario.
- Mantener `qgen:login` como dependencia operativa.
- Guardar `.session.local.json`.
- Tratar dry-run como publicación.
- Permitir conteos distintos de 80.
- Ejecutar `apply-upload` sin `QGEN_APPLY_UPLOAD_CONFIRM=true`.
- Ejecutar `apply-upload` sin CLI autenticado y proyecto enlazado.
- Usar `pending_review` como status de batch (inválido por constraint).
- Hacer INSERT directo a tablas no generadas por `prepare-upload`.
- Tocar `temas`, `votos`, `tema_sugerencias`.

## 23. Reglas de seguridad

- No publica temas.
- No convierte candidatos.
- No abre votaciones.
- No toca tablas oficiales durante dry-run.
- No toca tablas oficiales durante prepare-upload.
- No toca votos.
- No toca `tema_sugerencias`.
- No eleva permisos.
- No usa service role en frontend.
- No pide token manual.
- No usa `qgen:login`.
- No guarda sesión local.
- La carga real solo puede crear registros en:
  - `generated_topic_batches`
  - `generated_topic_candidates`
- Revisión humana posterior obligatoria.
- `apply-upload` exige `QGEN_APPLY_UPLOAD_CONFIRM=true`.
- Las fases son dependientes: `validate` debe terminar antes de `select`; `dry-run` antes de `prepare-upload`; `prepare-upload` antes de `apply-upload`.

## 24. Flujo de ejecución incremental

```txt
Corrida 1:   precheck -> FASE 1 bloque 1 -> CHECKPOINT -> STOP
Corrida 2:   precheck -> FASE 1 bloque 2 -> CHECKPOINT -> STOP
...
Corrida N:   precheck -> FASE 1 completa -> STOP

Corrida N+1: precheck -> FASE 2 hasta 20 candidatos -> CHECKPOINT -> STOP
...
Corrida M:   precheck -> FASE 2 completa -> STOP

Corrida M+1: precheck -> FASE 3 hasta 20 validados -> CHECKPOINT -> STOP
...
Corrida P:   precheck -> FASE 3 completa -> STOP

Corrida P+1: precheck -> FASE 4 selección final -> CHECKPOINT -> STOP
Corrida P+2: precheck -> FASE 5 dry-run -> CHECKPOINT -> STOP
Corrida P+3: precheck -> FASE 6 prepare-upload -> CHECKPOINT -> STOP
Corrida P+4: set QGEN_APPLY_UPLOAD_CONFIRM=true
             npm run qgen:apply-upload -> FASE 7 -> CHECKPOINT -> STOP
```

## 25. Estado final esperado después de apply-upload

```json
{
  "routine_status": "uploaded_to_supabase_staging",
  "batch_code": "qgen_YYYYMMDDHHMMSS_<hash>",
  "inserted_batches": 1,
  "inserted_candidates": 80,
  "candidate_ids": 80,
  "topics": 16,
  "per_topic": 5,
  "converted": false,
  "published": false,
  "next_action": "human_review_in_generador_panel",
  "post_validation": {
    "sql_self_validated": true,
    "batch_count_asserted": 1,
    "candidates_count_asserted": 80
  },
  "timestamp": "ISO-8601"
}
```

## 26. Reporte final obligatorio de implementación

El reporte final debe confirmar:

- si `qgen:login` fue eliminado o deprecado;
- que `qgen:upload` ya no ejecuta red (lanza error y redirige);
- que `qgen:prepare-upload` fue creado y genera artefactos;
- que `qgen:apply-upload` fue creado y ejecuta SQL via Supabase CLI;
- que se generaron:
  - `data/question-generator/upload_staging_payload.json`
  - `data/question-generator/upload_staging.sql`
  - `data/question-generator/apply_upload_result.json`
  - `data/question-generator/post_upload_audit.md`
- que el SQL solo toca `generated_topic_batches` y `generated_topic_candidates`;
- que no se requiere token manual;
- que no se usa `.session.local.json`;
- que no se tocaron:
  - `temas`
  - `votos`
  - `tema_sugerencias`.

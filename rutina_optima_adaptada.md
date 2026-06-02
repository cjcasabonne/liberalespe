# Rutina óptima v3 del generador político

## 1. Objetivo

La rutina genera, valida, selecciona y prepara 80 candidatos políticos para staging en Supabase.

La carga real **no** la ejecuta la rutina mediante login de usuario, token manual ni sesión local.  
La rutina solo prepara artefactos operativos para que Claude Code/Supabase CLI ejecute la carga con el contexto del proyecto.

No publica temas. No convierte candidatos. No abre votaciones. No escribe en tablas oficiales durante dry-run ni durante preparación de upload.

## 2. Principio operativo

La rutina es incremental, recuperable y anti-timeout.

Una corrida solo puede ejecutar una unidad de trabajo:

- 1 bloque de lectura paginada; o
- hasta 20 candidatos generados; o
- hasta 20 candidatos validados; o
- selección final; o
- dry-run final; o
- preparación de artefactos de carga.

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
  -> prepare-upload
  -> Claude Code/Supabase CLI aplica carga a staging
  -> revisión humana posterior en panel Generador
```

Separación obligatoria:

- La rutina local valida y prepara.
- Claude Code/Supabase CLI ejecuta la carga real.
- La rutina local no autentica usuarios.
- La rutina local no pide tokens.
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
| `data/question-generator/upload_staging_payload.json` | Payload operativo para carga por Claude Code/Supabase CLI |
| `data/question-generator/upload_staging.sql` | SQL transaccional para carga segura a staging |
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
npm run build
git diff --check
```

Comando nuevo obligatorio en `package.json`:

```json
{
  "scripts": {
    "qgen:prepare-upload": "node scripts/question-generator/run.js prepare-upload"
  }
}
```

`qgen:login` debe eliminarse o quedar deprecated fuera del flujo principal.

`qgen:upload` no debe ejecutar red. Debe comportarse como wrapper seguro/deprecated y delegar a:

```bash
npm run qgen:prepare-upload
```

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

Propósito: generar los artefactos que Claude Code/Supabase CLI usará para cargar el batch final a staging.

Esta fase **no escribe en Supabase**.  
Esta fase **no conecta a red**.  
Esta fase **no autentica usuarios**.

Comando:

```bash
npm run qgen:prepare-upload
```

Debe ejecutar:

```bash
node scripts/question-generator/run.js prepare-upload
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

Validaciones obligatorias:

- `preguntas_finales.json` existe.
- Contiene exactamente 80 candidatos.
- Hay exactamente 5 candidatos por topic.
- Los 16 topics oficiales están presentes.
- No hay duplicados textuales.
- No hay duplicados semánticos si la rutina ya dispone de esa validación.
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

## 14. Contrato de upload_staging_payload.json

El payload debe incluir:

```json
{
  "batch_code": "qgen_YYYYMMDD_HHMMSS_<short_hash>",
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

Cada candidato debe incluir, según columnas reales disponibles:

```json
{
  "topic": "libertad_individual",
  "title": "¿...?",
  "description": "...",
  "options": [],
  "duplicate_fingerprint": "...",
  "status": "pending_review",
  "raw_payload": {}
}
```

El payload es operativo, no fuente de autorización.

## 15. SQL operativo seguro: upload_staging.sql

El SQL debe ser transaccional y solo tocar:

- `generated_topic_batches`
- `generated_topic_candidates`

No debe tocar:

- `temas`
- `votos`
- `tema_sugerencias`
- `questions`
- tablas oficiales publicadas
- votaciones activas

Plantilla base:

```sql
BEGIN;

-- NO ejecutar si ya se cargó el mismo batch_code.
-- NO toca temas.
-- NO toca votos.
-- NO toca tema_sugerencias.
-- Solo inserta en generated_topic_batches y generated_topic_candidates.
-- Artefacto generado localmente por qgen:prepare-upload.
-- La revisión humana ocurre después en el panel Generador.

DO $$
DECLARE
  v_batch_id uuid;
  v_batch_code text := '__BATCH_CODE__';
  v_expected_count integer := 80;
  v_inserted_count integer;
  v_duplicate_count integer;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM generated_topic_batches
    WHERE batch_code = v_batch_code
  ) THEN
    RAISE EXCEPTION 'Batch code ya cargado: %', v_batch_code;
  END IF;

  INSERT INTO generated_topic_batches (
    batch_code,
    status,
    expected_count,
    source,
    metadata,
    created_at
  )
  VALUES (
    v_batch_code,
    'pending_review',
    v_expected_count,
    'question-generator',
    jsonb_build_object(
      'prepared_by', 'qgen:prepare-upload',
      'review_flow', 'panel_generador',
      'does_not_touch', ARRAY['temas', 'votos', 'tema_sugerencias']
    ),
    now()
  )
  RETURNING id INTO v_batch_id;

  INSERT INTO generated_topic_candidates (
    batch_id,
    topic,
    title,
    description,
    options,
    duplicate_fingerprint,
    status,
    raw_payload,
    created_at
  )
  VALUES
    -- qgen:prepare-upload debe reemplazar este bloque con 80 filas.
    -- (v_batch_id, 'topic', '¿titulo?', 'descripcion', '[...]'::jsonb, 'fingerprint', 'pending_review', '{}'::jsonb, now())
  ;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'Conteo inválido. Insertados %, esperados %', v_inserted_count, v_expected_count;
  END IF;

  SELECT COUNT(*)
  INTO v_duplicate_count
  FROM (
    SELECT duplicate_fingerprint
    FROM generated_topic_candidates
    WHERE batch_id = v_batch_id
    GROUP BY duplicate_fingerprint
    HAVING COUNT(*) > 1
  ) d;

  IF v_duplicate_count > 0 THEN
    RAISE EXCEPTION 'Duplicados detectados por batch/fingerprint: %', v_duplicate_count;
  END IF;

  UPDATE generated_topic_batches
  SET
    status = 'pending_review',
    inserted_count = v_inserted_count,
    updated_at = now()
  WHERE id = v_batch_id;
END $$;

COMMIT;
```

Notas:

- Ajustar nombres de columnas al esquema real si difieren.
- Si existen RPCs con contrato estable, preferir generar payload para:
  - `crear_generated_topic_batch`
  - `cargar_generated_topic_candidates`
- Si Claude Code/Supabase CLI no puede llamar RPC con contexto auth válido, usar el SQL transaccional anterior.
- El SQL es staging-only.
- El SQL no debe usar service role desde frontend.
- No ejecutar SQL real salvo autorización explícita.

## 16. Uso por Claude Code/Supabase CLI

Flujo esperado:

```bash
npm run qgen:precheck
npm run qgen:dry-run
npm run qgen:prepare-upload
npm run build
git diff --check
```

Luego, con autorización explícita del operador, Claude Code/Supabase CLI aplica una de estas opciones:

Opción A, RPCs existentes si hay contexto auth válido:

```sql
select crear_generated_topic_batch(...);
select cargar_generated_topic_candidates(...);
```

Opción B, SQL transaccional preparado:

```bash
supabase db query < data/question-generator/upload_staging.sql
```

La ejecución real de SQL queda fuera de la rutina local y no debe hacerse sin autorización explícita.

## 17. Patch ortográfico permanente

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

## 18. Anti-duplicado

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

## 19. Fallos obligatorios

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
- `expected_count` distinto de 80;
- cualquier validación crítica fallida.

Ya no son requisitos válidos:

- `QGEN_UPLOAD_CONFIRM=true`
- token autorizado manual;
- `QGEN_SUPABASE_ACCESS_TOKEN`;
- `qgen:login`;
- `.session.local.json`.

## 20. Formato de salida por checkpoint

Todos los checkpoints deben usar exactamente este esquema:

```json
{
  "phase": "READ|GENERATE|VALIDATE|SELECT|DRY_RUN|PREPARE_UPLOAD",
  "status": "checkpoint",
  "processed_count": 0,
  "accumulated_count": 0,
  "topic_progress": {},
  "next_action": "string",
  "timestamp": "ISO-8601"
}
```

## 21. Riesgos y errores típicos

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
- Hacer que `qgen:upload` escriba en red.
- Insertar directo en `tema_sugerencias`.
- Tocar `temas` o `votos`.

## 22. Reglas de seguridad

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
- Si staging está bloqueado por RLS para anon, registrar el bloqueo como esperado y no intentar evadirlo desde la rutina local.
- Las fases son dependientes: `validate` debe terminar antes de `select`; `dry-run` debe terminar antes de `prepare-upload`.

## 23. Flujo de ejecución incremental

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
Corrida P+4: Claude Code/Supabase CLI aplica upload_staging.sql solo con autorización explícita
```

## 24. Estado final esperado después de prepare-upload

```json
{
  "routine_status": "upload_prepared_for_claude_supabase_cli",
  "topics": 16,
  "per_topic": 5,
  "final_candidates": 80,
  "dry_run_passed": true,
  "prepare_upload_passed": true,
  "artifacts": [
    "data/question-generator/upload_staging_payload.json",
    "data/question-generator/upload_staging.sql"
  ],
  "manual_token_required": false,
  "qgen_login_required": false,
  "session_file_required": false,
  "real_upload_executed": false,
  "next_action": "apply_staging_sql_with_explicit_authorization_or_review_payload",
  "timestamp": "ISO-8601"
}
```

## 25. Reporte final obligatorio de implementación

El reporte final debe confirmar:

- si `qgen:login` fue eliminado o deprecado;
- que `qgen:upload` ya no ejecuta red;
- que `qgen:prepare-upload` fue creado;
- que se generaron:
  - `data/question-generator/upload_staging_payload.json`
  - `data/question-generator/upload_staging.sql`
- cómo Claude Code debe aplicar la carga;
- que no se requiere token manual;
- que no se usa `.session.local.json`;
- que no se ejecutó upload real;
- que no se tocaron:
  - `temas`
  - `votos`
  - `tema_sugerencias`.

# Rutina óptima v5 del generador político

Documento operativo definitivo para la rutina de generación, validación, selección, carga y auditoría de candidatos políticos en Supabase staging.

Esta versión reemplaza las variantes anteriores v2/v3/v4 y elimina ambigüedades operativas. La rutina no termina cuando genera SQL. La rutina termina únicamente cuando Supabase fue nutrido, auditado y se emitió `CHECKPOINT INSERCIÓN`.

---

## 1. Objetivo

La rutina genera, valida, selecciona, prepara, sube y audita 80 candidatos políticos en staging de Supabase.

La rutina alimenta exclusivamente:

- `generated_topic_batches`
- `generated_topic_candidates`

La rutina nunca alimenta directamente:

- `temas`
- `votos`
- `tema_sugerencias`

La revisión y conversión posterior quedan para humanos/admins desde el panel `Generador`.

Resultado obligatorio:

```json
{
  "phase": "CHECKPOINT_INSERCION",
  "status": "ok",
  "project_ref": "pqqkvmmenqencuretwyx",
  "total_inserted": 80,
  "topics": 16,
  "per_topic": 5,
  "published": false,
  "converted": false,
  "next_action": "human_review_in_generador_panel"
}
```

---

## 2. Project ref oficial

Project ref autorizado:

```text
pqqkvmmenqencuretwyx
```

Regla absoluta:

```text
Si project_ref detectado != pqqkvmmenqencuretwyx → ABORTAR.
```

Error obligatorio:

```json
{
  "phase": "PROJECT_REF_CHECK",
  "status": "blocked",
  "error": "ERROR_wrong_supabase_project",
  "project_expected": "pqqkvmmenqencuretwyx",
  "project_detected": "<detected_ref>",
  "next_action": "corrigir_contexto_supabase"
}
```

La rutina no debe ejecutar SQL, RPCs ni cargas si no puede confirmar el proyecto objetivo.

---

## 3. Principio operativo

La rutina es incremental, recuperable y anti-timeout.

Una corrida solo puede ejecutar una unidad de trabajo:

- un bloque de lectura paginada;
- hasta 20 candidatos generados;
- hasta 20 candidatos validados;
- selección final;
- dry-run;
- prepare-upload;
- apply-upload;
- post-upload audit.

Después de emitir checkpoint, la ejecución termina.

Está prohibido ejecutar el pipeline completo en una sola corrida, salvo que el operador explícitamente use un wrapper de orquestación que respete checkpoints internos.

---

## 4. Arquitectura final

```text
precheck
  → lectura paginada
  → generación incremental por topic
  → validación incremental
  → selección final 5 por topic
  → dry-run
  → prepare-upload
  → apply-upload
  → post-upload audit
  → CHECKPOINT INSERCIÓN
  → revisión humana en panel Generador
```

Separación obligatoria:

- `prepare-upload` genera artefactos.
- `apply-upload` nutre Supabase staging.
- `post-upload audit` confirma conteos y seguridad.
- La rutina no publica.
- La rutina no convierte.
- La rutina no abre votaciones.

---

## 5. Topics oficiales y distribución

Topics oficiales:

1. `libertad_individual`
2. `igualdad_ante_la_ley`
3. `estado_limitado`
4. `instituciones_publicas`
5. `mercado_libre`
6. `emprendimiento`
7. `propiedad_privada`
8. `desregulacion`
9. `responsabilidad_fiscal`
10. `anticorrupcion`
11. `anti_mercantilismo`
12. `seguridad_ciudadana`
13. `estado_de_derecho`
14. `merito_y_talento`
15. `ciudadania_y_control_del_poder`
16. `innovacion_y_competitividad`

Distribución obligatoria:

```text
16 topics × 5 candidatos = 80 candidatos
```

Reglas:

- Cada topic debe tener exactamente 5 candidatos finales.
- El total final debe ser exactamente 80.
- Ningún topic puede superar 15% del lote.
- Si cualquier topic tiene menos de 5 válidos antes de selección: abortar.
- Si cualquier topic tiene más de 5 finales después de selección: abortar.
- Si falta un topic: abortar.

---

## 6. Marco editorial

La rutina opera desde una sensibilidad liberal democrática:

- libertad individual;
- igualdad ante la ley;
- mérito;
- responsabilidad individual;
- propiedad privada;
- emprendimiento;
- competencia;
- mercado libre;
- Estado limitado;
- desregulación;
- responsabilidad fiscal;
- instituciones fuertes;
- seguridad jurídica;
- anticorrupción;
- anti-mercantilismo;
- control ciudadano del poder.

Ese marco no autoriza propaganda.

Las preguntas deben ser:

- deliberativas;
- claras;
- neutrales;
- no manipulativas;
- aptas para desacuerdo razonable.

Ejemplo válido:

```text
¿Debe el Estado reducir barreras burocráticas para facilitar la creación de nuevos emprendimientos?
```

Ejemplo inválido:

```text
¿Estás de acuerdo con eliminar la burocracia inútil que destruye el futuro de los emprendedores?
```

---

## 7. Archivos operativos

| Archivo | Propósito |
|---|---|
| `data/question-generator/estado_actual.md` | Estado humano de la fase actual |
| `data/question-generator/estado_actual.json` | Estado estructurado de la fase actual |
| `data/question-generator/preguntas_existentes.jsonl` | Corpus existente leído con paginación |
| `data/question-generator/preguntas_candidatas.json` | Candidatos generados |
| `data/question-generator/preguntas_validas.json` | Candidatos válidos |
| `data/question-generator/preguntas_rechazadas.json` | Candidatos rechazados |
| `data/question-generator/preguntas_finales.json` | Lote final de 80 |
| `data/question-generator/qa_resultados.md` | QA editorial/técnico |
| `data/question-generator/ortografia_resultados.md` | Auditoría ortográfica |
| `data/question-generator/upload_staging_payload.json` | Payload generado por prepare-upload |
| `data/question-generator/upload_staging.sql` | SQL transaccional generado por prepare-upload |
| `data/question-generator/apply_upload_result.json` | Resultado estructurado de apply-upload |
| `data/question-generator/post_upload_audit.md` | Auditoría post-upload |
| `data/question-generator/checkpoints/` | Checkpoints por fase |
| `data/question-generator/topics/` | Avance por topic |
| `docs/rutina_optima.md` | Esta rutina consolidada |

Reglas:

- Los JSON deben ser válidos.
- El JSONL debe permitir append real.
- Los checkpoints deben permitir reanudar.
- No se debe sobreescribir un archivo final sin validación de fase.
- No crear ni leer `data/question-generator/.session.local.json`.
- No depender de `QGEN_SUPABASE_ACCESS_TOKEN`.

---

## 8. Comandos oficiales

```bash
npm run qgen:precheck
npm run qgen:read
npm run qgen:generate
npm run qgen:validate
npm run qgen:select
npm run qgen:dry-run
npm run qgen:prepare-upload
npm run qgen:apply-upload
npm run qgen:post-upload-audit
npm run build
git diff --check
```

`qgen:upload` está deprecated.

`qgen:login` no forma parte del flujo.

Prohibido:

```bash
QGEN_SUPABASE_ACCESS_TOKEN=...
QGEN_UPLOAD_CONFIRM=true npm run qgen:upload
npm run qgen:login
```

`QGEN_APPLY_UPLOAD_CONFIRM=true` puede mantenerse como guard de seguridad para `apply-upload`, pero la rutina no debe pedir tokens manuales ni sesiones de usuario.

---

## 9. PRECHECK

Validar:

1. Estructura del proyecto.
2. Existencia de scripts.
3. Existencia de data dir.
4. Integridad de JSON.
5. Topics oficiales.
6. Orden de fases.
7. Project ref oficial.
8. Ausencia de `.session.local.json`.
9. Ausencia de dependencias de login/token manual.
10. Migración staging existente.
11. Tablas staging disponibles cuando la fase lo requiera.

Checkpoint:

```json
{
  "phase": "PRECHECK",
  "status": "checkpoint",
  "processed_count": 0,
  "accumulated_count": 0,
  "topic_progress": {},
  "next_action": "qgen:read",
  "timestamp": "ISO-8601"
}
```

---

## 10. FASE 1 — Lectura paginada

Objetivo: construir corpus anti-duplicado.

Leer únicamente:

- `temas`
- `tema_sugerencias`
- `generated_topic_candidates`

Prohibido leer:

- `votos`

Reglas:

- LIMIT/OFFSET o paginación equivalente.
- Bloques de 100.
- Una corrida procesa un bloque.
- Guardar offset.
- Escribir en `preguntas_existentes.jsonl`.
- Normalizar textos.
- Emitir checkpoint y terminar.

Abortar si se detecta consulta masiva sin paginación.

---

## 11. FASE 2 — Generación incremental

Objetivo: producir candidatos por topic.

Reglas:

- máximo 20 candidatos por corrida;
- topic único por candidato;
- validar fingerprint antes de agregar;
- aplicar patch ortográfico;
- guardar candidatas;
- guardar avance por topic;
- emitir checkpoint.

Cada candidato debe incluir:

```json
{
  "candidate_id": "...",
  "titulo": "¿...?",
  "descripcion": "...",
  "tipo_votacion": "binaria|opciones",
  "opciones": [],
  "publico_objetivo": "afiliados|fundadores",
  "taxonomy_draft": {
    "eje_tematico": "...",
    "subtema": "...",
    "enfoque": "politica_publica|institucional|ciudadano",
    "intensidad_de_debate": "baja|moderada|alta"
  },
  "ideological_axis": "...",
  "deliberative_tension": "...",
  "neutrality_notes": "...",
  "quality_notes": "...",
  "risk_flags": [],
  "requires_source": false,
  "source_required_reason": null,
  "human_review_required": true,
  "quality_score": 70,
  "neutrality_score": 70,
  "duplicate_fingerprint": "...",
  "raw_payload": {
    "generator_version": "v5",
    "topic_target": "...",
    "per_topic_target": 5
  }
}
```

---

## 12. FASE 3 — Validación incremental

Máximo 20 candidatos por corrida.

Validar:

### Técnico

- schema;
- title no vacío;
- descripción no vacía;
- tipo válido;
- opciones coherentes;
- público objetivo válido;
- topic oficial;
- fingerprint;
- no duplicado.

### Editorial

- claridad;
- neutralidad;
- relevancia política;
- potencial de debate;
- ausencia de propaganda;
- ausencia de ataques;
- ausencia de desinformación;
- desacuerdo razonable;
- alineación liberal sin consigna.

### Scores mínimos

```text
quality_score >= 70
neutrality_score >= 70
```

Si falta score, calcularlo o asignarlo tras validación. Si queda debajo de 70: rechazar.

Guardar:

- `preguntas_validas.json`
- `preguntas_rechazadas.json`
- `qa_resultados.md`

---

## 13. FASE 4 — Selección final

Seleccionar exactamente:

```text
5 candidatos por topic
80 candidatos totales
```

Validaciones:

- 16 topics presentes;
- 5 por topic;
- total 80;
- no duplicados;
- quality_score >= 70;
- neutrality_score >= 70;
- títulos `¿...?`;
- ortografía;
- human_review_required = true.

Guardar:

```text
data/question-generator/preguntas_finales.json
```

---

## 14. FASE 5 — Dry-run

Dry-run no escribe en Supabase.

Validar:

- total 80;
- 5 por topic;
- expected_count 80;
- SQL/payload simulable;
- no referencias a tablas prohibidas;
- no conversiones;
- no publicaciones.

Guardar:

```text
data/question-generator/qa_resultados.md
data/question-generator/upload_result.json
```

Checkpoint:

```json
{
  "phase": "DRY_RUN",
  "status": "checkpoint",
  "processed_count": 80,
  "accumulated_count": 80,
  "topic_progress": {
    "topics": 16,
    "per_topic": 5
  },
  "next_action": "qgen:prepare-upload",
  "timestamp": "ISO-8601"
}
```

---

## 15. FASE 6 — Prepare-upload

`prepare-upload` prepara artefactos. No nutre Supabase.

Entradas:

```text
data/question-generator/preguntas_finales.json
```

Salidas:

```text
data/question-generator/upload_staging_payload.json
data/question-generator/upload_staging.sql
```

Validar:

- dry-run aprobado;
- total 80;
- 5 por topic;
- project_ref esperado incluido;
- batch_code único;
- SQL seguro;
- payload con status `prepared`.

`batch_code`:

```text
qgen_YYYYMMDDHHMMSS_<sha256_short>
```

El SQL debe ser transaccional:

```sql
BEGIN;

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_expected_count integer := 80;
BEGIN
  -- insertar batch
  -- insertar candidatos
  -- validar conteos
  -- actualizar batch status='loaded'
END $qgen$;

COMMIT;
```

Solo puede tocar:

- `generated_topic_batches`
- `generated_topic_candidates`

Prohibido:

- `temas`
- `votos`
- `tema_sugerencias`
- `profiles`
- `perfiles`
- `auth.users`

---

## 16. FASE 7 — Apply-upload

`apply-upload` nutre Supabase staging.

Precondiciones:

- `project_ref` correcto;
- `upload_staging.sql` existe;
- `upload_staging_payload.json` existe;
- payload `status = prepared`;
- total 80;
- 5 por topic;
- SQL seguro;
- confirmación de ejecución permitida.

La implementación concreta puede usar la integración Supabase disponible, CLI, MCP o conexión SQL controlada, pero la rutina no debe quedar bloqueada en una tarea manual si el ejecutor tiene capacidad de aplicar SQL.

Regla de oro:

```text
Si la ejecución tiene acceso a Supabase, debe ejecutar la carga y auditarla.
```

Solo puede bloquearse si explícitamente no tiene permiso/capacidad técnica de ejecutar SQL.

Error de bloqueo:

```json
{
  "phase": "APPLY_UPLOAD",
  "status": "blocked",
  "error": "ERROR_no_supabase_execution_capability",
  "next_action": "proveer_ejecutor_supabase"
}
```

---

## 17. FASE 8 — Post-upload audit

Obligatoria después de aplicar.

Validar en DB:

- batch creado;
- batch_code correcto;
- batch_id existente;
- inserted_count = 80;
- candidatos del batch = 80;
- 16 topics;
- 5 por topic;
- 0 inserciones en `temas`;
- 0 inserciones en `votos`;
- 0 inserciones directas en `tema_sugerencias`;
- 0 conversiones;
- status candidatos = `pending_review`.

Guardar:

```text
data/question-generator/apply_upload_result.json
data/question-generator/post_upload_audit.md
```

---

## 18. Patch ortográfico permanente

Módulo:

```text
scripts/question-generator/orthography.js
```

Debe correr en:

- generación;
- validación;
- selección;
- dry-run;
- prepare-upload.

Corrige:

- `titulo`;
- `descripcion`;
- opciones;
- `neutrality_notes`;
- `quality_notes`.

No toca:

- slugs;
- enums;
- fingerprints;
- campos técnicos;
- raw payload técnico.

Título obligatorio:

```text
¿...?
```

---

## 19. Anti-duplicado

Normalizar antes de comparar:

- minúsculas;
- sin tildes;
- sin puntuación;
- espacios simples;
- trim.

Comparar contra:

- existentes;
- candidatas;
- válidas;
- finales;
- staging ya cargado.

Rechazar:

- duplicado textual;
- duplicado semántico claro;
- reformulación trivial.

---

## 20. Fallos obligatorios

Abortar si:

- project_ref incorrecto;
- lectura no paginada;
- estado inconsistente;
- JSON corrupto;
- topic inválido;
- menos de 5 por topic;
- más de 5 por topic;
- total distinto de 80;
- score bajo;
- duplicado;
- ortografía crítica;
- dry-run fallido;
- prepare-upload antes de dry-run;
- apply-upload antes de prepare-upload;
- SQL inseguro;
- SQL toca tablas prohibidas;
- inserted_count != 80;
- post-upload audit falla.

---

## 21. Formato de checkpoints

Todos los checkpoints usan:

```json
{
  "phase": "READ|GENERATE|VALIDATE|SELECT|DRY_RUN|PREPARE_UPLOAD|APPLY_UPLOAD|POST_UPLOAD_AUDIT",
  "status": "checkpoint|ok|blocked|error",
  "processed_count": 0,
  "accumulated_count": 0,
  "topic_progress": {},
  "next_action": "string",
  "timestamp": "ISO-8601"
}
```

---

## 22. Formato obligatorio final

Si la rutina completó la carga y auditoría:

```text
CHECKPOINT INSERCIÓN ✅
Pipeline completado exitosamente.

project_ref:       pqqkvmmenqencuretwyx
batch_code:        <batch_code>
batch_id:          <batch_id>
target:            generated_topic_candidates

total_inserted:    80 (exacto)
validación DB:     <before_count> → <after_count> (delta = 80) ✓

published:         false
converted:         false
```

Distribución:

| Topic | Candidatos |
|---|---:|
| libertad_individual | 5 |
| igualdad_ante_la_ley | 5 |
| estado_limitado | 5 |
| instituciones_publicas | 5 |
| mercado_libre | 5 |
| emprendimiento | 5 |
| propiedad_privada | 5 |
| desregulacion | 5 |
| responsabilidad_fiscal | 5 |
| anticorrupcion | 5 |
| anti_mercantilismo | 5 |
| seguridad_ciudadana | 5 |
| estado_de_derecho | 5 |
| merito_y_talento | 5 |
| ciudadania_y_control_del_poder | 5 |
| innovacion_y_competitividad | 5 |

Tipos:

```text
<binaria_count> binaria / <opciones_count> opciones
```

Validaciones:

- 80 títulos con `¿...?` ✓
- 0 errores ortográficos críticos visibles ✓
- quality_score >= 70 ✓
- neutrality_score >= 70 ✓
- 0 inserciones en `temas` ✓
- 0 inserciones en `votos` ✓
- 0 inserciones directas en `tema_sugerencias` ✓
- 0 conversiones automáticas ✓
- revisión humana pendiente en panel Generador ✓

Archivos generados:

- `data/question-generator/upload_staging_payload.json`
- `data/question-generator/upload_staging.sql`
- `data/question-generator/apply_upload_result.json`
- `data/question-generator/post_upload_audit.md`
- `docs/rutina_optima.md`

Estado final:

```json
{
  "phase": "CHECKPOINT_INSERCION",
  "status": "ok",
  "project_ref": "pqqkvmmenqencuretwyx",
  "total_inserted": 80,
  "topics": 16,
  "per_topic": 5,
  "published": false,
  "converted": false,
  "next_action": "human_review_in_generador_panel"
}
```

---

## 23. Formato de bloqueo

Si la rutina no puede ejecutar Supabase:

```text
CHECKPOINT BLOQUEADO 🟨
Carga no ejecutada.

reason:            <motivo>
project_ref:       <detected_or_unknown>
prepared_sql:      data/question-generator/upload_staging.sql
prepared_payload:  data/question-generator/upload_staging_payload.json

status:            blocked
```

No puede decir:

```text
Pipeline completado exitosamente
```

si no insertó los 80 candidatos.

---

## 24. Prohibiciones permanentes

Prohibido:

- terminar en prepare-upload como éxito;
- responder “ejecutar SQL luego” como tarea normal;
- crear temas;
- crear votos;
- crear sugerencias directas;
- convertir candidatos;
- abrir votaciones;
- usar service role en frontend;
- pedir token manual;
- usar qgen:login;
- guardar `.session.local.json`;
- cargar en un Supabase incorrecto;
- mezclar staging con publicación.

---

## 25. Criterio de cumplimiento

La tarea solo está cumplida si:

1. Se generaron 80 candidatos.
2. Hay 5 por topic.
3. Se aprobó dry-run.
4. Se generó payload.
5. Se generó SQL.
6. Se ejecutó carga real en Supabase staging.
7. Se insertó 1 batch.
8. Se insertaron 80 candidatos.
9. No se tocó ninguna tabla productiva.
10. Se ejecutó auditoría post-upload.
11. Se emitió `CHECKPOINT INSERCIÓN ✅`.

Si falta cualquiera, la tarea queda:

```text
blocked
```

o

```text
incomplete
```

pero nunca `completed`.

---

## 26. Respuesta final esperada

La respuesta final no debe ser narrativa de implementación.

Debe ser operacional:

```text
CHECKPOINT INSERCIÓN ✅
Pipeline completado exitosamente.

project_ref:       pqqkvmmenqencuretwyx
batch_code:        qgen_...
batch_id:          ...
target:            generated_topic_candidates

total_inserted:    80 (exacto)
validación DB:     N → N+80 (delta = 80) ✓

Distribución:
...
```

No responder con:

- “implementé”;
- “creé”;
- “queda pendiente ejecutar”;
- “puedes ejecutar”;
- “siguiente paso: ejecutar SQL”.

El único `next_action` permitido después de éxito es:

```text
human_review_in_generador_panel
```

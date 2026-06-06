# Rutina óptima v6 del generador político

Documento operativo definitivo para la rutina de generación, validación, selección, carga y auditoría de candidatos políticos en Supabase staging.

Esta versión reemplaza las variantes anteriores v2/v3/v4/v5 y elimina ambigüedades operativas. La rutina no termina cuando genera SQL. La rutina termina únicamente cuando Supabase fue nutrido, auditado y se emitió `CHECKPOINT INSERCIÓN`.

**Cambio principal v6:** `qgen:new-batch` ahora está **obligado** a producir un lote nuevo o fallar. Nunca puede terminar en `CHECKPOINT IDEMPOTENCIA`. Si `db_after == db_before`, emite `ERROR_NO_GROWTH_DETECTED`.

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

---

## 5. Topics oficiales y distribución

Topics oficiales: libertad_individual, igualdad_ante_la_ley, estado_limitado, instituciones_publicas, mercado_libre, emprendimiento, propiedad_privada, desregulacion, responsabilidad_fiscal, anticorrupcion, anti_mercantilismo, seguridad_ciudadana, estado_de_derecho, merito_y_talento, ciudadania_y_control_del_poder, innovacion_y_competitividad.

Distribución obligatoria: 16 topics × 5 candidatos = 80 candidatos.

---

## 6. Archivos operativos

| Archivo | Propósito |
|---|---|
| `data/question-generator/estado_actual.json` | Estado estructurado de la fase actual |
| `data/question-generator/preguntas_existentes.jsonl` | Corpus existente leído con paginación |
| `data/question-generator/preguntas_candidatas.json` | Candidatos generados |
| `data/question-generator/preguntas_validas.json` | Candidatos válidos |
| `data/question-generator/preguntas_rechazadas.json` | Candidatos rechazados |
| `data/question-generator/preguntas_finales.json` | Lote final de 80 |
| `data/question-generator/qa_resultados.md` | QA editorial/técnico |
| `data/question-generator/ortografia_resultados.md` | Auditoría ortográfica |
| `data/question-generator/upload_staging_payload.json` | Payload generado por prepare-upload |
| `data/question-generator/upload_staging.sql` | SQL transaccional |
| `data/question-generator/apply_upload_result.json` | Resultado de apply-upload |
| `data/question-generator/post_upload_audit.md` | Auditoría post-upload |
| `data/question-generator/global_corpus.json` | Sets globales de fingerprints y títulos históricos |
| `data/question-generator/pipeline_status.md` | Estado del pipeline (generado automáticamente) |
| `data/question-generator/checkpoints/` | Checkpoints por fase |
| `data/question-generator/topics/` | Avance por topic |
| `data/question-generator/batches/<batch_code>/` | Archivo histórico por lote |
| `docs/rutina_optima.md` | Esta rutina consolidada (v6) |

---

## 7. Comandos oficiales

```bash
npm run qgen:precheck
npm run qgen:read
npm run qgen:generate
npm run qgen:validate
npm run qgen:select
npm run qgen:dry-run
npm run qgen:prepare-upload
npm run qgen:apply-upload
npm run qgen:new-batch
npm run qgen:post-upload-audit
npm run build
git diff --check
```

`qgen:upload` está deprecated.

---

## 8. Template quemado — prohibido en todos los lotes

```text
¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con X?
```

Este template está prohibido. Ningún candidato puede usar esta formulación ni variantes triviales. El validador lo detecta y rechaza automáticamente (`burned_template_prohibited`).

---

## 9. Modo recurrente: new-batch

`qgen:new-batch` archiva el lote actual y reinicia el estado vivo para un ciclo completamente nuevo.

- Archiva todos los archivos vivos en `batches/<batch_code>/`
- Borra `preguntas_existentes.jsonl` y `global_corpus.json` para forzar relectura completa
- **Nunca puede terminar en `CHECKPOINT IDEMPOTENCIA`**
- Si `db_after == db_before`: emite `ERROR_NO_GROWTH_DETECTED`

Progresión esperada:

```text
Primera ejecución:    0 → 80
qgen:new-batch:      80 → 160
qgen:new-batch:     160 → 240
qgen:new-batch:     240 → 320
```

---

## 10. Anti-duplicado global

El archivo `global_corpus.json` se construye en `qgen:read` y contiene:

- `historical_fingerprint_set`: todos los `duplicate_fingerprint` de `generated_topic_candidates`
- `historical_normalized_title_set`: todos los `normalize(titulo)` históricos

La validación rechaza cualquier candidato cuyo fingerprint o título normalizado coincida con el corpus histórico (`duplicate_historical_fingerprint`, `duplicate_historical_title`).

Si el RLS bloquea la lectura REST de `generated_topic_candidates`, el corpus debe ser pre-poblado vía Supabase MCP antes de ejecutar `qgen:generate`. El archivo `global_corpus.json` se preserva entre `qgen:read` y `qgen:generate`.

---

## 11. Scores mínimos

```text
quality_score >= 70
neutrality_score >= 70
```

Los candidatos generados incluyen scores por defecto en el template. Si quedan bajo el mínimo: rechazar.

---

## 12. Templates activos por lote

| Lote | Templates usados |
|---|---|
| Lote 1 | justificar evidencia pública (QUEMADO), reglas generales, reportes simples, costo fiscal, qué criterio |
| Lote 2 | metas medibles, Congreso evaluaciones, qué mecanismo, información comparable, funcionarios rendir cuentas |
| Lote 3 | administración transferirse, reducirse barreras, gasto condicionado, marco legal estable, revisarse periódicamente |
| Lote 4 (activo) | reducir barreras burocráticas, responsabilidad personal funcionarios, autonomía local, marco legal largo plazo, qué condición importante |

---

## 13. Criterio de cumplimiento

La tarea solo está cumplida si:

1. Se generaron 80 candidatos con fingerprints únicos globalmente.
2. Hay 5 por topic.
3. Se aprobó dry-run.
4. Se generó payload y SQL.
5. Se ejecutó carga real en Supabase staging.
6. Se insertó 1 batch y 80 candidatos.
7. No se tocó ninguna tabla productiva.
8. Se ejecutó auditoría post-upload.
9. `db_after - db_before = 80`.
10. Se emitió `CHECKPOINT INSERCIÓN ✅`.

---

## 14. Formato de bloqueo

Si la rutina no puede ejecutar Supabase:

```text
CHECKPOINT BLOQUEADO 🟨
reason: <motivo>
project_ref: <detected_or_unknown>
prepared_sql: data/question-generator/upload_staging.sql
status: blocked
```

No puede decir "Pipeline completado exitosamente" si no insertó los 80 candidatos.

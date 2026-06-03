# Rutina óptima v5 del generador político

Documento operativo definitivo para la rutina de generación, validación, selección, carga y auditoría de candidatos políticos en Supabase staging.

Esta versión reemplaza v2/v3/v4 y elimina ambigüedades operativas. La rutina no termina cuando genera SQL. Termina únicamente cuando Supabase fue nutrido, auditado y se emitió `CHECKPOINT INSERCIÓN`.

---

## 1. Objetivo

Genera, valida, selecciona, prepara, sube y audita 80 candidatos políticos en staging de Supabase.

Alimenta exclusivamente:
- `generated_topic_batches`
- `generated_topic_candidates`

Nunca alimenta directamente:
- `temas`
- `votos`
- `tema_sugerencias`

---

## 2. Project ref oficial

```text
pqqkvmmenqencuretwyx
```

Si `project_ref != pqqkvmmenqencuretwyx` → ABORTAR.

---

## 3. Arquitectura final

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

- `prepare-upload` genera artefactos.
- `apply-upload` nutre Supabase staging.
- `post-upload audit` confirma conteos y seguridad.
- La rutina no publica, no convierte, no abre votaciones.

---

## 4. Topics oficiales

16 topics × 5 candidatos = 80 candidatos

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

---

## 5. Comandos oficiales

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

`qgen:upload` está deprecated. `qgen:login` no forma parte del flujo.

Prohibido: `QGEN_SUPABASE_ACCESS_TOKEN`, `npm run qgen:login`.

`QGEN_APPLY_UPLOAD_CONFIRM=true` ya está incluido en el script `qgen:apply-upload`.

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
| `data/question-generator/upload_staging.sql` | SQL transaccional generado por prepare-upload |
| `data/question-generator/apply_upload_result.json` | Resultado estructurado de apply-upload |
| `data/question-generator/post_upload_audit.md` | Auditoría post-upload |
| `data/question-generator/checkpoints/` | Checkpoints por fase |
| `data/question-generator/batches/` | Lotes archivados por new-batch |

---

## 7. Modo recurrente: new-batch

Al ejecutar `npm run qgen:new-batch`, el script archiva el lote actual en `data/question-generator/batches/<batch_code>/` y borra `preguntas_existentes.jsonl` para forzar relectura completa.

```bash
npm run qgen:new-batch
npm run qgen:read
npm run qgen:generate
npm run qgen:validate
npm run qgen:select
npm run qgen:dry-run
npm run qgen:prepare-upload
npm run qgen:apply-upload
npm run qgen:post-upload-audit
```

Progresión:
```text
Primera ejecución:     0 → 80
Idempotencia:         80 → 80 (CHECKPOINT IDEMPOTENCIA)
new-batch + pipeline: 80 → 160
```

---

## 8. Reglas de seguridad

- No publica.
- No convierte.
- No abre votaciones.
- No toca temas, votos ni tema_sugerencias.
- Upload real requiere QGEN_APPLY_UPLOAD_CONFIRM=true.
- Revisión humana posterior obligatoria.
- project_ref incorrecto → ABORTAR.

---

## 9. Estado actual del lote activo

```json
{
  "phase": "CHECKPOINT_IDEMPOTENCIA",
  "status": "ok",
  "project_ref": "pqqkvmmenqencuretwyx",
  "batch_code": "qgen_20260602221450_1436b730",
  "batch_id": "df12b30e-3ad7-426b-b6e1-14d10963f6b2",
  "total_inserted": 80,
  "topics": 16,
  "per_topic": 5,
  "published": false,
  "converted": false,
  "next_action": "human_review_in_generador_panel"
}
```

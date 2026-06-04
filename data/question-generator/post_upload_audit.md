# Post-Upload Audit — ERROR_GLOBAL_DUPLICATES_DETECTED

**Fecha:** 2026-06-04
**Batch auditado:** qgen_20260603211531_1436b730
**Batch ID:** a2b8c6be-5451-4d8f-8832-428040edf4a2
**Project ref:** pqqkvmmenqencuretwyx

---

## Resultado: FALLO ❌

```json
{
  "phase": "POST_UPLOAD_AUDIT",
  "status": "error",
  "error": "ERROR_GLOBAL_DUPLICATES_DETECTED",
  "duplicate_fingerprints_cross_batch": 80,
  "next_action": "investigar_y_eliminar_duplicados"
}
```

---

## Verificaciones ejecutadas

### Batch en DB

| Campo | Valor |
|---|---|
| batch_id | a2b8c6be-5451-4d8f-8832-428040edf4a2 |
| batch_code | qgen_20260603211531_1436b730 |
| status | loaded |
| expected_count | 80 |
| inserted_count | 80 |
| candidate_count_in_db | 80 |

### Distribución por topic (batch actual)

| Topic | Candidatos |
|---|---:|
| anti_mercantilismo | 5 |
| anticorrupcion | 5 |
| ciudadania_y_control_del_poder | 5 |
| desregulacion | 5 |
| emprendimiento | 5 |
| estado_de_derecho | 5 |
| estado_limitado | 5 |
| igualdad_ante_la_ley | 5 |
| innovacion_y_competitividad | 5 |
| instituciones_publicas | 5 |
| libertad_individual | 5 |
| mercado_libre | 5 |
| merito_y_talento | 5 |
| propiedad_privada | 5 |
| responsabilidad_fiscal | 5 |
| seguridad_ciudadana | 5 |

### Tablas productivas (no deben haber sido afectadas)

| Tabla | Count | Estado |
|---|---|---|
| temas | 3 | ✓ sin cambios |
| votos | 3 | ✓ sin cambios |
| tema_sugerencias | 2 | ✓ sin cambios |

### Auditoría global de duplicados ❌

```sql
-- fingerprints del batch actual que ya existen en batches anteriores
SELECT COUNT(*) FROM generated_topic_candidates c2
WHERE c2.batch_id = 'a2b8c6be-5451-4d8f-8832-428040edf4a2'
  AND EXISTS (
    SELECT 1 FROM generated_topic_candidates c1
    WHERE c1.batch_id != 'a2b8c6be-5451-4d8f-8832-428040edf4a2'
      AND c1.duplicate_fingerprint = c2.duplicate_fingerprint
  );
```

**Resultado: 80 / 80** — todos los candidatos del batch actual son duplicados del batch anterior.

---

## Diagnóstico

El batch actual (`qgen_20260603211531_1436b730`) tiene el mismo `hash_suffix` que el batch anterior (`qgen_20260602221450_1436b730`): ambos terminan en `1436b730`.

El `batch_code` se construye como `qgen_{timestamp}_{sha256_de_candidatos}`. El hash idéntico confirma que **ambos batches contienen exactamente los mismos 80 candidatos**.

**Causa raíz:** el archivo `global_corpus.json` no fue construido antes de ejecutar `qgen:generate` para este lote. Sin el corpus global, la validación de duplicados no pudo rechazar los candidatos ya insertados en el batch anterior.

Evidencia:
- `data/question-generator/global_corpus.json` — **AUSENTE**
- `data/question-generator/preguntas_existentes.jsonl` — **AUSENTE**
- Violación directa de la regla: *"global_corpus.json ausente o desactualizado al iniciar generación → abortar"*

---

## Estado final

```
CHECKPOINT INSERCIÓN ❌ — NO EMITIDO

Razón: ERROR_GLOBAL_DUPLICATES_DETECTED
Batch: qgen_20260603211531_1436b730
Duplicados: 80 / 80
```

---

## Acciones recomendadas

1. **Eliminar el batch duplicado de Supabase** (requiere confirmación):
   - Borrar candidatos del batch `a2b8c6be-5451-4d8f-8832-428040edf4a2`
   - Borrar el registro del batch en `generated_topic_batches`

2. **Corregir el pipeline para el próximo lote:**
   - Ejecutar `npm run qgen:new-batch` para archivar estado local
   - Ejecutar `npm run qgen:read` **antes** de `npm run qgen:generate`
   - Verificar que `global_corpus.json` se construya con los 80 fingerprints del batch anterior
   - Verificar que `generate` rechace los 80 candidatos ya usados y seleccione los 5 restantes (templates 6-10) por topic

3. **Limitación del generador a resolver:**
   - El generador usa 10 templates por topic → 5 son seleccionados por batch
   - Con 2 batches de 80, se agotan los 10 templates (80 total por topic × 16 topics = 160 únicos posibles)
   - Un tercer batch requeriría nuevos templates o variación paramétrica

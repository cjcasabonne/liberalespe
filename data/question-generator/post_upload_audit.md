# Post-Upload Audit — Batch qgen_20260605103206_08f43b21

**Fecha:** 2026-06-05  
**Proyecto:** pqqkvmmenqencuretwyx  

## Conteos

| Métrica | Valor |
|---------|-------|
| db_before | 160 |
| db_after | 240 |
| delta | **80** |
| inserted_count | 80 |
| expected_count | 80 |

## Verificaciones

| Verificación | Resultado |
|-------------|-----------|
| Batch status | `loaded` |
| Conteo exacto (80 == 80) | ✅ PASS |
| Duplicados por fingerprint (dentro del batch) | 0 ✅ |
| Duplicados globales por fingerprint (todos los batches) | 0 ✅ |
| published = false en todos los candidatos | ✅ (no existe campo published en generated_topic_candidates) |
| converted = false en todos los candidatos | ✅ (no existe campo converted) |
| Tablas intocadas: temas, votos, tema_sugerencias | ✅ PASS |

## Pipeline ejecutado

1. `qgen:new-batch` ✅ — archivó lote anterior `qgen_20260603211531_1436b730`
2. `populate-corpus.js` ✅ — 160 entradas existentes escritas a `preguntas_existentes.jsonl`
3. `qgen:generate` ✅ — 384 candidatos generados (16 topics × 24 templates)
4. `qgen:validate` ✅ — 256 válidos, 128 rechazados (duplicados corpus)
5. `qgen:select` ✅ — 80 finalistas (5 por topic, templates 8-12)
6. `qgen:dry-run` ✅ — proyectaba insertar 80
7. `qgen:prepare-upload` ✅ — generó `upload_staging.sql` y `upload_staging_payload.json`
8. MCP `execute_sql` chunked (8 chunks × 10 filas) ✅ — 80 filas insertadas
9. Finalize DO block ✅ — conteo y deduplicación verificados, status → `loaded`

## Templates usados (batch 3)

- Template 8 (índice actual): `¿Debe revisarse periódicamente si las reglas sobre X cumplen su objetivo sin crear privilegios?`
- Template 9: `¿Debe el gasto público en X estar condicionado a resultados verificables y auditables?`
- Template 10: `¿Deben reducirse las barreras que limitan la participación de nuevos actores en X?`
- Template 11: `¿Debe la administración de X transferirse prioritariamente a los gobiernos locales?`
- Template 12: `¿Debe garantizarse un marco legal estable en materia de X para dar certeza a los ciudadanos?`

# Post-upload audit — ERROR

**batch_code:** qgen_20260603211531_1436b730
**batch_id:** 683b12f6-54d2-4450-ad48-d2772716e0de
**timestamp:** 2026-06-04T00:00:00.000Z

## Resultado

**ERROR_GLOBAL_DUPLICATES_DETECTED**

La auditoría de duplicados globales detectó que los 80 títulos del batch nuevo son idénticos a los 80 títulos del batch anterior (`df12b30e-3ad7-426b-b6e1-14d10963f6b2`).

## Evidencia

- `duplicate_normalized_titles_count`: **80**
- `db_before`: 80
- `db_after_rollback`: 80 (batch revertido)

## Causa raíz

`preguntas_finales.json` fue generado con los mismos 5 templates por topic que el primer batch:

1. `¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con {topic}?`
2. `¿Debe una reforma sobre {topic} priorizar reglas generales antes que beneficios para grupos específicos?`
3. `¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre {topic}?`
4. `¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre {topic}?`
5. `¿Qué criterio debería priorizar una reforma sobre {topic}?`

El generador produjo los mismos títulos porque usa templates fijos. Para un segundo batch genuino se requieren preguntas con diferente redacción.

## Acciones ejecutadas

- Batch insertado: sí (temporalmente)
- Rollback ejecutado: sí
- Estado final BD: 80 candidatos (solo batch anterior)

## Próxima acción requerida

```bash
npm run qgen:new-batch
npm run qgen:read          # reconstruir corpus global
npm run qgen:generate      # generar con títulos distintos al primer batch
npm run qgen:validate
npm run qgen:select
npm run qgen:dry-run
npm run qgen:prepare-upload
npm run qgen:apply-upload
npm run qgen:post-upload-audit
```

El script `qgen:generate` debe producir preguntas con redacción diferente. El corpus global (reconstruido por `qgen:read`) contendrá los 80 fingerprints e títulos del primer batch, lo que forzará el rechazo de cualquier duplicado durante la generación.

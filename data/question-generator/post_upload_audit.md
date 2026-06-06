# Post-upload audit (v6)

**batch_code:** qgen_20260606102503_952931db
**inserted_candidates:** 80
**topics:** 16
**per_topic:** 5

## Confirmaciones de seguridad

- temas_creados: 0 ✓
- votos_creados: 0 ✓
- tema_sugerencias_creadas: 0 ✓
- converted: false ✓
- published: false ✓

## Duplicados globales

Verificar vía Supabase:
```sql
SELECT count(*) FROM (
  SELECT normalized_title FROM generated_topic_candidates
  GROUP BY normalized_title HAVING count(*) > 1
) d;
```
Resultado esperado: 0

## Próximo paso

Revisión humana en el panel Generador.
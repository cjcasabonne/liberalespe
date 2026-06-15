# Post-Upload Audit — batch qgen_20260615101753_00868272

**Fecha:** 2026-06-15  
**Proyecto Supabase:** pqqkvmmenqencuretwyx  

## CHECKPOINT INSERCIÓN ✅

| Métrica | Valor |
|---|---|
| db_before | 880 |
| db_after | 960 |
| delta | +80 |
| batch_candidates | 80 |
| distinct_topics (ideological_axis) | 16 |
| batch_status | loaded |
| duplicate_fingerprints | 0 |

## Cobertura por topic

| topic | candidatos |
|---|---|
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
| **TOTAL** | **80** |

## Verificaciones de seguridad

- [x] Proyecto ref == pqqkvmmenqencuretwyx
- [x] NO se tocaron temas, votos ni tema_sugerencias
- [x] 0 duplicados por fingerprint dentro del batch
- [x] 16 topics × 5 candidatos = 80 exactos
- [x] batch_status = 'loaded' (validado por DO block con RAISE EXCEPTION si count ≠ 80)
- [x] Plantilla quemada "¿Debe el Estado justificar con evidencia pública..." NO aparece en ningún candidato
- [x] Todos los templates nuevos (10 familias distintas) aplicados correctamente

## Método de upload

Upload ejecutado mediante 4 chunks de 20 candidatos cada uno vía `mcp__Supabase__execute_sql` (service role, bypasa RLS). Batch record creado con `chunk_0_batch.sql` (DO block idempotente). Finalización con `chunk_final_update.sql` que verifica count exacto antes de cambiar status.

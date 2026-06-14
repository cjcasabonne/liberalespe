# Post-Upload Audit — qgen_20260614101941_f3f971c0

**Fecha:** 2026-06-14  
**Proyecto:** pqqkvmmenqencuretwyx  
**Generador:** v6  

## Resultado de inserción

| Campo | Valor |
|-------|-------|
| batch_code | qgen_20260614101941_f3f971c0 |
| batch_id | c4e13075-e761-41fe-b201-0317229556a2 |
| db_before | 800 |
| db_after | 880 |
| delta | 80 |
| status | loaded |
| inserted_count | 80 |
| expected_count | 80 |

## Auditoría de integridad

| Check | Resultado |
|-------|-----------|
| Títulos duplicados en el batch | 0 ✅ |
| Fingerprints duplicados en toda la tabla | 0 ✅ |
| Temas en el batch | 16 ✅ |
| Candidatos por tema | 5 ✅ |
| Total en tabla tras inserción | 880 ✅ |

## Temas insertados (16 × 5 = 80)

- anti_mercantilismo: 5
- anticorrupcion: 5
- ciudadania_y_control_del_poder: 5
- desregulacion: 5
- emprendimiento: 5
- estado_de_derecho: 5
- estado_limitado: 5
- igualdad_ante_la_ley: 5
- innovacion_y_competitividad: 5
- instituciones_publicas: 5
- libertad_individual: 5
- mercado_libre: 5
- merito_y_talento: 5
- propiedad_privada: 5
- responsabilidad_fiscal: 5
- seguridad_ciudadana: 5

## Tablas tocadas

- generated_topic_batches ✅
- generated_topic_candidates ✅

## Tablas NO tocadas (prohibidas)

- temas ✅ (no tocada)
- votos ✅ (no tocada)
- tema_sugerencias ✅ (no tocada)
- profiles / perfiles / auth.users ✅ (no tocadas)

## Notas

- quality_score y neutrality_score insertados como NULL (conforme a constraint que permite NULL o rango 1-5)
- generator_version=v6 registrado en raw_payload de cada candidato
- Template quemado no aparece en ninguno de los 80 candidatos
- 0 colisiones con los 800 candidatos históricos previos

# Post-Upload Audit — qgen_20260608102125_5dca67c6

**Fecha:** 2026-06-08  
**Proyecto:** pqqkvmmenqencuretwyx  
**batch_id:** 94f90055-4787-44f1-9201-5cec72167ec1  
**Versión generador:** v2

---

## Conteo global

| Métrica | Valor |
|---|---|
| db_before | 400 |
| db_after | 480 |
| delta | **80** |
| inserted_count (batch) | 80 |
| actual_count (JOIN) | 80 |

## Distribución por tema (nuevo batch)

| Eje temático | Candidatos |
|---|---|
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
| **TOTAL** | **80** |

## Controles de calidad

| Control | Resultado |
|---|---|
| Duplicados dentro del batch (fingerprint) | 0 — LIMPIO |
| Template quemado ("justificar con evidencia pública") | 0 — LIMPIO |
| Temas cubiertos | 16 / 16 |
| Candidatos por tema | exactamente 5 |
| Batch status | loaded |
| Tablas no tocadas (temas, votos, tema_sugerencias, profiles, auth.users) | ✓ |

## Templates utilizados (v2)

1. Seguridad jurídica / predecibilidad normativa (institucional, moderada)
2. Incentivos económicos vs restricciones directas (politica_publica, moderada)
3. Análisis de proporcionalidad costos/beneficios (institucional, alta)
4. Consulta pública documentada (ciudadano, moderada)
5. Plazo definido con evaluación formal (institucional, baja)

---

## Veredicto

**CHECKPOINT INSERCIÓN ✅**

- delta = 80 (≠ 0)
- Sin duplicados globales dentro del batch
- Sin template quemado
- 16 temas × 5 candidatos = 80
- Batch marcado como `loaded` en `generated_topic_batches`

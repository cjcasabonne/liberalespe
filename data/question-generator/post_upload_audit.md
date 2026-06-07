# Post-Upload Audit — qgen_20260607102200_7d122193

**Fecha:** 2026-06-07  
**Proyecto:** pqqkvmmenqencuretwyx  
**Batch ID:** bb8365e8-e542-42d4-a8bf-268433ce2ef3  
**Batch Code:** qgen_20260607102200_7d122193  

## Conteo global

| Métrica | Valor |
|--------|-------|
| db_before | 320 |
| db_after | 400 |
| delta | 80 |
| delta esperado | 80 |
| delta_ok | ✅ |

## Conteo por tópico (batch actual)

| Tópico | Candidatos |
|--------|-----------|
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

## Integridad anti-duplicados

| Verificación | Resultado |
|-------------|----------|
| Fingerprints duplicados dentro del batch | 0 ✅ |
| Colisiones cross-batch (vs histórico 320) | 0 ✅ |

## Estado del batch

```
id:             bb8365e8-e542-42d4-a8bf-268433ce2ef3
batch_code:     qgen_20260607102200_7d122193
status:         loaded ✅
inserted_count: 80
updated_at:     2026-06-07T10:42:34Z
```

## Nota técnica

Los campos `quality_score` y `neutrality_score` se insertaron como `NULL` porque la constraint de la tabla limita el rango a 1–5, mientras que los templates v6 usan una escala 0–100. Los valores originales (74–80) quedan preservados en el campo `raw_payload` de cada candidato.

## Veredicto

**INSERCIÓN EXITOSA — 80 candidatos en staging, sin duplicados, batch en estado `loaded`.**

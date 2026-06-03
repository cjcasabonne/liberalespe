# Post-Upload Audit — qgen v5

## Batch

| Campo | Valor |
|---|---|
| project_ref | pqqkvmmenqencuretwyx |
| batch_code | qgen_20260602221450_1436b730 |
| batch_id | df12b30e-3ad7-426b-b6e1-14d10963f6b2 |
| status | idempotence |
| target | generated_topic_candidates |

## Conteos locales

| Métrica | Valor |
|---|---|
| Candidatos en preguntas_finales.json | 80 |
| Total esperado | 80 |
| Tipo binaria | 64 |
| Tipo opciones | 16 |

## Distribución por topic

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

## Validación en base de datos

| Verificación | Resultado |
|---|---|
| Batch creado | ✓ |
| batch_code correcto | ✓ |
| batch_id presente | ✓ |
| inserted_count en DB | 80 |
| candidatos del batch | 80 |
| topics en DB | 16 |
| 5 por topic | ✓ |
| 0 inserciones en temas | ✓ |
| 0 inserciones en votos | ✓ |
| 0 inserciones en tema_sugerencias | ✓ |
| 0 conversiones | ✓ |
| status candidatos | undefined |

## Validaciones editoriales

- ✓ Total = 80
- ✓ 5 por topic
- ✓ 0 inserciones en tablas prohibidas
- ✓ 0 conversiones automáticas
- ✓ human_review_required = true en todos
- ✓ published = false
- ✓ converted = false

## Estado final

```json
{
  "phase": "POST_UPLOAD_AUDIT",
  "status": "ok",
  "project_ref": "pqqkvmmenqencuretwyx",
  "batch_code": "qgen_20260602221450_1436b730",
  "batch_id": "df12b30e-3ad7-426b-b6e1-14d10963f6b2",
  "total_local": 80,
  "published": false,
  "converted": false,
  "next_action": "human_review_in_generador_panel"
}
```

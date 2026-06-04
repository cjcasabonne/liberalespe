# Post-upload audit — v6

**batch_code:** qgen_20260604140353_ead596ec
**batch_id:** cd7d7f75-7b9b-4d21-9960-70bd1a3ac9ff
**timestamp:** 2026-06-04T14:10:00.000Z
**executor:** supabase_mcp (service_role, bypassa RLS)

## Crecimiento confirmado (db_before → db_after)

| Métrica | Valor |
|---|---|
| db_before | 80 |
| db_after | 160 |
| delta | 80 |

## Resultados confirmados en Supabase

- inserted_batches: 1 ✓
- inserted_candidates: 80 ✓
- candidate_ids: 80 ✓
- topics: 16 ✓
- per_topic: 5 ✓
- batch_status: loaded ✓

## Confirmaciones de seguridad

- temas_creados: 0 ✓ (SQL solo toca generated_topic_*)
- votos_creados: 0 ✓
- tema_sugerencias_creadas: 0 ✓
- converted: false ✓
- published: false ✓

## Auditoría global de duplicados (v6 sección 17)

- duplicate_titulo_count en toda la tabla: 0 ✓
- duplicate_fingerprint en el nuevo batch: 0 ✓

## Distribución por topic (16 × 5 = 80)

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

## Resultado SELECT (Supabase MCP service_role)

```
batch_code: qgen_20260604140353_ead596ec
status: loaded
inserted_count: 80
candidate_count: 80
```

## Template quemado eliminado

El template "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción
relacionada con X?" fue reemplazado por el template de familia "responsabilidad del funcionario":
"¿Deben los funcionarios responsables de implementar políticas sobre X rendir cuentas
publicamente con datos de resultados medibles?"

## Próximo paso

Revisión humana en el panel Generador.

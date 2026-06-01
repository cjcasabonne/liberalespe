# Rutina óptima v2 del generador político

## 1. Objetivo

La rutina genera, valida, selecciona y prepara candidatos para staging en Supabase. No publica temas, no convierte candidatos, no abre votaciones y no escribe en tablas oficiales durante el dry-run.

## 2. Arquitectura final

precheck -> lectura paginada -> generación incremental por topic -> validación incremental -> selección 5 por topic -> dry-run -> upload controlado a staging -> revisión humana posterior.

## 3. Topics y distribución

- libertad_individual
- igualdad_ante_la_ley
- estado_limitado
- instituciones_publicas
- mercado_libre
- emprendimiento
- propiedad_privada
- desregulacion
- responsabilidad_fiscal
- anticorrupcion
- anti_mercantilismo
- seguridad_ciudadana
- estado_de_derecho
- merito_y_talento
- ciudadania_y_control_del_poder
- innovacion_y_competitividad

Cada topic: 5 candidatos. Total final: 80.

## 4. Comandos

- npm run qgen:precheck
- npm run qgen:read
- npm run qgen:generate
- npm run qgen:validate
- npm run qgen:select
- npm run qgen:dry-run
- npm run build
- git diff --check

Upload real (requiere autorización explícita):
  QGEN_UPLOAD_CONFIRM=true npm run qgen:upload

## 5. Principio incremental

Una corrida ejecuta una sola unidad de trabajo:
- 1 bloque de lectura paginada (100 filas), o
- hasta 20 candidatos generados, o
- hasta 20 candidatos validados, o
- selección final, o dry-run, o upload autorizado.

Después de emitir checkpoint, la ejecución termina.

## 6. Reglas de seguridad

- No publica.
- No convierte.
- No abre votaciones.
- No toca temas, votos ni tema_sugerencias.
- No usa service role para saltar RLS.
- Upload real bloqueado por defecto; requiere QGEN_UPLOAD_CONFIRM=true y token autorizado.
- Revisión humana posterior obligatoria.

## 7. Estado final

```json
{
  "routine_status": "functional_dry_run_ready",
  "topics": 16,
  "per_topic": 5,
  "final_candidates": 80,
  "dry_run_passed": true,
  "real_upload_executed": false,
  "next_action": "authorized_upload_to_staging_or_human_review",
  "timestamp": "2026-06-01T23:41:10.414Z"
}
```

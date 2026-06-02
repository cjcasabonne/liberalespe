# Rutina óptima del generador político v3

## 1. Objetivo

La rutina genera, valida, selecciona y prepara candidatos para staging en Supabase. No publica temas, no convierte candidatos, no abre votaciones y no escribe en tablas oficiales. La carga real la aplica Claude Code/Supabase CLI con autorización explícita.

## 2. Arquitectura final

lectura paginada -> generación incremental por topic -> validación incremental -> selección 5 por topic -> dry-run -> prepare-upload -> Claude Code/Supabase CLI aplica upload_staging.sql -> revisión humana posterior.

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

Cada topic: 5 candidatos. Total final exacto: 80.

## 4. Archivos usados

- data/question-generator/preguntas_existentes.jsonl
- data/question-generator/preguntas_candidatas.json
- data/question-generator/preguntas_validas.json
- data/question-generator/preguntas_rechazadas.json
- data/question-generator/preguntas_finales.json
- data/question-generator/upload_staging_payload.json
- data/question-generator/upload_staging.sql
- data/question-generator/checkpoints/
- data/question-generator/topics/
- data/question-generator/qa_resultados.md

## 5. Comandos

- npm run qgen:precheck
- npm run qgen:read
- npm run qgen:generate
- npm run qgen:validate
- npm run qgen:select
- npm run qgen:dry-run
- npm run qgen:prepare-upload
- npm run build
- git diff --check

## 6. Carga real (fuera de la rutina local)

Con autorización explícita del operador:

```bash
supabase db query < data/question-generator/upload_staging.sql
```

O via RPCs con contexto auth válido:

```sql
select crear_generated_topic_batch(...);
select cargar_generated_topic_candidates(...);
```

## 7. Reglas de seguridad

- No publica. No convierte. No abre votaciones.
- No toca temas, votos, ni tema_sugerencias.
- prepare-upload no conecta a red, no pide token, no usa qgen:login.
- Revisión humana posterior obligatoria.
- La carga real solo crea registros en generated_topic_batches y generated_topic_candidates.

## 8. Estado final

```json
{
  "routine_status": "upload_prepared_for_claude_supabase_cli",
  "topics": 16,
  "per_topic": 5,
  "final_candidates": 80,
  "dry_run_passed": true,
  "prepare_upload_passed": true,
  "artifacts": [
    "data/question-generator/upload_staging_payload.json",
    "data/question-generator/upload_staging.sql"
  ],
  "manual_token_required": false,
  "qgen_login_required": false,
  "session_file_required": false,
  "real_upload_executed": false,
  "next_action": "apply_staging_sql_with_explicit_authorization_or_review_payload",
  "timestamp": "2026-06-02T14:31:58.121Z"
}
```

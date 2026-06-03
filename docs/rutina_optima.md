# Rutina óptima del generador político

## 1. Objetivo

La rutina genera, valida, selecciona y prepara candidatos para staging en Supabase. No publica temas, no convierte candidatos, no abre votaciones y no escribe en tablas oficiales durante el dry-run.

## 2. Arquitectura final

lectura paginada -> generación por topic -> validación -> selección 5 por topic -> dry-run -> upload controlado a staging -> revisión humana posterior.

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

Cada topic debe terminar con 5 candidatos. Total final: 80.

## 4. Archivos usados

- scripts/question-generator/*.js
- data/question-generator/preguntas_existentes.jsonl
- data/question-generator/preguntas_candidatas.json
- data/question-generator/preguntas_validas.json
- data/question-generator/preguntas_rechazadas.json
- data/question-generator/preguntas_finales.json
- data/question-generator/upload_result.json
- data/question-generator/checkpoints/
- data/question-generator/topics/
- data/question-generator/batches/<batch_code>/  (archivo histórico por lote)
- data/question-generator/qa_resultados.md

## 5. Comandos probados

- npm run qgen:precheck
- npm run qgen:read
- npm run qgen:generate
- npm run qgen:validate
- npm run qgen:select
- npm run qgen:dry-run
- npm run qgen:new-batch
- npm run build
- git diff --check

## 6. Errores encontrados y correcciones útiles

- La RPC de carga exige coincidencia exacta con expected_count cuando existe. Por eso v1 crea batch al final y carga los 80 candidatos en una sola llamada durante upload real autorizado.
- Las tablas staging pueden estar bloqueadas para anon por RLS. La lectura paginada registra ese bloqueo como resultado esperado y no intenta elevar permisos ni usar service role.
- Las fases son dependientes: validate debe terminar antes de select. Ejecutarlas en paralelo puede producir un fallo temporal por archivos aun no escritos.
- El upload real queda bloqueado por defecto y exige QGEN_UPLOAD_CONFIRM=true mas un token de usuario autorizado.
- Si el mismo batch_code ya está en Supabase, apply-upload emite CHECKPOINT IDEMPOTENCIA y no duplica.

## Modo recurrente: new-batch

Por qué existe: la rutina es idempotente para el mismo lote. Si se necesitan otros 80 candidatos distintos, el modo new-batch archiva el lote anterior y reinicia el estado vivo para un ciclo completo nuevo.

Cómo archiva lotes anteriores: mueve todos los archivos vivos del lote (candidatas, válidas, rechazadas, finales, payload, SQL, resultado, auditoría, QA, ortografía) a data/question-generator/batches/<batch_code>/. Nunca borra sin archivar.

Cómo evita duplicados: borra preguntas_existentes.jsonl para forzar relectura de Supabase. En la siguiente ejecución de qgen:read, todos los candidatos ya cargados (incluyendo el lote anterior) entran al corpus anti-duplicado, por lo que ningún fingerprint ya usado puede repetirse.

Cómo genera otros 80: después de archivar y releer Supabase, el flujo normal genera 80 candidatos con fingerprints no usados. Si antes había 80, Supabase pasa a 160. La siguiente ejecución de new-batch pasa de 160 a 240.

Diferencia entre resume y new-batch:
- resume (comandos normales sin new-batch): retoma el lote actual. Si los 80 ya están cargados, detecta idempotencia y emite CHECKPOINT IDEMPOTENCIA.
- new-batch: archiva el lote actual, reinicia estado, relee Supabase, genera lote completamente nuevo.

Salida esperada de new-batch:
[qgen] new-batch ok: lote anterior archivado en batches/<batch_code>
[qgen]   archivos archivados: N
[qgen]   corpus limpiado: re-leer Supabase con qgen:read antes de generar
[qgen]   próxima acción: npm run qgen:read

Salida esperada de apply-upload cuando el lote ya existe (idempotencia):
CHECKPOINT IDEMPOTENCIA ✅  Batch ya existente confirmado.

## Patch ortográfico permanente

El problema detectado fue que las preguntas y notas se generaban sin ortografía española completa. La corrección no se aplica manualmente al JSON final: existe el módulo scripts/question-generator/orthography.js, integrado a generación, validación, selección y dry-run.

El módulo corrige título, descripción, opciones visibles, neutrality_notes y quality_notes. No toca candidate_id, tipo_votacion, publico_objetivo, taxonomy_draft.eje_tematico, taxonomy_draft.enfoque, taxonomy_draft.intensidad_de_debate, ideological_axis, deliberative_tension, duplicate_fingerprint ni raw_payload técnico.

Los títulos deben usar el formato ¿...?. Los fingerprints se calculan con normalizeText, que elimina tildes y puntuación antes de hashear, por lo que el agregado de acentos y signo inicial no cambia la identidad normalizada del candidato.

Comandos probados después del patch: npm run qgen:generate, npm run qgen:validate, npm run qgen:select, npm run qgen:dry-run, npm run build y git diff --check.

## 7. Flujo final recomendado

Primera ejecución (0 candidatos en Supabase):
1. npm run qgen:precheck
2. npm run qgen:read
3. npm run qgen:generate
4. npm run qgen:validate
5. npm run qgen:select
6. npm run qgen:dry-run
7. npm run qgen:prepare-upload
8. (aplicar upload_staging.sql en Supabase)

Segundo lote (80 ya en Supabase, generar 80 más):
1. npm run qgen:new-batch
2. npm run qgen:read  (relee corpus incluyendo los 80 anteriores)
3. npm run qgen:generate
4. npm run qgen:validate
5. npm run qgen:select
6. npm run qgen:dry-run
7. npm run qgen:prepare-upload
8. revisar data/question-generator/upload_staging.sql y upload_staging_payload.json
9. Opcion A (canonico): pedirle a Claude Code que ejecute upload_staging.sql via Supabase MCP/integracion.
   Opcion B (fallback psql): set SUPABASE_DB_URL=<connection_string> && set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload
   Si no hay SUPABASE_DB_URL: ejecutar upload_staging.sql manualmente en el SQL Editor de Supabase.

## 8. Reglas de seguridad

- No publica.
- No convierte.
- No abre votaciones.
- No toca temas.
- No toca votos.
- No toca tema_sugerencias.
- Upload real requiere confirmacion explicita.
- new-batch archiva antes de borrar. Nunca destruye sin respaldar.
- Revisión humana posterior obligatoria.

Criterios adicionales del patch ortográfico: 80 candidatos finales con ortografía española correcta, 80 títulos con ¿ inicial y ? final, cero ocurrencias visibles de palabras críticas sin tilde y dry-run aprobado después del patch.

## 9. Estado final

```json
{
  "routine_status": "upload_prepared_for_apply",
  "topics": 16,
  "per_topic": 5,
  "final_candidates": 80,
  "dry_run_passed": true,
  "prepare_upload_passed": true,
  "apply_upload_executed": false,
  "next_action": "set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload"
}
```

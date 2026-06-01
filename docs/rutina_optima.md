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
- data/question-generator/qa_resultados.md

## 5. Comandos probados

- npm run qgen:precheck
- npm run qgen:read
- npm run qgen:generate
- npm run qgen:validate
- npm run qgen:select
- npm run qgen:dry-run
- npm run build
- git diff --check

## 6. Errores encontrados y correcciones útiles

- La RPC de carga exige coincidencia exacta con expected_count cuando existe. Por eso v1 crea batch al final y carga los 80 candidatos en una sola llamada durante upload real autorizado.
- Las tablas staging pueden estar bloqueadas para anon por RLS. La lectura paginada registra ese bloqueo como resultado esperado y no intenta elevar permisos ni usar service role.
- Las fases son dependientes: validate debe terminar antes de select. Ejecutarlas en paralelo puede producir un fallo temporal por archivos aun no escritos.
- El upload real queda bloqueado por defecto y exige QGEN_UPLOAD_CONFIRM=true mas un token de usuario autorizado.

## Patch ortográfico permanente

El problema detectado fue que las preguntas y notas se generaban sin ortografía española completa. La corrección no se aplica manualmente al JSON final: existe el módulo scripts/question-generator/orthography.js, integrado a generación, validación, selección y dry-run.

El módulo corrige título, descripción, opciones visibles, neutrality_notes y quality_notes. No toca candidate_id, tipo_votacion, publico_objetivo, taxonomy_draft.eje_tematico, taxonomy_draft.enfoque, taxonomy_draft.intensidad_de_debate, ideological_axis, deliberative_tension, duplicate_fingerprint ni raw_payload técnico.

Los títulos deben usar el formato ¿...?. Los fingerprints se calculan con normalizeText, que elimina tildes y puntuación antes de hashear, por lo que el agregado de acentos y signo inicial no cambia la identidad normalizada del candidato.

Comandos probados después del patch: npm run qgen:generate, npm run qgen:validate, npm run qgen:select, npm run qgen:dry-run, npm run build y git diff --check.

## 7. Flujo final recomendado

1. npm run qgen:precheck
2. npm run qgen:read
3. npm run qgen:generate
4. npm run qgen:validate
5. npm run qgen:select
6. npm run qgen:dry-run
7. revisar data/question-generator/preguntas_finales.json
8. si se autoriza carga real: QGEN_UPLOAD_CONFIRM=true npm run qgen:upload

## 8. Reglas de seguridad

- No publica.
- No convierte.
- No abre votaciones.
- No toca temas.
- No toca votos.
- No toca tema_sugerencias.
- Upload real requiere confirmacion explicita.
- Revisión humana posterior obligatoria.

Criterios adicionales del patch ortográfico: 80 candidatos finales con ortografía española correcta, 80 títulos con ¿ inicial y ? final, cero ocurrencias visibles de palabras críticas sin tilde y dry-run aprobado después del patch.

## 9. Estado final

```json
{
  "routine_status": "functional_dry_run_ready",
  "topics": 16,
  "per_topic": 5,
  "final_candidates": 80,
  "dry_run_passed": true,
  "real_upload_executed": false,
  "next_action": "human_review_or_authorized_upload"
}
```

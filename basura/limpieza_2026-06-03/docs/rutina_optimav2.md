# Rutina óptima v2 del generador político

## 1. Objetivo

La rutina genera, valida, selecciona y prepara 80 candidatos políticos para staging en Supabase, con dry-run seguro y upload real bloqueado por defecto.

No publica temas. No convierte candidatos. No abre votaciones. No escribe en tablas oficiales durante dry-run.

## 2. Principio operativo

La rutina es incremental, recuperable y anti-timeout.

Una corrida solo puede ejecutar una unidad de trabajo:

- 1 bloque de lectura paginada; o
- hasta 20 candidatos generados; o
- hasta 20 candidatos validados; o
- selección final; o
- dry-run final; o
- upload real autorizado.

Después de emitir checkpoint, la ejecución debe terminar.

Nunca ejecutar el pipeline completo en una sola corrida.

## 3. Arquitectura final

```
precheck -> lectura paginada -> generación incremental por topic -> validación incremental -> selección 5 por topic -> dry-run -> upload controlado a staging -> revisión humana posterior
```

## 4. Topics oficiales y distribución

Topics oficiales (16):

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

Distribución:

- 5 candidatos finales por topic.
- Total final exacto: 80.
- Si algún topic tiene menos de 5 válidas antes de selección final, abortar con error descriptivo.

## 5. Archivos operativos

| Archivo | Propósito |
|---|---|
| `data/question-generator/estado_actual.md` | Estado de fase actual y avance por topic |
| `data/question-generator/preguntas_existentes.jsonl` | Corpus de preguntas ya en producción (lectura paginada) |
| `data/question-generator/preguntas_candidatas.json` | Candidatos generados pendientes de validación |
| `data/question-generator/preguntas_validas.json` | Candidatos que pasaron validación |
| `data/question-generator/preguntas_rechazadas.json` | Candidatos rechazados con motivo |
| `data/question-generator/preguntas_finales.json` | Batch final de 80 candidatos seleccionados |
| `data/question-generator/upload_result.json` | Resultado del upload real |
| `data/question-generator/qa_resultados.md` | Reporte de QA y dry-run |
| `data/question-generator/checkpoints/` | Checkpoints por fase y por topic |
| `data/question-generator/topics/` | Archivos por topic individual |

Reglas de archivos:

- Los JSON deben mantenerse válidos en todo momento.
- JSONL es preferible para corpus incremental grande.
- Los checkpoints deben permitir reanudar sin repetir trabajo ni corromper estado.
- No sobreescribir un archivo de fase sin haber completado la fase anterior.

## 6. Comandos oficiales

```bash
npm run qgen:precheck      # validar entorno y estado antes de cualquier fase
npm run qgen:read          # leer un bloque paginado de preguntas existentes
npm run qgen:generate      # generar hasta 20 candidatos
npm run qgen:validate      # validar hasta 20 candidatos
npm run qgen:select        # selección final (5 por topic)
npm run qgen:dry-run       # dry-run completo del batch final
npm run build              # verificar compilación
git diff --check           # verificar que no hay conflictos de formato
```

Upload real (requiere autorización explícita):

```bash
QGEN_UPLOAD_CONFIRM=true npm run qgen:upload
```

`qgen:upload` no debe ejecutarse salvo autorización explícita del operador.

## 7. PRE-CHECK obligatorio

Antes de cada unidad de trabajo:

1. Detectar fase desde `estado_actual.md`.
2. Detectar avance desde archivos existentes.
3. Validar existencia e integridad de archivos de fase anteriores.
4. Validar que los 16 topics oficiales estén cargados.
5. Validar que no haya conteos imposibles (ej. más de 5 finales por topic antes de selección).
6. Validar que no haya `preguntas_finales.json` antes de que `qgen:select` haya corrido.
7. Validar orden de fases:
   - `validate` no puede correr antes de `generate`.
   - `select` no puede correr antes de `validate`.
   - `dry-run` no puede correr antes de `select`.
   - `upload` no puede correr sin dry-run aprobado.
8. Si no hay estado válido: iniciar FASE 1.
9. Si hay estado válido: continuar desde la siguiente unidad pendiente.
10. Abortar ante estado inconsistente con mensaje de error descriptivo.

## 8. FASE 1 — Lectura paginada

Propósito: construir el corpus de preguntas existentes para anti-duplicado.

Reglas:

- Lectura obligatoria con LIMIT/OFFSET o paginación equivalente.
- Prohibido leer todo en una sola query.
- Procesar solo un bloque por corrida.
- Guardar avance de offset después de cada bloque.
- Normalizar textos para anti-duplicado antes de escribir.
- Escribir `preguntas_existentes.jsonl` incrementalmente (append).
- Emitir CHECKPOINT LECTURA al finalizar el bloque.
- Terminar ejecución inmediatamente después del checkpoint.

Pseudocódigo:

```sql
LOOP:
  SELECT id, titulo, descripcion
  FROM fuente_existente
  ORDER BY created_at, id
  LIMIT 100 OFFSET n

  IF rows == 0: BREAK
  normalize_and_append(rows, preguntas_existentes.jsonl)
  n += 100
  emit_checkpoint(fase="lectura", offset=n)
  STOP -- una sola iteración por corrida
```

Checkpoint de lectura:

```json
{
  "fase": "lectura",
  "offset": 100,
  "bloques_procesados": 1,
  "total_existentes": 100,
  "timestamp": "2026-06-01T00:00:00Z"
}
```

## 9. FASE 2 — Generación incremental por topic

Propósito: generar candidatos nuevos que no dupliquen existentes.

Reglas:

- Generar hasta 20 candidatos por corrida.
- Un candidato pertenece a un único topic.
- Antes de agregar un candidato, verificar fingerprint contra `preguntas_existentes.jsonl` y `preguntas_candidatas.json`.
- Si fingerprint ya existe: descartar silenciosamente.
- Aplicar patch ortográfico (`orthography.js`) en el momento de generación.
- Guardar progreso en `preguntas_candidatas.json` y en `topics/<topic>.json`.
- Actualizar `estado_actual.md` con el topic y conteo actual.
- Emitir CHECKPOINT GENERACIÓN.
- Terminar después del checkpoint.

Campos que `orthography.js` corrige en generación:

- `titulo` (formato obligatorio: `¿...?`)
- `descripcion`
- opciones visibles
- `neutrality_notes`
- `quality_notes`

Campos que `orthography.js` no toca:

- `candidate_id`
- `tipo_votacion`
- `publico_objetivo`
- `taxonomy_draft.eje_tematico`
- `taxonomy_draft.enfoque`
- `taxonomy_draft.intensidad_de_debate`
- `ideological_axis`
- `deliberative_tension`
- `duplicate_fingerprint`
- raw_payload técnico

Checkpoint de generación:

```json
{
  "fase": "generacion",
  "topic": "libertad_individual",
  "candidatos_generados": 20,
  "total_candidatas": 20,
  "timestamp": "2026-06-01T00:00:00Z"
}
```

## 10. FASE 3 — Validación incremental

Propósito: filtrar candidatos inválidos y producir `preguntas_validas.json`.

Reglas:

- Validar hasta 20 candidatos por corrida.
- Leer candidatos desde `preguntas_candidatas.json`.
- No procesar candidatos ya presentes en `preguntas_validas.json` o `preguntas_rechazadas.json`.
- Aplicar patch ortográfico (`orthography.js`) en el momento de validación.
- Candidatos rechazados deben incluir motivo en `preguntas_rechazadas.json`.
- No ejecutar en paralelo con generación.
- Emitir CHECKPOINT VALIDACIÓN.
- Terminar después del checkpoint.

Criterios de validación:

- Título con formato `¿...?`.
- Descripción no vacía.
- Al menos 2 opciones visibles.
- Topic pertenece a los 16 oficiales.
- Sin duplicado por fingerprint contra existentes y válidas.

Checkpoint de validación:

```json
{
  "fase": "validacion",
  "procesados": 20,
  "validos": 17,
  "rechazados": 3,
  "total_validas": 17,
  "timestamp": "2026-06-01T00:00:00Z"
}
```

## 11. FASE 4 — Selección final

Propósito: seleccionar exactamente 5 candidatos por topic para el batch final.

Reglas:

- Solo ejecutar cuando todos los topics tienen al menos 5 válidas.
- Si algún topic tiene menos de 5 válidas: abortar con error descriptivo.
- Aplicar patch ortográfico (`orthography.js`) en el momento de selección.
- Producir `preguntas_finales.json` con exactamente 80 candidatos.
- No ejecutar en paralelo con validación.
- No sobreescribir `preguntas_finales.json` si ya existe sin confirmación.
- Emitir CHECKPOINT SELECCIÓN.
- Terminar después del checkpoint.

Checkpoint de selección:

```json
{
  "fase": "seleccion",
  "topics": 16,
  "por_topic": 5,
  "total_finales": 80,
  "timestamp": "2026-06-01T00:00:00Z"
}
```

## 12. FASE 5 — Dry-run

Propósito: verificar que el batch de 80 candidatos es válido y apto para upload, sin escribir en tablas oficiales.

Reglas:

- Leer `preguntas_finales.json` completo.
- Verificar que contiene exactamente 80 candidatos.
- Verificar distribución: exactamente 5 por topic.
- Verificar ortografía de títulos, descripciones y opciones.
- Aplicar patch ortográfico (`orthography.js`) en el momento de dry-run.
- Simular llamada a RPC de carga (sin ejecutarla).
- Verificar que `expected_count` coincide con 80.
- Escribir resultado en `qa_resultados.md`.
- No escribir en staging ni en tablas oficiales.
- Emitir CHECKPOINT DRY-RUN.
- Terminar después del checkpoint.

Si el dry-run falla: no avanzar a upload. Registrar motivo en `qa_resultados.md`.

Checkpoint de dry-run:

```json
{
  "fase": "dry_run",
  "total_finales": 80,
  "distribucion_ok": true,
  "ortografia_ok": true,
  "expected_count_ok": true,
  "dry_run_passed": true,
  "timestamp": "2026-06-01T00:00:00Z"
}
```

## 13. FASE 6 — Upload real autorizado

Propósito: cargar el batch final a staging con autorización explícita.

Reglas:

- Solo ejecutar si dry-run fue aprobado (`dry_run_passed: true`).
- Requiere `QGEN_UPLOAD_CONFIRM=true` en entorno.
- Requiere token de usuario autorizado.
- El batch debe cargarse completo en una sola llamada a la RPC.
- La RPC exige coincidencia exacta con `expected_count` cuando existe.
- Si staging está bloqueado por RLS para anon: registrar el bloqueo como resultado esperado. No intentar evadir RLS. No elevar permisos. No usar service role.
- No publicar temas después del upload.
- No convertir candidatos después del upload.
- Revisión humana posterior obligatoria.
- Escribir resultado en `upload_result.json`.
- Emitir CHECKPOINT UPLOAD.

Checkpoint de upload:

```json
{
  "fase": "upload",
  "total_cargados": 80,
  "staging_blocked_by_rls": false,
  "upload_result": "success",
  "timestamp": "2026-06-01T00:00:00Z"
}
```

## 14. Patch ortográfico permanente

Módulo: `scripts/question-generator/orthography.js`

Está integrado obligatoriamente a:

- generación
- validación
- selección
- dry-run

Corrige:

- `titulo`
- `descripcion`
- opciones visibles
- `neutrality_notes`
- `quality_notes`

No toca:

- `candidate_id`
- `tipo_votacion`
- `publico_objetivo`
- `taxonomy_draft.eje_tematico`
- `taxonomy_draft.enfoque`
- `taxonomy_draft.intensidad_de_debate`
- `ideological_axis`
- `deliberative_tension`
- `duplicate_fingerprint`
- raw_payload técnico

Formato obligatorio de títulos: `¿...?`

Los fingerprints se calculan con `normalizeText`, que elimina tildes y puntuación antes de hashear. Agregar acentos o signo inicial no cambia la identidad normalizada del candidato.

## 15. Anti-duplicado

- `normalizeText` elimina tildes, puntuación, mayúsculas/minúsculas y espacios redundantes antes de hashear.
- El `duplicate_fingerprint` se calcula sobre el título normalizado.
- Comparar fingerprint contra: `preguntas_existentes.jsonl`, `preguntas_candidatas.json`, `preguntas_validas.json` y `preguntas_finales.json`.
- Rechazar duplicado textual (mismo fingerprint exacto).
- Rechazar duplicado semántico (contenido equivalente aunque redacción distinta).
- La corrección ortográfica (acentos, signos `¿?`) no debe alterar la identidad normalizada del candidato.

## 16. Fallos obligatorios

Abortar inmediatamente si ocurre cualquiera de estos casos:

- error de conexión;
- lectura no paginada;
- intento de SELECT masivo;
- estado inconsistente;
- archivos JSON inválidos;
- archivo JSONL corrupto;
- topics no cargados;
- topic inválido (fuera de los 16 oficiales);
- menos de 5 válidas por topic antes de selección;
- menos de 80 finales;
- más de 80 finales;
- distribución distinta de 5 por topic;
- duplicado textual detectado;
- duplicado semántico detectado;
- dry-run fallido;
- upload sin `QGEN_UPLOAD_CONFIRM=true`;
- upload sin token autorizado;
- `expected_count` distinto de 80;
- cualquier validación crítica fallida.

## 17. Formato de salida por checkpoint

Todos los checkpoints deben usar exactamente este esquema:

```json
{
  "phase": "READ|GENERATE|VALIDATE|SELECT|DRY_RUN|UPLOAD",
  "status": "checkpoint",
  "processed_count": 0,
  "accumulated_count": 0,
  "topic_progress": {},
  "next_action": "string",
  "timestamp": "ISO-8601"
}
```

## 18. Riesgos y errores típicos

- Ejecutar el pipeline completo en una sola corrida (viola principio incremental).
- Ejecutar `validate` antes de terminar `generate` (fases dependientes, puede leer archivos incompletos).
- Ejecutar `select` con válidas insuficientes (menos de 5 por topic).
- Leer toda la DB en una sola query (viola lectura paginada obligatoria).
- Romper identidad de candidatos al modificar campos técnicos (`candidate_id`, `duplicate_fingerprint`, etc.).
- Corregir ortografía manualmente solo al final (el patch debe aplicarse en cada fase).
- Usar service role para saltarse RLS (prohibido absolutamente).
- Hacer upload sin `QGEN_UPLOAD_CONFIRM=true` (upload bloqueado por defecto).
- Tratar dry-run como publicación (dry-run no escribe en tablas oficiales).
- Permitir conteos distintos de 80 (el total final es exacto e invariable).

## 19. Reglas de seguridad

- No publica temas.
- No convierte candidatos.
- No abre votaciones.
- No toca tablas oficiales durante dry-run.
- No toca votos.
- No toca `tema_sugerencias`.
- No eleva permisos.
- No usa service role para saltar RLS.
- Upload real bloqueado por defecto.
- Upload real requiere `QGEN_UPLOAD_CONFIRM=true` y token de usuario autorizado.
- Revisión humana posterior obligatoria.
- La RPC de carga exige coincidencia exacta con `expected_count` cuando existe.
- En upload real autorizado, el batch debe cargarse completo en una sola llamada.
- Si staging está bloqueado por RLS para anon, registrar el bloqueo como resultado esperado y no intentar evadirlo.
- Las fases son dependientes: `validate` debe terminar antes de `select`. No ejecutar fases dependientes en paralelo.

## 20. Flujo de ejecución incremental

```
Corrida 1:  precheck -> FASE 1 bloque 1 -> CHECKPOINT -> STOP
Corrida 2:  precheck -> FASE 1 bloque 2 -> CHECKPOINT -> STOP
...
Corrida N:  precheck -> FASE 1 completa -> continuar a FASE 2
Corrida N+1: precheck -> FASE 2 (hasta 20 candidatos) -> CHECKPOINT -> STOP
...
Corrida M:  precheck -> FASE 3 (hasta 20 validados) -> CHECKPOINT -> STOP
...
Corrida P:  precheck -> FASE 4 selección -> CHECKPOINT -> STOP
Corrida P+1: precheck -> FASE 5 dry-run -> CHECKPOINT -> STOP
Corrida P+2: (autorización explícita) precheck -> FASE 6 upload -> CHECKPOINT -> STOP
```

## 21. Estado final esperado

```json
{
  "routine_status": "functional_dry_run_ready",
  "topics": 16,
  "per_topic": 5,
  "final_candidates": 80,
  "dry_run_passed": true,
  "real_upload_executed": false,
  "next_action": "human_review_or_authorized_upload",
  "timestamp": "ISO-8601"
}
```

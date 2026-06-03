# Generador controlado de preguntas políticas

Documento técnico-operativo para orientar una implementación futura. Este archivo no implementa código, no modifica la base de datos y no define una taxonomía cerrada. Registra lo que se pudo confirmar en la estructura actual del proyecto y separa explícitamente las propuestas futuras de lo existente.

## 1. Diagnóstico de la estructura actual

### Framework detectado

La aplicación actual usa:

- React + Vite + TypeScript para el frontend.
- Supabase como backend operativo: Auth, PostgreSQL, RLS y RPC.
- Cloudflare Pages como destino de frontend estático, según `README.md`.
- Una función serverless aislada en `functions/api/restablecer-password.ts` para recuperación administrativa de acceso.

Esto se confirma en `package.json`, `README.md`, `vite.config.ts`, `src/lib/supabase.ts` y `supabase/migrations/`.

### Estructura general de carpetas

Estructura relevante encontrada:

- `src/`: aplicación React. La mayor parte de la lógica operativa vive en `src/App.tsx`.
- `src/types.ts`: tipos TypeScript del dominio, incluyendo perfiles, temas, votos y sugerencias.
- `src/lib/`: helpers de autenticación, Supabase, contacto y servicio DNI.
- `supabase/migrations/`: esquema, RLS, RPCs y reglas operativas de la base de datos.
- `functions/api/`: función serverless para restablecimiento de contraseña.
- `public/`: assets, headers, redirects, manifest y service worker.
- `Documentation/` y archivos Markdown de auditoría/arquitectura: documentación histórica y operativa.
- `docs/`: carpeta creada para este documento.

No se encontró una carpeta de servicios frontend dedicada a votaciones. La lógica está concentrada en `src/App.tsx` y la seguridad crítica está en RPCs SQL.

### Dónde está la funcionalidad de preguntas/votaciones

La app no usa actualmente una entidad llamada `pregunta`. La unidad votable real se llama `tema`.

Piezas principales:

- Modelo TypeScript:
  - `src/types.ts`: `Tema`, `Voto`, `VoteSummary`, `TemaSugerencia`.
- UI y flujos:
  - `src/App.tsx`: carga, creación, sugerencia, conversión, apertura, cierre, anulación, archivado, votación y visualización de resultados.
- Modelo persistente:
  - `supabase/migrations/005_security_hardening_and_v3.sql`: crea `temas`, `votos`, enum `estado_tema`, RLS inicial y auditoría.
  - `supabase/migrations/010_v3_voting_rpcs.sql`: define RPCs controladas de creación de tema, cambio de estado, emisión de voto y resumen.
  - `supabase/migrations/012_multiple_founders_and_topic_audience.sql`: agrega `publico_objetivo`.
  - `supabase/migrations/013_topic_suggestions.sql`: agrega `tema_sugerencias` y RPCs de sugerencia/revisión/conversión.
  - `supabase/migrations/014_voting_options.sql`: agrega `tipo_votacion` y `opciones` para votaciones por opciones múltiples.
  - `supabase/migrations/015_archive_tema.sql` y `016_fix_archive_tema_rpc.sql`: agregan y corrigen archivado de temas.

### Archivos relevantes encontrados

- `src/App.tsx`
  - `temaSelectColumns` y `temaSugerenciaSelectColumns`.
  - `loadVotingData()`: carga temas, votos propios, sugerencias y resúmenes.
  - `canVote()`: regla frontend de elegibilidad visible.
  - `handleVote()`: emite voto mediante `emitir_voto_controlado`.
  - `handleCreateTopicSuggestion()`: crea sugerencias mediante `crear_sugerencia_tema`.
  - `handleReviewTopicSuggestion()`: aprueba, rechaza o convierte sugerencias.
  - `handleCreateTopic()`: creación administrativa de temas mediante prompts.
  - `handleTopicState()`: cambia estado mediante `cambiar_estado_tema_controlado`.
  - `handleArchiveTopic()`: archiva temas cerrados o anulados mediante `archivar_tema_controlado`.
- `src/types.ts`
  - Tipos: `EstadoTema`, `PublicoObjetivoTema`, `OpcionVoto`, `TipoVotacionSugerido`, `EstadoTemaSugerencia`, `Tema`, `Voto`, `VoteSummary`, `TemaSugerencia`.
- `supabase/migrations/005_security_hardening_and_v3.sql`
  - Tablas `temas` y `votos`.
  - RLS y auditoría para temas y votos.
- `supabase/migrations/010_v3_voting_rpcs.sql`
  - RPCs base de votación V3.
- `supabase/migrations/013_topic_suggestions.sql`
  - Tabla y RPCs para sugerencias de temas.
- `supabase/migrations/014_voting_options.sql`
  - Votaciones binarias o por opciones.

### Flujo actual de una pregunta/tema hasta votación

Flujo administrativo directo:

1. Un administrador o fundador activo crea un `tema` desde el panel de administración.
2. La UI solicita título, descripción opcional, público objetivo y tipo de votación.
3. `src/App.tsx` llama a `crear_tema_controlado`.
4. La base de datos valida autorización, título, público objetivo, tipo y opciones.
5. El tema nace en estado `borrador`.
6. Un administrador/fundador abre el tema con `cambiar_estado_tema_controlado`.
7. Afiliados activos pueden votar si el tema está `abierto` y si pertenecen al público objetivo.
8. La emisión de voto se hace con `emitir_voto_controlado`.
9. La tabla `votos` impide duplicado por `tema_id` y `usuario_id`.
10. El resumen se consulta con `resumen_votos_tema`.
11. El tema puede cerrarse, anularse y luego archivarse si corresponde.

Flujo por sugerencia:

1. Un afiliado activo sugiere un tema desde la UI.
2. La UI llama a `crear_sugerencia_tema`.
3. La sugerencia queda en `tema_sugerencias` con estado `pendiente`.
4. Un administrador/fundador puede aprobar, rechazar o convertir la sugerencia.
5. Al convertirla, se crea un registro oficial en `temas` en estado `borrador`.
6. Desde ese punto sigue el flujo administrativo normal.

### Qué partes están claras

- La entidad actual para votación es `temas`, no `preguntas`.
- Los votos viven en `votos`.
- Las sugerencias viven en `tema_sugerencias`, separadas de los temas oficiales.
- La base de datos es el punto de control de autorización y validación crítica.
- Las acciones críticas usan RPCs, no `UPDATE`/`INSERT` directo desde el frontend para los cambios principales.
- Los tipos actuales de votación son `binaria` y `opciones`.
- El público objetivo actual es `afiliados` o `fundadores`.
- No se encontró taxonomía temática oficial para clasificar preguntas políticas.
- No se encontró un seed real de temas. `supabase/config.toml` referencia `./seed.sql`, pero ese archivo no existe en el árbol revisado.

### Qué partes requieren confirmación futura

- Si el producto seguirá llamando `tema` a la unidad votable o si introducirá una entidad explícita `pregunta`.
- Si las preguntas generadas se insertarán como `temas` oficiales, como `tema_sugerencias`, o en una nueva tabla de staging/revisión.
- Si se agregará taxonomía temática persistente o si la taxonomía vivirá solo en archivos de generación.
- Si se necesitan estados adicionales como `generado`, `prevalidado`, `revisado` o `aprobado_para_insercion`.
- Si se necesita un campo de batch en la base de datos para trazabilidad nativa.
- Si la revisión humana ocurrirá dentro de la app o fuera de ella mediante archivos controlados.
- Si el público objetivo futuro seguirá limitado a `afiliados` y `fundadores`.
- Si se debe exponer un módulo administrativo específico para revisar candidatos generados.

## 2. Objetivo del generador

El generador futuro no debe ser una generación libre de texto ni una inserción automática de contenido político. Debe ser una rutina controlada, incremental, auditable y recuperable para producir candidatos de preguntas políticas de calidad, validarlos y preparar lotes pequeños para revisión humana.

El propósito del generador es:

- Fomentar debate político informado.
- Cubrir diversidad temática sin fijar todavía categorías definitivas.
- Evitar sesgo partidario directo.
- Evitar propaganda.
- Evitar ataques personales.
- Evitar desinformación.
- Generar preguntas útiles para votación, deliberación o contraste de posiciones.
- Preservar trazabilidad entre corpus existente, candidatos generados, validaciones, rechazos y selección final.

En la estructura actual, el resultado más compatible sería un conjunto de candidatos que puedan mapearse a `temas` o `tema_sugerencias`. La inserción real debe quedar como fase separada y requerir aprobación explícita.

## 3. Principios operativos

El generador futuro debe cumplir estos principios:

- No modificar preguntas o temas existentes.
- No insertar directamente sin validación.
- No generar todo en una sola corrida.
- Trabajar por fases.
- Usar checkpoints.
- Mantener archivos intermedios.
- Validar contra la estructura real de la app.
- No inventar categorías definitivas.
- Separar generación, validación, selección e inserción.
- Permitir que la taxonomía política sea definida después.
- Diseñar para poder ejecutarse varias veces sin duplicar contenido.
- Priorizar trazabilidad sobre velocidad.

Principios adicionales derivados de la app actual:

- Respetar el patrón de acciones críticas por RPC.
- No saltarse RLS ni usar credenciales privilegiadas desde frontend.
- No depender de estados implícitos en la UI para decidir elegibilidad.
- Mantener la creación oficial en estado `borrador` antes de apertura.
- Registrar lotes y decisiones editoriales aunque la base de datos todavía no tenga campos dedicados.
- Comparar contra temas existentes y sugerencias existentes antes de proponer inserciones.

## 4. Taxonomía abierta

Actualmente no se encontró una taxonomía temática oficial en el modelo de votaciones. Los campos existentes `publico_objetivo` y `tipo_votacion` no son categorías políticas; describen audiencia y mecánica de voto.

La estrategia recomendada es trabajar con una taxonomía abierta en archivos intermedios, no como contrato definitivo de base de datos. Esa taxonomía debe poder cambiar sin migraciones mientras el producto define sus criterios oficiales.

Estructura conceptual futura, pendiente de aprobación:

- `eje_tematico`
- `subtema`
- `enfoque`
- `nivel_de_abstraccion`
- `intensidad_de_debate`
- `publico_objetivo`
- `tipo_de_pregunta`

Los nombres finales deben adaptarse al modelo real de la app. Por ejemplo, si la entidad sigue siendo `temas`, `tipo_de_pregunta` podría mapearse a `tipo_votacion` solo cuando exista equivalencia directa. No debe asumirse que todos los metadatos tendrán columnas persistentes.

Posibles ejes temáticos como ejemplos no definitivos:

- libertades
- instituciones públicas
- democracia
- justicia
- seguridad
- economía pública
- género
- política exterior
- descentralización
- corrupción
- servicios públicos
- medio ambiente
- partidos políticos
- reforma estatal

Otros temas posibles también deben permanecer abiertos, incluyendo Congreso, Poder Ejecutivo, Poder Judicial, gobiernos regionales y municipales, educación, salud pública, relaciones internacionales, derechos civiles y cualquier tema político que el proyecto apruebe después.

Regla operativa: el generador puede etiquetar candidatos con una taxonomía provisional, pero la selección final no debe depender de una lista cerrada hasta que el proyecto la apruebe.

## 5. Modelo esperado de pregunta

### Modelo real encontrado

El modelo actual persistente se basa en tres entidades principales.

Tabla `temas`:

- `id`: UUID primario.
- `titulo`: texto obligatorio. Mínimo actual: 4 caracteres tras normalización.
- `descripcion`: texto opcional.
- `estado`: enum `estado_tema`. Valores observados: `borrador`, `abierto`, `cerrado`, `anulado`, `archivado`.
- `creado_por`: referencia a `auth.users(id)`.
- `creado_en`: timestamp.
- `actualizado_en`: timestamp.
- `abre_en`: timestamp opcional.
- `cierra_en`: timestamp opcional.
- `publico_objetivo`: texto validado. Valores actuales: `afiliados`, `fundadores`.
- `tipo_votacion`: texto validado. Valores actuales: `binaria`, `opciones`.
- `opciones`: `text[]`. Vacío para `binaria`; mínimo 2 para `opciones`.

Tabla `votos`:

- `id`: UUID primario.
- `tema_id`: referencia a `temas(id)`.
- `usuario_id`: referencia a `perfiles(id)`.
- `opcion`: texto obligatorio.
- `creado_en`: timestamp.
- Restricción única: un voto por `tema_id` y `usuario_id`.

Tabla `tema_sugerencias`:

- `id`: UUID primario.
- `titulo`: texto obligatorio.
- `descripcion`: texto opcional.
- `tipo_votacion_sugerido`: `binaria` u `opciones`.
- `opciones_sugeridas`: JSON array.
- `created_by`: referencia a `perfiles(id)`.
- `estado`: `pendiente`, `aprobado`, `rechazado`, `convertido`.
- `revision_comentario`: texto opcional.
- `reviewed_by`: referencia a `auth.users(id)`.
- `reviewed_at`: timestamp opcional.
- `tema_id_generado`: referencia opcional a `temas(id)`.
- `created_at`: timestamp.

Tipos TypeScript relevantes:

- `Tema`
- `Voto`
- `VoteSummary`
- `TemaSugerencia`
- `EstadoTema`
- `PublicoObjetivoTema`
- `TipoVotacionSugerido`
- `EstadoTemaSugerencia`

### Validaciones actuales encontradas

- `temas.titulo` y `tema_sugerencias.titulo` requieren mínimo 4 caracteres.
- `publico_objetivo` solo acepta `afiliados` o `fundadores`.
- `tipo_votacion` solo acepta `binaria` u `opciones`.
- `opciones` requiere al menos 2 alternativas cuando `tipo_votacion = 'opciones'`.
- Las opciones sugeridas se normalizan, se deduplican y se limitan en la función `normalizar_opciones_sugeridas`.
- La emisión de voto valida que el actor tenga perfil, esté activo, sea afiliado y pertenezca al público objetivo.
- Para votación binaria, las opciones válidas son `si`, `no`, `abstencion`.
- Para votación por opciones, la opción elegida debe pertenecer al arreglo `temas.opciones`.
- La base impide más de un voto por usuario y tema.
- Las transiciones de estado se controlan por RPC.

### Campos del modelo objetivo tentativo

Propuesta futura, no existente como contrato actual:

- `id`
- `text`
- `description`
- `category`
- `subcategory`
- `topic`
- `type`
- `options`
- `status`
- `source`
- `created_by`
- `is_active`
- `created_at`
- `updated_at`

Mapeo tentativo contra el modelo actual:

- `text` podría mapearse a `temas.titulo`.
- `description` podría mapearse a `temas.descripcion`.
- `type` podría mapearse parcialmente a `temas.tipo_votacion`.
- `options` podría mapearse a `temas.opciones`.
- `status` podría mapearse a `temas.estado`.
- `created_by`, `created_at` y `updated_at` ya tienen equivalentes parciales.
- `category`, `subcategory` y `topic` no tienen columna actual confirmada.
- `source` e `is_active` no tienen equivalentes directos confirmados.

Metadatos futuros que convendría evaluar:

- `debate_intensity`
- `neutrality_score`
- `quality_score`
- `risk_flags`
- `generated_batch_id`
- `reviewed_by`
- `approved_at`

Estos campos no deben imponerse sin decisión de producto y migración explícita. En una primera versión podrían vivir en archivos intermedios de generación y revisión, no en la base de datos.

## 6. Tipos de preguntas posibles

Tipos existentes actualmente en la app:

- `binaria`: votación con `si`, `no`, `abstencion`.
- `opciones`: votación con alternativas libres definidas en `temas.opciones`.

Tipos posibles como extensiones futuras:

- Sí/no.
- Acuerdo/desacuerdo.
- Escala Likert.
- Opción múltiple.
- Priorización.
- Dilema político.
- Ranking.
- Pregunta comparativa.

Compatibilidad con el modelo actual:

- Sí/no puede representarse como `binaria`, aunque la app actual también incluye `abstencion`.
- Opción múltiple puede representarse como `opciones`.
- Acuerdo/desacuerdo podría representarse como `opciones` si se definen alternativas explícitas, pero no existe como tipo propio.
- Likert, priorización, dilema político y ranking no existen actualmente como mecánicas nativas.
- Pregunta comparativa puede existir editorialmente dentro de `titulo`/`descripcion`, pero no tiene estructura específica.

Regla recomendada: el generador solo debe emitir tipos que el adaptador de salida pueda mapear sin pérdida peligrosa. Si genera un tipo futuro no soportado por la app, debe dejarlo como candidato no insertable hasta que exista soporte real.

## 7. Reglas de calidad editorial

Una pregunta o tema candidato debe cumplir:

- Texto claro.
- Una sola idea principal.
- No inducir respuesta.
- No atacar personas.
- No favorecer explícitamente a un partido.
- No contener insultos.
- No contener afirmaciones dudosas como hechos.
- No requerir conocimiento excesivamente técnico si la app es ciudadana.
- Permitir posiciones razonables en desacuerdo.
- Fomentar deliberación.
- Evitar ambigüedad excesiva.
- Evitar duplicados textuales y semánticos.
- No mezclar dos temas incompatibles en una sola pregunta.

Reglas editoriales adicionales:

- Preferir formulaciones institucionales y de política pública sobre consignas.
- Separar hechos verificables de opiniones o valoraciones.
- Evitar absolutos innecesarios como "siempre", "nunca", "todos" o "nadie" salvo que sean parte estricta del dilema.
- Evitar preguntas que solo admitan una respuesta socialmente aceptable por presión moral.
- Evitar preguntas que dependan de un evento reciente no verificado por fuentes confiables.
- Evitar textos con jerga legal, económica o administrativa si puede formularse en lenguaje ciudadano.

Ejemplos abstractos de mala y buena formulación:

Mala:

> ¿Debe eliminarse de inmediato una institución corrupta que solo perjudica al país?

Problema: presupone corrupción total, usa carga emocional y no permite desacuerdo razonable.

Buena:

> ¿Debe reformarse el sistema de control de una institución pública para aumentar la rendición de cuentas?

Ventaja: plantea una política pública discutible sin insultos ni presuposiciones absolutas.

Mala:

> ¿Estás de acuerdo con que los enemigos de la libertad no tengan espacio en el debate público?

Problema: etiqueta a opositores como enemigos y puede justificar exclusión política.

Buena:

> ¿Debe una organización política establecer reglas internas para moderar discursos que afecten la convivencia democrática?

Ventaja: mantiene el foco en reglas, derechos y convivencia.

Mala:

> ¿Debe bajarse el gasto público y a la vez aumentar todos los servicios sin subir impuestos?

Problema: mezcla varios objetivos y puede crear una promesa fiscal incoherente.

Buena:

> ¿Qué debería priorizar el Estado cuando existen restricciones presupuestarias?

Ventaja: permite deliberar sobre prioridades sin imponer una solución.

## 8. Reglas de seguridad política y neutralidad

El generador debe evitar:

- Propaganda partidaria.
- Manipulación emocional.
- Desinformación.
- Afirmaciones falsas.
- Preguntas diseñadas para favorecer una postura.
- Odio o discriminación.
- Ataques personales.
- Persecución de grupos protegidos.
- Llamados a violencia.
- Contenido electoral sensible no validado.
- Contenido que parezca encuesta dirigida a manipular intención de voto.

El generador debe favorecer:

- Pluralidad.
- Neutralidad.
- Contraste de ideas.
- Instituciones.
- Políticas públicas.
- Derechos.
- Responsabilidades ciudadanas.
- Rendición de cuentas.
- Deliberación democrática.

Reglas operativas de seguridad:

- No usar nombres reales de políticos en candidatos generados salvo que exista una política editorial explícita y revisión humana reforzada.
- No convertir acusaciones en premisas de preguntas.
- No inferir hechos sobre grupos, partidos o autoridades sin validación externa.
- No formular preguntas que busquen perfilar intención de voto electoral.
- No generar preguntas dirigidas a persuadir a favor o en contra de una candidatura.
- Marcar con `risk_flags` cualquier candidato que trate temas sensibles, grupos protegidos, seguridad ciudadana, corrupción, género, religión, etnicidad, migración o conflicto social.
- Rechazar candidatos que usen lenguaje deshumanizante, insultante o acusatorio.

## 9. Arquitectura lógica del generador

El generador debe implementarse como pipeline por fases. Cada fase debe poder ejecutarse de manera independiente, retomar desde checkpoint y dejar evidencia de entrada, salida y decisión.

### FASE 0 — Pre-check

- Detectar estructura del proyecto.
- Detectar modelo de preguntas o temas.
- Detectar taxonomía existente si la hay.
- Validar archivos de estado.
- Decidir siguiente fase.
- Confirmar si la salida se orientará a `temas`, `tema_sugerencias` o staging externo.
- Confirmar que no se está ejecutando inserción sin aprobación explícita.
- Registrar versión del código o hash de commit si está disponible.

Salida esperada:

- Checkpoint de pre-check.
- Resumen del modelo detectado.
- Lista de campos soportados y no soportados.

### FASE 1 — Lectura del corpus existente

- Leer preguntas o temas existentes de forma segura.
- No hacer lecturas masivas si la tabla puede crecer.
- Normalizar textos.
- Guardar corpus incremental.
- Emitir checkpoint.
- Leer también `tema_sugerencias` si se quiere evitar duplicados contra sugerencias pendientes o convertidas.
- Guardar huellas normalizadas para detección de duplicados.

Recomendación para la app actual:

- Leer `temas` paginando por `creado_en` o `id`.
- Leer `tema_sugerencias` paginando por `created_at`.
- No leer `votos` para generación editorial salvo que exista una métrica explícita aprobada. Los votos pueden ser sensibles y no son necesarios para deduplicar textos.

### FASE 2 — Generación de candidatos

- Generar candidatos en lotes pequeños.
- No insertar todavía.
- Validar estructura básica.
- Guardar en archivo intermedio.
- Emitir checkpoint.
- Asociar cada candidato a una taxonomía provisional abierta.
- Incluir razón editorial breve de por qué la pregunta fomenta deliberación.
- Incluir `source = "generated"` o equivalente en el archivo intermedio.

Tamaño recomendado inicial:

- 10 a 25 candidatos por lote.
- No más de un eje temático dominante por lote si la taxonomía provisional ya existe.

### FASE 3 — Validación

- Validar schema.
- Validar taxonomía.
- Validar calidad editorial.
- Validar neutralidad.
- Validar duplicados.
- Validar mecánica de votación.
- Guardar válidas y rechazadas.
- Emitir checkpoint.

Validaciones mínimas contra la app actual:

- `titulo` no vacío y con mínimo 4 caracteres.
- `tipo_votacion` solo `binaria` u `opciones`.
- Si `tipo_votacion = "opciones"`, mínimo 2 opciones no vacías.
- Si `tipo_votacion = "binaria"`, no proponer opciones custom para inserción directa.
- `publico_objetivo` solo `afiliados` o `fundadores`, salvo que el candidato quede como no insertable.
- No duplicar títulos normalizados contra `temas` ni `tema_sugerencias`.
- No proponer estados distintos de `borrador` para inserción oficial.

### FASE 4 — Selección

- Seleccionar un lote final.
- Balancear por temas disponibles.
- Balancear por tipo de pregunta.
- Balancear por intensidad.
- Garantizar diversidad.
- Guardar archivo final.
- Separar candidatos aprobados para revisión humana de candidatos insertables técnicamente.
- Mantener explicación de selección y de descarte.

La selección debe poder producir un lote menor que el generado. Es preferible descartar de más antes que insertar contenido débil o riesgoso.

### FASE 5 — Inserción futura

- Insertar solo si existe aprobación explícita.
- Usar batch controlado.
- Confirmar cantidad exacta insertada.
- No modificar registros previos.
- Registrar batch.
- Preferir RPCs existentes o una RPC nueva específica antes que `INSERT` directo.
- Insertar en estado `borrador` si el destino es `temas`.
- Considerar insertar primero como `tema_sugerencias` o en una tabla de revisión si el flujo editorial lo exige.
- Verificar después de insertar que la cantidad y los IDs coinciden con el lote final aprobado.

En el modelo actual, la inserción compatible sería mediante `crear_tema_controlado` para temas oficiales o una rutina futura equivalente. Si se requieren metadatos como batch, scores o taxonomía, la base actual no tiene campos para persistirlos en `temas`.

## 10. Archivos de estado propuestos

Carpeta futura sugerida:

```text
data/question-generator/
```

Archivos propuestos:

- `estado_actual.md`
- `preguntas_existentes.jsonl`
- `preguntas_candidatas.json`
- `preguntas_validas.json`
- `preguntas_rechazadas.json`
- `preguntas_finales.json`
- `qa_resultados.md`
- `batches/`
- `logs/`

Ubicación pendiente de aprobación:

- La carpeta `data/question-generator/` es una propuesta, no una decisión final.
- Si el proyecto prefiere no versionar datos generados, esta carpeta podría estar fuera del repositorio o agregarse a `.gitignore`.
- Si se necesita auditoría histórica, los archivos finales y checkpoints deberían versionarse o almacenarse en un repositorio/control documental separado.

Formato recomendado para `preguntas_candidatas.json`:

```json
[
  {
    "candidate_id": "local-uuid-or-hash",
    "titulo": "Pregunta candidata",
    "descripcion": "Contexto opcional",
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "democracia",
      "subtema": null,
      "enfoque": "institucional",
      "nivel_de_abstraccion": "medio",
      "intensidad_de_debate": "moderada",
      "publico_objetivo": "afiliados",
      "tipo_de_pregunta": "si_no"
    },
    "quality_notes": "Pendiente de revision humana.",
    "risk_flags": [],
    "duplicate_fingerprint": "normalized-title-hash",
    "generated_batch_id": "batch-2026-05-29-001"
  }
]
```

Este formato no debe asumirse como modelo de base de datos. Es un formato operativo para generación, validación y revisión.

## 11. Formato de checkpoint

Cada fase debe terminar con un JSON de checkpoint. El checkpoint debe permitir retomar la ejecución sin repetir trabajo ni perder trazabilidad.

Ejemplo mínimo:

```json
{
  "phase": "FASE_2_GENERACION",
  "status": "ok",
  "processed_count": 20,
  "accumulated_count": 80,
  "next_action": "continuar_validacion",
  "timestamp": "2026-05-29T00:00:00Z"
}
```

Campos recomendados para una implementación real:

```json
{
  "phase": "FASE_3_VALIDACION",
  "status": "ok",
  "project_model": "temas_votos_tema_sugerencias",
  "input_files": [
    "data/question-generator/preguntas_candidatas.json"
  ],
  "output_files": [
    "data/question-generator/preguntas_validas.json",
    "data/question-generator/preguntas_rechazadas.json"
  ],
  "processed_count": 25,
  "accepted_count": 14,
  "rejected_count": 11,
  "accumulated_count": 64,
  "duplicate_count": 3,
  "risk_flag_count": 4,
  "next_action": "continuar_seleccion",
  "requires_human_review": true,
  "insertion_allowed": false,
  "timestamp": "2026-05-29T00:00:00Z"
}
```

Reglas para checkpoints:

- Deben escribirse al final de cada fase.
- Deben incluir conteos exactos.
- Deben registrar archivos de entrada y salida.
- Deben indicar si la inserción está prohibida o aprobada.
- Deben registrar errores recuperables y no recuperables.
- Deben permitir reanudar desde la siguiente fase sin regenerar candidatos ya procesados.
- Deben conservarse junto con logs de validación.

## Ecosistema previo al generador

La rutina generadora aún no existe en este proyecto. La fase implementada prepara una capa previa para que, más adelante, una rutina externa o interna pueda cargar candidatos sin convertirlos automáticamente en votaciones.

La arquitectura operativa queda así:

```text
generador futuro
  -> generated_topic_batches
  -> generated_topic_candidates
  -> revisión humana
  -> conversión controlada a tema_sugerencias
  -> revisión/conversión manual existente
  -> temas en borrador
  -> apertura manual por el flujo existente
```

Ningún candidato generado se abre automáticamente a votación. La conversión directa a `temas` no se implementa en v1; la salida recomendada y disponible es `tema_sugerencias`, manteniendo una revisión humana adicional antes de que exista un tema oficial.

### Migración creada

La migración `supabase/migrations/017_generated_topic_staging.sql` agrega el staging mínimo:

- `generated_topic_batches`: registra lotes de candidatos futuros.
- `generated_topic_candidates`: almacena candidatos generados antes de revisión.
- RLS en ambas tablas.
- Políticas de lectura solo para usuarios autenticados que cumplen `public.es_admin()`.
- Sin políticas directas de `insert`, `update` o `delete` desde cliente.
- RPCs `security definer` con validación interna y auditoría.

### Tablas nuevas

`generated_topic_batches` registra:

- código único de lote;
- fuente;
- perfil editorial/ideológico;
- estado;
- conteos esperados, insertados, válidos y rechazados;
- notas;
- usuario creador;
- timestamps.

Estados permitidos:

- `draft`
- `loaded`
- `under_review`
- `partially_reviewed`
- `approved`
- `rejected`
- `archived`

`generated_topic_candidates` registra:

- `titulo`, `descripcion`, `tipo_votacion`, `opciones`, `publico_objetivo`;
- `taxonomy_draft`;
- `ideological_axis`;
- `deliberative_tension`;
- `neutrality_notes`;
- `quality_notes`;
- `risk_flags`;
- `requires_source`;
- `source_required_reason`;
- `human_review_required`;
- `quality_score`;
- `neutrality_score`;
- `duplicate_fingerprint`;
- referencias de conversión a `tema_sugerencias` o `temas`.

Estados permitidos:

- `pending_review`
- `needs_changes`
- `approved`
- `rejected`
- `converted_to_suggestion`
- `converted_to_topic`
- `archived`

La restricción activa impide que `human_review_required` sea `false`. La tabla permite campos para futura evaluación editorial, pero no convierte esos campos en una taxonomía política definitiva.

### RPCs nuevas

`crear_generated_topic_batch`

- Crea un batch vacío.
- Requiere usuario autorizado por `public.es_admin()`.
- Valida `batch_code` y `expected_count`.
- Registra auditoría.

`cargar_generated_topic_candidates`

- Recibe candidatos ya generados por una rutina futura.
- No genera contenido.
- Requiere usuario autorizado.
- Valida batch existente y no cerrado.
- Valida estructura mínima de cada candidato.
- Valida `tipo_votacion`, `opciones`, `publico_objetivo`, scores, `risk_flags`, `taxonomy_draft` y `duplicate_fingerprint`.
- Si `expected_count` existe, la cantidad total cargada debe coincidir.
- Si un candidato falla, aborta toda la carga.
- Actualiza conteos del batch.
- Registra auditoría.

`revisar_generated_topic_candidate`

- Permite revisión humana.
- Acciones soportadas: `approve`, `reject`, `needs_changes`.
- Requiere usuario autorizado.
- Bloquea candidatos ya convertidos o archivados.
- Permite registrar motivo, notas y scores.
- Actualiza conteos del batch.
- Registra auditoría.

`convertir_generated_candidate_a_sugerencia`

- Convierte solo candidatos `approved`.
- Requiere revisión humana previa.
- Requiere usuario autorizado.
- Requiere que el ejecutor tenga perfil activo, rol administrador/fundador y tipo afiliado, alineado con el panel operativo actual.
- Normaliza las opciones con la función existente `normalizar_opciones_sugeridas` antes de insertar.
- Crea un registro en `tema_sugerencias` con estado inicial `pendiente`.
- Usa los nombres reales de columnas de `tema_sugerencias`.
- No crea un tema oficial.
- No abre votación.
- Registra `converted_tema_sugerencia_id`.
- Bloquea reconversión.
- Registra auditoría.

No se implementó `convertir_generated_candidate_a_tema` en v1. La conversión directa a `temas` queda como TODO técnico sujeto a decisión de producto y revisión de seguridad. Si se implementa después, debe crear siempre `temas` en `borrador` y reutilizar el patrón controlado existente.

### RLS y permisos

Reglas aplicadas:

- RLS está activada en ambas tablas nuevas.
- Usuarios comunes no pueden leer, insertar, actualizar ni eliminar staging.
- Administradores/fundadores activos pueden leer staging por política RLS basada en `public.es_admin()`.
- La creación, carga, revisión y conversión se hacen por RPCs controladas.
- No hay permisos directos de escritura para `authenticated`.
- `anon` no tiene acceso.
- Las funciones revocan ejecución pública y conceden ejecución solo a `authenticated`, con validación interna de rol.
- El frontend no contiene ni requiere `service_role`.

### UI administrativa mínima

Se agregó una sección mínima en el panel operativo:

- navegación `Generador`;
- listado de batches;
- listado filtrable de candidatos;
- aprobación;
- rechazo;
- marcado de cambios requeridos;
- conversión a `tema_sugerencias`;
- visualización de IDs convertidos.

La UI no crea preguntas, no llama IA, no carga candidatos y no abre votaciones. Solo opera sobre registros existentes en staging mediante RPCs.

### Ejes editoriales preparados

Los campos `ideological_axis` y `deliberative_tension` quedan como texto flexible para evitar migraciones constantes. Valores recomendados iniciales para futuras rutinas:

Ejes:

- `libertad_individual`
- `igualdad_ante_la_ley`
- `estado_limitado`
- `instituciones_publicas`
- `mercado_libre`
- `emprendimiento`
- `propiedad_privada`
- `desregulacion`
- `responsabilidad_fiscal`
- `anticorrupcion`
- `anti_mercantilismo`
- `seguridad_ciudadana`
- `estado_de_derecho`
- `merito_y_talento`
- `ciudadania_y_control_del_poder`
- `innovacion_y_competitividad`

Tensiones deliberativas:

- `ciudadano_vs_poder_politico`
- `libertad_individual_vs_intervencion_estatal`
- `igualdad_ante_la_ley_vs_privilegios`
- `merito_vs_clientelismo`
- `competencia_vs_mercantilismo`
- `emprendimiento_vs_burocracia`
- `propiedad_privada_vs_arbitrariedad_estatal`
- `responsabilidad_fiscal_vs_gasto_politico`
- `estado_limitado_eficaz_vs_estado_grande_ineficiente`
- `instituciones_fuertes_vs_captura_del_poder`
- `seguridad_ciudadana_vs_arbitrariedad`
- `ciudadania_activa_vs_poder_sin_control`

Estos valores son recomendaciones editoriales, no enums duros. El ecosistema permite cambiar la taxonomía futura sin migraciones constantes.

### Uso esperado por una rutina futura

Una rutina futura deberá:

1. Crear un batch con `crear_generated_topic_batch`.
2. Generar candidatos fuera de la base de datos.
3. Enviar el lote completo a `cargar_generated_topic_candidates`.
4. No marcar candidatos como aprobados por sí misma.
5. Esperar revisión humana en el panel.
6. Convertir solo candidatos aprobados a `tema_sugerencias`.
7. Dejar que el flujo existente de sugerencias y temas mantenga la apertura manual.

La rutina futura debe calcular `duplicate_fingerprint`, validar duplicados contra `temas`, `tema_sugerencias` y staging, y mantener archivos/checkpoints externos si forma parte de un pipeline por fases.

### Prueba manual sugerida

Después de aplicar la migración:

1. Confirmar que un usuario común no puede consultar `generated_topic_batches` ni `generated_topic_candidates`.
2. Confirmar que un administrador/fundador puede consultar ambas tablas.
3. Ejecutar `crear_generated_topic_batch` con un `batch_code` de prueba.
4. Ejecutar `cargar_generated_topic_candidates` con un candidato ficticio técnico, no político, solo para validación de schema.
5. Confirmar que la carga aborta completa si un candidato del array es inválido.
6. Revisar el candidato con `revisar_generated_topic_candidate`.
7. Convertir un candidato aprobado con `convertir_generated_candidate_a_sugerencia`.
8. Confirmar que la sugerencia queda `pendiente`, no como tema abierto.
9. Confirmar que el mismo candidato no puede reconvertirse.
10. Confirmar que `audit_log` registra creación de batch, carga, revisión y conversión.

No usar datos reales ni preguntas políticas reales para esta prueba de infraestructura.

### Pendientes para el generador futuro

- Definir si el generador será script local, job interno o servicio controlado.
- Definir credencial segura de ejecución sin usar `service_role` en frontend.
- Definir política final de taxonomía.
- Definir deduplicación semántica global.
- Definir criterios de fuentes para candidatos con `requires_source = true`.
- Definir si se agregará conversión directa a `temas` en `borrador`.
- Definir pruebas automatizadas de RPC/RLS si el proyecto incorpora entorno de validación de Supabase.
- Definir si los archivos externos de checkpoint se versionan o se almacenan fuera del repo.

## Recomendación final

La implementación futura debería empezar como herramienta offline o script administrativo que produzca archivos auditables, no como función automática dentro del flujo de usuario. La app actual ya tiene un patrón correcto para decisiones sensibles: el contenido oficial nace como `tema` en `borrador`, se controla por RPC, se audita y solo después puede abrirse a votación. El generador debe respetar ese patrón y agregar una capa previa de generación, revisión y selección, sin asumir todavía una taxonomía final.

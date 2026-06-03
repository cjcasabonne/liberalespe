-- ============================================================
-- upload_staging.sql
-- Generado por: rutina_optima_v5
-- batch_code:   qgen_20260602221450_1436b730
-- batch_id:     df12b30e-3ad7-426b-b6e1-14d10963f6b2
-- project_ref:  pqqkvmmenqencuretwyx
-- total:        80 candidatos × 16 topics × 5 cada uno
-- NOTA: Este SQL fue aplicado el 2026-06-02T23:15:24Z
-- Tablas prohibidas: temas, votos, tema_sugerencias, profiles, auth.users
-- ============================================================

BEGIN;

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_expected_count integer := 80;
  v_inserted integer := 0;
BEGIN

  -- Insertar batch
  INSERT INTO generated_topic_batches (
    batch_code, source, ideological_profile, status,
    expected_count, inserted_count, notes
  ) VALUES (
    'qgen_20260602221450_1436b730',
    'question_generator_v5',
    'liberal_democratic',
    'loaded',
    80,
    0,
    'Carga controlada de candidatos generados. No publica ni convierte.'
  ) RETURNING id INTO v_batch_id;

  -- Insertar 80 candidatos
  -- [1/80] topic: libertad_individual
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con libertad individual?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "libertad_individual", "subtema": "limites del poder publico", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'libertad_individual',
    'libertad_individual_vs_intervencion_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '1ff5177b2f841e78fecb713c',
    '{"topic": "libertad_individual", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con libertad individual?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "libertad_individual", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "libertad_individual", "subtema": "limites del poder publico", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "libertad_individual", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "libertad_individual_vs_intervencion_estatal", "duplicate_fingerprint": "1ff5177b2f841e78fecb713c", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [2/80] topic: libertad_individual
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre libertad individual priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "libertad_individual", "subtema": "autonomia ciudadana", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'libertad_individual',
    'libertad_individual_vs_intervencion_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'dc539124a8f8f75a35b797d7',
    '{"topic": "libertad_individual", "titulo": "¿Debe una reforma sobre libertad individual priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "libertad_individual", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "libertad_individual", "subtema": "autonomia ciudadana", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "libertad_individual", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "libertad_individual_vs_intervencion_estatal", "duplicate_fingerprint": "dc539124a8f8f75a35b797d7", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [3/80] topic: libertad_individual
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre libertad individual?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "libertad_individual", "subtema": "garantias legales", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'libertad_individual',
    'libertad_individual_vs_intervencion_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '08183cf3ff2f25277ee54c14',
    '{"topic": "libertad_individual", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre libertad individual?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "libertad_individual", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "libertad_individual", "subtema": "garantias legales", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "libertad_individual", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "libertad_individual_vs_intervencion_estatal", "duplicate_fingerprint": "08183cf3ff2f25277ee54c14", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [4/80] topic: libertad_individual
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre libertad individual?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "libertad_individual", "subtema": "limites del poder publico", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'libertad_individual',
    'libertad_individual_vs_intervencion_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'a5356df076eb4dc3c9c39879',
    '{"topic": "libertad_individual", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre libertad individual?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "libertad_individual", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "libertad_individual", "subtema": "limites del poder publico", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "libertad_individual", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "libertad_individual_vs_intervencion_estatal", "duplicate_fingerprint": "a5356df076eb4dc3c9c39879", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [5/80] topic: libertad_individual
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre libertad individual?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "libertad_individual", "subtema": "autonomia ciudadana", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'libertad_individual',
    'libertad_individual_vs_intervencion_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '8c115a7c70f9d093e254d9fb',
    '{"topic": "libertad_individual", "titulo": "¿Qué criterio debería priorizar una reforma sobre libertad individual?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "libertad_individual", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "libertad_individual", "subtema": "autonomia ciudadana", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "libertad_individual", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "libertad_individual_vs_intervencion_estatal", "duplicate_fingerprint": "8c115a7c70f9d093e254d9fb", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [6/80] topic: igualdad_ante_la_ley
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con igualdad ante la ley?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "igualdad_ante_la_ley", "subtema": "reglas generales", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'igualdad_ante_la_ley',
    'igualdad_ante_la_ley_vs_privilegios',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '420f894ccefae643ac3093ff',
    '{"topic": "igualdad_ante_la_ley", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con igualdad ante la ley?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "igualdad_ante_la_ley", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "igualdad_ante_la_ley", "subtema": "reglas generales", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "igualdad_ante_la_ley", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios", "duplicate_fingerprint": "420f894ccefae643ac3093ff", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [7/80] topic: igualdad_ante_la_ley
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre igualdad ante la ley priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "igualdad_ante_la_ley", "subtema": "privilegios legales", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'igualdad_ante_la_ley',
    'igualdad_ante_la_ley_vs_privilegios',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '0f3b3b5a5f05c1a6966607e4',
    '{"topic": "igualdad_ante_la_ley", "titulo": "¿Debe una reforma sobre igualdad ante la ley priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "igualdad_ante_la_ley", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "igualdad_ante_la_ley", "subtema": "privilegios legales", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "igualdad_ante_la_ley", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios", "duplicate_fingerprint": "0f3b3b5a5f05c1a6966607e4", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [8/80] topic: igualdad_ante_la_ley
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre igualdad ante la ley?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "igualdad_ante_la_ley", "subtema": "trato institucional", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'igualdad_ante_la_ley',
    'igualdad_ante_la_ley_vs_privilegios',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '0145d3de1d84d22eefa755d5',
    '{"topic": "igualdad_ante_la_ley", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre igualdad ante la ley?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "igualdad_ante_la_ley", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "igualdad_ante_la_ley", "subtema": "trato institucional", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "igualdad_ante_la_ley", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios", "duplicate_fingerprint": "0145d3de1d84d22eefa755d5", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [9/80] topic: igualdad_ante_la_ley
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre igualdad ante la ley?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "igualdad_ante_la_ley", "subtema": "reglas generales", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'igualdad_ante_la_ley',
    'igualdad_ante_la_ley_vs_privilegios',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'dc44cb4a246fc5a6c9422082',
    '{"topic": "igualdad_ante_la_ley", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre igualdad ante la ley?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "igualdad_ante_la_ley", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "igualdad_ante_la_ley", "subtema": "reglas generales", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "igualdad_ante_la_ley", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios", "duplicate_fingerprint": "dc44cb4a246fc5a6c9422082", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [10/80] topic: igualdad_ante_la_ley
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre igualdad ante la ley?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "igualdad_ante_la_ley", "subtema": "privilegios legales", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'igualdad_ante_la_ley',
    'igualdad_ante_la_ley_vs_privilegios',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '4966648b5809460ac2f3836b',
    '{"topic": "igualdad_ante_la_ley", "titulo": "¿Qué criterio debería priorizar una reforma sobre igualdad ante la ley?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "igualdad_ante_la_ley", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "igualdad_ante_la_ley", "subtema": "privilegios legales", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "igualdad_ante_la_ley", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios", "duplicate_fingerprint": "4966648b5809460ac2f3836b", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [11/80] topic: estado_limitado
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con límites y funciones del Estado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_limitado", "subtema": "alcance estatal", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'estado_limitado',
    'estado_limitado_eficaz_vs_estado_grande_ineficiente',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'a3b18b9ab0724106b9932cf6',
    '{"topic": "estado_limitado", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con límites y funciones del Estado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_limitado", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_limitado", "subtema": "alcance estatal", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "estado_limitado", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente", "duplicate_fingerprint": "a3b18b9ab0724106b9932cf6", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [12/80] topic: estado_limitado
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre límites y funciones del Estado priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_limitado", "subtema": "controles institucionales", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'estado_limitado',
    'estado_limitado_eficaz_vs_estado_grande_ineficiente',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '24b98d4df020255ecd862c27',
    '{"topic": "estado_limitado", "titulo": "¿Debe una reforma sobre límites y funciones del Estado priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_limitado", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_limitado", "subtema": "controles institucionales", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "estado_limitado", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente", "duplicate_fingerprint": "24b98d4df020255ecd862c27", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [13/80] topic: estado_limitado
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre límites y funciones del Estado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_limitado", "subtema": "eficacia publica", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'estado_limitado',
    'estado_limitado_eficaz_vs_estado_grande_ineficiente',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'ca780e492187273969bd47e9',
    '{"topic": "estado_limitado", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre límites y funciones del Estado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_limitado", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_limitado", "subtema": "eficacia publica", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "estado_limitado", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente", "duplicate_fingerprint": "ca780e492187273969bd47e9", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [14/80] topic: estado_limitado
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre límites y funciones del Estado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_limitado", "subtema": "alcance estatal", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'estado_limitado',
    'estado_limitado_eficaz_vs_estado_grande_ineficiente',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '7c4dde4005e715e5e9445193',
    '{"topic": "estado_limitado", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre límites y funciones del Estado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_limitado", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_limitado", "subtema": "alcance estatal", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "estado_limitado", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente", "duplicate_fingerprint": "7c4dde4005e715e5e9445193", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [15/80] topic: estado_limitado
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre límites y funciones del Estado?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_limitado", "subtema": "controles institucionales", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'estado_limitado',
    'estado_limitado_eficaz_vs_estado_grande_ineficiente',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '982f3bd7ff6aaf0512908e75',
    '{"topic": "estado_limitado", "titulo": "¿Qué criterio debería priorizar una reforma sobre límites y funciones del Estado?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_limitado", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "estado_limitado", "subtema": "controles institucionales", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "estado_limitado", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente", "duplicate_fingerprint": "982f3bd7ff6aaf0512908e75", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [16/80] topic: instituciones_publicas
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con instituciones públicas?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "instituciones_publicas", "subtema": "rendicion de cuentas", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'instituciones_publicas',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '58768eec07faa063c09f1a8b',
    '{"topic": "instituciones_publicas", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con instituciones públicas?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "instituciones_publicas", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "instituciones_publicas", "subtema": "rendicion de cuentas", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "instituciones_publicas", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "58768eec07faa063c09f1a8b", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [17/80] topic: instituciones_publicas
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre instituciones públicas priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "instituciones_publicas", "subtema": "confianza institucional", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'instituciones_publicas',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'bb42cf56d27eb4f598db9738',
    '{"topic": "instituciones_publicas", "titulo": "¿Debe una reforma sobre instituciones públicas priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "instituciones_publicas", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "instituciones_publicas", "subtema": "confianza institucional", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "instituciones_publicas", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "bb42cf56d27eb4f598db9738", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [18/80] topic: instituciones_publicas
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre instituciones públicas?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "instituciones_publicas", "subtema": "reglas de decision", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'instituciones_publicas',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'aebc721ccc92981374a4c607',
    '{"topic": "instituciones_publicas", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre instituciones públicas?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "instituciones_publicas", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "instituciones_publicas", "subtema": "reglas de decision", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "instituciones_publicas", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "aebc721ccc92981374a4c607", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [19/80] topic: instituciones_publicas
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre instituciones públicas?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "instituciones_publicas", "subtema": "rendicion de cuentas", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'instituciones_publicas',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'ffe9fad017a37d85959c4e5a',
    '{"topic": "instituciones_publicas", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre instituciones públicas?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "instituciones_publicas", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "instituciones_publicas", "subtema": "rendicion de cuentas", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "instituciones_publicas", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "ffe9fad017a37d85959c4e5a", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [20/80] topic: instituciones_publicas
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre instituciones públicas?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "instituciones_publicas", "subtema": "confianza institucional", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'instituciones_publicas',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '6a2252bea1668bf677985b22',
    '{"topic": "instituciones_publicas", "titulo": "¿Qué criterio debería priorizar una reforma sobre instituciones públicas?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "instituciones_publicas", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "instituciones_publicas", "subtema": "confianza institucional", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "instituciones_publicas", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "6a2252bea1668bf677985b22", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [21/80] topic: mercado_libre
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con competencia y mercado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "mercado_libre", "subtema": "competencia abierta", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'mercado_libre',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'b18ed99f78ea2b157bbac36d',
    '{"topic": "mercado_libre", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con competencia y mercado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "mercado_libre", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "mercado_libre", "subtema": "competencia abierta", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "mercado_libre", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "b18ed99f78ea2b157bbac36d", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [22/80] topic: mercado_libre
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre competencia y mercado priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "mercado_libre", "subtema": "barreras de entrada", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'mercado_libre',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'd63a1a53164f1dfa35b475a9',
    '{"topic": "mercado_libre", "titulo": "¿Debe una reforma sobre competencia y mercado priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "mercado_libre", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "mercado_libre", "subtema": "barreras de entrada", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "mercado_libre", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "d63a1a53164f1dfa35b475a9", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [23/80] topic: mercado_libre
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre competencia y mercado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "mercado_libre", "subtema": "consumidores", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'mercado_libre',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'c05f055b7ab371aaeedd002f',
    '{"topic": "mercado_libre", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre competencia y mercado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "mercado_libre", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "mercado_libre", "subtema": "consumidores", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "mercado_libre", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "c05f055b7ab371aaeedd002f", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [24/80] topic: mercado_libre
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre competencia y mercado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "mercado_libre", "subtema": "competencia abierta", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'mercado_libre',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '3dc015aea74347e3cead39c8',
    '{"topic": "mercado_libre", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre competencia y mercado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "mercado_libre", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "mercado_libre", "subtema": "competencia abierta", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "mercado_libre", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "3dc015aea74347e3cead39c8", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [25/80] topic: mercado_libre
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre competencia y mercado?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "mercado_libre", "subtema": "barreras de entrada", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'mercado_libre',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'bfa0587091d75b6e34318c58',
    '{"topic": "mercado_libre", "titulo": "¿Qué criterio debería priorizar una reforma sobre competencia y mercado?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "mercado_libre", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "mercado_libre", "subtema": "barreras de entrada", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "mercado_libre", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "bfa0587091d75b6e34318c58", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [26/80] topic: emprendimiento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con emprendimiento?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "emprendimiento", "subtema": "formalizacion", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'emprendimiento',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '48fb2aafecf99083cc7651d8',
    '{"topic": "emprendimiento", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con emprendimiento?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "emprendimiento", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "emprendimiento", "subtema": "formalizacion", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "emprendimiento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "48fb2aafecf99083cc7651d8", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [27/80] topic: emprendimiento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre emprendimiento priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "emprendimiento", "subtema": "burocracia", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'emprendimiento',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'e80ff3e081068d34701cd90c',
    '{"topic": "emprendimiento", "titulo": "¿Debe una reforma sobre emprendimiento priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "emprendimiento", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "emprendimiento", "subtema": "burocracia", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "emprendimiento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "e80ff3e081068d34701cd90c", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [28/80] topic: emprendimiento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre emprendimiento?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "emprendimiento", "subtema": "nuevos negocios", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'emprendimiento',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'a02b07300dec86cbcf7b1353',
    '{"topic": "emprendimiento", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre emprendimiento?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "emprendimiento", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "emprendimiento", "subtema": "nuevos negocios", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "emprendimiento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "a02b07300dec86cbcf7b1353", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [29/80] topic: emprendimiento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre emprendimiento?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "emprendimiento", "subtema": "formalizacion", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'emprendimiento',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '21c475523a9f313d87a31ba5',
    '{"topic": "emprendimiento", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre emprendimiento?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "emprendimiento", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "emprendimiento", "subtema": "formalizacion", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "emprendimiento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "21c475523a9f313d87a31ba5", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [30/80] topic: emprendimiento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre emprendimiento?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "emprendimiento", "subtema": "burocracia", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'emprendimiento',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '6095efdcca89fabeff04a6c6',
    '{"topic": "emprendimiento", "titulo": "¿Qué criterio debería priorizar una reforma sobre emprendimiento?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "emprendimiento", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "emprendimiento", "subtema": "burocracia", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "emprendimiento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "6095efdcca89fabeff04a6c6", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [31/80] topic: propiedad_privada
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con propiedad privada?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "propiedad_privada", "subtema": "seguridad juridica", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'propiedad_privada',
    'propiedad_privada_vs_arbitrariedad_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '6872c85c1b2fbd25437f0462',
    '{"topic": "propiedad_privada", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con propiedad privada?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "propiedad_privada", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "propiedad_privada", "subtema": "seguridad juridica", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "propiedad_privada", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal", "duplicate_fingerprint": "6872c85c1b2fbd25437f0462", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [32/80] topic: propiedad_privada
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre propiedad privada priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "propiedad_privada", "subtema": "uso de bienes", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'propiedad_privada',
    'propiedad_privada_vs_arbitrariedad_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '9af04f3b77030aa3ff3e0fb2',
    '{"topic": "propiedad_privada", "titulo": "¿Debe una reforma sobre propiedad privada priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "propiedad_privada", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "propiedad_privada", "subtema": "uso de bienes", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "propiedad_privada", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal", "duplicate_fingerprint": "9af04f3b77030aa3ff3e0fb2", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [33/80] topic: propiedad_privada
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre propiedad privada?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "propiedad_privada", "subtema": "garantias patrimoniales", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'propiedad_privada',
    'propiedad_privada_vs_arbitrariedad_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '88eca51ec2bed51d6f28541f',
    '{"topic": "propiedad_privada", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre propiedad privada?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "propiedad_privada", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "propiedad_privada", "subtema": "garantias patrimoniales", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "propiedad_privada", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal", "duplicate_fingerprint": "88eca51ec2bed51d6f28541f", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [34/80] topic: propiedad_privada
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre propiedad privada?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "propiedad_privada", "subtema": "seguridad juridica", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'propiedad_privada',
    'propiedad_privada_vs_arbitrariedad_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'ba939dedcbab067c64495778',
    '{"topic": "propiedad_privada", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre propiedad privada?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "propiedad_privada", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "propiedad_privada", "subtema": "seguridad juridica", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "propiedad_privada", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal", "duplicate_fingerprint": "ba939dedcbab067c64495778", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [35/80] topic: propiedad_privada
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre propiedad privada?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "propiedad_privada", "subtema": "uso de bienes", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'propiedad_privada',
    'propiedad_privada_vs_arbitrariedad_estatal',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '317979a9131e2308877b6f60',
    '{"topic": "propiedad_privada", "titulo": "¿Qué criterio debería priorizar una reforma sobre propiedad privada?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "propiedad_privada", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "propiedad_privada", "subtema": "uso de bienes", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "propiedad_privada", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal", "duplicate_fingerprint": "317979a9131e2308877b6f60", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [36/80] topic: desregulacion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con simplificación regulatoria?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "desregulacion", "subtema": "tramites", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'desregulacion',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '0de125ab9e3d5f9a8070e7e3',
    '{"topic": "desregulacion", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con simplificación regulatoria?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "desregulacion", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "desregulacion", "subtema": "tramites", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "desregulacion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "0de125ab9e3d5f9a8070e7e3", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [37/80] topic: desregulacion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre simplificación regulatoria priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "desregulacion", "subtema": "costos regulatorios", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'desregulacion',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'faeeceb35095e2faa0d6aab7',
    '{"topic": "desregulacion", "titulo": "¿Debe una reforma sobre simplificación regulatoria priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "desregulacion", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "desregulacion", "subtema": "costos regulatorios", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "desregulacion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "faeeceb35095e2faa0d6aab7", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [38/80] topic: desregulacion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre simplificación regulatoria?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "desregulacion", "subtema": "evaluacion normativa", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'desregulacion',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '75e19864d4e44108427b937b',
    '{"topic": "desregulacion", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre simplificación regulatoria?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "desregulacion", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "desregulacion", "subtema": "evaluacion normativa", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "desregulacion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "75e19864d4e44108427b937b", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [39/80] topic: desregulacion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre simplificación regulatoria?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "desregulacion", "subtema": "tramites", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'desregulacion',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '5075625d03b389842d8af97b',
    '{"topic": "desregulacion", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre simplificación regulatoria?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "desregulacion", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "desregulacion", "subtema": "tramites", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "desregulacion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "5075625d03b389842d8af97b", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [40/80] topic: desregulacion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre simplificación regulatoria?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "desregulacion", "subtema": "costos regulatorios", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'desregulacion',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '79b98c54f62547112f381725',
    '{"topic": "desregulacion", "titulo": "¿Qué criterio debería priorizar una reforma sobre simplificación regulatoria?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "desregulacion", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "desregulacion", "subtema": "costos regulatorios", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "desregulacion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "79b98c54f62547112f381725", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [41/80] topic: responsabilidad_fiscal
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con responsabilidad fiscal?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "responsabilidad_fiscal", "subtema": "gasto publico", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'responsabilidad_fiscal',
    'responsabilidad_fiscal_vs_gasto_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '7fa4e697f937a463f4adf52c',
    '{"topic": "responsabilidad_fiscal", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con responsabilidad fiscal?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "responsabilidad_fiscal", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "responsabilidad_fiscal", "subtema": "gasto publico", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "responsabilidad_fiscal", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico", "duplicate_fingerprint": "7fa4e697f937a463f4adf52c", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [42/80] topic: responsabilidad_fiscal
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre responsabilidad fiscal priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "responsabilidad_fiscal", "subtema": "deuda", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'responsabilidad_fiscal',
    'responsabilidad_fiscal_vs_gasto_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '50382b45af8452c068810987',
    '{"topic": "responsabilidad_fiscal", "titulo": "¿Debe una reforma sobre responsabilidad fiscal priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "responsabilidad_fiscal", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "responsabilidad_fiscal", "subtema": "deuda", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "responsabilidad_fiscal", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico", "duplicate_fingerprint": "50382b45af8452c068810987", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [43/80] topic: responsabilidad_fiscal
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre responsabilidad fiscal?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "responsabilidad_fiscal", "subtema": "prioridades presupuestales", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'responsabilidad_fiscal',
    'responsabilidad_fiscal_vs_gasto_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '5fe006557807409e0a682a33',
    '{"topic": "responsabilidad_fiscal", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre responsabilidad fiscal?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "responsabilidad_fiscal", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "responsabilidad_fiscal", "subtema": "prioridades presupuestales", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "responsabilidad_fiscal", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico", "duplicate_fingerprint": "5fe006557807409e0a682a33", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [44/80] topic: responsabilidad_fiscal
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre responsabilidad fiscal?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "responsabilidad_fiscal", "subtema": "gasto publico", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'responsabilidad_fiscal',
    'responsabilidad_fiscal_vs_gasto_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '8469d295dc54d7b4e02c9ed0',
    '{"topic": "responsabilidad_fiscal", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre responsabilidad fiscal?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "responsabilidad_fiscal", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "responsabilidad_fiscal", "subtema": "gasto publico", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "responsabilidad_fiscal", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico", "duplicate_fingerprint": "8469d295dc54d7b4e02c9ed0", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [45/80] topic: responsabilidad_fiscal
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre responsabilidad fiscal?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "responsabilidad_fiscal", "subtema": "deuda", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'responsabilidad_fiscal',
    'responsabilidad_fiscal_vs_gasto_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '407497c83b1aa272ffbd0a8f',
    '{"topic": "responsabilidad_fiscal", "titulo": "¿Qué criterio debería priorizar una reforma sobre responsabilidad fiscal?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "responsabilidad_fiscal", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "responsabilidad_fiscal", "subtema": "deuda", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "responsabilidad_fiscal", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico", "duplicate_fingerprint": "407497c83b1aa272ffbd0a8f", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [46/80] topic: anticorrupcion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con lucha contra la corrupción?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anticorrupcion", "subtema": "transparencia", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'anticorrupcion',
    'ciudadano_vs_poder_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'bc5b48598d419992c39efb8f',
    '{"topic": "anticorrupcion", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con lucha contra la corrupción?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anticorrupcion", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anticorrupcion", "subtema": "transparencia", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "anticorrupcion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadano_vs_poder_politico", "duplicate_fingerprint": "bc5b48598d419992c39efb8f", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [47/80] topic: anticorrupcion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre lucha contra la corrupción priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anticorrupcion", "subtema": "compras publicas", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'anticorrupcion',
    'ciudadano_vs_poder_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '136c5b28feecdb1a06cd17ba',
    '{"topic": "anticorrupcion", "titulo": "¿Debe una reforma sobre lucha contra la corrupción priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anticorrupcion", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anticorrupcion", "subtema": "compras publicas", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "anticorrupcion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadano_vs_poder_politico", "duplicate_fingerprint": "136c5b28feecdb1a06cd17ba", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [48/80] topic: anticorrupcion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre lucha contra la corrupción?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anticorrupcion", "subtema": "sanciones", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'anticorrupcion',
    'ciudadano_vs_poder_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'f57b4f5f9b7b2eb6210a2a40',
    '{"topic": "anticorrupcion", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre lucha contra la corrupción?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anticorrupcion", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anticorrupcion", "subtema": "sanciones", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "anticorrupcion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadano_vs_poder_politico", "duplicate_fingerprint": "f57b4f5f9b7b2eb6210a2a40", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [49/80] topic: anticorrupcion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre lucha contra la corrupción?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anticorrupcion", "subtema": "transparencia", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'anticorrupcion',
    'ciudadano_vs_poder_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '2dd1fc4a672b10cdb8862340',
    '{"topic": "anticorrupcion", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre lucha contra la corrupción?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anticorrupcion", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anticorrupcion", "subtema": "transparencia", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "anticorrupcion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadano_vs_poder_politico", "duplicate_fingerprint": "2dd1fc4a672b10cdb8862340", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [50/80] topic: anticorrupcion
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre lucha contra la corrupción?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anticorrupcion", "subtema": "compras publicas", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'anticorrupcion',
    'ciudadano_vs_poder_politico',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'c5c0c58e0b32e5c8d5ee5bf4',
    '{"topic": "anticorrupcion", "titulo": "¿Qué criterio debería priorizar una reforma sobre lucha contra la corrupción?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anticorrupcion", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "anticorrupcion", "subtema": "compras publicas", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "anticorrupcion", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadano_vs_poder_politico", "duplicate_fingerprint": "c5c0c58e0b32e5c8d5ee5bf4", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [51/80] topic: anti_mercantilismo
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con privilegios económicos otorgados por el Estado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anti_mercantilismo", "subtema": "competencia", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'anti_mercantilismo',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '566eeefa226a8ee7a4172d74',
    '{"topic": "anti_mercantilismo", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con privilegios económicos otorgados por el Estado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anti_mercantilismo", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anti_mercantilismo", "subtema": "competencia", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "anti_mercantilismo", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "566eeefa226a8ee7a4172d74", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [52/80] topic: anti_mercantilismo
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre privilegios económicos otorgados por el Estado priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anti_mercantilismo", "subtema": "subsidios selectivos", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'anti_mercantilismo',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '6adc73d34e4eea0e648f66ec',
    '{"topic": "anti_mercantilismo", "titulo": "¿Debe una reforma sobre privilegios económicos otorgados por el Estado priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anti_mercantilismo", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anti_mercantilismo", "subtema": "subsidios selectivos", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "anti_mercantilismo", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "6adc73d34e4eea0e648f66ec", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [53/80] topic: anti_mercantilismo
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre privilegios económicos otorgados por el Estado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anti_mercantilismo", "subtema": "captura regulatoria", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'anti_mercantilismo',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '82b14a1d0cc6bdab95e0bcb8',
    '{"topic": "anti_mercantilismo", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre privilegios económicos otorgados por el Estado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anti_mercantilismo", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anti_mercantilismo", "subtema": "captura regulatoria", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "anti_mercantilismo", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "82b14a1d0cc6bdab95e0bcb8", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [54/80] topic: anti_mercantilismo
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre privilegios económicos otorgados por el Estado?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anti_mercantilismo", "subtema": "competencia", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'anti_mercantilismo',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '8cc5262647d0fdda695aa47e',
    '{"topic": "anti_mercantilismo", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre privilegios económicos otorgados por el Estado?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anti_mercantilismo", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "anti_mercantilismo", "subtema": "competencia", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "anti_mercantilismo", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "8cc5262647d0fdda695aa47e", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [55/80] topic: anti_mercantilismo
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre privilegios económicos otorgados por el Estado?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "anti_mercantilismo", "subtema": "subsidios selectivos", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'anti_mercantilismo',
    'competencia_vs_mercantilismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'f2bf7a6de1c50e34d41a4e0d',
    '{"topic": "anti_mercantilismo", "titulo": "¿Qué criterio debería priorizar una reforma sobre privilegios económicos otorgados por el Estado?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "anti_mercantilismo", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "anti_mercantilismo", "subtema": "subsidios selectivos", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "anti_mercantilismo", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "competencia_vs_mercantilismo", "duplicate_fingerprint": "f2bf7a6de1c50e34d41a4e0d", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [56/80] topic: seguridad_ciudadana
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con seguridad ciudadana?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "seguridad_ciudadana", "subtema": "prevencion", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'seguridad_ciudadana',
    'seguridad_ciudadana_vs_arbitrariedad',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '40190c1ab53f7986da95efa3',
    '{"topic": "seguridad_ciudadana", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con seguridad ciudadana?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "seguridad_ciudadana", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "seguridad_ciudadana", "subtema": "prevencion", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "seguridad_ciudadana", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad", "duplicate_fingerprint": "40190c1ab53f7986da95efa3", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [57/80] topic: seguridad_ciudadana
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre seguridad ciudadana priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "seguridad_ciudadana", "subtema": "control del delito", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'seguridad_ciudadana',
    'seguridad_ciudadana_vs_arbitrariedad',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '9cbebf6c52a0b747ac391691',
    '{"topic": "seguridad_ciudadana", "titulo": "¿Debe una reforma sobre seguridad ciudadana priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "seguridad_ciudadana", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "seguridad_ciudadana", "subtema": "control del delito", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "seguridad_ciudadana", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad", "duplicate_fingerprint": "9cbebf6c52a0b747ac391691", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [58/80] topic: seguridad_ciudadana
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre seguridad ciudadana?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "seguridad_ciudadana", "subtema": "garantias ciudadanas", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'seguridad_ciudadana',
    'seguridad_ciudadana_vs_arbitrariedad',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '0775db84f6a96821a7a4371e',
    '{"topic": "seguridad_ciudadana", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre seguridad ciudadana?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "seguridad_ciudadana", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "seguridad_ciudadana", "subtema": "garantias ciudadanas", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "seguridad_ciudadana", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad", "duplicate_fingerprint": "0775db84f6a96821a7a4371e", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [59/80] topic: seguridad_ciudadana
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre seguridad ciudadana?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "seguridad_ciudadana", "subtema": "prevencion", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'seguridad_ciudadana',
    'seguridad_ciudadana_vs_arbitrariedad',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'baa86865478f4316c3fb6884',
    '{"topic": "seguridad_ciudadana", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre seguridad ciudadana?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "seguridad_ciudadana", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "seguridad_ciudadana", "subtema": "prevencion", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "seguridad_ciudadana", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad", "duplicate_fingerprint": "baa86865478f4316c3fb6884", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [60/80] topic: seguridad_ciudadana
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre seguridad ciudadana?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "seguridad_ciudadana", "subtema": "control del delito", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'seguridad_ciudadana',
    'seguridad_ciudadana_vs_arbitrariedad',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '4bbe772036bea98760ed66e5',
    '{"topic": "seguridad_ciudadana", "titulo": "¿Qué criterio debería priorizar una reforma sobre seguridad ciudadana?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "seguridad_ciudadana", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "seguridad_ciudadana", "subtema": "control del delito", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "seguridad_ciudadana", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad", "duplicate_fingerprint": "4bbe772036bea98760ed66e5", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [61/80] topic: estado_de_derecho
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con Estado de derecho?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_de_derecho", "subtema": "debido proceso", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'estado_de_derecho',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '56ce9f406f9658a970d158a0',
    '{"topic": "estado_de_derecho", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con Estado de derecho?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_de_derecho", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_de_derecho", "subtema": "debido proceso", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "estado_de_derecho", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "56ce9f406f9658a970d158a0", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [62/80] topic: estado_de_derecho
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre Estado de derecho priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_de_derecho", "subtema": "cumplimiento de normas", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'estado_de_derecho',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'd58963eb281609b18495c414',
    '{"topic": "estado_de_derecho", "titulo": "¿Debe una reforma sobre Estado de derecho priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_de_derecho", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_de_derecho", "subtema": "cumplimiento de normas", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "estado_de_derecho", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "d58963eb281609b18495c414", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [63/80] topic: estado_de_derecho
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre Estado de derecho?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_de_derecho", "subtema": "independencia institucional", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'estado_de_derecho',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'f1c1dc7bee0919291f0bc8b1',
    '{"topic": "estado_de_derecho", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre Estado de derecho?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_de_derecho", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_de_derecho", "subtema": "independencia institucional", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "estado_de_derecho", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "f1c1dc7bee0919291f0bc8b1", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [64/80] topic: estado_de_derecho
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre Estado de derecho?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_de_derecho", "subtema": "debido proceso", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'estado_de_derecho',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '470bd9f31227f2bd05b779ef',
    '{"topic": "estado_de_derecho", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre Estado de derecho?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_de_derecho", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "estado_de_derecho", "subtema": "debido proceso", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "estado_de_derecho", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "470bd9f31227f2bd05b779ef", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [65/80] topic: estado_de_derecho
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre Estado de derecho?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "estado_de_derecho", "subtema": "cumplimiento de normas", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'estado_de_derecho',
    'instituciones_fuertes_vs_captura_del_poder',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '7c7508851ffd32d627c42f49',
    '{"topic": "estado_de_derecho", "titulo": "¿Qué criterio debería priorizar una reforma sobre Estado de derecho?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "estado_de_derecho", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "estado_de_derecho", "subtema": "cumplimiento de normas", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "estado_de_derecho", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder", "duplicate_fingerprint": "7c7508851ffd32d627c42f49", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [66/80] topic: merito_y_talento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con mérito en el sector público?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "merito_y_talento", "subtema": "servicio civil", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'merito_y_talento',
    'merito_vs_clientelismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '59a7289bf8dc5cc6ecc7d862',
    '{"topic": "merito_y_talento", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con mérito en el sector público?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "merito_y_talento", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "merito_y_talento", "subtema": "servicio civil", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "merito_y_talento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "merito_vs_clientelismo", "duplicate_fingerprint": "59a7289bf8dc5cc6ecc7d862", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [67/80] topic: merito_y_talento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre mérito en el sector público priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "merito_y_talento", "subtema": "evaluacion de desempeno", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'merito_y_talento',
    'merito_vs_clientelismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '041fdeb05602eab249a337b6',
    '{"topic": "merito_y_talento", "titulo": "¿Debe una reforma sobre mérito en el sector público priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "merito_y_talento", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "merito_y_talento", "subtema": "evaluacion de desempeno", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "merito_y_talento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "merito_vs_clientelismo", "duplicate_fingerprint": "041fdeb05602eab249a337b6", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [68/80] topic: merito_y_talento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre mérito en el sector público?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "merito_y_talento", "subtema": "nombramientos", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'merito_y_talento',
    'merito_vs_clientelismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'fda02a0343044e2a5f9ae7fd',
    '{"topic": "merito_y_talento", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre mérito en el sector público?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "merito_y_talento", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "merito_y_talento", "subtema": "nombramientos", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "merito_y_talento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "merito_vs_clientelismo", "duplicate_fingerprint": "fda02a0343044e2a5f9ae7fd", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [69/80] topic: merito_y_talento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre mérito en el sector público?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "merito_y_talento", "subtema": "servicio civil", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'merito_y_talento',
    'merito_vs_clientelismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '016f2f8e8ccf5058f0e220dc',
    '{"topic": "merito_y_talento", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre mérito en el sector público?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "merito_y_talento", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "merito_y_talento", "subtema": "servicio civil", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "merito_y_talento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "merito_vs_clientelismo", "duplicate_fingerprint": "016f2f8e8ccf5058f0e220dc", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [70/80] topic: merito_y_talento
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre mérito en el sector público?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "merito_y_talento", "subtema": "evaluacion de desempeno", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'merito_y_talento',
    'merito_vs_clientelismo',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '96186a2418b02512a8442f6e',
    '{"topic": "merito_y_talento", "titulo": "¿Qué criterio debería priorizar una reforma sobre mérito en el sector público?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "merito_y_talento", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "merito_y_talento", "subtema": "evaluacion de desempeno", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "merito_y_talento", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "merito_vs_clientelismo", "duplicate_fingerprint": "96186a2418b02512a8442f6e", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [71/80] topic: ciudadania_y_control_del_poder
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con control ciudadano del poder?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "fiscalizacion ciudadana", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'ciudadania_y_control_del_poder',
    'ciudadania_activa_vs_poder_sin_control',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '7a33f8d9c4eae0baec165d62',
    '{"topic": "ciudadania_y_control_del_poder", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con control ciudadano del poder?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "ciudadania_y_control_del_poder", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "fiscalizacion ciudadana", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "ciudadania_y_control_del_poder", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadania_activa_vs_poder_sin_control", "duplicate_fingerprint": "7a33f8d9c4eae0baec165d62", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [72/80] topic: ciudadania_y_control_del_poder
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre control ciudadano del poder priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "acceso a informacion", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'ciudadania_y_control_del_poder',
    'ciudadania_activa_vs_poder_sin_control',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '5e84e9741725bb572987ccf0',
    '{"topic": "ciudadania_y_control_del_poder", "titulo": "¿Debe una reforma sobre control ciudadano del poder priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "ciudadania_y_control_del_poder", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "acceso a informacion", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "ciudadania_y_control_del_poder", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadania_activa_vs_poder_sin_control", "duplicate_fingerprint": "5e84e9741725bb572987ccf0", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [73/80] topic: ciudadania_y_control_del_poder
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre control ciudadano del poder?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "responsabilidad politica", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'ciudadania_y_control_del_poder',
    'ciudadania_activa_vs_poder_sin_control',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '36aae7a765b35087121dd4ce',
    '{"topic": "ciudadania_y_control_del_poder", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre control ciudadano del poder?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "ciudadania_y_control_del_poder", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "responsabilidad politica", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "ciudadania_y_control_del_poder", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadania_activa_vs_poder_sin_control", "duplicate_fingerprint": "36aae7a765b35087121dd4ce", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [74/80] topic: ciudadania_y_control_del_poder
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre control ciudadano del poder?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "fiscalizacion ciudadana", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'ciudadania_y_control_del_poder',
    'ciudadania_activa_vs_poder_sin_control',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'ee94f25a41864c14cc93c5a3',
    '{"topic": "ciudadania_y_control_del_poder", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre control ciudadano del poder?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "ciudadania_y_control_del_poder", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "fiscalizacion ciudadana", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "ciudadania_y_control_del_poder", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadania_activa_vs_poder_sin_control", "duplicate_fingerprint": "ee94f25a41864c14cc93c5a3", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [75/80] topic: ciudadania_y_control_del_poder
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre control ciudadano del poder?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "acceso a informacion", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'ciudadania_y_control_del_poder',
    'ciudadania_activa_vs_poder_sin_control',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '1ccca3966195b035df6b85bc',
    '{"topic": "ciudadania_y_control_del_poder", "titulo": "¿Qué criterio debería priorizar una reforma sobre control ciudadano del poder?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "ciudadania_y_control_del_poder", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "ciudadania_y_control_del_poder", "subtema": "acceso a informacion", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "ciudadania_y_control_del_poder", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "ciudadania_activa_vs_poder_sin_control", "duplicate_fingerprint": "1ccca3966195b035df6b85bc", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [76/80] topic: innovacion_y_competitividad
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con innovación y competitividad?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "innovacion_y_competitividad", "subtema": "competitividad", "enfoque": "institucional", "intensidad_de_debate": "moderada"}'::jsonb,
    'innovacion_y_competitividad',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Evalúa límites al poder público sin inducir una respuesta.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '5c86feeca72fa6ebb06b6b20',
    '{"topic": "innovacion_y_competitividad", "titulo": "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con innovación y competitividad?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "innovacion_y_competitividad", "per_topic_target": 5, "template_index": 0}, "quality_notes": "Evalúa límites al poder público sin inducir una respuesta.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "innovacion_y_competitividad", "subtema": "competitividad", "enfoque": "institucional", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "innovacion_y_competitividad", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "5c86feeca72fa6ebb06b6b20", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [77/80] topic: innovacion_y_competitividad
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe una reforma sobre innovación y competitividad priorizar reglas generales antes que beneficios para grupos específicos?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "innovacion_y_competitividad", "subtema": "reglas para innovar", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'innovacion_y_competitividad',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Contrasta reglas generales y excepciones sin atacar actores.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '7f0542dee7dd16cfb6bd29a6',
    '{"topic": "innovacion_y_competitividad", "titulo": "¿Debe una reforma sobre innovación y competitividad priorizar reglas generales antes que beneficios para grupos específicos?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "innovacion_y_competitividad", "per_topic_target": 5, "template_index": 1}, "quality_notes": "Contrasta reglas generales y excepciones sin atacar actores.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "innovacion_y_competitividad", "subtema": "reglas para innovar", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "innovacion_y_competitividad", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "7f0542dee7dd16cfb6bd29a6", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [78/80] topic: innovacion_y_competitividad
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre innovación y competitividad?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "innovacion_y_competitividad", "subtema": "productividad", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}'::jsonb,
    'innovacion_y_competitividad',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Promueve rendición de cuentas con lenguaje neutral.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '6398f1520f6662feab331386',
    '{"topic": "innovacion_y_competitividad", "titulo": "¿Debe la ciudadanía contar con reportes simples para evaluar resultados sobre innovación y competitividad?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "innovacion_y_competitividad", "per_topic_target": 5, "template_index": 2}, "quality_notes": "Promueve rendición de cuentas con lenguaje neutral.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "innovacion_y_competitividad", "subtema": "productividad", "enfoque": "ciudadano", "intensidad_de_debate": "baja"}, "requires_source": false, "ideological_axis": "innovacion_y_competitividad", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "6398f1520f6662feab331386", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [79/80] topic: innovacion_y_competitividad
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre innovación y competitividad?',
    NULL,
    'binaria',
    '[]'::jsonb,
    'afiliados',
    '{"eje_tematico": "innovacion_y_competitividad", "subtema": "competitividad", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}'::jsonb,
    'innovacion_y_competitividad',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Introduce costo fiscal y regulatorio como criterio deliberativo.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    'a2cb07e00633ae0b88ebf356',
    '{"topic": "innovacion_y_competitividad", "titulo": "¿Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre innovación y competitividad?", "opciones": [], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "innovacion_y_competitividad", "per_topic_target": 5, "template_index": 3}, "quality_notes": "Introduce costo fiscal y regulatorio como criterio deliberativo.", "quality_score": null, "tipo_votacion": "binaria", "taxonomy_draft": {"eje_tematico": "innovacion_y_competitividad", "subtema": "competitividad", "enfoque": "politica_publica", "intensidad_de_debate": "moderada"}, "requires_source": false, "ideological_axis": "innovacion_y_competitividad", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "a2cb07e00633ae0b88ebf356", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- [80/80] topic: innovacion_y_competitividad
  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones,
    publico_objetivo, taxonomy_draft, ideological_axis,
    deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason,
    human_review_required, duplicate_fingerprint, raw_payload,
    status
  ) VALUES (
    v_batch_id,
    '¿Qué criterio debería priorizar una reforma sobre innovación y competitividad?',
    NULL,
    'opciones',
    '["Reglas simples y fiscalizables", "Controles administrativos más detallados"]'::jsonb,
    'afiliados',
    '{"eje_tematico": "innovacion_y_competitividad", "subtema": "reglas para innovar", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}'::jsonb,
    'innovacion_y_competitividad',
    'emprendimiento_vs_burocracia',
    'Redacción deliberativa sin llamados partidarios ni ataque personal.',
    'Ofrece alternativas institucionales comparables.',
    '[]'::jsonb,
    false,
    NULL,
    true,
    '3943a57a3ea21bcc32555cc6',
    '{"topic": "innovacion_y_competitividad", "titulo": "¿Qué criterio debería priorizar una reforma sobre innovación y competitividad?", "opciones": ["Reglas simples y fiscalizables", "Controles administrativos más detallados"], "risk_flags": [], "descripcion": null, "raw_payload": {"generator_version": "v1", "topic_target": "innovacion_y_competitividad", "per_topic_target": 5, "template_index": 4}, "quality_notes": "Ofrece alternativas institucionales comparables.", "quality_score": null, "tipo_votacion": "opciones", "taxonomy_draft": {"eje_tematico": "innovacion_y_competitividad", "subtema": "reglas para innovar", "enfoque": "politica_publica", "intensidad_de_debate": "alta"}, "requires_source": false, "ideological_axis": "innovacion_y_competitividad", "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.", "neutrality_score": null, "publico_objetivo": "afiliados", "deliberative_tension": "emprendimiento_vs_burocracia", "duplicate_fingerprint": "3943a57a3ea21bcc32555cc6", "human_review_required": true, "source_required_reason": null, "status": "pending_review"}'::jsonb,
    'pending_review'
  );

  -- Validar conteo
  SELECT COUNT(*) INTO v_inserted
  FROM generated_topic_candidates
  WHERE batch_id = v_batch_id;

  IF v_inserted <> v_expected_count THEN
    RAISE EXCEPTION 'ERROR: inserted_count=% expected=%', v_inserted, v_expected_count;
  END IF;

  -- Actualizar batch status a loaded
  UPDATE generated_topic_batches
  SET status = 'loaded', inserted_count = v_inserted, updated_at = now()
  WHERE id = v_batch_id;

END $qgen$;

COMMIT;
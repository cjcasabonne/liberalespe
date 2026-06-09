BEGIN;

-- ARTEFACTO GENERADO POR qgen:prepare-upload
-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias
-- Ejecutar solo via: set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload
-- batch_code: qgen_20260609103631_3040e9e3

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := 'qgen_20260609103631_3040e9e3';
  v_expected_count integer := 80;
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$[
  {
    "topic": "libertad_individual",
    "titulo": "¿Deben las políticas de libertad individual evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "limites del poder publico",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9e15dc991609a3323dc10a6b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en libertad individual a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "autonomia ciudadana",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f7344c930a5d6934894497ca",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a libertad individual?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "garantias legales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "df72cf21b4f6546fbd7bdca0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe el Estado limitar su intervención en libertad individual a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "limites del poder publico",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a963e0289a74818711df56c7",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre libertad individual?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "autonomia ciudadana",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8620c947003bc296cc69253f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Deben las políticas de igualdad ante la ley evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "reglas generales",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "517ffd4869e4bb985f4f8d5b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en igualdad ante la ley a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "privilegios legales",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3342139059f4e19eac4470d5",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "trato institucional",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8af24c56d8c0bd3cc0f24e9f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe el Estado limitar su intervención en igualdad ante la ley a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "reglas generales",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "63713b9f90042e82bc1bacd6",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "privilegios legales",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5642753ad83e575bc538bb66",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Deben las políticas de límites y funciones del Estado evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "alcance estatal",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ec03d6bce4acfb39643e4662",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en límites y funciones del Estado a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "controles institucionales",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9b9caada638cff2a736c90d8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "eficacia publica",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3ebb172c5e5a7ef228d12b55",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe el Estado limitar su intervención en límites y funciones del Estado a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "alcance estatal",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4b81be7a6a729bb770f3968d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "controles institucionales",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "0f9fe4a074221edd361fa38d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Deben las políticas de instituciones públicas evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "rendicion de cuentas",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "eeeeea596e80ca103f35d874",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en instituciones públicas a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "confianza institucional",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "2b410a362d65dba307d28e7e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "reglas de decision",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4a60d94f15c303dc6c1128ed",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe el Estado limitar su intervención en instituciones públicas a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "rendicion de cuentas",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7fc948cb92937067fd3b4d88",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "confianza institucional",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6ad71c6d79c6fb295dceff64",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Deben las políticas de competencia y mercado evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "competencia abierta",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "458c6fcc08c701004dd42308",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en competencia y mercado a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "barreras de entrada",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d94293349d8276b318cd15a4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "consumidores",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "692192af7aa2856c539c1ced",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe el Estado limitar su intervención en competencia y mercado a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "competencia abierta",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "76e72622fb3dbad4f710d81f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "barreras de entrada",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "120552578981c7f708ca5d77",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Deben las políticas de emprendimiento evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "formalizacion",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "17bee210eec974371d6fb107",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en emprendimiento a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "burocracia",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cd5950ac359d3651d0169bb7",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "nuevos negocios",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "30589399d80a561194fffe13",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe el Estado limitar su intervención en emprendimiento a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "formalizacion",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "51fe722385ed52e0563afadc",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "burocracia",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "12761952065bc97edde9675c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Deben las políticas de propiedad privada evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "seguridad juridica",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "57166ce9fb11619012276fdd",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en propiedad privada a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "uso de bienes",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cbda30b4b753d2b09a8ebf8c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "garantias patrimoniales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c74a53ef0b7e6cdca7eebdbf",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe el Estado limitar su intervención en propiedad privada a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "seguridad juridica",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6e37691d7e8d9c7fa4b574a1",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "uso de bienes",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "659d62b8bf4e0b560bf16b56",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Deben las políticas de simplificación regulatoria evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "tramites",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "05103bfd0dd351715f8ee99b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en simplificación regulatoria a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "costos regulatorios",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ca86f4dcf38fba8f0c731b8d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "evaluacion normativa",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "df446a7e634061efcbd3bdc2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe el Estado limitar su intervención en simplificación regulatoria a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "tramites",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c37bd7735d0b711e131c87ff",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "costos regulatorios",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d34f16e30b700485bd18f7e1",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Deben las políticas de responsabilidad fiscal evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "gasto publico",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a145b1ca59f78637b575667a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en responsabilidad fiscal a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "deuda",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6d7dbc6ba483287df265e139",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "prioridades presupuestales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "af318a104657792d1627afe2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe el Estado limitar su intervención en responsabilidad fiscal a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "gasto publico",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d15f0ca2fe7132cfba8c653f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "deuda",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6ae9be3d1ef5ffd7cd2cb3ed",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Deben las políticas de lucha contra la corrupción evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "transparencia",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f9718a7eedea997be73d076c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en lucha contra la corrupción a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "compras publicas",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "2617641d3c0cbe4444d981cd",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "sanciones",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5b02719081ae70a30ebfb026",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe el Estado limitar su intervención en lucha contra la corrupción a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "transparencia",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "639a9c6bc96b5ecee141da8f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "compras publicas",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8e3a0b3c7a67f65ddbc78a4c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Deben las políticas de privilegios económicos otorgados por el Estado evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "competencia",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5b58b7f050f7ef568a2c4e04",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en privilegios económicos otorgados por el Estado a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "subsidios selectivos",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "aac993c6b79bbc9abd405473",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "captura regulatoria",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "68b394f1eab84aa888eb7727",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe el Estado limitar su intervención en privilegios económicos otorgados por el Estado a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "competencia",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "19cebbc67dd9f201446ab495",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "subsidios selectivos",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4e84a8358d41eedfae7a90fc",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Deben las políticas de seguridad ciudadana evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "prevencion",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "bddf91d3c3e3e7f878dca3db",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en seguridad ciudadana a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "control del delito",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "57bbf37ec42a2b18c978aa33",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "garantias ciudadanas",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "00bbf693028a976bcbe9348e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe el Estado limitar su intervención en seguridad ciudadana a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "prevencion",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6e07e6be7facf6d6af47605d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "control del delito",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9f6ae095cc28dc9be8388d7c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Deben las políticas de Estado de derecho evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "debido proceso",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "eb6dca866c6fb1ad657d1023",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en Estado de derecho a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "cumplimiento de normas",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8869d3379bebbc7174a2e1fb",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "independencia institucional",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "295ae451d389057f5bbae99e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe el Estado limitar su intervención en Estado de derecho a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "debido proceso",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "0e7042d11158ec3e6fb2b634",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "cumplimiento de normas",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4b1e4aed0d698b8efa9789a6",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Deben las políticas de mérito en el sector público evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "servicio civil",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "1440d7346a2ccc3727b80e99",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en mérito en el sector público a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "evaluacion de desempeno",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9c693bf69a88d7ad09ac602d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "nombramientos",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ac4d887dd95712f5aa7f8241",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe el Estado limitar su intervención en mérito en el sector público a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "servicio civil",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d6fa2a40c60d8789b8a5913d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "evaluacion de desempeno",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cb0fc731ba3972067281c330",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Deben las políticas de control ciudadano del poder evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "fiscalizacion ciudadana",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7d55d5012769b0ee2f389388",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en control ciudadano del poder a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "acceso a informacion",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9d59cb846a419a9e7e814fdf",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "responsabilidad politica",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "830cee62dd56008e95c67d68",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe el Estado limitar su intervención en control ciudadano del poder a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "fiscalizacion ciudadana",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c309462a585db99680c9581a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "acceso a informacion",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "020f02c16abec59558a0466b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 13
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Deben las políticas de innovación y competitividad evaluarse comparativamente frente a estandares internacionales para identificar mejores practicas aplicables?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "competitividad",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Orienta la discusión hacia benchmarking sin prescribir resultado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c29a7228e95303a8633909c9",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 9
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe condicionarse el incremento del presupuesto en innovación y competitividad a una evaluación independiente que certifique el uso eficiente de los recursos previos?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "reglas para innovar",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce eficiencia presupuestal como requisito sin sesgo ideologico.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7326379c66bb313d6fae3151",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 10
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Deben eliminarse los requisitos diferenciados que generan ventajas injustificadas para ciertos grupos en el acceso a innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "productividad",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en igualdad ante las normas sin atacar colectivos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ecdba75699c83f21948c6c5c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 11
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe el Estado limitar su intervención en innovación y competitividad a los casos donde exista evidencia de falla de mercado o dano verificable a terceros?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "competitividad",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Debate el alcance del Estado con criterio empirico y sin retórica.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "aea7e1a4a161d239f9301936",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 12
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Qué enfoque debería guiar la reforma de las normas sobre innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Simplificar unificando normas dispersas en un solo marco legal",
      "Mantener regulaciones especializadas con mejor coordinacion"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "reglas para innovar",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Ofrece dos rutas de reforma comparables sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "50a8436c5f578603d8f6c13e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 13
    }
  }
]$json_payload$::jsonb;
BEGIN
  IF EXISTS (
    SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code
  ) THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;
  END IF;

  INSERT INTO generated_topic_batches (
    batch_code, source, ideological_profile, status, expected_count, notes, created_at
  ) VALUES (
    v_batch_code,
    'question-generator',
    'liberal_democratic',
    'draft',
    v_expected_count,
    'Generado por qgen:prepare-upload. No toca temas, votos ni tema_sugerencias.',
    now()
  ) RETURNING id INTO v_batch_id;

  INSERT INTO generated_topic_candidates (
    batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,
    taxonomy_draft, ideological_axis, deliberative_tension, neutrality_notes, quality_notes,
    risk_flags, requires_source, source_required_reason, human_review_required,
    quality_score, neutrality_score, duplicate_fingerprint, raw_payload
  )
  SELECT
    v_batch_id,
    rec->>'titulo',
    nullif(btrim(coalesce(rec->>'descripcion', '')), ''),
    rec->>'tipo_votacion',
    coalesce(rec->'opciones', '[]'::jsonb),
    rec->>'publico_objetivo',
    coalesce(rec->'taxonomy_draft', '{}'::jsonb),
    nullif(btrim(coalesce(rec->>'ideological_axis', '')), ''),
    nullif(btrim(coalesce(rec->>'deliberative_tension', '')), ''),
    nullif(btrim(coalesce(rec->>'neutrality_notes', '')), ''),
    nullif(btrim(coalesce(rec->>'quality_notes', '')), ''),
    coalesce(rec->'risk_flags', '[]'::jsonb),
    coalesce((nullif(rec->>'requires_source', ''))::boolean, false),
    nullif(btrim(coalesce(rec->>'source_required_reason', '')), ''),
    true,
    (nullif(rec->>'quality_score', ''))::integer,
    (nullif(rec->>'neutrality_score', ''))::integer,
    rec->>'duplicate_fingerprint',
    rec
  FROM jsonb_array_elements(v_candidates) AS rec;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'conteo_invalido: insertados %, esperados %', v_inserted_count, v_expected_count;
  END IF;

  SELECT COUNT(*) INTO v_dup_count
  FROM (
    SELECT duplicate_fingerprint
    FROM generated_topic_candidates
    WHERE batch_id = v_batch_id
    GROUP BY duplicate_fingerprint
    HAVING COUNT(*) > 1
  ) d;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'duplicados_detectados_por_fingerprint: %', v_dup_count;
  END IF;

  UPDATE generated_topic_batches
  SET status = 'loaded', inserted_count = v_inserted_count, updated_at = now()
  WHERE id = v_batch_id;
END $qgen$;

COMMIT;

BEGIN;

-- ARTEFACTO GENERADO POR qgen:prepare-upload
-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias
-- Ejecutar solo via: set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload
-- batch_code: qgen_20260613104430_70201636

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := 'qgen_20260613104430_70201636';
  v_expected_count integer := 80;
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$[
  {
    "topic": "libertad_individual",
    "titulo": "¿Deben los responsables de políticas sobre libertad individual responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "limites del poder publico",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "297a0c68b6926a9187bda39c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a libertad individual si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "autonomia ciudadana",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "32a9c71ad42d46f746d5fed5",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten libertad individual?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "garantias legales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a0993501fae0c2fb622a0c00",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre libertad individual?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7293ec3a159f9f783e9c69c8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en libertad individual?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "autonomia ciudadana",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ed4456af6f942fc2392d3b0c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Deben los responsables de políticas sobre igualdad ante la ley responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "reglas generales",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7ab40110123c5dd62c2cf113",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a igualdad ante la ley si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "privilegios legales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f31143f3dfec8161486d34ed",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "trato institucional",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8565c1da6cff775ec5f873a8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre igualdad ante la ley?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "06005bafed417578c0b762c0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "privilegios legales",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5bb8d4e851e7743c823dadb8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Deben los responsables de políticas sobre límites y funciones del Estado responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "alcance estatal",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "af095d44c9fe6a83ae636b74",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a límites y funciones del Estado si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "controles institucionales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "00f90472a7fcdce85cbac41d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "eficacia publica",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b530968ec7ed648bda9fee3a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre límites y funciones del Estado?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b8f16270172673ac0177c037",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "controles institucionales",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3c0ccca635644bb5833f040d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Deben los responsables de políticas sobre instituciones públicas responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "rendicion de cuentas",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4b97674b23f83dbc72da7baa",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a instituciones públicas si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "confianza institucional",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "02719cc54cc316839eb6a0dc",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "reglas de decision",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4b2ea8f23924a287fc8bfac8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre instituciones públicas?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "1f229f1bfa245ff0718c9599",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "confianza institucional",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4b1687514fe914b113cd6c8c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Deben los responsables de políticas sobre competencia y mercado responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "competencia abierta",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "417d980c60852c723b89aa7f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a competencia y mercado si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "barreras de entrada",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6a82dd115e020a09dfebaee5",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "consumidores",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fbc0f92437c4af9b285be92d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre competencia y mercado?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "813a73b319737e1eb4496203",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "barreras de entrada",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cd985bd255b28c8504187dce",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Deben los responsables de políticas sobre emprendimiento responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "formalizacion",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cd90aa32b9e6ca00d03e6b2a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a emprendimiento si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "burocracia",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "63bc95eed62847c04ce52a8f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "nuevos negocios",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d42d9852be69b11a040e6581",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre emprendimiento?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "587b54f0418e4266ca94488b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "burocracia",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7759e2abf0f5fff8bd40fc68",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Deben los responsables de políticas sobre propiedad privada responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "seguridad juridica",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f1553656096948e1893a0fa4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a propiedad privada si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "uso de bienes",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "78dbb5831bfaffa2999980c2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "garantias patrimoniales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "325a5f203010398af31a4466",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre propiedad privada?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a907ae608e5aae3aa6742562",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "uso de bienes",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "e70c155b93a2968cb619d07e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Deben los responsables de políticas sobre simplificación regulatoria responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "tramites",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a0985a58e8e161c2aa0d685f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a simplificación regulatoria si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "costos regulatorios",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6a88668eeab84e2b77650873",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "evaluacion normativa",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "81f39c581e46bc6c0d00e393",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre simplificación regulatoria?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4ea6afa050aa092b8945f82f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "costos regulatorios",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "073ba7a9aa40a10db1ee34bc",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Deben los responsables de políticas sobre responsabilidad fiscal responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "gasto publico",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cccb250d5f8576d46ca45df0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a responsabilidad fiscal si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "deuda",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a1b83c864f44a195d058e688",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "prioridades presupuestales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3b5da85cfece5174d55b85fb",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre responsabilidad fiscal?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "78109668581abb3145b40539",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "deuda",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5c065f84807fadf4a8daeef4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Deben los responsables de políticas sobre lucha contra la corrupción responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "transparencia",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "75cceb1909335e20dcf87f7c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a lucha contra la corrupción si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "compras publicas",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fa9f63e10944026284aeffb0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "sanciones",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d198b772f161731ac48e0897",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre lucha contra la corrupción?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7c0a0f345c4a5ce519b77e95",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "compras publicas",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "883ef1be0607f8e5eda80ca2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Deben los responsables de políticas sobre privilegios económicos otorgados por el Estado responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "competencia",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a70e3d74b5bb0ff88682bd68",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a privilegios económicos otorgados por el Estado si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "subsidios selectivos",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4de0de169485e5e32db41a27",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "captura regulatoria",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8f8856d877c34d382a9357ee",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre privilegios económicos otorgados por el Estado?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "dd49c0f93f82f9bc7a01462f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "subsidios selectivos",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5fcf71c7f943bc6a0f7e0150",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Deben los responsables de políticas sobre seguridad ciudadana responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "prevencion",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d1d93162d661d0755db350ac",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a seguridad ciudadana si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "control del delito",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "27b25c5cd5c541817116a149",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "garantias ciudadanas",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "970c335c7902a35cd40e059e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre seguridad ciudadana?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9450fb0d30556222a9d5f7f4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "control del delito",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "50deeab3d964581480c33e33",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Deben los responsables de políticas sobre Estado de derecho responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "debido proceso",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b20a5d39460e2c733b444f46",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a Estado de derecho si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "cumplimiento de normas",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "420cefbd92dd251b5b384141",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "independencia institucional",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "1860d0b24ec2cb8f1b04ce36",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre Estado de derecho?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "afe302c991037dcc004ba6a2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "cumplimiento de normas",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a74ca67689c8ccc13eea95ca",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Deben los responsables de políticas sobre mérito en el sector público responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "servicio civil",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "e12ad1eca09578e9abd261f0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a mérito en el sector público si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "evaluacion de desempeno",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "623f13612ef6f1fe68ca4d7f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "nombramientos",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4ac5c48c28ddc045f9c45813",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre mérito en el sector público?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "0616c32efa93e07c62a9eb92",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "evaluacion de desempeno",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "aca442cb39be53c88a69b8ef",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Deben los responsables de políticas sobre control ciudadano del poder responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "fiscalizacion ciudadana",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "668e9696548ac70f252df6d0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a control ciudadano del poder si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "acceso a informacion",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "428ede46fe13c852259c26ea",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "responsabilidad politica",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "52fb5f5b8346d707052800de",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre control ciudadano del poder?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "838eb06e151e00438a4c88bf",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "acceso a informacion",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "e72c01b9af628710d919b33c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Deben los responsables de políticas sobre innovación y competitividad responder individualmente ante organismos de control independientes?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "competitividad",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce responsabilidad personal del funcionario sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f8615fa8d8d483241caf20d8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe el Estado aprobar automaticamente los trámites vinculados a innovación y competitividad si no responde al ciudadano en el plazo legal establecido?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "reglas para innovar",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce silencio positivo como mecanismo de eficiencia administrativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "35c5c96a40cff0e39adfd483",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "productividad",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Plantea impugnacion ciudadana sin señalar actores concretos.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9d540db4ed5cc1f1c8306926",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre innovación y competitividad?",
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
    "quality_notes": "Ubica el debate en la calidad tecnica previa a la decisión legislativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "50e4df3bd72dcad01bfd37bb",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Qué tipo de intervención pública es más eficaz para mejorar los resultados en innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Reducir barreras y obligaciones actuales",
      "Incorporar nuevos mecanismos de supervisión"
    ],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "reglas para innovar",
      "enfoque": "politica_publica",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Contrasta dos enfoques institucionales sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a1495e47c6169943b22dab0e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 4
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

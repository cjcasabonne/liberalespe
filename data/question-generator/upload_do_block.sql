DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := 'qgen_20260604140353_ead596ec';
  v_expected_count integer := 80;
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$[
  {
    "topic": "libertad_individual",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre libertad individual rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b4b109ef00aec1d07cf011e7",
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
    "titulo": "¿Debe toda política vinculada a libertad individual tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "garantias legales",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d8ed215663e86fdd9eee8337",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con libertad individual?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4efa8365d01e750a135752d3",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de libertad individual?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b9facec71c2304e4421f46e9",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre libertad individual?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "garantias legales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4e1323d5a4bec3a911035928",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre igualdad ante la ley rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b612cdea7372963ec2d71284",
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
    "titulo": "¿Debe toda política vinculada a igualdad ante la ley tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "trato institucional",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "76d2ce27c16689f6ba4907cb",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con igualdad ante la ley?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "de0f7f0e95b88086a05cd4a7",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d197c152514f305f83a46d81",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "trato institucional",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d0b48be5b8d7d863eab61fb1",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre límites y funciones del Estado rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8cbc2eff31aa32e1744bd0da",
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
    "titulo": "¿Debe toda política vinculada a límites y funciones del Estado tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "eficacia publica",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3f1f7fdea81f8bd6df3f99c6",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con límites y funciones del Estado?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3c2641cdc6c40ccb5a301b39",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4c1fc0a3b59ffc1e5d259f67",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "eficacia publica",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ba0ec04d3ea2a22aa27afb3f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre instituciones públicas rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9e00eeec56b26aece515a5bf",
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
    "titulo": "¿Debe toda política vinculada a instituciones públicas tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "reglas de decision",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "218c4d002bb394d598d3d9a1",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con instituciones públicas?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "42e737f739db34531a65f623",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "bdb08a91655d7b0acce3fbba",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "reglas de decision",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d7bf9899815c74a3f825674f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre competencia y mercado rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cede18d7881283815002d102",
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
    "titulo": "¿Debe toda política vinculada a competencia y mercado tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "consumidores",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a55ddde7e6d13d777e17260e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con competencia y mercado?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5badc973ffa6dd8c84bf8399",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9f7eefbfcf9326e817fd6ced",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "consumidores",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "91a71193e8451415582a923b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre emprendimiento rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fa34b07c74606b077fbd9474",
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
    "titulo": "¿Debe toda política vinculada a emprendimiento tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "nuevos negocios",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "16597bcba4a1c2f6d5a137aa",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con emprendimiento?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "87190eecc0efe07ceaefaea0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3cb66a6849916d594491775a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "nuevos negocios",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "029b94f889f1c1c98c9222ce",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre propiedad privada rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "560dcab17c0b2e1b8764ec88",
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
    "titulo": "¿Debe toda política vinculada a propiedad privada tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "garantias patrimoniales",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9a177ff023ddd1887d0c5bd2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con propiedad privada?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c0e6e12d3a751ed3ba930600",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5ecd18294ccb6956010d08d5",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "garantias patrimoniales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3cdc8bc4551e257ec24410b2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre simplificación regulatoria rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "bd9d927755907a3f741e337b",
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
    "titulo": "¿Debe toda política vinculada a simplificación regulatoria tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "evaluacion normativa",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a99f300f8d1b0bb5b8afd2ad",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con simplificación regulatoria?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5d0abef508dbced39b066afa",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ac5776fb71861a4a896895b4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "evaluacion normativa",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "99985aad207ce616a0a765ef",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre responsabilidad fiscal rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ccb243525d5de35848cc1c28",
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
    "titulo": "¿Debe toda política vinculada a responsabilidad fiscal tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "prioridades presupuestales",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b51a75787da2eebde0e78146",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con responsabilidad fiscal?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "12ff5d6808d57d0092b7a223",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f5410cfd5ba31b8c9ff27cc0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "prioridades presupuestales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5e50d4a692d01cc76b7f3409",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre lucha contra la corrupción rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "559c80e96b9dd72365f6a225",
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
    "titulo": "¿Debe toda política vinculada a lucha contra la corrupción tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "sanciones",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "0259b99de9fcfc498e3c75dd",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con lucha contra la corrupción?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a9ed935e3e9764868703e541",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3a3bc98daa7b9ed146610c6c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "sanciones",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9ebd7ea91df9ff479e094165",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre privilegios económicos otorgados por el Estado rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a68fad8c876b4367fe74a522",
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
    "titulo": "¿Debe toda política vinculada a privilegios económicos otorgados por el Estado tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "captura regulatoria",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fea32f9942e8d688335e175b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con privilegios económicos otorgados por el Estado?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7942075f723b4778a4704b6b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c4237fa05143f43d406481e8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "captura regulatoria",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b5e4ea729f335fd997fd0963",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre seguridad ciudadana rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a6103d316b647eeebdf24d55",
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
    "titulo": "¿Debe toda política vinculada a seguridad ciudadana tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "garantias ciudadanas",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f8218f85ce245b684c010fb4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con seguridad ciudadana?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ae519593cc4b2b6dd8f243ea",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fe4717ee0675ce11ca627027",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "garantias ciudadanas",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "06339fbcb5e9ef7d9909561f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre Estado de derecho rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "af561b3b3dbfc5fa51dac599",
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
    "titulo": "¿Debe toda política vinculada a Estado de derecho tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "independencia institucional",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "1252083d7631334990ad9512",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con Estado de derecho?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "1b8711edbe1c4fed305ed22b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "adb0e2210acc51d4d6f4f3de",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "independencia institucional",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a9837ae58e467ea2cfdf8bb9",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre mérito en el sector público rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9b96f477bc09489fb1d1868c",
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
    "titulo": "¿Debe toda política vinculada a mérito en el sector público tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "nombramientos",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f515a4d96d64b93d86ff208d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con mérito en el sector público?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7ac5ba02892251f27b3b78f9",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7d330be22947bd669d6166d7",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "nombramientos",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "252d49c65ee9dc1584149073",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre control ciudadano del poder rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "719f3146ac0fc3fc863dc356",
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
    "titulo": "¿Debe toda política vinculada a control ciudadano del poder tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "responsabilidad politica",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "dfaa8dc1adb253f6f40fd957",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con control ciudadano del poder?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "825b6d8a7cf2a02a11e2c780",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b5257f39a8d5b1cb2df1b704",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "responsabilidad politica",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a936a7f5567c83639469cf7a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 8
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Deben los funcionarios responsables de implementar políticas sobre innovación y competitividad rendir cuentas publicamente con datos de resultados medibles?",
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
    "quality_notes": "Evalúa responsabilidad del funcionario y transparencia sin inducir una respuesta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3864a221b839a453aae83572",
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
    "titulo": "¿Debe toda política vinculada a innovación y competitividad tener metas públicas medibles antes de recibir más presupuesto?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "productividad",
      "enfoque": "institucional",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra la discusión en metas y presupuesto.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "27a9634b1d7ea4ae2c83768e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 5
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con innovación y competitividad?",
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
    "quality_notes": "Ubica el debate en control institucional.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a244597550db56e43be524c6",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 6
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Qué mecanismo sería más útil para mejorar la supervisión de innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "opciones",
    "opciones": [
      "Indicadores públicos periódicos",
      "Auditorias externas focalizadas"
    ],
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
    "quality_notes": "Plantea mecanismos de supervisión sin opción evidentemente correcta.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "1e540c5d7a79ef0ffce2de14",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 7
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe publicarse información comparable para que los ciudadanos evalúen decisiones sobre innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "productividad",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Refuerza acceso a información y control ciudadano.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d3e71f1c2ce4dd90d4ac39b3",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v1",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 8
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
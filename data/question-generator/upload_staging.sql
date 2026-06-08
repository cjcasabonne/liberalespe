BEGIN;

-- ARTEFACTO GENERADO POR qgen:prepare-upload
-- Solo toca: generated_topic_batches, generated_topic_candidates
-- NO toca: temas, votos, tema_sugerencias
-- Ejecutar solo via: set QGEN_APPLY_UPLOAD_CONFIRM=true && npm run qgen:apply-upload
-- batch_code: qgen_20260608102125_5dca67c6

DO $qgen$
DECLARE
  v_batch_id uuid;
  v_batch_code text := 'qgen_20260608102125_5dca67c6';
  v_expected_count integer := 80;
  v_inserted_count integer;
  v_dup_count integer;
  v_candidates jsonb := $json_payload$[
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre libertad individual sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ea988e154b5114053acae6b2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en libertad individual?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f8c4cdbb8bdb018ccb76753f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe toda nueva norma sobre libertad individual incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "garantias legales",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "38eaf962a7a4bf607b0b3edc",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre libertad individual?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "limites del poder publico",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "41444f8d4e992865f46e9836",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "libertad_individual",
    "titulo": "¿Deben las normas sobre libertad individual tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "libertad_individual",
      "subtema": "autonomia ciudadana",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "libertad_individual",
    "deliberative_tension": "libertad_individual_vs_intervencion_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9cb963d255c68a93f5f3527c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "libertad_individual",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre igualdad ante la ley sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "2627bf88fdf1f7c8c1de97f9",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "02c940b73968d96bf5b417fa",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe toda nueva norma sobre igualdad ante la ley incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "trato institucional",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7161576ec7be309b9103d2ec",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre igualdad ante la ley?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "reglas generales",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3310e7a81605108e1baf1901",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "igualdad_ante_la_ley",
    "titulo": "¿Deben las normas sobre igualdad ante la ley tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "igualdad_ante_la_ley",
      "subtema": "privilegios legales",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "igualdad_ante_la_ley",
    "deliberative_tension": "igualdad_ante_la_ley_vs_privilegios",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3e3f8abe4b5ef6660383b844",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "igualdad_ante_la_ley",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre límites y funciones del Estado sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c412e5bd3b56f20f048b52d2",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9d7ef640caf6242d3f13ef27",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe toda nueva norma sobre límites y funciones del Estado incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "eficacia publica",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "7f5ac2aa6b322c2cded3a4cd",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre límites y funciones del Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "alcance estatal",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ec700ede3f584872d083fd1f",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "estado_limitado",
    "titulo": "¿Deben las normas sobre límites y funciones del Estado tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_limitado",
      "subtema": "controles institucionales",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "estado_limitado",
    "deliberative_tension": "estado_limitado_eficaz_vs_estado_grande_ineficiente",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "42fe6aea0dcffdd77c2969a8",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_limitado",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre instituciones públicas sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "bbb239dcb539ddfa42e2914a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "97d0f378b22dd617559e016a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe toda nueva norma sobre instituciones públicas incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "reglas de decision",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "1f90ddb0d8449634613d6feb",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre instituciones públicas?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "rendicion de cuentas",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "bb8b137fccb86733a5fcdfdd",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "instituciones_publicas",
    "titulo": "¿Deben las normas sobre instituciones públicas tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "instituciones_publicas",
      "subtema": "confianza institucional",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "instituciones_publicas",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c7be8418934cc9049ba36e86",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "instituciones_publicas",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre competencia y mercado sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3875f1ae6d03ee13ecc47842",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "a667ff5706231e847737fd77",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe toda nueva norma sobre competencia y mercado incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "consumidores",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "66a1ec9f559185a4cc8ae88d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre competencia y mercado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "competencia abierta",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8c6dfdaeb36cfa58ac84462d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "mercado_libre",
    "titulo": "¿Deben las normas sobre competencia y mercado tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "mercado_libre",
      "subtema": "barreras de entrada",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "mercado_libre",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "76c8c9e454882395764a074c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "mercado_libre",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre emprendimiento sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fdd59578c3a3430d661e6de1",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "86e065580164ed393ea9d338",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe toda nueva norma sobre emprendimiento incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "nuevos negocios",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d2516c26b24d532895536ef6",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre emprendimiento?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "formalizacion",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "88f3bfaa5747f786c35fdc84",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "emprendimiento",
    "titulo": "¿Deben las normas sobre emprendimiento tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "emprendimiento",
      "subtema": "burocracia",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "emprendimiento",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6da98ae623b9be5da91a3566",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "emprendimiento",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre propiedad privada sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "58842e6f6b18ea4cefc9491d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d1eb346c15372cb9cb5f530d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe toda nueva norma sobre propiedad privada incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "garantias patrimoniales",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "0ec99072e7c089a3e938fa47",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre propiedad privada?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "seguridad juridica",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "48bf38d422daf45358f12031",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "propiedad_privada",
    "titulo": "¿Deben las normas sobre propiedad privada tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "propiedad_privada",
      "subtema": "uso de bienes",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "propiedad_privada",
    "deliberative_tension": "propiedad_privada_vs_arbitrariedad_estatal",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "e98acd9662c90c1a6516a6d1",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "propiedad_privada",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre simplificación regulatoria sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "590985e46c591b10bee139d4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "67f6263f01633c3446af2e26",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe toda nueva norma sobre simplificación regulatoria incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "evaluacion normativa",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f2ee88da7c353551fdba8a59",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre simplificación regulatoria?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "tramites",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f3343e4dae5830e6855e2e51",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "desregulacion",
    "titulo": "¿Deben las normas sobre simplificación regulatoria tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "desregulacion",
      "subtema": "costos regulatorios",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "desregulacion",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "12a7c65d301f1f160da2528a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "desregulacion",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre responsabilidad fiscal sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3baef4589a46054c0f6220b3",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "20a4f61bfcf4bf2a82fe81ac",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe toda nueva norma sobre responsabilidad fiscal incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "prioridades presupuestales",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9df45235d7ff68fbf65c2e5d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre responsabilidad fiscal?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "gasto publico",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5c0d56f7f4eaeb2bb7a148e4",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "responsabilidad_fiscal",
    "titulo": "¿Deben las normas sobre responsabilidad fiscal tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "responsabilidad_fiscal",
      "subtema": "deuda",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "responsabilidad_fiscal",
    "deliberative_tension": "responsabilidad_fiscal_vs_gasto_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "f6477463696e10d5760f828e",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "responsabilidad_fiscal",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre lucha contra la corrupción sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ea0926e96c8f348909a293e9",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "ec1bdce347ec6acb6208bd14",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe toda nueva norma sobre lucha contra la corrupción incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "sanciones",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "e5d22e1f2af6e9aac4795850",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre lucha contra la corrupción?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "transparencia",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8e33bc6ed5af952bd2ed1856",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "anticorrupcion",
    "titulo": "¿Deben las normas sobre lucha contra la corrupción tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anticorrupcion",
      "subtema": "compras publicas",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "anticorrupcion",
    "deliberative_tension": "ciudadano_vs_poder_politico",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5b22efe2787f6a61166f10ba",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anticorrupcion",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre privilegios económicos otorgados por el Estado sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "b677c9b3c2fb053200905d8c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "877cc23e0748dc49dfa3c186",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe toda nueva norma sobre privilegios económicos otorgados por el Estado incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "captura regulatoria",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "8b33ae0c11ccf3bdef6f3087",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre privilegios económicos otorgados por el Estado?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "competencia",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "dc2d0217e553c5a89eb8c51c",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "anti_mercantilismo",
    "titulo": "¿Deben las normas sobre privilegios económicos otorgados por el Estado tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "anti_mercantilismo",
      "subtema": "subsidios selectivos",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "anti_mercantilismo",
    "deliberative_tension": "competencia_vs_mercantilismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "4910bb59a66ecc83c1908449",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "anti_mercantilismo",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre seguridad ciudadana sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "78d32b80b973463d87134c2d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "08d52b41c95f7c507a086e60",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe toda nueva norma sobre seguridad ciudadana incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "garantias ciudadanas",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d7b362878d9259bb3066e616",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre seguridad ciudadana?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "prevencion",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "5ac8d85ddbfd7353ebb46d74",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "seguridad_ciudadana",
    "titulo": "¿Deben las normas sobre seguridad ciudadana tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "seguridad_ciudadana",
      "subtema": "control del delito",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "seguridad_ciudadana",
    "deliberative_tension": "seguridad_ciudadana_vs_arbitrariedad",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fae237dc317e81f63aa2822b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "seguridad_ciudadana",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre Estado de derecho sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "715c7ff9b5686f761667c63a",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "300cb0d742af5902a69e4fe0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe toda nueva norma sobre Estado de derecho incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "independencia institucional",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "66b1a7159a3aa4d2ca7d0abc",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre Estado de derecho?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "debido proceso",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "534cfa4d942b2034854f591b",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "estado_de_derecho",
    "titulo": "¿Deben las normas sobre Estado de derecho tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "estado_de_derecho",
      "subtema": "cumplimiento de normas",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "estado_de_derecho",
    "deliberative_tension": "instituciones_fuertes_vs_captura_del_poder",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "da4703fd2e532b0389b3cbe0",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "estado_de_derecho",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre mérito en el sector público sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3f1f6a3d1f91a75951fbf0e3",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "66b7f7f2cd23d173f30eff90",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe toda nueva norma sobre mérito en el sector público incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "nombramientos",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "d4acabdd39396d6dde0e7724",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre mérito en el sector público?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "servicio civil",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "6d8bda409e3841ff01d036cb",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "merito_y_talento",
    "titulo": "¿Deben las normas sobre mérito en el sector público tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "merito_y_talento",
      "subtema": "evaluacion de desempeno",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "merito_y_talento",
    "deliberative_tension": "merito_vs_clientelismo",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "db0969c5cc9b5805bd5306ac",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "merito_y_talento",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre control ciudadano del poder sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "cabb05fa0d67f1f5c009ca46",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "059971e6270fc1f97d998f8d",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe toda nueva norma sobre control ciudadano del poder incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "responsabilidad politica",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "c1e9324125e90605b064d804",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre control ciudadano del poder?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "fiscalizacion ciudadana",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "750de1351858aa2cd00a2c81",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "ciudadania_y_control_del_poder",
    "titulo": "¿Deben las normas sobre control ciudadano del poder tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "ciudadania_y_control_del_poder",
      "subtema": "acceso a informacion",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "ciudadania_y_control_del_poder",
    "deliberative_tension": "ciudadania_activa_vs_poder_sin_control",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "9d0b6ff887eac145a2df8adc",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "ciudadania_y_control_del_poder",
      "per_topic_target": 5,
      "template_index": 4
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe garantizarse que cualquier cambio normativo sobre innovación y competitividad sea predecible y no retroactivo para preservar la seguridad jurídica?",
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
    "quality_notes": "Plantea el principio de seguridad jurídica sin prescribir el contenido normativo.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "3a3b87ecff3b0090c8d88df9",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 0
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debería el Estado priorizar incentivos económicos sobre restricciones directas como herramienta principal en innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
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
    "quality_notes": "Contrasta enfoques de incentivos y restricciones sin presuponer el más eficaz.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "fc500024e2427135f9275866",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 1
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe toda nueva norma sobre innovación y competitividad incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "productividad",
      "enfoque": "institucional",
      "intensidad_de_debate": "alta"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "54bf661efc2eabd96ddb11ea",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 2
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Debe realizarse una consulta pública documentada antes de aprobar cambios sustanciales a las normas sobre innovación y competitividad?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "competitividad",
      "enfoque": "ciudadano",
      "intensidad_de_debate": "moderada"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Centra el debate en la participacion ciudadana previa a la decisión normativa.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "59bd294222c751d71cfe7e54",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
      "topic_target": "innovacion_y_competitividad",
      "per_topic_target": 5,
      "template_index": 3
    }
  },
  {
    "topic": "innovacion_y_competitividad",
    "titulo": "¿Deben las normas sobre innovación y competitividad tener un plazo definido que obligue a una evaluación formal antes de ser renovadas automaticamente?",
    "descripcion": null,
    "tipo_votacion": "binaria",
    "opciones": [],
    "publico_objetivo": "afiliados",
    "taxonomy_draft": {
      "eje_tematico": "innovacion_y_competitividad",
      "subtema": "reglas para innovar",
      "enfoque": "institucional",
      "intensidad_de_debate": "baja"
    },
    "ideological_axis": "innovacion_y_competitividad",
    "deliberative_tension": "emprendimiento_vs_burocracia",
    "neutrality_notes": "Redacción deliberativa sin llamados partidarios ni ataque personal.",
    "quality_notes": "Propone evaluación periodica de normas sin prescribir el resultado esperado.",
    "risk_flags": [],
    "requires_source": false,
    "source_required_reason": null,
    "human_review_required": true,
    "quality_score": null,
    "neutrality_score": null,
    "duplicate_fingerprint": "36b7f0afb36d750198181b55",
    "status": "pending_review",
    "raw_payload": {
      "generator_version": "v2",
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

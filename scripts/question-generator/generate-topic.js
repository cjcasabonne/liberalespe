const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

// v6: template quemado prohibido
// "debe el estado justificar con evidencia publica cualquier nueva restriccion relacionada con X"
// ninguno de los templates siguientes puede usar esa formulacion ni variantes triviales.

const TEMPLATES = [
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    family: 'fiscalizacion_proporcional',
    quality_score: 75,
    neutrality_score: 78,
    title: (topic) => `Deben los costos de fiscalizacion sobre ${topic.subject} ser proporcionales al riesgo real involucrado?`,
    notes: 'Evalua si la carga regulatoria guarda relacion con el riesgo efectivo.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    family: 'incentivos',
    quality_score: 76,
    neutrality_score: 77,
    title: (topic) => `Deberia el Estado usar incentivos antes que mandatos obligatorios para promover ${topic.subject}?`,
    notes: 'Contrasta incentivos voluntarios con regulacion coercitiva sin atacar posicion.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    family: 'barreras_de_entrada',
    quality_score: 75,
    neutrality_score: 75,
    title: (topic) => `Deben eliminarse los requisitos administrativos que no tengan respaldo en resultados probados sobre ${topic.subject}?`,
    notes: 'Evalua barreras administrativas sin fundamento objetivo comprobado.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'alta',
    family: 'seguridad_juridica',
    quality_score: 78,
    neutrality_score: 76,
    title: (topic) => `Debe el Estado indemnizar a los afectados cuando cambie retroactivamente las reglas vigentes sobre ${topic.subject}?`,
    notes: 'Debate sobre seguridad juridica y responsabilidad del Estado ante cambios normativos.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    family: 'responsabilidad_del_funcionario',
    quality_score: 76,
    neutrality_score: 78,
    title: (topic) => `Deben los funcionarios que administran recursos de ${topic.subject} asumir responsabilidad personal ante resultados deficientes?`,
    notes: 'Debate sobre rendicion de cuentas individual en la gestion publica.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    family: 'descentralizacion',
    quality_score: 74,
    neutrality_score: 77,
    title: (topic) => `Deberia trasladarse a los gobiernos regionales la facultad de regular ${topic.subject} en funcion de las condiciones locales?`,
    notes: 'Evalua descentralizacion regulatoria frente a uniformidad nacional.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    family: 'control_ciudadano',
    quality_score: 75,
    neutrality_score: 80,
    title: (topic) => `Debe existir un mecanismo formal para que ciudadanos cuestionen politicas de ${topic.subject} aprobadas sin consulta?`,
    notes: 'Promueve control ciudadano directo sin promover partido ni candidato.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    family: 'competencia',
    quality_score: 77,
    neutrality_score: 76,
    title: (topic) => `Deben evaluarse los efectos anticompetitivos antes de aprobar nuevas normas sobre ${topic.subject}?`,
    notes: 'Introduce analisis de competencia como requisito previo a regulacion.',
  },
  {
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    family: 'priorizacion_presupuestal',
    quality_score: 77,
    neutrality_score: 75,
    title: (topic) => `Que criterio deberia orientar el gasto publico destinado a ${topic.subject}?`,
    options: ['Resultados verificables y metas publicas', 'Demanda de grupos con influencia politica'],
    notes: 'Contrasta logica de resultados con logica de poder politico.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    family: 'transparencia',
    quality_score: 74,
    neutrality_score: 80,
    title: (topic) => `Deben publicarse en tiempo real los contratos y gastos publicos relacionados con ${topic.subject}?`,
    notes: 'Refuerza transparencia y acceso a informacion sin inducir respuesta.',
  },
];

function buildCandidate(topic, template, index) {
  const title = fixSpanishOrthography(template.title(topic));
  const candidateId = `${topic.id}-${String(index + 1).padStart(2, '0')}-${slugify(title).slice(0, 42)}`;
  const subtheme = topic.subthemes[index % topic.subthemes.length];

  const candidate = {
    candidate_id: candidateId,
    titulo: title,
    descripcion: null,
    tipo_votacion: template.type,
    opciones: template.type === 'opciones' ? template.options : [],
    publico_objetivo: 'afiliados',
    taxonomy_draft: {
      eje_tematico: topic.id,
      subtema: subtheme,
      enfoque: template.focus,
      intensidad_de_debate: template.intensity,
    },
    ideological_axis: topic.id,
    deliberative_tension: topic.tension,
    neutrality_notes: 'Redaccion deliberativa sin llamados partidarios ni ataque personal.',
    quality_notes: template.notes,
    risk_flags: [],
    requires_source: false,
    source_required_reason: null,
    human_review_required: true,
    quality_score: template.quality_score || 75,
    neutrality_score: template.neutrality_score || 75,
    duplicate_fingerprint: fingerprint(topic.id, title),
    raw_payload: {
      generator_version: GENERATOR_VERSION,
      generation_family: template.family || 'general',
      generation_variant: `template_${index + 1}`,
      batch_nonce: `v6_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      topic_target: topic.id,
      per_topic_target: PER_TOPIC_TARGET,
      template_index: index,
    },
  };

  return fixVisibleCandidateText(candidate);
}

function generateTopicCandidates(topic, count = TEMPLATES.length) {
  return TEMPLATES.slice(0, count).map((template, index) => buildCandidate(topic, template, index));
}

module.exports = { generateTopicCandidates };

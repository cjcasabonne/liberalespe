const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

const TEMPLATES = [
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe el Estado justificar con evidencia publica cualquier nueva restriccion relacionada con ${topic.subject}?`,
    notes: 'Evalua limites al poder publico sin inducir una respuesta.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Debe una reforma sobre ${topic.subject} priorizar reglas generales antes que beneficios para grupos especificos?`,
    notes: 'Contrasta reglas generales y excepciones sin atacar actores.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    title: (topic) => `Debe la ciudadania contar con reportes simples para evaluar resultados sobre ${topic.subject}?`,
    notes: 'Promueve rendicion de cuentas con lenguaje neutral.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Debe evaluarse el costo fiscal y regulatorio antes de ampliar medidas sobre ${topic.subject}?`,
    notes: 'Introduce costo fiscal y regulatorio como criterio deliberativo.',
  },
  {
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Que criterio deberia priorizar una reforma sobre ${topic.subject}?`,
    options: ['Reglas simples y fiscalizables', 'Controles administrativos mas detallados'],
    notes: 'Ofrece alternativas institucionales comparables.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe toda politica vinculada a ${topic.subject} tener metas publicas medibles antes de recibir mas presupuesto?`,
    notes: 'Centra la discusion en metas y presupuesto.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Debe el Congreso exigir evaluaciones independientes antes de aprobar cambios relacionados con ${topic.subject}?`,
    notes: 'Ubica el debate en control institucional.',
  },
  {
    type: 'opciones',
    focus: 'ciudadano',
    intensity: 'moderada',
    title: (topic) => `Que mecanismo seria mas util para mejorar la supervision de ${topic.subject}?`,
    options: ['Indicadores publicos periodicos', 'Auditorias externas focalizadas'],
    notes: 'Plantea mecanismos de supervision sin opcion evidentemente correcta.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    title: (topic) => `Debe publicarse informacion comparable para que los ciudadanos evaluen decisiones sobre ${topic.subject}?`,
    notes: 'Refuerza acceso a informacion y control ciudadano.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Debe revisarse periodicamente si las reglas sobre ${topic.subject} cumplen su objetivo sin crear privilegios?`,
    notes: 'Combina evaluacion regulatoria y neutralidad ante privilegios.',
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
    duplicate_fingerprint: fingerprint(topic.id, title),
    raw_payload: {
      generator_version: GENERATOR_VERSION,
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

const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

// Template quemado — prohibido en todos los lotes (v6)
const BURNED_TEMPLATE_PATTERN = /justificar con evidencia p[uú]blica cualquier nueva restricci[oó]n relacionada con/i;

const TEMPLATES = [
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Deben los responsables de politicas sobre ${topic.subject} responder individualmente ante organismos de control independientes?`,
    notes: 'Introduce responsabilidad personal del funcionario sin señalar actores concretos.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'moderada',
    title: (topic) => `Debe el Estado aprobar automaticamente los tramites vinculados a ${topic.subject} si no responde al ciudadano en el plazo legal establecido?`,
    notes: 'Introduce silencio positivo como mecanismo de eficiencia administrativa.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'alta',
    title: (topic) => `Deben los ciudadanos contar con herramientas accesibles para impugnar decisiones administrativas que afecten ${topic.subject}?`,
    notes: 'Plantea impugnacion ciudadana sin señalar actores concretos.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Debe exigirse un dictamen tecnico independiente antes de que el Congreso vote cualquier cambio normativo sobre ${topic.subject}?`,
    notes: 'Ubica el debate en la calidad tecnica previa a la decision legislativa.',
  },
  {
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Que tipo de intervencion publica es mas eficaz para mejorar los resultados en ${topic.subject}?`,
    options: ['Reducir barreras y obligaciones actuales', 'Incorporar nuevos mecanismos de supervision'],
    notes: 'Contrasta dos enfoques institucionales sin opcion evidentemente correcta.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'moderada',
    title: (topic) => `Debe el Estado compensar a los ciudadanos que sufran perjuicios directos y comprobables como consecuencia de politicas sobre ${topic.subject}?`,
    notes: 'Introduce responsabilidad patrimonial del Estado como criterio de politica publica.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Deben publicarse los estudios de impacto economico que respaldan las normas sobre ${topic.subject} antes de que entren en vigor?`,
    notes: 'Combina transparencia regulatoria y deliberacion ciudadana previa.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Debe permitirse la participacion de actores privados acreditados para competir con el Estado en la prestacion de servicios relacionados con ${topic.subject}?`,
    notes: 'Plantea competencia publica y privada sin descalificar ningun modelo.',
  },
  {
    type: 'opciones',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `A quien deberia corresponder la potestad principal de dictar normas que regulen ${topic.subject}?`,
    options: ['Al Poder Ejecutivo via reglamentos tecnicos', 'Al Congreso mediante ley expresa'],
    notes: 'Contrasta dos fuentes normativas legitimas sin atribuir jerarquia predeterminada.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Debe el Estado identificar y suprimir los privilegios que algunos actores ostentan en el ambito de ${topic.subject} por decisiones previas del Estado?`,
    notes: 'Introduce supresion de privilegios adquiridos como criterio de reforma.',
  },
];

function buildCandidate(topic, template, index) {
  const title = fixSpanishOrthography(template.title(topic));
  if (BURNED_TEMPLATE_PATTERN.test(title)) {
    throw new Error(`burned_template_detected: "${title.slice(0, 100)}"`);
  }
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

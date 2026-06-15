const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

const TEMPLATES = [
  // Family: simplificacion administrativa
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe el Estado eliminar todo tramite no esencial antes de imponer nuevas obligaciones sobre ${topic.subject}?`,
    notes: 'Prioriza la simplificacion administrativa antes de ampliar cargas regulatorias.',
  },
  // Family: igualdad ante normas
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Debe la norma que regula ${topic.subject} excluir explícitamente tratamientos diferenciados por vínculo político o posición sectorial?`,
    notes: 'Promueve igualdad formal ante la norma sin favorecer grupos con influencia.',
  },
  // Family: fiscalizacion proporcional
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Debe el Estado restringir la fiscalizacion sobre ${topic.subject} a los casos con evidencia documentada de incumplimiento previo?`,
    notes: 'Vincula la fiscalizacion a criterios proporcionales y no arbitrarios.',
  },
  // Family: incentivos (opciones)
  {
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Que tipo de incentivo deberia priorizar una politica publica para mejorar los resultados en ${topic.subject}?`,
    options: ['Reducción de cargas y trámites para los agentes que cumplen voluntariamente', 'Transferencias condicionadas a indicadores de resultado verificables'],
    notes: 'Contrasta incentivos mediante reduccion de cargas e incentivos vinculados a desempeno.',
  },
  // Family: control ciudadano
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'moderada',
    title: (topic) => `Debe el Estado publicar comparaciones anuales entre los compromisos asumidos y los resultados obtenidos en ${topic.subject}?`,
    notes: 'Fortalece el control ciudadano mediante informacion comparable y verificable.',
  },
  // Family: descentralizacion
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe trasladarse la competencia sobre ${topic.subject} al nivel de gobierno mas cercano al ciudadano directamente afectado?`,
    notes: 'Evalua la asignacion de competencias segun el principio de subsidiariedad.',
  },
  // Family: seguridad juridica
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Debe el Estado garantizar que ningún cambio normativo sobre ${topic.subject} afecte derechos constituidos antes de su entrada en vigor?`,
    notes: 'Protege la seguridad juridica frente a modificaciones retroactivas de normas.',
  },
  // Family: responsabilidad del funcionario (opciones)
  {
    type: 'opciones',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Que mecanismo deberia existir para responsabilizar a los funcionarios por malos resultados en ${topic.subject}?`,
    options: ['Evaluación de desempeño vinculada a la permanencia en el cargo', 'Auditoría externa con capacidad de sancionar directamente'],
    notes: 'Plantea opciones de responsabilidad funcional directa sin impunidad por defecto.',
  },
  // Family: barreras de entrada
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'moderada',
    title: (topic) => `Debe el Estado mapear y publicar las principales barreras que limitan el acceso equitativo a ${topic.subject}?`,
    notes: 'Promueve transparencia sobre barreras de acceso sin asumir una solucion estatal unica.',
  },
  // Family: rendicion de cuentas de resultados
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    title: (topic) => `Debe el organismo responsable de ${topic.subject} presentar un informe anual de resultados auditado por una entidad independiente?`,
    notes: 'Vincula la rendicion de cuentas con auditoria externa y periodicidad definida.',
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

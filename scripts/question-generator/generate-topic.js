const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

// v6 templates — all from distinct families, none use the quemado template.
// Quemado template (FORBIDDEN): "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con X?"
const TEMPLATES = [
  {
    family: 'limites_institucionales',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    quality_score: 75,
    neutrality_score: 80,
    title: (topic) => `Deben establecerse limites claros a la intervencion del Estado en materia de ${topic.subject}?`,
    notes: 'Plantea límites institucionales sin impugnar al Estado en general.',
  },
  {
    family: 'igualdad_ante_normas',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 78,
    neutrality_score: 82,
    title: (topic) => `Deben aplicarse las mismas reglas sobre ${topic.subject} a todos los actores sin excepción?`,
    notes: 'Contrasta igualdad normativa y privilegios sin atacar actores específicos.',
  },
  {
    family: 'evaluacion_costos_regulatorios',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 76,
    neutrality_score: 80,
    title: (topic) => `Debe diseñarse un mecanismo de evaluacion de costos antes de ampliar normas sobre ${topic.subject}?`,
    notes: 'Introduce evaluacion de costos regulatorios como criterio deliberativo neutral.',
  },
  {
    family: 'simplificacion_administrativa',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'baja',
    quality_score: 75,
    neutrality_score: 78,
    title: (topic) => `Deben simplificarse los procedimientos administrativos que regulan ${topic.subject}?`,
    notes: 'Evalúa carga administrativa sin presuponer que la simplificación es necesariamente correcta.',
  },
  {
    family: 'barreras_entrada',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 76,
    neutrality_score: 79,
    title: (topic) => `Deben eliminarse las barreras que impiden la participación de nuevos actores en ${topic.subject}?`,
    notes: 'Debate sobre competencia y acceso sin descalificar el marco regulatorio existente.',
  },
  {
    family: 'seguridad_juridica',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    quality_score: 79,
    neutrality_score: 82,
    title: (topic) => `Debe el Estado garantizar reglas estables y predecibles en materia de ${topic.subject}?`,
    notes: 'Centra el debate en seguridad jurídica como bien público sin sesgo ideológico explícito.',
  },
  {
    family: 'incentivos',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 75,
    neutrality_score: 80,
    title: (topic) => `Deben diseñarse incentivos que promuevan mejores resultados en ${topic.subject}?`,
    notes: 'Abre la discusion sobre diseño de incentivos sin prescribir soluciones.',
  },
  {
    family: 'descentralizacion',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'baja',
    quality_score: 74,
    neutrality_score: 78,
    title: (topic) => `Debe descentralizarse la gestión de las politicas vinculadas a ${topic.subject}?`,
    notes: 'Debate territorial sin presuponer que la descentralizacion es siempre superior.',
  },
  {
    family: 'fiscalizacion_proporcional',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    quality_score: 77,
    neutrality_score: 80,
    title: (topic) => `Deben aplicarse criterios de fiscalizacion proporcionales al riesgo en el ámbito de ${topic.subject}?`,
    notes: 'Introduce proporcionalidad en fiscalizacion como criterio institucional deliberativo.',
  },
  {
    family: 'responsabilidad_funcionario',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    quality_score: 78,
    neutrality_score: 78,
    title: (topic) => `Deben establecerse consecuencias claras para los funcionarios que incumplan sus responsabilidades en ${topic.subject}?`,
    notes: 'Centra el debate en rendicion de cuentas institucional sin nombrar actores.',
  },
  {
    family: 'rendicion_cuentas',
    type: 'opciones',
    focus: 'ciudadano',
    intensity: 'alta',
    quality_score: 80,
    neutrality_score: 85,
    options: ['Resultados medibles y verificados por organismos independientes', 'Cumplimiento de procedimientos formales establecidos por ley'],
    title: (topic) => `Cual deberia ser el principal criterio para evaluar el desempeño de las politicas de ${topic.subject}?`,
    notes: 'Ofrece dos criterios institucionales comparables sin opcion evidentemente correcta.',
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
    quality_score: template.quality_score,
    neutrality_score: template.neutrality_score,
    duplicate_fingerprint: fingerprint(topic.id, title),
    raw_payload: {
      generator_version: GENERATOR_VERSION,
      generation_family: template.family,
      generation_variant: `T${index}`,
      topic_target: topic.id,
      per_topic_target: PER_TOPIC_TARGET,
    },
  };

  return fixVisibleCandidateText(candidate);
}

function generateTopicCandidates(topic, count = TEMPLATES.length) {
  return TEMPLATES.slice(0, count).map((template, index) => buildCandidate(topic, template, index));
}

module.exports = { generateTopicCandidates };

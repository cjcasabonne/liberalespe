const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

const TEMPLATES = [
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe garantizarse que cualquier cambio normativo sobre ${topic.subject} sea predecible y no retroactivo para preservar la seguridad juridica?`,
    notes: 'Plantea el principio de seguridad juridica sin prescribir el contenido normativo.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Deberia el Estado priorizar incentivos economicos sobre restricciones directas como herramienta principal en ${topic.subject}?`,
    notes: 'Contrasta enfoques de incentivos y restricciones sin presuponer el mas eficaz.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Debe toda nueva norma sobre ${topic.subject} incluir un análisis que demuestre que sus costos no superan los beneficios sociales esperados?`,
    notes: 'Introduce criterio de proporcionalidad sin favorecer una posicion predefinida.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'moderada',
    title: (topic) => `Debe realizarse una consulta publica documentada antes de aprobar cambios sustanciales a las normas sobre ${topic.subject}?`,
    notes: 'Centra el debate en la participacion ciudadana previa a la decision normativa.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'baja',
    title: (topic) => `Deben las normas sobre ${topic.subject} tener un plazo definido que obligue a una evaluacion formal antes de ser renovadas automaticamente?`,
    notes: 'Propone evaluacion periodica de normas sin prescribir el resultado esperado.',
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

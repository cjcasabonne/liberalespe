const crypto = require('crypto');
const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

// Prohibited template (burned in v6) — must never appear in generated output:
// "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción relacionada con X?"
// None of the templates below use this formulation or trivial variants of it.

const TEMPLATES = [
  {
    family: 'limites_institucionales',
    variant: 'claridad_vs_discrecionalidad',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Deben las normas sobre ${topic.subject} privilegiar la claridad y la predictibilidad sobre la discrecionalidad de los funcionarios?`,
    notes: 'Contrasta reglas claras con discrecionalidad administrativa sin atacar actores.',
    quality_score: 78,
    neutrality_score: 80,
  },
  {
    family: 'transparencia',
    variant: 'inventario_cargas_regulatorias',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Debe el Estado elaborar y publicar un inventario de las cargas administrativas vinculadas a ${topic.subject}?`,
    notes: 'Promueve transparencia sobre costos regulatorios con lenguaje neutral.',
    quality_score: 75,
    neutrality_score: 78,
  },
  {
    family: 'independencia_institucional',
    variant: 'independencia_respecto_ejecutivo',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Deben los organismos de control de ${topic.subject} contar con independencia institucional respecto del poder ejecutivo?`,
    notes: 'Plantea independencia institucional como condición de imparcialidad.',
    quality_score: 80,
    neutrality_score: 75,
  },
  {
    family: 'simplificacion_administrativa',
    variant: 'limite_requisitos_previos',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'baja',
    title: (topic) => `Debe reducirse el número de requisitos previos que el Estado exige para actuar en el ámbito de ${topic.subject}?`,
    notes: 'Introduce el límite de requisitos como criterio de simplificación.',
    quality_score: 75,
    neutrality_score: 78,
  },
  {
    family: 'responsabilidad_del_funcionario',
    variant: 'carga_prueba_intervencion',
    type: 'opciones',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Que parte deberia asumir la carga de probar que una nueva intervencion publica en ${topic.subject} genera beneficios concretos?`,
    options: ['El Estado que propone la intervención', 'Los actores privados afectados por la medida'],
    notes: 'Plantea quién debe demostrar la utilidad de una intervención sin sesgar la respuesta.',
    quality_score: 82,
    neutrality_score: 76,
  },
  {
    family: 'fiscalizacion_proporcional',
    variant: 'publicar_impacto_obligaciones',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Deben los reguladores de ${topic.subject} publicar el impacto estimado de cada nueva obligación antes de que entre en vigor?`,
    notes: 'Vincula transparencia regulatoria con estimación de impacto ex ante.',
    quality_score: 78,
    neutrality_score: 80,
  },
  {
    family: 'merito_institucional',
    variant: 'criterios_tecnicos_vs_politicos',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe la toma de decisiones sobre ${topic.subject} basarse en criterios tecnicos objetivos antes que en consideraciones politicas?`,
    notes: 'Contrasta mérito técnico con lógica política sin atacar actores específicos.',
    quality_score: 78,
    neutrality_score: 75,
  },
  {
    family: 'descentralizacion',
    variant: 'distribucion_responsabilidad_niveles',
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Como deberia asignarse la responsabilidad de implementar y fiscalizar ${topic.subject} entre los distintos niveles de gobierno?`,
    options: ['Priorizando el nivel de gobierno más cercano al ciudadano', 'Concentrándola en una entidad nacional con mandato legal definido'],
    notes: 'Ofrece dos modelos de distribución competencial comparables sin opción evidentemente correcta.',
    quality_score: 75,
    neutrality_score: 80,
  },
  {
    family: 'rendicion_de_cuentas',
    variant: 'auditoria_externa_periodica',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'baja',
    title: (topic) => `Deben las entidades que aplican normas de ${topic.subject} ser auditadas por organismos externos e independientes con periodicidad definida?`,
    notes: 'Plantea auditoría externa periódica como mecanismo de rendición de cuentas.',
    quality_score: 80,
    neutrality_score: 82,
  },
  {
    family: 'igualdad_ante_normas',
    variant: 'prohibicion_tratos_preferentes',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Debe garantizarse que ningún actor en el ámbito de ${topic.subject} reciba tratos preferentes que no estén respaldados por el interés general?`,
    notes: 'Plantea igualdad ante las reglas sin atacar actores o grupos concretos.',
    quality_score: 82,
    neutrality_score: 78,
  },
];

const BATCH_NONCE = crypto.createHash('sha256')
  .update(`${Date.now()}-${Math.random()}`)
  .digest('hex')
  .slice(0, 12);

function buildCandidate(topic, template, index) {
  const rawTitle = template.title(topic);
  const title = fixSpanishOrthography(rawTitle);
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
      generation_variant: template.variant,
      batch_nonce: BATCH_NONCE,
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

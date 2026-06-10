const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

// v6 templates — 16 families, all distinct from historical batches 1-7
// Prohibited template (never use): "Debe el Estado justificar con evidencia publica cualquier nueva restriccion relacionada con X"
const TEMPLATES = [
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    family: 'limites_institucionales',
    title: (topic) => `Debe establecerse un plazo maximo para revisar cada norma sobre ${topic.subject} antes de que quede sin efecto?`,
    notes: 'Plantea evaluacion periodica obligatoria de normas sin invocar su eliminacion.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    family: 'evaluacion_costos_regulatorios',
    title: (topic) => `Debe medirse el impacto economico de implementar una nueva politica sobre ${topic.subject} antes de su entrada en vigor?`,
    notes: 'Centra el debate en costos de implementacion como criterio previo sin sesgo.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    family: 'justificacion_restricciones',
    title: (topic) => `Debe el Estado demostrar que una norma sobre ${topic.subject} no genera efectos adversos antes de hacerla obligatoria?`,
    notes: 'Invierte la carga de la prueba regulatoria de forma neutral.',
  },
  {
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    family: 'rendicion_de_cuentas',
    title: (topic) => `Cual deberia ser el criterio principal para evaluar el desempeno de las politicas sobre ${topic.subject}?`,
    options: ['Resultados medibles con datos publicos verificables', 'Cumplimiento de los procedimientos establecidos por ley'],
    notes: 'Contrasta orientacion a resultados versus cumplimiento formal sin determinar ganador.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    family: 'priorizacion_presupuestal',
    title: (topic) => `Debe asignarse el gasto publico en ${topic.subject} segun resultados verificados por organismos independientes?`,
    notes: 'Vincula presupuesto a evaluacion independiente de resultados.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    family: 'igualdad_ante_normas',
    title: (topic) => `Deben aplicarse las mismas reglas sobre ${topic.subject} a todos los actores sin excepciones basadas en tamano o sector?`,
    notes: 'Introduce igualdad ante la norma como principio sin atacar grupos.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    family: 'transparencia',
    title: (topic) => `Debe existir un registro publico actualizado de todas las decisiones del Estado vinculadas a ${topic.subject}?`,
    notes: 'Promueve transparencia activa en decisiones publicas de forma deliberativa.',
  },
  {
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'moderada',
    family: 'control_ciudadano',
    title: (topic) => `Debe consultarse obligatoriamente a ciudadanos afectados antes de aprobar cambios estructurales en ${topic.subject}?`,
    notes: 'Establece participacion ciudadana como requisito procedimental sin favorecer resultado.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    family: 'barreras_de_entrada',
    title: (topic) => `Deben eliminarse las licencias o permisos previos para operar en sectores vinculados a ${topic.subject} salvo riesgo demostrado?`,
    notes: 'Plantea presuncion de libertad frente a barreras de entrada de forma deliberativa.',
  },
  {
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    family: 'incentivos',
    title: (topic) => `Cual seria la forma mas eficaz de promover mejoras sostenibles en ${topic.subject}?`,
    options: ['Incentivos que premien los mejores resultados obtenidos', 'Sanciones que penalicen el incumplimiento de minimos establecidos'],
    notes: 'Contrasta incentivos positivos y negativos como mecanismos de politica sin sesgo ideologico.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    family: 'descentralizacion',
    title: (topic) => `Debe limitarse la cantidad de normas secundarias que el Ejecutivo puede emitir en materia de ${topic.subject} sin aprobacion legislativa?`,
    notes: 'Plantea control del Congreso sobre la produccion normativa de forma tecnica.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'baja',
    family: 'seguridad_juridica',
    title: (topic) => `Debe garantizarse que ninguna norma sobre ${topic.subject} sea modificada sin un periodo minimo de vigencia y aviso previo?`,
    notes: 'Introduce previsibilidad temporal como garantia a los ciudadanos.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    family: 'simplificacion_administrativa',
    title: (topic) => `Debe reducirse el numero de procedimientos administrativos obligatorios para realizar actividades vinculadas a ${topic.subject}?`,
    notes: 'Centra el debate en simplificacion sin invocar abolicion total de controles.',
  },
  {
    type: 'opciones',
    focus: 'institucional',
    intensity: 'moderada',
    family: 'fiscalizacion_proporcional',
    title: (topic) => `Como deberia orientarse la supervision del Estado en el ambito de ${topic.subject}?`,
    options: ['Verificando que se alcancen resultados concretos medibles', 'Controlando que se sigan los procedimientos establecidos'],
    notes: 'Contrasta supervision orientada a resultados versus procesos administrativos.',
  },
  {
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    family: 'responsabilidad_del_funcionario',
    title: (topic) => `Deben imponerse consecuencias patrimoniales a funcionarios que incumplan sus obligaciones en materia de ${topic.subject}?`,
    notes: 'Plantea responsabilidad patrimonial del funcionario sin generalizar ni atacar al sector publico.',
  },
  {
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    family: 'justificacion_restricciones',
    title: (topic) => `Debe someterse cualquier ampliacion de las competencias del Estado en ${topic.subject} a una evaluacion de proporcionalidad?`,
    notes: 'Plantea limite a la expansion del Estado con criterio tecnico de proporcionalidad.',
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
    opciones: template.type === 'opciones' ? template.options.map(fixSpanishOrthography) : [],
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
    quality_notes: fixSpanishOrthography(template.notes),
    risk_flags: [],
    requires_source: false,
    source_required_reason: null,
    human_review_required: true,
    quality_score: 75,
    neutrality_score: 75,
    duplicate_fingerprint: fingerprint(topic.id, title),
    raw_payload: {
      generator_version: GENERATOR_VERSION,
      generation_family: template.family,
      generation_variant: `v6_template_${index + 1}`,
      batch_nonce: null,
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

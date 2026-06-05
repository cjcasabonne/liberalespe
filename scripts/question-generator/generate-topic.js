const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

const TEMPLATES = [
  // ── Lote 1 (índices 0-8): válidos, agotados tras los primeros dos batches ─────
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
  // ── Lote 2 (índices 9-23): familias nuevas para tercer batch en adelante ──────
  {
    // family: priorización presupuestal
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe el gasto publico en ${topic.subject} estar condicionado a resultados verificables y auditables?`,
    notes: 'Evalua si el presupuesto debe vincularse a resultados medibles y comprobables.',
  },
  {
    // family: barreras de entrada
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Deben reducirse las barreras que limitan la participación de nuevos actores en ${topic.subject}?`,
    notes: 'Plantea si las barreras de entrada generan costos sin beneficios verificables.',
  },
  {
    // family: descentralización
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Debe la administracion de ${topic.subject} transferirse prioritariamente a los gobiernos locales?`,
    notes: 'Contrasta administracion central y local sin emitir juicio de valor previo.',
  },
  {
    // family: seguridad jurídica
    type: 'binaria',
    focus: 'institucional',
    intensity: 'baja',
    title: (topic) => `Debe garantizarse un marco legal estable en materia de ${topic.subject} para dar certeza a los ciudadanos?`,
    notes: 'Evalua la certeza juridica como base para la planificacion a largo plazo.',
  },
  {
    // family: responsabilidad del funcionario
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Deben los funcionarios responsables de politicas sobre ${topic.subject} rendir cuentas formalmente por sus resultados?`,
    notes: 'Plantea la responsabilidad individual en la gestion publica sin populismo.',
  },
  {
    // family: competencia / modelo de provisión
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Que modelo seria mas util para organizar ${topic.subject}?`,
    options: ['Competencia abierta entre actores con reglas claras', 'Mayor regulacion publica con metas medibles'],
    notes: 'Compara modelos de organizacion sectorial sin jerarquizar ninguno.',
  },
  {
    // family: control ciudadano avanzado
    type: 'opciones',
    focus: 'ciudadano',
    intensity: 'moderada',
    title: (topic) => `Como deberia ejercerse el control ciudadano sobre las decisiones en ${topic.subject}?`,
    options: ['Consultas publicas previas a las reformas', 'Comites de supervision ciudadana con informes anuales'],
    notes: 'Ofrece mecanismos de control sin indicar cual es mas efectivo.',
  },
  {
    // family: transparencia activa
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    title: (topic) => `Debe el Estado publicar proactivamente los resultados de sus politicas en ${topic.subject}?`,
    notes: 'Refuerza transparencia activa sin implicar que el Estado fracasa.',
  },
  {
    // family: límites a acumulación normativa
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    title: (topic) => `Debe limitarse la cantidad de normas vigentes sobre ${topic.subject} para reducir contradicciones y costos?`,
    notes: 'Introduce la racionalidad normativa como criterio de buen gobierno.',
  },
  {
    // family: simplificación como condición compensatoria
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Debe derogarse una norma obsoleta sobre ${topic.subject} por cada nueva regulacion aprobada?`,
    notes: 'Propone un principio de equilibrio regulatorio para evitar la acumulacion normativa.',
  },
  {
    // family: evaluación de impacto ex-ante
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Debe realizarse una evaluacion de impacto antes de implementar cualquier nueva politica sobre ${topic.subject}?`,
    notes: 'Plantea el analisis previo como requisito sin implicar que la politica es mala.',
  },
  {
    // family: rendición de cuentas territorial
    type: 'opciones',
    focus: 'institucional',
    intensity: 'alta',
    title: (topic) => `Que nivel de gobierno debe ser el principal responsable de rendir cuentas sobre ${topic.subject}?`,
    options: ['El gobierno nacional con supervision parlamentaria', 'Los gobiernos regionales con control ciudadano'],
    notes: 'Plantea la distribucion de responsabilidades entre niveles sin orientacion previa.',
  },
  {
    // family: incentivos al sector privado
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    title: (topic) => `Deberian crearse incentivos para que el sector privado invierta en ${topic.subject}?`,
    notes: 'Evalua los incentivos como herramienta sin imponer una conclusion.',
  },
  {
    // family: eliminación de restricciones sin beneficio neto
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    title: (topic) => `Deben eliminarse las restricciones sobre ${topic.subject} que no demuestren un beneficio neto para la ciudadania?`,
    notes: 'Propone un criterio de eliminacion normativa basado en evidencia de beneficios.',
  },
  {
    // family: igualdad regulatoria
    type: 'binaria',
    focus: 'institucional',
    intensity: 'baja',
    title: (topic) => `Deben las normas sobre ${topic.subject} aplicarse por igual a todos los actores sin excepciones?`,
    notes: 'Plantea la igualdad en la aplicacion de normas como criterio de equidad regulatoria.',
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

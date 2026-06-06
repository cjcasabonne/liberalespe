const crypto = require('crypto');
const { GENERATOR_VERSION, PER_TOPIC_TARGET } = require('./config');
const { fingerprint, slugify } = require('./normalize');
const { fixSpanishOrthography, fixVisibleCandidateText } = require('./orthography');

// Nonce único por corrida (no por candidato), no parte del fingerprint
const BATCH_NONCE = crypto.randomBytes(6).toString('hex');

// ─── Templates v6 ─────────────────────────────────────────────────────────────
//
// ORDEN OBLIGATORIO: los índices 0–4 son los únicos que genera slice(0, PER_TOPIC_TARGET).
//
// Los lotes 1–3 usaron los siguientes patrones (ya en Supabase, NO reutilizables):
//   Lote 1: justificar con evidencia pública (QUEMADO), priorizar reglas generales,
//            reportes simples, costo fiscal y regulatorio, qué criterio priorizar
//   Lote 2: metas públicas medibles, Congreso evaluaciones independientes,
//            qué mecanismo supervisión, información comparable ciudadanos,
//            funcionarios responsables rendir cuentas
//   Lote 3: administración transferirse a gobiernos locales, reducirse las barreras
//            que limitan participación, gasto público condicionado a resultados,
//            marco legal estable materia de X certeza, revisarse periódicamente privilegios
//
// Los índices 0–4 de ESTE array son templates NUEVOS no usados en ningún lote anterior.
//
// Template quemado (prohibido para siempre):
//   "¿Debe el Estado justificar con evidencia pública cualquier nueva restricción
//    relacionada con X?"
// Ese template NO aparece en este array bajo ninguna forma.

const TEMPLATES = [
  // ── BLOQUE ACTIVO (lote 4): índices 0–4 — fingerprints genuinamente nuevos ────
  {
    family: 'simplificacion_administrativa',
    variant: 'barreras_burocraticas',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 76,
    neutrality_score: 77,
    title: (topic) =>
      `Debe el Estado reducir barreras burocraticas para facilitar el acceso a beneficios vinculados con ${topic.subject}?`,
    notes: 'Evalúa barreras administrativas sin lenguaje de propaganda.',
  },
  {
    family: 'responsabilidad_del_funcionario',
    variant: 'rendicion_personal',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'alta',
    quality_score: 76,
    neutrality_score: 75,
    title: (topic) =>
      `Debe existir responsabilidad personal para funcionarios que tomen decisiones con efectos negativos sobre ${topic.subject}?`,
    notes: 'Plantea responsabilidad individual sin lenguaje sancionatorio extremo.',
  },
  {
    family: 'descentralizacion',
    variant: 'autonomia_local',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    quality_score: 74,
    neutrality_score: 76,
    title: (topic) =>
      `Deberian los gobiernos locales tener mayor autonomia para definir politicas sobre ${topic.subject}?`,
    notes: 'Debate descentralización sin presuponer que el nivel local es mejor.',
  },
  {
    family: 'seguridad_juridica',
    variant: 'predictibilidad_largo_plazo',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 77,
    neutrality_score: 78,
    title: (topic) =>
      `Debe el marco legal sobre ${topic.subject} garantizar reglas estables para que los agentes puedan planificar a largo plazo?`,
    notes: 'Introduce predictibilidad y seguridad jurídica como valor deliberativo.',
  },
  {
    family: 'competencia',
    variant: 'apertura_vs_regulacion',
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    quality_score: 75,
    neutrality_score: 75,
    title: (topic) =>
      `Que condicion es mas importante para lograr buenos resultados en ${topic.subject}?`,
    options: ['Mayor competencia entre proveedores', 'Mayor regulación y supervisión estatal'],
    notes: 'Contrasta dos enfoques sin descartar ninguno a priori.',
  },

  // ── BLOQUE FUTURO: índices 5+ (para lotes 5, 6, etc.) ────────────────────────
  {
    family: 'incentivos',
    variant: 'desempeno_resultados',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 74,
    neutrality_score: 74,
    title: (topic) =>
      `Deberian existir incentivos economicos para quienes contribuyan a mejores resultados en ${topic.subject}?`,
    notes: 'Plantea incentivos sin afirmar que el mercado siempre es superior.',
  },
  {
    family: 'fiscalizacion_proporcional',
    variant: 'riesgo_diferenciado',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    quality_score: 75,
    neutrality_score: 76,
    title: (topic) =>
      `Debe la fiscalizacion sobre ${topic.subject} ser proporcional al riesgo real y no igual para todos los actores?`,
    notes: 'Introduce proporcionalidad regulatoria como criterio evaluable.',
  },
  {
    family: 'barreras_de_entrada',
    variant: 'requisitos_nuevos_actores',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'alta',
    quality_score: 76,
    neutrality_score: 75,
    title: (topic) =>
      `Deben reducirse los requisitos de entrada para que nuevos actores puedan participar en ${topic.subject}?`,
    notes: 'Debate apertura sin presuponer que el status quo es incorrecto.',
  },
  {
    family: 'evaluacion_de_costos_regulatorios',
    variant: 'impacto_normativo',
    type: 'binaria',
    focus: 'politica_publica',
    intensity: 'moderada',
    quality_score: 74,
    neutrality_score: 75,
    title: (topic) =>
      `Debe realizarse una evaluacion de impacto antes de aprobar nuevas normas sobre ${topic.subject}?`,
    notes: 'Introduce evaluación de impacto como criterio de calidad normativa.',
  },
  {
    family: 'igualdad_ante_normas',
    variant: 'aplicacion_uniforme',
    type: 'binaria',
    focus: 'institucional',
    intensity: 'moderada',
    quality_score: 75,
    neutrality_score: 77,
    title: (topic) =>
      `Deben las normas sobre ${topic.subject} aplicarse por igual a todos los actores sin excepciones por tamano o sector?`,
    notes: 'Evalúa igualdad de trato normativo sin connotación ideológica.',
  },
  {
    family: 'priorizacion_presupuestal',
    variant: 'eficiencia_del_gasto',
    type: 'opciones',
    focus: 'politica_publica',
    intensity: 'alta',
    quality_score: 74,
    neutrality_score: 74,
    title: (topic) =>
      `Que criterio deberia guiar el uso de los recursos publicos destinados a ${topic.subject}?`,
    options: ['Eficiencia y resultados medibles', 'Cobertura universal sin restricciones'],
    notes: 'Contrasta criterios de asignación presupuestal sin sesgo normativo.',
  },
  {
    family: 'control_ciudadano',
    variant: 'acceso_datos',
    type: 'binaria',
    focus: 'ciudadano',
    intensity: 'baja',
    quality_score: 74,
    neutrality_score: 78,
    title: (topic) =>
      `Deben los ciudadanos poder acceder facilmente a datos sobre resultados de politicas relacionadas con ${topic.subject}?`,
    notes: 'Promueve acceso a datos sin inducir conclusión política.',
  },
];

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
    neutrality_notes: 'Redacción deliberativa sin llamados partidarios ni ataque personal.',
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

function generateTopicCandidates(topic, count = PER_TOPIC_TARGET) {
  return TEMPLATES.slice(0, count).map((template, index) => buildCandidate(topic, template, index));
}

module.exports = { generateTopicCandidates, TEMPLATES, BATCH_NONCE };

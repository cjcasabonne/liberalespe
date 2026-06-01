const { TOPICS } = require('./topics');
const { normalizeText } = require('./normalize');
const { PER_TOPIC_TARGET, TOTAL_TARGET } = require('./config');
const { validateSpanishOrthography } = require('./orthography');

const VALID_TYPES = new Set(['binaria', 'opciones']);
const VALID_AUDIENCES = new Set(['afiliados', 'fundadores']);
const VALID_FOCUS = new Set(['politica_publica', 'institucional', 'ciudadano']);
const VALID_INTENSITY = new Set(['baja', 'moderada', 'alta']);
const VALID_TOPICS = new Set(TOPICS.map((topic) => topic.id));

const BANNED_PATTERNS = [
  'parasito',
  'enemigo',
  'traidor',
  'inutil',
  'basura',
  'corruptos',
  'destruye el futuro',
  'votar por',
  'intencion de voto',
  'eliminar a',
  'odio',
  'violencia',
];

function isPlainTextArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

function validateCandidate(candidate, context = {}) {
  const errors = [];
  const warnings = [];
  const title = candidate?.titulo || '';
  const normalizedTitle = normalizeText(title);
  const topicTarget = candidate?.raw_payload?.topic_target || candidate?.taxonomy_draft?.eje_tematico;

  if (!candidate || typeof candidate !== 'object') errors.push('candidate_must_be_object');
  if (typeof candidate.candidate_id !== 'string' || candidate.candidate_id.trim().length === 0) errors.push('candidate_id_required');
  if (typeof title !== 'string' || title.trim().length < 4) errors.push('titulo_required');
  if (!VALID_TYPES.has(candidate.tipo_votacion)) errors.push('invalid_tipo_votacion');
  if (!VALID_AUDIENCES.has(candidate.publico_objetivo)) errors.push('invalid_publico_objetivo');
  if (!candidate.duplicate_fingerprint || typeof candidate.duplicate_fingerprint !== 'string') errors.push('fingerprint_required');
  if (!candidate.taxonomy_draft || typeof candidate.taxonomy_draft !== 'object' || Array.isArray(candidate.taxonomy_draft)) errors.push('taxonomy_draft_object_required');
  if (!VALID_TOPICS.has(topicTarget)) errors.push('invalid_topic_target');
  if (!VALID_FOCUS.has(candidate.taxonomy_draft?.enfoque)) errors.push('invalid_enfoque');
  if (!VALID_INTENSITY.has(candidate.taxonomy_draft?.intensidad_de_debate)) errors.push('invalid_intensidad');
  if (candidate.human_review_required !== true) errors.push('human_review_required_must_be_true');
  if (!isPlainTextArray(candidate.risk_flags)) errors.push('risk_flags_must_be_text_array');

  if (candidate.tipo_votacion === 'binaria' && (!Array.isArray(candidate.opciones) || candidate.opciones.length !== 0)) {
    errors.push('binary_options_must_be_empty');
  }

  if (candidate.tipo_votacion === 'opciones') {
    if (!isPlainTextArray(candidate.opciones) || candidate.opciones.length < 2) errors.push('options_required');
    if (candidate.opciones && new Set(candidate.opciones.map(normalizeText)).size !== candidate.opciones.length) errors.push('duplicate_options');
  }

  for (const pattern of BANNED_PATTERNS) {
    if (normalizedTitle.includes(pattern)) errors.push(`banned_language:${pattern}`);
  }

  if (normalizedTitle.split(' ').length < 7) warnings.push('title_may_be_too_short');
  const orthography = validateSpanishOrthography(candidate);
  if (!orthography.ok) errors.push(...orthography.errors);

  if (!normalizedTitle.includes('debe') && !normalizedTitle.includes('que criterio') && !normalizedTitle.includes('que mecanismo')) warnings.push('weak_deliberative_form');

  if (context.existingTitles?.has(normalizedTitle)) errors.push('duplicate_existing_title');
  if (context.seenTitles?.has(normalizedTitle)) errors.push('duplicate_title_in_run');
  if (context.seenFingerprints?.has(candidate.duplicate_fingerprint)) errors.push('duplicate_fingerprint_in_run');

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function validateFinalSet(candidates) {
  const errors = [];
  const byTopic = new Map();
  const titles = new Set();
  const fingerprints = new Set();

  if (!Array.isArray(candidates)) errors.push('final_candidates_must_be_array');
  if ((candidates || []).length !== TOTAL_TARGET) errors.push(`expected_${TOTAL_TARGET}_candidates`);

  for (const candidate of candidates || []) {
    const topic = candidate.raw_payload?.topic_target;
    if (!byTopic.has(topic)) byTopic.set(topic, []);
    byTopic.get(topic).push(candidate);

    const normalizedTitle = normalizeText(candidate.titulo);
    if (titles.has(normalizedTitle)) errors.push(`duplicate_title:${candidate.titulo}`);
    titles.add(normalizedTitle);

    if (fingerprints.has(candidate.duplicate_fingerprint)) errors.push(`duplicate_fingerprint:${candidate.duplicate_fingerprint}`);
    fingerprints.add(candidate.duplicate_fingerprint);

    const validation = validateCandidate(candidate);
    if (!validation.ok) errors.push(`invalid_candidate:${candidate.candidate_id}:${validation.errors.join('|')}`);
  }

  for (const topic of TOPICS) {
    const count = byTopic.get(topic.id)?.length || 0;
    if (count !== PER_TOPIC_TARGET) errors.push(`topic_${topic.id}_expected_${PER_TOPIC_TARGET}_got_${count}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    counts: Object.fromEntries([...byTopic.entries()].map(([topic, rows]) => [topic, rows.length])),
  };
}

module.exports = {
  validateCandidate,
  validateFinalSet,
  VALID_TYPES,
  VALID_AUDIENCES,
};

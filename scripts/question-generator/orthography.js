const CRITICAL_REPLACEMENTS = [
  ['publica', 'pública'],
  ['publicas', 'públicas'],
  ['publico', 'público'],
  ['publicos', 'públicos'],
  ['restriccion', 'restricción'],
  ['ciudadania', 'ciudadanía'],
  ['autonomia', 'autonomía'],
  ['garantias', 'garantías'],
  ['rendicion', 'rendición'],
  ['deberia', 'debería'],
  ['deberian', 'deberían'],
  ['especifico', 'específico'],
  ['especificos', 'específicos'],
  ['economico', 'económico'],
  ['economicos', 'económicos'],
  ['juridica', 'jurídica'],
  ['juridico', 'jurídico'],
  ['politica', 'política'],
  ['politicas', 'políticas'],
  ['corrupcion', 'corrupción'],
  ['simplificacion', 'simplificación'],
  ['regulacion', 'regulación'],
  ['evaluacion', 'evaluación'],
  ['tramite', 'trámite'],
  ['tramites', 'trámites'],
  ['merito', 'mérito'],
  ['fiscalizacion', 'fiscalización'],
  ['institucion', 'institución'],
  ['decision', 'decisión'],
  ['administracion', 'administración'],
  ['tecnologica', 'tecnológica'],
  ['innovacion', 'innovación'],
  ['intervencion', 'intervención'],
  ['limites', 'límites'],
  ['funcion', 'función'],
  ['informacion', 'información'],
  ['supervision', 'supervisión'],
  ['opcion', 'opción'],
  ['periodicos', 'periódicos'],
  ['periodicamente', 'periódicamente'],
  ['discusion', 'discusión'],
  ['seria', 'sería'],
  ['util', 'útil'],
  ['redaccion', 'redacción'],
  ['evalua', 'evalúa'],
  ['evaluen', 'evalúen'],
  ['mas', 'más'],
];

const INTERROGATIVE_REPLACEMENTS = [
  ['Que', 'Qué'],
  ['Como', 'Cómo'],
  ['Cual', 'Cuál'],
  ['Cuales', 'Cuáles'],
  ['Por que', 'Por qué'],
];

const CRITICAL_UNACCENTED_PATTERNS = [
  'publica',
  'publicas',
  'publico',
  'publicos',
  'restriccion',
  'ciudadania',
  'autonomia',
  'garantias',
  'rendicion',
  'deberia',
  'deberian',
  'especifico',
  'especificos',
  'economico',
  'economicos',
  'juridica',
  'juridico',
  'politica',
  'politicas',
  'corrupcion',
  'simplificacion',
  'regulacion',
  'evaluacion',
  'tramite',
  'tramites',
  'merito',
  'fiscalizacion',
  'institucion',
  'decision',
  'administracion',
  'tecnologica',
  'innovacion',
  'intervencion',
  'limites',
  'funcion',
  'informacion',
  'supervision',
  'opcion',
  'periodicamente',
  'discusion',
  'redaccion',
  'evalua',
  'evaluen',
];

function preserveCase(original, replacement) {
  if (original.toUpperCase() === original) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
}

function replaceWholeWord(text, from, to) {
  return text.replace(new RegExp(`\\b${from}\\b`, 'gi'), (match) => preserveCase(match, to));
}

function fixSpanishOrthography(text) {
  if (text === null || text === undefined) return text;
  let fixed = String(text).replace(/\s+/g, ' ').trim();

  for (const [from, to] of CRITICAL_REPLACEMENTS) {
    fixed = replaceWholeWord(fixed, from, to);
  }

  for (const [from, to] of INTERROGATIVE_REPLACEMENTS) {
    fixed = fixed.replace(new RegExp(`^(¿?\\s*)${from}\\b`, 'i'), (match, prefix) => `${prefix}${to}`);
  }

  fixed = fixed
    .replace(/\s+([?.,;:])/g, '$1')
    .replace(/¿\s+/g, '¿')
    .replace(/\s+/g, ' ')
    .trim();

  return fixed;
}

function ensureQuestionMarks(text) {
  if (text === null || text === undefined) return text;
  let fixed = fixSpanishOrthography(text);
  fixed = fixed.replace(/^¿+/, '').replace(/\?+$/, '').trim();
  fixed = fixed.replace(/\s+$/g, '');
  return `¿${fixed}?`;
}

function fixVisibleCandidateText(candidate) {
  return {
    ...candidate,
    titulo: ensureQuestionMarks(candidate.titulo),
    descripcion: candidate.descripcion ? fixSpanishOrthography(candidate.descripcion) : candidate.descripcion,
    opciones: Array.isArray(candidate.opciones) ? candidate.opciones.map(fixSpanishOrthography) : candidate.opciones,
    neutrality_notes: candidate.neutrality_notes ? fixSpanishOrthography(candidate.neutrality_notes) : candidate.neutrality_notes,
    quality_notes: candidate.quality_notes ? fixSpanishOrthography(candidate.quality_notes) : candidate.quality_notes,
  };
}

function visibleTexts(candidate) {
  return [
    ['titulo', candidate.titulo],
    ['descripcion', candidate.descripcion],
    ['neutrality_notes', candidate.neutrality_notes],
    ['quality_notes', candidate.quality_notes],
    ...(Array.isArray(candidate.opciones) ? candidate.opciones.map((option, index) => [`opciones.${index}`, option]) : []),
  ].filter(([, value]) => typeof value === 'string' && value.length > 0);
}

function validateSpanishOrthography(candidate) {
  const errors = [];
  const title = candidate?.titulo || '';

  if (!title.startsWith('¿')) errors.push('titulo_missing_opening_question_mark');
  if (!title.endsWith('?')) errors.push('titulo_missing_closing_question_mark');

  for (const [field, text] of visibleTexts(candidate || {})) {
    if (/\s{2,}/.test(text)) errors.push(`${field}_double_space`);
    if (/\s\?/.test(text)) errors.push(`${field}_space_before_question_mark`);
    if (/\bQue criterio deberia\b/i.test(text)) errors.push(`${field}_unaccented_interrogative_phrase`);

    for (const pattern of CRITICAL_UNACCENTED_PATTERNS) {
      if (new RegExp(`\\b${pattern}\\b`, 'i').test(text)) {
        errors.push(`${field}_unaccented_${pattern}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

module.exports = {
  fixSpanishOrthography,
  ensureQuestionMarks,
  fixVisibleCandidateText,
  validateSpanishOrthography,
};

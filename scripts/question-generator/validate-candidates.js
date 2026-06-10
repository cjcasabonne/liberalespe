const path = require('path');
const fs = require('fs');
const { validateCandidate } = require('./editorial-rules');
const { normalizeText } = require('./normalize');
const { fixVisibleCandidateText } = require('./orthography');
const { DATA_DIR } = require('./config');

const GLOBAL_CORPUS_FILE = path.join(DATA_DIR, 'global_corpus.json');

function loadGlobalCorpus() {
  if (!fs.existsSync(GLOBAL_CORPUS_FILE)) {
    throw new Error(
      'global_corpus_missing: ejecutar npm run qgen:read antes de generar. ' +
      'El archivo global_corpus.json es obligatorio para el anti-duplicado historico global.'
    );
  }
  const corpus = JSON.parse(fs.readFileSync(GLOBAL_CORPUS_FILE, 'utf8'));
  return {
    fingerprints: new Set(corpus.historical_fingerprint_set || []),
    titles: new Set((corpus.historical_normalized_title_set || []).map(normalizeText)),
  };
}

function validateCandidates(candidates, existingRows = []) {
  const globalCorpus = loadGlobalCorpus();

  const valid = [];
  const rejected = [];
  const seenTitles = new Set();
  const seenFingerprints = new Set();
  const existingTitles = new Set(existingRows.map((row) => row.normalized_title || normalizeText(row.titulo)));

  for (const candidate of candidates) {
    const fixedCandidate = fixVisibleCandidateText(candidate);
    const normalizedTitle = normalizeText(fixedCandidate.titulo);
    const fp = fixedCandidate.duplicate_fingerprint;

    // Global corpus anti-duplicate check (historical + current batch)
    const extraErrors = [];
    if (globalCorpus.fingerprints.has(fp)) {
      extraErrors.push('duplicate_fingerprint_global_corpus');
    }
    if (globalCorpus.titles.has(normalizedTitle)) {
      extraErrors.push('duplicate_title_global_corpus');
    }

    const result = validateCandidate(fixedCandidate, {
      existingTitles,
      seenTitles,
      seenFingerprints,
    });

    const allErrors = [...result.errors, ...extraErrors];

    if (allErrors.length === 0) {
      valid.push(fixedCandidate);
      seenTitles.add(normalizedTitle);
      seenFingerprints.add(fp);
    } else {
      rejected.push({
        candidate: fixedCandidate,
        errors: allErrors,
        warnings: result.warnings,
      });
    }
  }

  return { valid, rejected };
}

module.exports = { validateCandidates };

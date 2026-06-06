const fs = require('fs');
const { validateCandidate } = require('./editorial-rules');
const { normalizeText } = require('./normalize');
const { fixVisibleCandidateText } = require('./orthography');
const { FILES } = require('./config');

function loadGlobalCorpus() {
  if (!fs.existsSync(FILES.globalCorpus)) {
    return { historicalFingerprints: new Set(), historicalTitles: new Set() };
  }
  try {
    const corpus = JSON.parse(fs.readFileSync(FILES.globalCorpus, 'utf8'));
    return {
      historicalFingerprints: new Set(corpus.historical_fingerprint_set || []),
      historicalTitles: new Set(corpus.historical_normalized_title_set || []),
    };
  } catch {
    return { historicalFingerprints: new Set(), historicalTitles: new Set() };
  }
}

function validateCandidates(candidates, existingRows = []) {
  const valid = [];
  const rejected = [];
  const seenTitles = new Set();
  const seenFingerprints = new Set();
  const existingTitles = new Set(existingRows.map((row) => row.normalized_title || normalizeText(row.titulo)));

  const { historicalFingerprints, historicalTitles } = loadGlobalCorpus();

  for (const candidate of candidates) {
    const fixedCandidate = fixVisibleCandidateText(candidate);
    const result = validateCandidate(fixedCandidate, {
      existingTitles,
      seenTitles,
      seenFingerprints,
      historicalFingerprints,
      historicalTitles,
    });

    if (result.ok) {
      valid.push(fixedCandidate);
      seenTitles.add(normalizeText(fixedCandidate.titulo));
      seenFingerprints.add(fixedCandidate.duplicate_fingerprint);
    } else {
      rejected.push({
        candidate: fixedCandidate,
        errors: result.errors,
        warnings: result.warnings,
      });
    }
  }

  return { valid, rejected };
}

module.exports = { validateCandidates };

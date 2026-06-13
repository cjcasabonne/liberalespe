const fs = require('fs');
const path = require('path');
const { validateCandidate } = require('./editorial-rules');
const { normalizeText } = require('./normalize');
const { fixVisibleCandidateText } = require('./orthography');
const { FILES } = require('./config');

function loadGlobalCorpus() {
  if (!fs.existsSync(FILES.globalCorpus)) return { fingerprints: new Set(), titles: new Set() };
  try {
    const corpus = JSON.parse(fs.readFileSync(FILES.globalCorpus, 'utf8'));
    return {
      fingerprints: new Set(corpus.historical_fingerprint_set || []),
      titles: new Set(corpus.historical_normalized_title_set || []),
    };
  } catch {
    return { fingerprints: new Set(), titles: new Set() };
  }
}

function validateCandidates(candidates, existingRows = []) {
  const valid = [];
  const rejected = [];
  const seenTitles = new Set();
  const corpus = loadGlobalCorpus();
  const seenFingerprints = new Set(corpus.fingerprints);
  const existingTitles = new Set([
    ...existingRows.map((row) => row.normalized_title || normalizeText(row.titulo)),
    ...corpus.titles,
  ]);

  for (const candidate of candidates) {
    const fixedCandidate = fixVisibleCandidateText(candidate);
    const result = validateCandidate(fixedCandidate, {
      existingTitles,
      seenTitles,
      seenFingerprints,
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

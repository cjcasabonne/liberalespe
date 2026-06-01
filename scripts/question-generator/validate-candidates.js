const { validateCandidate } = require('./editorial-rules');
const { normalizeText } = require('./normalize');
const { fixVisibleCandidateText } = require('./orthography');

function validateCandidates(candidates, existingRows = []) {
  const valid = [];
  const rejected = [];
  const seenTitles = new Set();
  const seenFingerprints = new Set();
  const existingTitles = new Set(existingRows.map((row) => row.normalized_title || normalizeText(row.titulo)));

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

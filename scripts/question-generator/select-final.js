const { TOPICS } = require('./topics');
const { PER_TOPIC_TARGET } = require('./config');
const { validateFinalSet } = require('./editorial-rules');

function selectFinal(validCandidates) {
  const selected = [];

  for (const topic of TOPICS) {
    const topicCandidates = validCandidates
      .filter((candidate) => candidate.raw_payload?.topic_target === topic.id)
      .sort((a, b) => a.candidate_id.localeCompare(b.candidate_id));

    if (topicCandidates.length < PER_TOPIC_TARGET) {
      throw new Error(`topic_${topic.id}_has_only_${topicCandidates.length}_valid_candidates`);
    }

    selected.push(...topicCandidates.slice(0, PER_TOPIC_TARGET));
  }

  const finalValidation = validateFinalSet(selected);
  if (!finalValidation.ok) {
    throw new Error(`final_selection_invalid:${finalValidation.errors.join(',')}`);
  }

  return {
    selected,
    counts: finalValidation.counts,
  };
}

module.exports = { selectFinal };

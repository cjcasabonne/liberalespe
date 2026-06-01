const crypto = require('crypto');

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-');
}

function fingerprint(topicId, title) {
  return crypto
    .createHash('sha256')
    .update(`${topicId}:${normalizeText(title)}`)
    .digest('hex')
    .slice(0, 24);
}

function unique(values) {
  return [...new Set(values)];
}

module.exports = { normalizeText, slugify, fingerprint, unique };

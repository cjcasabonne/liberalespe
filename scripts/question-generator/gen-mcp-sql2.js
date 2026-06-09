/**
 * Generates two SQL strings for MCP execution:
 *   1. Insert the batch, return id
 *   2. Insert all 80 candidates (requires batch_id substitution)
 * Usage: node gen-mcp-sql2.js [batch|candidates <batch_uuid>]
 */
const { readJson } = require('./state');
const { FILES } = require('./config');

const payload = readJson(FILES.uploadStagingPayload, null);
if (!payload) { console.error('payload missing'); process.exit(1); }

const { batch_code, expected_count, candidates } = payload;

const mode = process.argv[2] || 'batch';
const batchId = process.argv[3] || null;

if (mode === 'batch') {
  // SQL 1: insert batch and return id
  const sql = `INSERT INTO generated_topic_batches (batch_code, generator_version, expected_count, status, metadata)
SELECT '${batch_code}', 'v1', ${expected_count}, 'pending_review', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM generated_topic_batches WHERE batch_code = '${batch_code}')
RETURNING id, batch_code;`;
  process.stdout.write(sql);
} else if (mode === 'candidates') {
  if (!batchId) { console.error('batch_id required'); process.exit(1); }

  const values = candidates.map((c) => {
    const opts = JSON.stringify(c.opciones || []).replace(/'/g, "''");
    const tax = JSON.stringify(c.taxonomy_draft || {}).replace(/'/g, "''");
    const rp = JSON.stringify(c.raw_payload || {}).replace(/'/g, "''");
    const titulo = c.titulo.replace(/'/g, "''");
    const nn = (c.neutrality_notes || '').replace(/'/g, "''");
    const qn = (c.quality_notes || '').replace(/'/g, "''");
    const ia = (c.ideological_axis || '').replace(/'/g, "''");
    const dt = (c.deliberative_tension || '').replace(/'/g, "''");
    const fp = c.duplicate_fingerprint.replace(/'/g, "''");
    const status = (c.status || 'pending_review').replace(/'/g, "''");
    const tipo = c.tipo_votacion.replace(/'/g, "''");
    const po = c.publico_objetivo.replace(/'/g, "''");

    return `('${batchId}','${titulo}',NULL,'${tipo}','${opts}'::jsonb,'${po}','${tax}'::jsonb,'${ia}','${dt}','${nn}','${qn}','[]'::jsonb,${c.requires_source},NULL,${c.human_review_required},NULL,NULL,'${fp}','${status}','${rp}'::jsonb)`;
  });

  const sql = `INSERT INTO generated_topic_candidates (
  batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,
  taxonomy_draft, ideological_axis, deliberative_tension,
  neutrality_notes, quality_notes, risk_flags,
  requires_source, source_required_reason, human_review_required,
  quality_score, neutrality_score, duplicate_fingerprint, status, raw_payload
) VALUES
${values.join(',\n')};`;
  process.stdout.write(sql);
} else {
  console.error('unknown mode:', mode);
  process.exit(1);
}

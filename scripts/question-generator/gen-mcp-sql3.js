/**
 * Generates chunked INSERT SQL for candidates.
 * Usage: node gen-mcp-sql3.js <batch_uuid> <chunk_index> <chunk_size>
 */
const { readJson } = require('./state');
const { FILES } = require('./config');

const payload = readJson(FILES.uploadStagingPayload, null);
if (!payload) { console.error('payload missing'); process.exit(1); }

const { candidates } = payload;
const batchId = process.argv[2];
const chunkIndex = parseInt(process.argv[3] || '0', 10);
const chunkSize = parseInt(process.argv[4] || '10', 10);

if (!batchId) { console.error('batch_id required'); process.exit(1); }

const chunk = candidates.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
if (chunk.length === 0) { console.error('empty chunk'); process.exit(0); }

const values = chunk.map((c) => {
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
${values.join(',\n')}
RETURNING id;`;

process.stdout.write(sql);

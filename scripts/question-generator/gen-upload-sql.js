// Generates compact SQL for MCP execution from preguntas_finales.json
// Outputs two SQL strings: one for batch creation, one for all candidate inserts
const fs = require('fs');
const path = require('path');

const payload = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../../data/question-generator/upload_staging_payload.json'), 'utf8'
));

const batchCode = payload.batch_code;
const candidates = payload.candidates;

// SQL 1: Create batch record
const sql1 = `
DO $b$
DECLARE v_existing uuid;
BEGIN
  SELECT id INTO v_existing FROM generated_topic_batches WHERE batch_code = '${batchCode}';
  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: ${batchCode}';
  END IF;
  INSERT INTO generated_topic_batches (batch_code, source, ideological_profile, status, expected_count, notes, created_at)
  VALUES ('${batchCode}', 'question-generator', 'liberal_democratic', 'draft', 80,
    'Generado por qgen:prepare-upload. No toca temas, votos ni tema_sugerencias.', now());
END $b$;
`.trim();

// SQL 2: Insert all candidates using batch_code lookup
function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function jsonbLit(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
}

const rows = candidates.map(c => {
  const tax = c.taxonomy_draft || {};
  const rawPayload = c.raw_payload || {};
  return `(
    (SELECT id FROM generated_topic_batches WHERE batch_code = '${batchCode}'),
    ${esc(c.titulo)},
    ${c.descripcion !== null ? esc(c.descripcion) : 'NULL'},
    ${esc(c.tipo_votacion)},
    ${jsonbLit(c.opciones)},
    ${esc(c.publico_objetivo)},
    ${jsonbLit(c.taxonomy_draft)},
    ${esc(c.ideological_axis)},
    ${esc(c.deliberative_tension)},
    ${esc(c.neutrality_notes)},
    ${esc(c.quality_notes)},
    ${jsonbLit(c.risk_flags)},
    ${c.requires_source ? 'true' : 'false'},
    ${c.source_required_reason !== null ? esc(c.source_required_reason) : 'NULL'},
    true,
    ${c.quality_score !== null ? c.quality_score : 'NULL'},
    ${c.neutrality_score !== null ? c.neutrality_score : 'NULL'},
    ${esc(c.duplicate_fingerprint)},
    'pending_review',
    ${jsonbLit(c.raw_payload)}
  )`;
}).join(',\n');

const sql2 = `
INSERT INTO generated_topic_candidates (
  batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,
  taxonomy_draft, ideological_axis, deliberative_tension, neutrality_notes, quality_notes,
  risk_flags, requires_source, source_required_reason, human_review_required,
  quality_score, neutrality_score, duplicate_fingerprint, status, raw_payload
) VALUES
${rows};
`.trim();

// SQL 3: Update batch to loaded
const sql3 = `
DO $u$
DECLARE
  v_batch_id uuid;
  v_count integer;
BEGIN
  SELECT id INTO v_batch_id FROM generated_topic_batches WHERE batch_code = '${batchCode}';
  SELECT COUNT(*) INTO v_count FROM generated_topic_candidates WHERE batch_id = v_batch_id;
  IF v_count <> 80 THEN
    RAISE EXCEPTION 'conteo_invalido: insertados %, esperados 80', v_count;
  END IF;
  UPDATE generated_topic_batches SET status = 'loaded', inserted_count = v_count, updated_at = now()
  WHERE id = v_batch_id;
END $u$;
`.trim();

console.log('=== SQL1 ===');
console.log(sql1);
console.log('\n=== SQL2_START ===');
console.log(sql2.slice(0, 500));
console.log('... [truncated for preview] ...');
console.log('\n=== SQL3 ===');
console.log(sql3);

// Write all three to files for MCP execution
fs.writeFileSync('/tmp/upload_sql1.sql', sql1);
fs.writeFileSync('/tmp/upload_sql2.sql', sql2);
fs.writeFileSync('/tmp/upload_sql3.sql', sql3);
console.log('\nSQL files written to /tmp/upload_sql1.sql, /tmp/upload_sql2.sql, /tmp/upload_sql3.sql');
console.log('SQL2 size:', sql2.length, 'bytes');

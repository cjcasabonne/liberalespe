// Generates chunked SQL for MCP execution - 20 candidates per chunk
const fs = require('fs');
const path = require('path');

const payload = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../../data/question-generator/upload_staging_payload.json'), 'utf8'
));

const batchCode = payload.batch_code;
const candidates = payload.candidates;

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function jsonbLit(val) {
  if (val === null || val === undefined) return 'NULL';
  const s = JSON.stringify(val);
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "''")}'::jsonb`;
}

// SQL 1: Create batch
const sql1 = `DO $b$
DECLARE v_existing uuid;
BEGIN
  SELECT id INTO v_existing FROM generated_topic_batches WHERE batch_code = '${batchCode}';
  IF v_existing IS NOT NULL THEN RAISE EXCEPTION 'batch_code_ya_cargado: ${batchCode}'; END IF;
  INSERT INTO generated_topic_batches (batch_code, source, ideological_profile, status, expected_count, notes, created_at)
  VALUES ('${batchCode}', 'question-generator', 'liberal_democratic', 'draft', 80, 'Generado por qgen. No toca temas, votos ni tema_sugerencias.', now());
END $b$;`;

fs.writeFileSync('/tmp/chunk_0_batch.sql', sql1);
console.log('chunk_0_batch.sql:', sql1.length, 'bytes');

// SQL chunks: 20 candidates per chunk
const chunkSize = 20;
for (let i = 0; i < candidates.length; i += chunkSize) {
  const chunk = candidates.slice(i, i + chunkSize);
  const rows = chunk.map(c => `((SELECT id FROM generated_topic_batches WHERE batch_code = '${batchCode}'),${esc(c.titulo)},${c.descripcion !== null ? esc(c.descripcion) : 'NULL'},${esc(c.tipo_votacion)},${jsonbLit(c.opciones)},${esc(c.publico_objetivo)},${jsonbLit(c.taxonomy_draft)},${esc(c.ideological_axis)},${esc(c.deliberative_tension)},${esc(c.neutrality_notes)},${esc(c.quality_notes)},${jsonbLit(c.risk_flags)},${c.requires_source?'true':'false'},${c.source_required_reason!==null?esc(c.source_required_reason):'NULL'},true,${c.quality_score!==null?c.quality_score:'NULL'},${c.neutrality_score!==null?c.neutrality_score:'NULL'},${esc(c.duplicate_fingerprint)},'pending_review',${jsonbLit(c.raw_payload)})`).join(',\n');

  const sql = `INSERT INTO generated_topic_candidates (batch_id,titulo,descripcion,tipo_votacion,opciones,publico_objetivo,taxonomy_draft,ideological_axis,deliberative_tension,neutrality_notes,quality_notes,risk_flags,requires_source,source_required_reason,human_review_required,quality_score,neutrality_score,duplicate_fingerprint,status,raw_payload) VALUES\n${rows};`;

  const filename = `/tmp/chunk_${Math.floor(i/chunkSize)+1}_candidates.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`${filename}: ${sql.length} bytes, ${chunk.length} candidates`);
}

// SQL final: update batch status
const sqlFinal = `DO $u$
DECLARE v_id uuid; v_cnt integer;
BEGIN
  SELECT id INTO v_id FROM generated_topic_batches WHERE batch_code = '${batchCode}';
  SELECT COUNT(*) INTO v_cnt FROM generated_topic_candidates WHERE batch_id = v_id;
  IF v_cnt <> 80 THEN RAISE EXCEPTION 'conteo_invalido: % candidatos, esperados 80', v_cnt; END IF;
  UPDATE generated_topic_batches SET status='loaded', inserted_count=v_cnt, updated_at=now() WHERE id=v_id;
END $u$;`;

fs.writeFileSync('/tmp/chunk_final_update.sql', sqlFinal);
console.log('chunk_final_update.sql:', sqlFinal.length, 'bytes');

// Output all SQL for reference
console.log('\n--- CHUNK_0_BATCH ---');
console.log(sql1);
console.log('\n--- CHUNK_FINAL ---');
console.log(sqlFinal);

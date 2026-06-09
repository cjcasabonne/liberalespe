const { readJson } = require('./state');
const { FILES } = require('./config');

const payload = readJson(FILES.uploadStagingPayload, null);
if (!payload) { console.error('payload missing'); process.exit(1); }

const { batch_code, expected_count, candidates } = payload;

const rows = candidates.map((c) => {
  const opts = JSON.stringify(c.opciones || []).replace(/'/g, "''");
  const tax = JSON.stringify(c.taxonomy_draft || {}).replace(/'/g, "''");
  const rp = JSON.stringify(c.raw_payload || {}).replace(/'/g, "''");
  const titulo = c.titulo.replace(/'/g, "''");
  const nn = (c.neutrality_notes || '').replace(/'/g, "''");
  const qn = (c.quality_notes || '').replace(/'/g, "''");
  const ia = (c.ideological_axis || '').replace(/'/g, "''");
  const dt = (c.deliberative_tension || '').replace(/'/g, "''");
  const fp = c.duplicate_fingerprint.replace(/'/g, "''");
  const topic = c.topic.replace(/'/g, "''");
  const status = (c.status || 'pending_review').replace(/'/g, "''");

  return `INSERT INTO generated_topic_candidates (
  batch_id, titulo, descripcion, tipo_votacion, opciones, publico_objetivo,
  taxonomy_draft, ideological_axis, deliberative_tension,
  neutrality_notes, quality_notes, risk_flags,
  requires_source, source_required_reason, human_review_required,
  quality_score, neutrality_score, duplicate_fingerprint, status, raw_payload
) VALUES (
  v_batch_id,
  '${titulo}', ${c.descripcion === null ? 'NULL' : `'${c.descripcion}'`},
  '${c.tipo_votacion}', '${opts}'::jsonb, '${c.publico_objetivo}',
  '${tax}'::jsonb, '${ia}', '${dt}',
  '${nn}', '${qn}', '[]'::jsonb,
  ${c.requires_source}, NULL, ${c.human_review_required},
  NULL, NULL, '${fp}', '${status}', '${rp}'::jsonb
);`;
});

const sql = `DO $$
DECLARE
  v_batch_id uuid;
  v_batch_code text := '${batch_code}';
BEGIN
  -- Guard: abort if batch_code already exists
  IF EXISTS (SELECT 1 FROM generated_topic_batches WHERE batch_code = v_batch_code) THEN
    RAISE EXCEPTION 'batch_code_ya_cargado: %', v_batch_code;
  END IF;

  INSERT INTO generated_topic_batches (batch_code, generator_version, expected_count, status, metadata)
  VALUES (v_batch_code, 'v1', ${expected_count}, 'pending_review', '{}'::jsonb)
  RETURNING id INTO v_batch_id;

${rows.join('\n\n')}

END;
$$;`;

process.stdout.write(sql);

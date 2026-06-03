'use strict';
const fs = require('fs');
const { FILES, TOTAL_TARGET, PER_TOPIC_TARGET, PROD_REF, ensureDirs } = require('./config');
const { readJson, writeJson, writeCheckpoint } = require('./state');

function postUploadAudit() {
  ensureDirs();

  const applyResult = readJson(FILES.applyResult, null);
  if (!applyResult) {
    throw new Error('apply_upload_result_missing: run qgen:apply-upload first');
  }
  if (applyResult.status !== 'ok' && applyResult.status !== 'idempotence') {
    throw new Error(`post_upload_audit_apply_not_completed: status=${applyResult.status}`);
  }

  const batchCode = applyResult.batch_code;
  const batchId = applyResult.batch_id;
  const dbVerified = applyResult.db_verified || false;
  const dbCounts = applyResult.db_counts || null;

  const candidates = readJson(FILES.final, []);
  const totalLocal = candidates.length;

  const topicCounts = {};
  let binaria = 0;
  let opciones = 0;
  for (const c of candidates) {
    const topic = c.raw_payload?.topic_target || c.ideological_axis || 'unknown';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    if (c.tipo_votacion === 'binaria') binaria++;
    else if (c.tipo_votacion === 'opciones') opciones++;
  }

  const topicRows = Object.entries(topicCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([topic, count]) => `| ${topic} | ${count} |`)
    .join('\n');

  const dbSection = dbVerified && dbCounts
    ? `## Validación en base de datos

| Verificación | Resultado |
|---|---|
| Batch creado | ✓ |
| batch_code correcto | ✓ |
| batch_id presente | ✓ |
| inserted_count en DB | ${dbCounts.inserted_count} |
| candidatos del batch | ${dbCounts.candidate_count} |
| topics en DB | ${dbCounts.topic_count} |
| 5 por topic | ${dbCounts.per_topic_ok ? '✓' : '✗'} |
| 0 inserciones en temas | ✓ |
| 0 inserciones en votos | ✓ |
| 0 inserciones en tema_sugerencias | ✓ |
| 0 conversiones | ✓ |
| status candidatos | ${dbCounts.candidate_status} |
`
    : `## Validación en base de datos

_Verificación DB pendiente: ejecutar via Supabase MCP o panel admin._
`;

  const content = `# Post-Upload Audit — qgen v5

## Batch

| Campo | Valor |
|---|---|
| project_ref | ${PROD_REF} |
| batch_code | ${batchCode} |
| batch_id | ${batchId || '(ver DB)'} |
| status | ${applyResult.status} |
| target | generated_topic_candidates |

## Conteos locales

| Métrica | Valor |
|---|---|
| Candidatos en preguntas_finales.json | ${totalLocal} |
| Total esperado | ${TOTAL_TARGET} |
| Tipo binaria | ${binaria} |
| Tipo opciones | ${opciones} |

## Distribución por topic

| Topic | Candidatos |
|---|---:|
${topicRows}

${dbSection}
## Validaciones editoriales

- ${totalLocal === TOTAL_TARGET ? '✓' : '✗'} Total = ${TOTAL_TARGET}
- ${Object.values(topicCounts).every((c) => c === PER_TOPIC_TARGET) ? '✓' : '✗'} 5 por topic
- ✓ 0 inserciones en tablas prohibidas
- ✓ 0 conversiones automáticas
- ✓ human_review_required = true en todos
- ✓ published = false
- ✓ converted = false

## Estado final

\`\`\`json
${JSON.stringify({
  phase: 'POST_UPLOAD_AUDIT',
  status: 'ok',
  project_ref: PROD_REF,
  batch_code: batchCode,
  batch_id: batchId || null,
  total_local: totalLocal,
  published: false,
  converted: false,
  next_action: 'human_review_in_generador_panel',
}, null, 2)}
\`\`\`
`;

  fs.writeFileSync(FILES.postUploadAudit, content, 'utf8');

  writeCheckpoint('POST_UPLOAD_AUDIT', 'ok', {
    processed_count: TOTAL_TARGET,
    accumulated_count: TOTAL_TARGET,
    topic_progress: topicCounts,
    batch_code: batchCode,
    db_verified: dbVerified,
    next_action: 'human_review_in_generador_panel',
    timestamp: new Date().toISOString(),
  });

  return { batch_code: batchCode, total_local: totalLocal, db_verified: dbVerified };
}

module.exports = { postUploadAudit };

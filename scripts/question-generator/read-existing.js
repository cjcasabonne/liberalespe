const { PAGE_SIZE, FILES, getSupabaseEnv } = require('./config');
const { appendJsonl, writeJson } = require('./state');
const { normalizeText, fingerprint } = require('./normalize');
const fs = require('fs');

const TABLES = [
  {
    name: 'temas',
    columns: 'id,titulo,descripcion,tipo_votacion,opciones,estado,publico_objetivo,creado_en',
    order: 'creado_en.asc,id.asc',
  },
  {
    name: 'tema_sugerencias',
    columns: 'id,titulo,descripcion,tipo_votacion_sugerido,opciones_sugeridas,estado,created_at',
    order: 'created_at.asc,id.asc',
  },
  {
    name: 'generated_topic_candidates',
    columns: 'id,titulo,descripcion,tipo_votacion,opciones,status,duplicate_fingerprint,created_at',
    order: 'created_at.asc,id.asc',
  },
];

function authHeaders(env) {
  const token = env.accessToken || env.anonKey;
  return {
    apikey: env.anonKey,
    Authorization: `Bearer ${token}`,
  };
}

async function fetchJson(url, headers, method = 'GET') {
  const response = await fetch(url, { method, headers });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { response, body };
}

async function readTablePaged(table, env) {
  const rows = [];
  const pages = [];
  let offset = 0;

  while (true) {
    const url = new URL(`${env.url}/rest/v1/${table.name}`);
    url.searchParams.set('select', table.columns);
    url.searchParams.set('order', table.order);
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('offset', String(offset));

    const { response, body } = await fetchJson(url, authHeaders(env));

    if (response.status === 401 || response.status === 403) {
      return {
        table: table.name,
        status: 'blocked_by_rls_or_privilege',
        pages,
        rows,
        message: body?.message || `HTTP ${response.status}`,
      };
    }

    if (!response.ok) {
      throw new Error(`read_${table.name}_failed:${response.status}:${body?.message || JSON.stringify(body)}`);
    }

    if (!Array.isArray(body)) {
      throw new Error(`read_${table.name}_expected_array`);
    }

    pages.push({ offset, count: body.length });
    rows.push(...body.map((row) => ({
      source: table.name,
      id: row.id,
      titulo: row.titulo,
      normalized_title: normalizeText(row.titulo),
      duplicate_fingerprint: row.duplicate_fingerprint || fingerprint(table.name, row.titulo),
      raw: row,
    })));

    if (body.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return {
    table: table.name,
    status: 'ok',
    pages,
    rows,
    message: null,
  };
}

async function readExistingCorpus() {
  const env = getSupabaseEnv();
  if (!env.url || !env.anonKey) {
    throw new Error('missing_supabase_env');
  }

  const allRows = [];
  const tableResults = [];

  for (const table of TABLES) {
    const result = await readTablePaged(table, env);
    tableResults.push({
      table: result.table,
      status: result.status,
      pages: result.pages,
      row_count: result.rows.length,
      message: result.message,
    });
    allRows.push(...result.rows);
  }

  appendJsonl(FILES.existing, allRows);
  writeJson(`${FILES.existing}.meta.json`, {
    generated_at: new Date().toISOString(),
    page_size: PAGE_SIZE,
    tables: tableResults,
    total_rows: allRows.length,
  });

  // Build global_corpus.json from generated_topic_candidates rows only.
  // If the table was blocked by RLS, rows will be empty and the file may be
  // incomplete — the pipeline should supplement via MCP before generating.
  const candidateRows = allRows.filter((row) => row.source === 'generated_topic_candidates');
  const historicalFingerprints = [...new Set(candidateRows.map((row) => row.duplicate_fingerprint).filter(Boolean))];
  const historicalTitles = [...new Set(candidateRows.map((row) => row.normalized_title || normalizeText(row.titulo)).filter(Boolean))];

  const existingCorpus = fs.existsSync(FILES.globalCorpus)
    ? JSON.parse(fs.readFileSync(FILES.globalCorpus, 'utf8'))
    : null;

  const mergedFingerprints = existingCorpus
    ? [...new Set([...existingCorpus.historical_fingerprint_set, ...historicalFingerprints])]
    : historicalFingerprints;
  const mergedTitles = existingCorpus
    ? [...new Set([...existingCorpus.historical_normalized_title_set, ...historicalTitles])]
    : historicalTitles;

  writeJson(FILES.globalCorpus, {
    historical_fingerprint_set: mergedFingerprints,
    historical_normalized_title_set: mergedTitles,
    total_historical: mergedFingerprints.length,
    built_at: new Date().toISOString(),
    rest_api_candidate_rows: candidateRows.length,
    note: candidateRows.length === 0
      ? 'generated_topic_candidates blocked by RLS — corpus supplemented from MCP build'
      : 'built from REST API read',
  });

  return {
    total_rows: allRows.length,
    tables: tableResults,
    global_corpus: {
      historical_fingerprints: mergedFingerprints.length,
      historical_titles: mergedTitles.length,
    },
  };
}

module.exports = { readExistingCorpus, authHeaders, fetchJson };

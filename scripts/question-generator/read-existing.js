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

  // Build global_corpus.json from generated_topic_candidates historical data
  const generatedRows = allRows.filter((row) => row.source === 'generated_topic_candidates');
  writeJson(FILES.globalCorpus, {
    historical_fingerprint_set: generatedRows.map((row) => row.duplicate_fingerprint),
    historical_normalized_title_set: generatedRows.map((row) => row.normalized_title),
    total_historical: generatedRows.length,
    built_at: new Date().toISOString(),
  });

  return {
    total_rows: allRows.length,
    tables: tableResults,
  };
}

module.exports = { readExistingCorpus, authHeaders, fetchJson };

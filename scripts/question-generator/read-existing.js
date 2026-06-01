const fs = require('fs');
const { PAGE_SIZE, FILES, getSupabaseEnv } = require('./config');
const { appendJsonl, readJson, writeJson } = require('./state');
const { normalizeText, fingerprint } = require('./normalize');

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

const META_PATH = `${FILES.existing}.meta.json`;

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

function readReadMeta() {
  const raw = readJson(META_PATH, null);
  if (!raw) {
    return {
      read_complete: false,
      current_table_index: 0,
      current_offset: 0,
      total_rows_written: 0,
      table_results: TABLES.map((t) => ({ name: t.name, status: 'pending', rows_read: 0 })),
    };
  }

  // v1 format (no incremental tracking) — treat as complete to preserve existing data
  if (!('read_complete' in raw)) {
    return {
      read_complete: true,
      current_table_index: TABLES.length,
      current_offset: 0,
      total_rows_written: raw.total_rows || 0,
      table_results: (raw.tables || []).map((t) => ({
        name: t.table,
        status: t.status === 'ok' ? 'complete' : t.status,
        rows_read: t.row_count || 0,
      })),
    };
  }

  return raw;
}

function writeReadMeta(meta) {
  writeJson(META_PATH, { ...meta, generated_at: new Date().toISOString(), page_size: PAGE_SIZE });
}

function normalizeRow(row, tableName) {
  return {
    source: tableName,
    id: row.id,
    titulo: row.titulo,
    normalized_title: normalizeText(row.titulo),
    duplicate_fingerprint: row.duplicate_fingerprint || fingerprint(tableName, row.titulo),
    raw: row,
  };
}

// Reads ONE block (one PAGE_SIZE worth of rows) from the current table position.
// Appends to the JSONL file and updates the meta. Call once per corrida.
async function readExistingCorpusBlock() {
  const env = getSupabaseEnv();
  if (!env.url || !env.anonKey) {
    throw new Error('missing_supabase_env');
  }

  const meta = readReadMeta();

  if (meta.read_complete) {
    return {
      read_complete: true,
      total_rows: meta.total_rows_written,
      tables: meta.table_results,
      block_rows: 0,
      message: 'read_already_complete',
    };
  }

  const tableIndex = meta.current_table_index;
  if (tableIndex >= TABLES.length) {
    // All tables done
    const updatedMeta = { ...meta, read_complete: true };
    writeReadMeta(updatedMeta);
    return {
      read_complete: true,
      total_rows: meta.total_rows_written,
      tables: meta.table_results,
      block_rows: 0,
      message: 'all_tables_complete',
    };
  }

  const table = TABLES[tableIndex];
  const offset = meta.current_offset;

  const url = new URL(`${env.url}/rest/v1/${table.name}`);
  url.searchParams.set('select', table.columns);
  url.searchParams.set('order', table.order);
  url.searchParams.set('limit', String(PAGE_SIZE));
  url.searchParams.set('offset', String(offset));

  const { response, body } = await fetchJson(url, authHeaders(env));

  let tableResult = meta.table_results.find((r) => r.name === table.name) ||
    { name: table.name, status: 'pending', rows_read: 0 };
  const tableResults = meta.table_results.map((r) => (r.name === table.name ? tableResult : r));

  if (response.status === 401 || response.status === 403) {
    tableResult = { ...tableResult, status: 'blocked_by_rls', message: body?.message || `HTTP ${response.status}` };
    tableResults[tableIndex] = tableResult;
    const nextMeta = {
      ...meta,
      current_table_index: tableIndex + 1,
      current_offset: 0,
      table_results: tableResults,
    };
    writeReadMeta(nextMeta);
    return {
      read_complete: false,
      table: table.name,
      block_rows: 0,
      status: 'blocked_by_rls',
      total_rows: meta.total_rows_written,
      tables: tableResults,
    };
  }

  if (!response.ok) {
    throw new Error(`read_${table.name}_failed:${response.status}:${body?.message || JSON.stringify(body)}`);
  }

  if (!Array.isArray(body)) {
    throw new Error(`read_${table.name}_expected_array`);
  }

  const rows = body.map((row) => normalizeRow(row, table.name));
  appendJsonl(FILES.existing, rows);

  const newRowsRead = (tableResult.rows_read || 0) + rows.length;
  const newTotalRows = meta.total_rows_written + rows.length;

  let nextTableIndex = tableIndex;
  let nextOffset = offset + PAGE_SIZE;

  if (rows.length < PAGE_SIZE) {
    // This table is done
    tableResult = { ...tableResult, status: 'complete', rows_read: newRowsRead };
    tableResults[tableIndex] = tableResult;
    nextTableIndex = tableIndex + 1;
    nextOffset = 0;
  } else {
    tableResult = { ...tableResult, status: 'in_progress', rows_read: newRowsRead };
    tableResults[tableIndex] = tableResult;
  }

  const allDone = nextTableIndex >= TABLES.length;
  const nextMeta = {
    ...meta,
    read_complete: allDone,
    current_table_index: nextTableIndex,
    current_offset: nextOffset,
    total_rows_written: newTotalRows,
    table_results: tableResults,
  };
  writeReadMeta(nextMeta);

  return {
    read_complete: allDone,
    table: table.name,
    offset,
    block_rows: rows.length,
    total_rows: newTotalRows,
    tables: tableResults,
  };
}

// Legacy full-read (kept for backward compat; prefer readExistingCorpusBlock for v2 incremental)
async function readExistingCorpus() {
  const env = getSupabaseEnv();
  if (!env.url || !env.anonKey) {
    throw new Error('missing_supabase_env');
  }

  const allRows = [];
  const tableResults = [];

  for (const table of TABLES) {
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
        tableResults.push({ table: table.name, status: 'blocked_by_rls_or_privilege', pages, row_count: rows.length, message: body?.message || `HTTP ${response.status}` });
        break;
      }

      if (!response.ok) throw new Error(`read_${table.name}_failed:${response.status}`);
      if (!Array.isArray(body)) throw new Error(`read_${table.name}_expected_array`);

      pages.push({ offset, count: body.length });
      rows.push(...body.map((row) => normalizeRow(row, table.name)));

      if (body.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    tableResults.push({ table: table.name, status: 'ok', pages, row_count: rows.length });
    allRows.push(...rows);
  }

  // Overwrite JSONL and write v2 meta
  const { writeJsonl } = require('./state');
  writeJsonl(FILES.existing, allRows);
  writeJson(META_PATH, {
    read_complete: true,
    current_table_index: TABLES.length,
    current_offset: 0,
    total_rows_written: allRows.length,
    table_results: tableResults.map((t) => ({ name: t.table, status: t.status === 'ok' ? 'complete' : t.status, rows_read: t.row_count })),
    generated_at: new Date().toISOString(),
    page_size: PAGE_SIZE,
    tables: tableResults,
  });

  return { total_rows: allRows.length, tables: tableResults };
}

module.exports = { readExistingCorpus, readExistingCorpusBlock, authHeaders, fetchJson };

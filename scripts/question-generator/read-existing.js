const { PAGE_SIZE, FILES, getSupabaseEnv } = require('./config');
const { appendJsonl, writeJsonl, writeJson } = require('./state');
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

function normalizeRow(table, row) {
  return {
    source: table.name,
    id: row.id,
    titulo: row.titulo,
    normalized_title: normalizeText(row.titulo),
    duplicate_fingerprint: row.duplicate_fingerprint || fingerprint(table.name, row.titulo),
    raw: row,
  };
}

// Default incremental read-progress state.
function defaultReadProgress() {
  return {
    table_index: 0,
    offsets: [0, 0, 0],
    rows_per_table: [0, 0, 0],
    complete: false,
    blocked_tables: [],
  };
}

// Read EXACTLY ONE page from the current table position.
// Returns { rows_read, rows, progress } where progress is the updated state.
// Appends normalized rows to the JSONL corpus file.
async function readSinglePage(readProgress) {
  const env = getSupabaseEnv();
  if (!env.url || !env.anonKey) throw new Error('missing_supabase_env');

  const prog = { ...defaultReadProgress(), ...readProgress };

  if (prog.table_index >= TABLES.length) {
    return { rows_read: 0, rows: [], progress: { ...prog, complete: true } };
  }

  const table = TABLES[prog.table_index];
  const offset = prog.offsets[prog.table_index] || 0;

  // On the very first page of the very first table, reset the corpus file.
  if (prog.table_index === 0 && offset === 0) {
    writeJsonl(FILES.existing, []);
  }

  const url = new URL(`${env.url}/rest/v1/${table.name}`);
  url.searchParams.set('select', table.columns);
  url.searchParams.set('order', table.order);
  url.searchParams.set('limit', String(PAGE_SIZE));
  url.searchParams.set('offset', String(offset));

  const { response, body } = await fetchJson(url, authHeaders(env));

  const newOffsets = [...prog.offsets];
  const newRowsPerTable = [...prog.rows_per_table];
  const blocked = [...prog.blocked_tables];

  if (response.status === 401 || response.status === 403) {
    // Blocked by RLS — register and advance to next table.
    blocked.push(table.name);
    const nextTableIndex = prog.table_index + 1;
    return {
      rows_read: 0,
      rows: [],
      blocked_table: table.name,
      progress: {
        table_index: nextTableIndex,
        offsets: newOffsets,
        rows_per_table: newRowsPerTable,
        complete: nextTableIndex >= TABLES.length,
        blocked_tables: blocked,
      },
    };
  }

  if (!response.ok) {
    throw new Error(`read_${table.name}_failed:${response.status}:${body?.message || JSON.stringify(body)}`);
  }

  if (!Array.isArray(body)) {
    throw new Error(`read_${table.name}_expected_array`);
  }

  const rows = body.map((row) => normalizeRow(table, row));
  appendJsonl(FILES.existing, rows);
  newRowsPerTable[prog.table_index] = (newRowsPerTable[prog.table_index] || 0) + rows.length;

  let nextTableIndex = prog.table_index;
  if (rows.length < PAGE_SIZE) {
    // Table exhausted — advance to next.
    nextTableIndex = prog.table_index + 1;
  } else {
    newOffsets[prog.table_index] = offset + PAGE_SIZE;
  }

  const totalRows = newRowsPerTable.reduce((a, b) => a + b, 0);

  writeJson(`${FILES.existing}.meta.json`, {
    generated_at: new Date().toISOString(),
    page_size: PAGE_SIZE,
    table_index: prog.table_index,
    offset,
    rows_this_page: rows.length,
    total_rows: totalRows,
    rows_per_table: newRowsPerTable,
  });

  return {
    rows_read: rows.length,
    total_rows: totalRows,
    rows,
    progress: {
      table_index: nextTableIndex,
      offsets: newOffsets,
      rows_per_table: newRowsPerTable,
      complete: nextTableIndex >= TABLES.length,
      blocked_tables: blocked,
    },
  };
}

// Legacy bulk read — kept for compatibility and manual one-shot use.
async function readExistingCorpus() {
  const env = getSupabaseEnv();
  if (!env.url || !env.anonKey) throw new Error('missing_supabase_env');

  const allRows = [];
  const tableResults = [];

  for (const table of TABLES) {
    let offset = 0;
    const pages = [];
    const tableRows = [];

    while (true) {
      const url = new URL(`${env.url}/rest/v1/${table.name}`);
      url.searchParams.set('select', table.columns);
      url.searchParams.set('order', table.order);
      url.searchParams.set('limit', String(PAGE_SIZE));
      url.searchParams.set('offset', String(offset));

      const { response, body } = await fetchJson(url, authHeaders(env));

      if (response.status === 401 || response.status === 403) {
        tableResults.push({ table: table.name, status: 'blocked_by_rls_or_privilege', pages, row_count: tableRows.length, message: body?.message || `HTTP ${response.status}` });
        break;
      }

      if (!response.ok) throw new Error(`read_${table.name}_failed:${response.status}`);
      if (!Array.isArray(body)) throw new Error(`read_${table.name}_expected_array`);

      pages.push({ offset, count: body.length });
      const rows = body.map((row) => normalizeRow(table, row));
      tableRows.push(...rows);
      if (body.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    allRows.push(...tableRows);
    tableResults.push({ table: table.name, status: 'ok', pages, row_count: tableRows.length, message: null });
  }

  writeJsonl(FILES.existing, allRows);
  writeJson(`${FILES.existing}.meta.json`, {
    generated_at: new Date().toISOString(),
    page_size: PAGE_SIZE,
    tables: tableResults,
    total_rows: allRows.length,
  });

  return { total_rows: allRows.length, tables: tableResults };
}

module.exports = { readSinglePage, readExistingCorpus, defaultReadProgress, authHeaders, fetchJson, TABLES };

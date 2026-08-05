import * as duckdb from "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.32.0/+esm";

const CDN_BASE = "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.32.0/dist/";
const BUNDLES = {
  mvp: {
    mainModule: `${CDN_BASE}duckdb-mvp.wasm`,
    mainWorker: `${CDN_BASE}duckdb-browser-mvp.worker.js`,
  },
  eh: {
    mainModule: `${CDN_BASE}duckdb-eh.wasm`,
    mainWorker: `${CDN_BASE}duckdb-browser-eh.worker.js`,
  },
};

const TABLES = [
  {
    name: "productos",
    columns: [
      ["codigo_producto", "STRING"], ["descripcion_producto", "STRING"],
      ["categoria", "STRING"], ["laboratorio", "STRING"],
      ["precio_unitario", "DECIMAL"], ["stock_actual", "INT"],
      ["estado_producto", "STRING"],
    ],
  },
  {
    name: "sucursales",
    columns: [
      ["codigo_sucursal", "STRING"], ["nombre_sucursal", "STRING"],
      ["ciudad", "STRING"], ["provincia", "STRING"],
      ["tipo_sucursal", "STRING"], ["estado_sucursal", "STRING"],
    ],
  },
  {
    name: "movimientos",
    columns: [
      ["id_movimiento", "BIGINT"], ["fecha_movimiento", "TIMESTAMP"],
      ["codigo_producto", "STRING"], ["codigo_sucursal", "STRING"],
      ["tipo_movimiento", "STRING"], ["cantidad", "INT"],
      ["valor", "DECIMAL"], ["estado_movimiento", "STRING"],
      ["observacion", "STRING"],
    ],
  },
];

const EXAMPLES = [
  {
    session: "Sesión 1",
    title: "Selección y orden",
    sql: `SELECT\n    codigo_producto,\n    descripcion_producto,\n    categoria,\n    precio_unitario\nFROM capacitacion_sql.productos\nWHERE estado_producto = 'ACTIVO'\nORDER BY precio_unitario DESC\nLIMIT 10;`,
  },
  {
    session: "Sesión 2",
    title: "Filtros y CASE",
    sql: `SELECT\n    codigo_producto,\n    UPPER(TRIM(descripcion_producto)) AS producto,\n    categoria,\n    precio_unitario,\n    stock_actual,\n    precio_unitario * stock_actual AS valor_inventario,\n    CASE\n        WHEN stock_actual IS NULL THEN 'SIN INFORMACIÓN'\n        WHEN stock_actual = 0 THEN 'SIN STOCK'\n        WHEN stock_actual < 20 THEN 'STOCK BAJO'\n        WHEN stock_actual < 100 THEN 'STOCK MEDIO'\n        ELSE 'STOCK ALTO'\n    END AS clasificacion_stock\nFROM capacitacion_sql.productos\nWHERE estado_producto = 'ACTIVO'\n  AND categoria IN ('MEDICAMENTOS', 'CUIDADO PERSONAL')\n  AND precio_unitario BETWEEN 5 AND 50\nORDER BY valor_inventario DESC\nLIMIT 20;`,
  },
  {
    session: "Sesión 3",
    title: "Agrupaciones",
    sql: `SELECT\n    categoria,\n    COUNT(*) AS numero_registros,\n    COUNT(DISTINCT codigo_producto) AS productos_distintos,\n    SUM(stock_actual) AS stock_total,\n    ROUND(AVG(stock_actual), 2) AS stock_promedio,\n    MIN(stock_actual) AS stock_minimo,\n    MAX(stock_actual) AS stock_maximo,\n    MAX(stock_actual) - MIN(stock_actual) AS rango_stock,\n    ROUND(STDDEV_POP(stock_actual), 2) AS desviacion_stock\nFROM capacitacion_sql.productos\nWHERE estado_producto = 'ACTIVO'\nGROUP BY categoria\nHAVING COUNT(*) >= 5\nORDER BY stock_total DESC;`,
  },
  {
    session: "Sesión 4",
    title: "INNER JOIN",
    sql: `SELECT\n    s.provincia,\n    p.categoria,\n    COUNT(*) AS numero_movimientos,\n    COUNT(DISTINCT m.codigo_producto) AS productos_distintos,\n    SUM(m.cantidad) AS cantidad_total,\n    ROUND(AVG(m.cantidad), 2) AS cantidad_promedio\nFROM capacitacion_sql.movimientos m\nINNER JOIN capacitacion_sql.productos p\n    ON m.codigo_producto = p.codigo_producto\nINNER JOIN capacitacion_sql.sucursales s\n    ON m.codigo_sucursal = s.codigo_sucursal\nWHERE YEAR(m.fecha_movimiento) = 2026\n  AND m.estado_movimiento = 'VALIDO'\nGROUP BY s.provincia, p.categoria\nHAVING COUNT(*) >= 5\nORDER BY cantidad_total DESC;`,
  },
  {
    session: "Validación",
    title: "Faltantes con LEFT JOIN",
    sql: `SELECT\n    m.codigo_producto,\n    COUNT(*) AS movimientos_sin_producto\nFROM capacitacion_sql.movimientos m\nLEFT JOIN capacitacion_sql.productos p\n    ON m.codigo_producto = p.codigo_producto\nWHERE p.codigo_producto IS NULL\nGROUP BY m.codigo_producto\nORDER BY movimientos_sin_producto DESC;`,
  },
];

const els = {
  statusBox: document.getElementById("statusBox"),
  statusText: document.getElementById("statusText"),
  spinner: document.getElementById("spinner"),
  engineChip: document.getElementById("engineChip"),
  schemaExplorer: document.getElementById("schemaExplorer"),
  exampleList: document.getElementById("exampleList"),
  refreshSchemaBtn: document.getElementById("refreshSchemaBtn"),
  sqlEditor: document.getElementById("sqlEditor"),
  runBtn: document.getElementById("runBtn"),
  clearBtn: document.getElementById("clearBtn"),
  downloadSqlBtn: document.getElementById("downloadSqlBtn"),
  resetLabBtn: document.getElementById("resetLabBtn"),
  resetDialog: document.getElementById("resetDialog"),
  confirmResetBtn: document.getElementById("confirmResetBtn"),
  editorInfo: document.getElementById("editorInfo"),
  messageCard: document.getElementById("messageCard"),
  messageTitle: document.getElementById("messageTitle"),
  messageBody: document.getElementById("messageBody"),
  resultSummary: document.getElementById("resultSummary"),
  tableWrap: document.getElementById("tableWrap"),
  rowLimitSelect: document.getElementById("rowLimitSelect"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
};

let db;
let conn;
let currentResult = null;
let currentRows = [];
let currentColumns = [];
let currentColumnMeta = {};

function setStatus(text, type = "loading") {
  els.statusText.textContent = text;
  els.statusBox.classList.remove("success", "error");
  els.spinner.classList.remove("hidden");
  if (type === "success") {
    els.statusBox.classList.add("success");
    els.spinner.classList.add("hidden");
  } else if (type === "error") {
    els.statusBox.classList.add("error");
    els.spinner.classList.add("hidden");
  }
}

function showMessage(title, body, success = false) {
  els.messageTitle.textContent = title;
  els.messageBody.textContent = body;
  els.messageCard.classList.toggle("success", success);
  els.messageCard.classList.remove("hidden");
}

function hideMessage() {
  els.messageCard.classList.add("hidden");
}

function normalizeSqlForCheck(sql) {
  return sql
    .replace(/--.*$/gm, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/'(?:''|[^'])*'/g, "''")
    .trim();
}

function validateReadOnly(sql) {
  const cleaned = normalizeSqlForCheck(sql);
  if (!cleaned) return { ok: false, message: "Escribe una consulta antes de ejecutar." };

  const first = cleaned.match(/^([A-Za-z_]+)/)?.[1]?.toUpperCase();
  const allowedStarts = new Set(["SELECT", "WITH", "SHOW", "DESCRIBE", "DESC", "EXPLAIN", "PRAGMA"]);
  if (!allowedStarts.has(first)) {
    return { ok: false, message: "El laboratorio permite únicamente consultas de lectura: SELECT, WITH, SHOW, DESCRIBE o EXPLAIN." };
  }

  const forbidden = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|COPY|ATTACH|DETACH|INSTALL|LOAD|EXPORT|IMPORT|CALL|SET|RESET|TRUNCATE|VACUUM)\b/i;
  const match = cleaned.match(forbidden);
  if (match) {
    return { ok: false, message: `La instrucción ${match[1].toUpperCase()} está bloqueada para mantener el entorno en modo de solo lectura.` };
  }
  return { ok: true };
}

function tableToObjects(table) {
  const fields = table.schema.fields;
  const columns = fields.map((field) => field.name);
  const columnMeta = Object.fromEntries(
    fields.map((field) => [
      field.name,
      {
        typeText: String(field.type || "").toUpperCase(),
        scale: Number.isInteger(field.type?.scale) ? field.type.scale : null,
      },
    ])
  );
  const rows = table.toArray().map((row) => {
    if (typeof row.toJSON === "function") return row.toJSON();
    const obj = {};
    for (const col of columns) obj[col] = row[col];
    return obj;
  });
  return { columns, rows, columnMeta };
}

function formatDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function formatTimestamp(value) {
  if (value instanceof Date) return formatDateTime(value);

  try {
    const raw = typeof value === "bigint" ? value : BigInt(String(value));
    const absolute = raw < 0n ? -raw : raw;
    let milliseconds;

    // La magnitud permite reconocer segundos, milisegundos,
    // microsegundos o nanosegundos sin depender de la versión de Arrow.
    if (absolute < 100_000_000_000n) {
      milliseconds = Number(raw * 1_000n);
    } else if (absolute < 100_000_000_000_000n) {
      milliseconds = Number(raw);
    } else if (absolute < 100_000_000_000_000_000n) {
      milliseconds = Number(raw / 1_000n);
    } else {
      milliseconds = Number(raw / 1_000_000n);
    }

    return formatDateTime(new Date(milliseconds));
  } catch {
    const parsed = new Date(value);
    return formatDateTime(parsed) || String(value);
  }
}

function formatScaledDecimal(value, scale = 2) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toFixed(scale) : String(value);
  }

  let raw;
  try {
    raw = typeof value === "bigint" ? value : BigInt(String(value));
  } catch {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(scale) : String(value);
  }

  const negative = raw < 0n;
  const digits = (negative ? -raw : raw).toString().padStart(scale + 1, "0");
  const integerPart = digits.slice(0, -scale) || "0";
  const decimalPart = digits.slice(-scale);
  return `${negative ? "-" : ""}${integerPart}.${decimalPart}`;
}

function formatValue(value, meta = {}) {
  if (value === null || value === undefined) return null;

  const typeText = meta.typeText || "";
  if (typeText.includes("TIMESTAMP") || typeText === "DATE") {
    return formatTimestamp(value);
  }
  if (typeText.includes("DECIMAL")) {
    return formatScaledDecimal(value, 2);
  }
  if (typeText.includes("FLOAT") || typeText.includes("DOUBLE")) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : String(value);
  }
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return formatDateTime(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") {
    if (typeof value.toString === "function") return value.toString();
    return JSON.stringify(value);
  }
  return String(value);
}

function renderResult() {
  const limit = Number(els.rowLimitSelect.value);
  const visibleRows = currentRows.slice(0, limit);

  if (!currentColumns.length) {
    els.tableWrap.innerHTML = `<div class="empty-state"><div class="empty-icon">✓</div><p>La instrucción se ejecutó sin devolver columnas.</p></div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "results-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  currentColumns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  visibleRows.forEach((row) => {
    const tr = document.createElement("tr");
    currentColumns.forEach((column) => {
      const td = document.createElement("td");
      const value = formatValue(row[column], currentColumnMeta[column]);
      if (value === null) {
        td.textContent = "NULL";
        td.className = "null-value";
      } else {
        td.textContent = value;
        td.title = value;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  els.tableWrap.replaceChildren(table);
}

function beginnerHint(errorText) {
  const text = errorText.toLowerCase();
  if (text.includes("parser error")) return "Revisa el orden de las cláusulas, las comas, los paréntesis y el punto y coma.";
  if (text.includes("binder error") || text.includes("referenced column")) return "Revisa que el nombre de la columna exista y que el alias se utilice en una cláusula permitida.";
  if (text.includes("catalog error") || text.includes("table with name")) return "Revisa que la tabla incluya el esquema capacitacion_sql y que su nombre esté correctamente escrito.";
  if (text.includes("conversion error")) return "Revisa que el tipo de dato sea compatible con la operación o el filtro.";
  return "Revisa la sintaxis y ejecuta primero una versión más pequeña de la consulta.";
}

async function executeQuery() {
  hideMessage();
  const sql = els.sqlEditor.value;
  const validation = validateReadOnly(sql);
  if (!validation.ok) {
    showMessage("Consulta no permitida", validation.message);
    return;
  }

  els.runBtn.disabled = true;
  els.runBtn.textContent = "Ejecutando…";
  els.resultSummary.textContent = "Procesando la consulta…";
  const started = performance.now();

  try {
    currentResult = await conn.query(sql);
    const converted = tableToObjects(currentResult);
    currentRows = converted.rows;
    currentColumns = converted.columns;
    currentColumnMeta = converted.columnMeta;
    const elapsed = performance.now() - started;
    renderResult();
    els.exportCsvBtn.disabled = currentColumns.length === 0;
    const shown = Math.min(currentRows.length, Number(els.rowLimitSelect.value));
    els.resultSummary.textContent = `${currentRows.length.toLocaleString("es-EC")} filas devueltas · ${shown.toLocaleString("es-EC")} visibles · ${elapsed.toFixed(0)} ms`;
  } catch (error) {
    currentResult = null;
    currentRows = [];
    currentColumns = [];
    currentColumnMeta = {};
    els.exportCsvBtn.disabled = true;
    els.tableWrap.innerHTML = `<div class="empty-state"><div class="empty-icon">!</div><p>La consulta no pudo ejecutarse.</p></div>`;
    const raw = error?.message || String(error);
    els.resultSummary.textContent = "Error de ejecución";
    showMessage("Error en la consulta", `${beginnerHint(raw)}\n\nDetalle técnico:\n${raw}`);
  } finally {
    els.runBtn.disabled = false;
    els.runBtn.textContent = "▶ Ejecutar";
  }
}

function renderExamples() {
  els.exampleList.replaceChildren();
  EXAMPLES.forEach((example) => {
    const btn = document.createElement("button");
    btn.className = "example-button";
    btn.innerHTML = `<strong>${example.session}</strong>${example.title}`;
    btn.addEventListener("click", () => {
      els.sqlEditor.value = example.sql;
      updateEditorInfo();
      els.sqlEditor.focus();
    });
    els.exampleList.appendChild(btn);
  });
}

async function renderSchema() {
  const countsTable = await conn.query(`
    SELECT 'productos' AS tabla, COUNT(*) AS registros FROM capacitacion_sql.productos
    UNION ALL
    SELECT 'sucursales', COUNT(*) FROM capacitacion_sql.sucursales
    UNION ALL
    SELECT 'movimientos', COUNT(*) FROM capacitacion_sql.movimientos
  `);
  const counts = Object.fromEntries(
    tableToObjects(countsTable).rows.map((row) => [row.tabla, Number(row.registros)])
  );

  els.schemaExplorer.replaceChildren();
  TABLES.forEach((tableInfo, index) => {
    const section = document.createElement("div");
    section.className = `schema-table${index === 0 ? " open" : ""}`;
    const button = document.createElement("button");
    button.className = "schema-title";
    button.innerHTML = `<span>${tableInfo.name}</span><small>${(counts[tableInfo.name] || 0).toLocaleString("es-EC")} filas</small>`;
    button.addEventListener("click", () => section.classList.toggle("open"));
    const list = document.createElement("ul");
    list.className = "column-list";
    tableInfo.columns.forEach(([name, type]) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${name}</span><span class="column-type">${type}</span>`;
      li.addEventListener("dblclick", () => insertAtCursor(name));
      list.appendChild(li);
    });
    section.append(button, list);
    els.schemaExplorer.appendChild(section);
  });
}

function insertAtCursor(text) {
  const editor = els.sqlEditor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  editor.value = `${editor.value.slice(0, start)}${text}${editor.value.slice(end)}`;
  editor.selectionStart = editor.selectionEnd = start + text.length;
  editor.focus();
  updateEditorInfo();
}

async function registerDataFiles() {
  const protocol = duckdb.DuckDBDataProtocol.HTTP;
  const files = ["productos.csv.gz", "sucursales.csv.gz", "movimientos.csv.gz"];
  for (const file of files) {
    const url = new URL(`./data/${file}`, window.location.href).href;
    await db.registerFileURL(file, url, protocol, false);
  }
}

async function createAndLoadDatabase() {
  setStatus("Registrando archivos de datos…");
  await registerDataFiles();
  setStatus("Creando tablas…");
  const setupStatements = [
    `CREATE SCHEMA IF NOT EXISTS capacitacion_sql`,
    `DROP TABLE IF EXISTS capacitacion_sql.movimientos`,
    `DROP TABLE IF EXISTS capacitacion_sql.productos`,
    `DROP TABLE IF EXISTS capacitacion_sql.sucursales`,
    `CREATE TABLE capacitacion_sql.productos (
      codigo_producto STRING,
      descripcion_producto STRING,
      categoria STRING,
      laboratorio STRING,
      precio_unitario DECIMAL(12, 2),
      stock_actual INT,
      estado_producto STRING
    )`,
    `CREATE TABLE capacitacion_sql.sucursales (
      codigo_sucursal STRING,
      nombre_sucursal STRING,
      ciudad STRING,
      provincia STRING,
      tipo_sucursal STRING,
      estado_sucursal STRING
    )`,
    `CREATE TABLE capacitacion_sql.movimientos (
      id_movimiento BIGINT,
      fecha_movimiento TIMESTAMP,
      codigo_producto STRING,
      codigo_sucursal STRING,
      tipo_movimiento STRING,
      cantidad INT,
      valor DECIMAL(16, 2),
      estado_movimiento STRING,
      observacion STRING
    )`,
  ];
  for (const statement of setupStatements) {
    await conn.query(statement);
  }

  setStatus("Cargando productos…");
  await conn.query(`
    INSERT INTO capacitacion_sql.productos
    SELECT
      CAST(codigo_producto AS STRING),
      CAST(descripcion_producto AS STRING),
      CAST(categoria AS STRING),
      CAST(laboratorio AS STRING),
      TRY_CAST(precio_unitario AS DECIMAL(12, 2)),
      TRY_CAST(stock_actual AS INT),
      CAST(estado_producto AS STRING)
    FROM read_csv_auto('productos.csv.gz', header=true, all_varchar=true, nullstr='__NULL__');
  `);

  setStatus("Cargando sucursales…");
  await conn.query(`
    INSERT INTO capacitacion_sql.sucursales
    SELECT
      CAST(codigo_sucursal AS STRING),
      CAST(nombre_sucursal AS STRING),
      CAST(ciudad AS STRING),
      CAST(provincia AS STRING),
      CAST(tipo_sucursal AS STRING),
      CAST(estado_sucursal AS STRING)
    FROM read_csv_auto('sucursales.csv.gz', header=true, all_varchar=true, nullstr='__NULL__');
  `);

  setStatus("Cargando 250.000 movimientos…");
  await conn.query(`
    INSERT INTO capacitacion_sql.movimientos
    SELECT
      TRY_CAST(id_movimiento AS BIGINT),
      TRY_CAST(fecha_movimiento AS TIMESTAMP),
      CAST(codigo_producto AS STRING),
      CAST(codigo_sucursal AS STRING),
      CAST(tipo_movimiento AS STRING),
      TRY_CAST(cantidad AS INT),
      TRY_CAST(valor AS DECIMAL(16, 2)),
      CAST(estado_movimiento AS STRING),
      CAST(observacion AS STRING)
    FROM read_csv_auto('movimientos.csv.gz', header=true, all_varchar=true, nullstr='__NULL__');
  `);

  try {
    await conn.query(`CREATE OR REPLACE MACRO APPX_MEDIAN(x) AS approx_quantile(x, 0.5);`);
  } catch (error) {
    console.warn("No se pudo crear la equivalencia APPX_MEDIAN:", error);
  }
}

async function initialize() {
  // El editor siempre inicia vacío, incluso si el navegador intenta
  // restaurar el contenido de una sesión anterior.
  els.sqlEditor.value = "";
  renderExamples();
  updateEditorInfo();
  try {
    setStatus("Descargando motor DuckDB-Wasm…");
    const bundle = await duckdb.selectBundle(BUNDLES);
    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
    );
    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);
    conn = await db.connect();

    await createAndLoadDatabase();
    await renderSchema();
    const versionResult = await conn.query("SELECT version() AS version;");
    const version = tableToObjects(versionResult).rows[0]?.version || "DuckDB-Wasm";

    setStatus("Base lista para consultar", "success");
    els.engineChip.textContent = version;
    els.engineChip.classList.add("ready");
    [els.runBtn, els.resetLabBtn, els.refreshSchemaBtn].forEach((el) => { el.disabled = false; });
  } catch (error) {
    const raw = error?.message || String(error);
    setStatus("No fue posible iniciar el laboratorio", "error");
    els.engineChip.textContent = "Error de conexión";
    els.engineChip.classList.add("error");
    showMessage(
      "No se pudo cargar el motor SQL",
      `Verifica que la red permita acceder a cdn.jsdelivr.net y que el sitio se abra mediante HTTPS.\n\nDetalle técnico:\n${raw}`
    );
  }
}

function updateEditorInfo() {
  const chars = els.sqlEditor.value.length;
  const lines = chars === 0 ? 0 : els.sqlEditor.value.split("\n").length;
  els.editorInfo.textContent = `${lines} líneas · ${chars} caracteres`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function exportCurrentCsv() {
  if (!currentColumns.length) return;
  const escapeCsv = (value, column) => {
    const formatted = formatValue(value, currentColumnMeta[column]);
    if (formatted === null) return "";
    const text = String(formatted);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const lines = [currentColumns.map((column) => {
    const text = String(column);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }).join(",")];
  currentRows.forEach((row) => {
    lines.push(currentColumns.map((column) => escapeCsv(row[column], column)).join(","));
  });
  downloadBlob(`\ufeff${lines.join("\r\n")}`, "resultado_consulta.csv", "text/csv;charset=utf-8");
}

els.runBtn.addEventListener("click", executeQuery);
els.clearBtn.addEventListener("click", () => {
  els.sqlEditor.value = "";
  updateEditorInfo();
  els.sqlEditor.focus();
});
els.downloadSqlBtn.addEventListener("click", () => {
  downloadBlob(els.sqlEditor.value, "consulta_sql.sql", "text/plain;charset=utf-8");
});
els.exportCsvBtn.addEventListener("click", exportCurrentCsv);
els.rowLimitSelect.addEventListener("change", renderResult);
els.refreshSchemaBtn.addEventListener("click", renderSchema);
els.resetLabBtn.addEventListener("click", () => els.resetDialog.showModal());
els.confirmResetBtn.addEventListener("click", async () => {
  els.runBtn.disabled = true;
  els.resetLabBtn.disabled = true;
  try {
    await createAndLoadDatabase();
    await renderSchema();
    els.sqlEditor.value = "";
    updateEditorInfo();
    currentResult = null;
    currentRows = [];
    currentColumns = [];
    currentColumnMeta = {};
    els.exportCsvBtn.disabled = true;
    els.resultSummary.textContent = "Ejecuta una consulta para ver los resultados.";
    els.tableWrap.innerHTML = `<div class="empty-state"><div class="empty-icon">⌁</div><p>El resultado de la consulta se mostrará aquí.</p></div>`;
    setStatus("Laboratorio restablecido", "success");
    showMessage("Laboratorio restablecido", "Las tres tablas volvieron a su estado original.", true);
  } catch (error) {
    showMessage("No fue posible restablecer", error?.message || String(error));
  } finally {
    els.runBtn.disabled = false;
    els.resetLabBtn.disabled = false;
  }
});

els.sqlEditor.addEventListener("input", updateEditorInfo);
els.sqlEditor.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    if (!els.runBtn.disabled) executeQuery();
  }
  if (event.key === "Tab") {
    event.preventDefault();
    insertAtCursor("    ");
  }
});

initialize();

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3');

const BASE_URL = process.env.NEP_BASE_URL || 'http://127.0.0.1:4018';
const OPERATION_KEY = process.env.NEP_OPERATION_KEY || 'Operation key not yet provided.';
const AUTHORIZATION = process.env.NEP_AUTHORIZATION;

const DB_FILE_PATH = path.join(__dirname, '..', '..', '..', 'database', 'neb_db.db');
const LOGS_DIR_PATH = path.join(__dirname, '..', '..', 'logs');
const initializedLogFiles = new Set();
const logFileLineNumbers = new Map();
let activeLogContextKey = null;

const HEADERS = {
  'Content-Type': 'application/json',
  'operation-key': OPERATION_KEY,
  user: process.env.NEP_USER || 'Katharina Mohr',
  originator: process.env.NEP_ORIGINATOR || 'NEP_LIVE_SCENARIO_TEST',
  'x-correlator': process.env.NEP_X_CORRELATOR || '550e8400-e29b-41d4-a716-446655440000',
  'trace-indicator': process.env.NEP_TRACE_INDICATOR || '1',
  'customer-journey': process.env.NEP_CUSTOMER_JOURNEY || 'live-test'
};

if (AUTHORIZATION) {
  HEADERS.Authorization = AUTHORIZATION;
}

function sanitizeFileName(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function shortHash(value) {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 10);
}

function toFileToken(value, maxLen = 48) {
  const source = String(value || 'unknown');
  const base = sanitizeFileName(source).slice(0, maxLen);
  return `${base}-${shortHash(source)}`;
}

function getLogFilePath() {
  const jestState = typeof expect !== 'undefined' && typeof expect.getState === 'function'
    ? expect.getState()
    : {};

  const testPath = jestState.testPath || jestState.currentTestPath || 'unknown-test-file';
  const currentTestName = jestState.currentTestName || 'unknown-test-name';

  const testFileName = toFileToken(path.basename(testPath, path.extname(testPath)), 36);
  const nameSource = activeLogContextKey || currentTestName || 'unknown-test-name';
  const testName = toFileToken(nameSource, 60);
  return path.join(LOGS_DIR_PATH, `${testFileName}__${testName}.log`);
}

function writeToCurrentLogFile(content) {
  if (!fs.existsSync(LOGS_DIR_PATH)) {
    fs.mkdirSync(LOGS_DIR_PATH, { recursive: true });
  }

  const logFilePath = getLogFilePath();

  // Reset each test log once per run so only latest run is kept.
  if (!initializedLogFiles.has(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
    initializedLogFiles.add(logFilePath);
  }

  fs.appendFileSync(logFilePath, content);
}

function formatResponseBody(response) {
  if (!response) {
    return '';
  }

  if (typeof response.body === 'string') {
    return response.body;
  }

  if (response.body == null) {
    return String(response.raw || '');
  }

  try {
    return JSON.stringify(response.body, null, 2);
  } catch (error) {
    return String(response.raw || response.body);
  }
}

function logApiResponse(label, response) {
  logLine(`${label}: status=${response.status}`);
  const logFilePath = getLogFilePath();
  
  let lineNum = logFileLineNumbers.get(logFilePath) || 1;
  const formattedBody = formatResponseBody(response);
  
  // Add line numbers to each line in response for readability
  const lines = formattedBody.split('\n');
  const numberedLines = lines.map((line, idx) => {
    if (line.trim() === '') return line;
    return `${(lineNum + idx).toString().padStart(4, ' ')} | ${line}`;
  });
  
  lineNum += lines.length;
  logFileLineNumbers.set(logFilePath, lineNum);
  
  writeToCurrentLogFile(`\n[${new Date().toISOString()}] ${label}: body\n${numberedLines.join('\n')}\n`);
}

function logLine(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  writeToCurrentLogFile(`${line}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpRequest(method, requestPath, body, options = {}) {
  const { rawBody, headers: extraHeaders } = options;

  return new Promise((resolve, reject) => {
    const url = new URL(requestPath, BASE_URL);
    const payload = rawBody !== undefined
      ? String(rawBody)
      : body == null
        ? undefined
        : typeof body === 'string'
          ? body
          : JSON.stringify(body);

    const headers = {
      ...HEADERS,
      ...(extraHeaders || {}),
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
    };

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed = raw;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch (e) {
            // Keep raw string when JSON parsing fails.
          }

          resolve({ status: res.statusCode, body: parsed, raw, headers: res.headers || {} });
        });
      }
    );

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

function openSqlite(filePath) {
  return new sqlite3.Database(filePath, sqlite3.OPEN_READONLY);
}

function all(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

async function getTableRowsByColumns(db, tableName, columns) {
  const selectColumns = columns.map((column) => quoteIdentifier(column)).join(', ');
  return all(db, `SELECT ${selectColumns} FROM ${quoteIdentifier(tableName)};`);
}

function getByPath(obj, path) {
  if (!path) {
    return obj;
  }

  return String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function isTimestampColumn(columnName) {
  const name = String(columnName || '').toLowerCase();
  return name === 'timestamp' || name.endsWith('-timestamp');
}

function isBooleanLikeColumn(columnName) {
  const name = String(columnName || '').toLowerCase();
  return name.includes('-is-') || name.startsWith('is-') || name.endsWith('-is-on') || name.endsWith('-is-avail');
}

function normalizeTimestamp(value) {
  if (value == null) {
    return '';
  }

  const raw = String(value).trim();
  if (!raw) {
    return '';
  }

  const canonical = raw
    .replace(' +00:00', 'Z')
    .replace(' ', 'T');

  const parsed = Date.parse(canonical);
  return Number.isNaN(parsed) ? raw : new Date(parsed).toISOString();
}

function normalizeBooleanLike(value) {
  const raw = String(value).trim().toLowerCase();
  if (raw === '1' || raw === 'true') {
    return 'true';
  }
  if (raw === '0' || raw === 'false') {
    return 'false';
  }
  return raw;
}

function normalizeValueForCompare(value, columnName) {
  if (value == null) {
    return '';
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return '';
  }

  if (/^(true|false)$/i.test(stringValue)) {
    return stringValue.toLowerCase();
  }

  if (isTimestampColumn(columnName)) {
    return normalizeTimestamp(stringValue);
  }

  if (isBooleanLikeColumn(columnName)) {
    return normalizeBooleanLike(stringValue);
  }

  const numericValue = Number(stringValue);
  if (Number.isFinite(numericValue) && /^[-+]?\d+(\.\d+)?$/.test(stringValue)) {
    return String(numericValue);
  }

  return stringValue;
}

function buildComparableRows(rows, columns) {
  return rows
    .map((row) => {
      const comparable = {};
      for (const column of columns) {
        comparable[column] = normalizeValueForCompare(row[column], column);
      }
      return JSON.stringify(comparable);
    })
    .sort();
}

function getResponseRowsForTableCheck(response, tableCheck) {
  if (tableCheck && tableCheck.responseSource === 'json') {
    const body = response && response.body;
    const sourceRows = getByPath(body, tableCheck.responsePath);
    if (!Array.isArray(sourceRows)) {
      return [];
    }

    const responseColumnMap = tableCheck.responseColumnMap || {};
    const compareColumns = tableCheck.compareColumns || tableCheck.expectedColumns || [];

    return sourceRows.map((sourceRow) => {
      const mapped = {};
      for (const column of compareColumns) {
        const sourceField = responseColumnMap[column] || column;
        mapped[column] = sourceRow[sourceField];
      }
      return mapped;
    });
  }

  return getResponseRowsForValidation(response);
}

async function getDbRowsForTableCheck(db, tableCheck, compareColumns) {
  if (tableCheck && tableCheck.dbQuery) {
    return all(db, tableCheck.dbQuery);
  }

  return getTableRowsByColumns(db, tableCheck.table, compareColumns);
}

async function assertResponseMatchesTable({
  db,
  responseRows,
  tableName,
  tableCheck,
  compareColumns,
  endpoint,
  logLine
}) {
  if (!Array.isArray(responseRows) || responseRows.length === 0) {
    throw new Error(
      `Cannot compare API response with table ${tableName}: parsed response rows are empty for ${endpoint}.`
    );
  }

  const dbRows = await getDbRowsForTableCheck(db, tableCheck, compareColumns);

  const comparableResponseRows = buildComparableRows(responseRows, compareColumns);
  const comparableDbRows = buildComparableRows(dbRows, compareColumns);

  logLine(
    `Cross-check ${tableName}: API rows=${comparableResponseRows.length}, DB rows=${comparableDbRows.length}, columns=[${compareColumns.join(', ')}]`
  );

  expect(comparableDbRows.length).toBe(comparableResponseRows.length);

  for (let i = 0; i < comparableResponseRows.length; i += 1) {
    expect(comparableDbRows[i]).toBe(comparableResponseRows[i]);
  }
}

async function getTableColumns(db, tableName) {
  const rows = await all(db, `PRAGMA table_info(${tableName});`);
  return rows.map((row) => row.name);
}

async function getTableRowCount(db, tableName) {
  const rows = await all(db, `SELECT COUNT(*) as cnt FROM ${tableName};`);
  return rows[0] ? rows[0].cnt : 0;
}

function getCsvDataCount(text) {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return 0;
  }

  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) {
    const dateHits = normalized.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g);
    return dateHits ? dateHits.length : 0;
  }

  return Math.max(lines.length - 1, 0);
}

function parseCsvRows(text) {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(';').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(';');
    const row = {};
    for (let i = 0; i < headers.length; i += 1) {
      row[headers[i]] = values[i] !== undefined ? values[i] : '';
    }
    return row;
  });
}

function getResponseRowsForValidation(response) {
  if (!response) {
    return [];
  }

  if (typeof response.body === 'string') {
    return parseCsvRows(response.body);
  }

  if (response.body == null && typeof response.raw === 'string') {
    return parseCsvRows(response.raw);
  }

  return [];
}

function getResponseDataCount(body, raw) {
  if (body == null) {
    return raw ? getCsvDataCount(raw) : 0;
  }

  if (Array.isArray(body)) {
    return body.length;
  }

  if (typeof body === 'string') {
    return getCsvDataCount(body);
  }

  if (typeof body !== 'object') {
    return 1;
  }

  if (Array.isArray(body['mount-name-list'])) {
    return body['mount-name-list'].length;
  }

  let count = 0;
  for (const value of Object.values(body)) {
    if (Array.isArray(value)) {
      count += value.length;
      continue;
    }
    if (value && typeof value === 'object') {
      count += getResponseDataCount(value);
    }
  }

  if (count > 0) {
    return count;
  }

  // Object exists but has no list-like payload.
  return Object.keys(body).length > 0 ? 1 : 0;
}

async function ensureDataLoaded(options = {}) {
  const previousLogContext = activeLogContextKey;
  if (options.logContext) {
    activeLogContextKey = String(options.logContext);
  }

  const allowEmbed = options.allowEmbed === true;
  try {
    logLine('Calling POST /v1/provide-list-of-devices-in-nep (preflight)');
    const listResponse = await httpRequest('POST', '/v1/provide-list-of-devices-in-nep');
    logApiResponse('Preflight /v1/provide-list-of-devices-in-nep', listResponse);
    if (listResponse.status === 401) {
      throw new Error('NEP returned 401 Unauthorized on preflight. Check NEP_OPERATION_KEY / NEP_AUTHORIZATION.');
    }
    if (listResponse.status !== 200) {
      throw new Error(`Preflight device list failed with status ${listResponse.status}`);
    }

    const list = listResponse.body && listResponse.body['mount-name-list'];
    const count = Array.isArray(list) ? list.length : 0;
    if (count > 0) {
      logLine(`Preflight: device list already populated (${count}).`);
      return;
    }

    if (!allowEmbed) {
      throw new Error('Device list is empty. Run test 0 (embed-yourself pre-run) first.');
    }

    logLine('Preflight: no devices found, calling /v1/embed-yourself to trigger ingestion.');
    const registryOfficeHost =
      process.env.NEP_REGISTRY_OFFICE_HOST ||
      process.env.RO_HOST ||
      process.env.MWDI_HOST ||
      '127.0.0.1';
    const registryOfficePort = Number(
      process.env.NEP_REGISTRY_OFFICE_PORT ||
        process.env.RO_PORT ||
        process.env.MWDI_PORT ||
        4015
    );

    const registryOfficeApplication =
      process.env.NEP_REGISTRY_OFFICE_APPLICATION ||
      process.env.RO_APPLICATION ||
      'RegistrationApplication';
    const registryOfficeRelease =
      process.env.NEP_REGISTRY_OFFICE_RELEASE ||
      process.env.RO_RELEASE ||
      '43.2.5';
    const relayServerReplacementOperation =
      process.env.NEP_RELAY_SERVER_REPLACEMENT_OPERATION ||
      '/v1/relay-server-replacement';
    const relayOperationUpdateOperation =
      process.env.NEP_RELAY_OPERATION_UPDATE_OPERATION ||
      '/v1/relay-operation-update';
    const deregistrationOperation =
      process.env.NEP_DEREGISTRATION_OPERATION ||
      '/v1/deregister-application';
    const registryOfficeProtocol =
      process.env.NEP_REGISTRY_OFFICE_PROTOCOL ||
      'HTTP';

    const embedBody = {
      'registry-office-application': registryOfficeApplication,
      'registry-office-application-release-number': registryOfficeRelease,
      'relay-server-replacement-operation': relayServerReplacementOperation,
      'relay-operation-update-operation': relayOperationUpdateOperation,
      'deregistration-operation': deregistrationOperation,
      'registry-office-protocol': registryOfficeProtocol,
      'registry-office-address': {
        'ip-address': {
          'ipv-4-address': registryOfficeHost
        },
      },
      'registry-office-port': registryOfficePort
    };

    logLine(`Calling POST /v1/embed-yourself with body=${JSON.stringify(embedBody)}`);
    const embedResponse = await httpRequest('POST', '/v1/embed-yourself', embedBody);
    logApiResponse('Preflight /v1/embed-yourself', embedResponse);
    if (embedResponse.status === 401) {
      throw new Error('NEP returned 401 Unauthorized on /v1/embed-yourself. Check NEP_OPERATION_KEY / NEP_AUTHORIZATION.');
    }
    if (![200, 202, 204].includes(embedResponse.status)) {
      throw new Error(
        `Embed call failed with status ${embedResponse.status}. registry-office-address=${registryOfficeHost}:${registryOfficePort}. Response=${String(embedResponse.raw || '').slice(0, 300)}`
      );
    }

    for (let i = 0; i < 18; i += 1) {
      await sleep(5000);
      logLine(`Calling POST /v1/provide-list-of-devices-in-nep (poll #${i + 1})`);
      const poll = await httpRequest('POST', '/v1/provide-list-of-devices-in-nep');
      logApiResponse(`Preflight poll #${i + 1} /v1/provide-list-of-devices-in-nep`, poll);
      const mountNames = poll.body && poll.body['mount-name-list'];
      const pollCount = Array.isArray(mountNames) ? mountNames.length : 0;
      logLine(`Preflight poll #${i + 1}: device count=${pollCount}, status=${poll.status}`);
      if (poll.status === 200 && pollCount > 0) {
        return;
      }
    }

    throw new Error(
      'Data ingestion did not populate device list in expected time window. Check MWDI/RegistryOffice connectivity and embed-yourself target settings (NEP_REGISTRY_OFFICE_HOST/PORT).'
    );
  } finally {
    activeLogContextKey = previousLogContext;
  }
}

async function runApiDbCase(testCase) {
  const previousLogContext = activeLogContextKey;
  activeLogContextKey = `${testCase.method || 'POST'} ${testCase.endpoint || 'unknown-endpoint'}`;

  try {
    await ensureDataLoaded({ allowEmbed: false });

    const requestBody = testCase.requestBody || {};
    logLine(`Calling ${testCase.method} ${testCase.endpoint} with body=${JSON.stringify(requestBody)}`);
    const response = await httpRequest(testCase.method, testCase.endpoint, requestBody);
    logApiResponse(`Response ${testCase.endpoint}`, response);

    if (response.status === 401) {
      throw new Error(`401 Unauthorized for ${testCase.endpoint}. Check operation-key/authorization headers.`);
    }
    expect(response.status).toBe(200);

    const responseDataCount = getResponseDataCount(response.body, response.raw);
    const minResponseCount = testCase.minResponseDataCount ?? 1;
    logLine(`Response ${testCase.endpoint}: extracted data count=${responseDataCount}, expected >= ${minResponseCount}`);
    expect(responseDataCount).toBeGreaterThanOrEqual(minResponseCount);

    if (typeof testCase.validateResponse === 'function') {
      const responseRows = getResponseRowsForValidation(response);
      logLine(`Response ${testCase.endpoint}: running custom validator with ${responseRows.length} parsed CSV rows`);
      await testCase.validateResponse({
        response,
        responseRows,
        responseDataCount,
        logLine
      });
    }

    const skipDbCheck = testCase.skipDbCheck || process.env.NEP_SKIP_DB_CHECK === 'true';
    const dbOptional = testCase.dbOptional || process.env.NEP_DB_OPTIONAL === 'true';

    if (!skipDbCheck && (Array.isArray(testCase.tableChecks) || Array.isArray(testCase.apiDbMatchChecks))) {
      if (!fs.existsSync(DB_FILE_PATH)) {
        if (dbOptional) {
          logLine(`SQLite DB file not found: ${DB_FILE_PATH} — skipping DB checks (dbOptional=true).`);
        } else {
          throw new Error(`SQLite DB file not found: ${DB_FILE_PATH}`);
        }
      } else {
        const db = openSqlite(DB_FILE_PATH);
        try {
          if (Array.isArray(testCase.tableChecks)) {
            for (const tableCheck of testCase.tableChecks) {
              const columns = await getTableColumns(db, tableCheck.table);
              logLine(`Table ${tableCheck.table} columns: ${columns.join(', ')}`);
              for (const expectedColumn of tableCheck.expectedColumns) {
                expect(columns).toContain(expectedColumn);
              }

              const rowCount = await getTableRowCount(db, tableCheck.table);
              const minRows = tableCheck.minRows ?? 1;
              logLine(`Table ${tableCheck.table} row count=${rowCount}, expected >= ${minRows}`);
              expect(rowCount).toBeGreaterThanOrEqual(minRows);

              if (tableCheck.matchApiResponse === true) {
                const compareColumns = tableCheck.compareColumns || tableCheck.expectedColumns;
                await assertResponseMatchesTable({
                  db,
                  responseRows: getResponseRowsForTableCheck(response, tableCheck),
                  tableName: tableCheck.table,
                  tableCheck,
                  compareColumns,
                  endpoint: testCase.endpoint,
                  logLine
                });
              }
            }
          }

          if (Array.isArray(testCase.apiDbMatchChecks)) {
            for (const matchCheck of testCase.apiDbMatchChecks) {
              const compareColumns = matchCheck.compareColumns;
              await assertResponseMatchesTable({
                db,
                responseRows: getResponseRowsForTableCheck(response, matchCheck),
                tableName: matchCheck.name || 'custom-match',
                tableCheck: matchCheck,
                compareColumns,
                endpoint: testCase.endpoint,
                logLine
              });
            }
          }
        } finally {
          db.close();
        }
      }
    }
  } finally {
    activeLogContextKey = previousLogContext;
  }
}

async function runInvalidJsonCase(testCase) {
  const method = testCase.method || 'POST';
  const response = await httpRequest(method, testCase.endpoint, null, {
    rawBody: '{"bad":'
  });

  expect(response.status).toBe(400);
  return response;
}

async function runInvalidFieldTypeCase(testCase, invalidBody, expectedStatus = 400) {
  const method = testCase.method || 'POST';
  const response = await httpRequest(method, testCase.endpoint, invalidBody);

  expect(response.status).toBe(expectedStatus);
  return response;
}

module.exports = {
  runApiDbCase,
  ensureDataLoaded,
  httpRequest,
  runInvalidJsonCase,
  runInvalidFieldTypeCase
};

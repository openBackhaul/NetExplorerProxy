/**
 * API Test Helper Utilities
 * 
 * Provides utilities for:
 * - Making API requests
 * - Validating responses
 * - Common request/response patterns
 */

const http = require('http');
const https = require('https');

/**
 * Default request headers for API calls
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'user': 'test-user',
  'originator': 'test-originator',
  'x-correlator': 'test-correlator',
  'trace-indicator': '1',
  'customer-journey': 'test-journey'
};

/**
 * Make HTTP request to API
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - API path
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response object {status, headers, body}
 */
async function makeRequest(method, path, options = {}) {
  const {
    body = null,
    headers = {},
    host = 'localhost',
    port = process.env.TEST_PORT || 4019,
    protocol = 'http'
  } = options;

  const requestHeaders = { ...DEFAULT_HEADERS, ...headers };

  return new Promise((resolve, reject) => {
    const lib = protocol === 'https' ? https : http;
    
    const reqOptions = {
      host,
      port,
      path,
      method,
      headers: requestHeaders
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(data);
        } catch (e) {
          parsedBody = data;
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsedBody
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Make GET request
 * @param {string} path - API path
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response
 */
async function get(path, options = {}) {
  return makeRequest('GET', path, options);
}

/**
 * Make POST request
 * @param {string} path - API path
 * @param {Object} body - Request body
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response
 */
async function post(path, body, options = {}) {
  return makeRequest('POST', path, { ...options, body });
}

/**
 * Make PUT request
 * @param {string} path - API path
 * @param {Object} body - Request body
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response
 */
async function put(path, body, options = {}) {
  return makeRequest('PUT', path, { ...options, body });
}

/**
 * Make DELETE request
 * @param {string} path - API path
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response
 */
async function del(path, options = {}) {
  return makeRequest('DELETE', path, options);
}

/**
 * Assert response status code
 * @param {Object} response - Response object
 * @param {number} expectedStatus - Expected status code
 */
function assertStatus(response, expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Body: ${JSON.stringify(response.body)}`
    );
  }
}

/**
 * Assert response has required fields
 * @param {Object} response - Response object
 * @param {Array<string>} fields - Required field names
 */
function assertHasFields(response, fields) {
  const missingFields = fields.filter(field => !response.body.hasOwnProperty(field));
  
  if (missingFields.length > 0) {
    throw new Error(`Response missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Assert response body matches expected structure
 * @param {Object} response - Response object
 * @param {Object} expected - Expected structure
 */
function assertResponseStructure(response, expected) {
  const errors = [];
  
  function checkStructure(obj, exp, path = '') {
    for (const [key, value] of Object.entries(exp)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!obj.hasOwnProperty(key)) {
        errors.push(`Missing field: ${currentPath}`);
        continue;
      }
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkStructure(obj[key], value, currentPath);
      } else if (Array.isArray(value) && value.length > 0) {
        if (!Array.isArray(obj[key])) {
          errors.push(`Field ${currentPath} should be an array`);
        } else if (obj[key].length > 0) {
          checkStructure(obj[key][0], value[0], `${currentPath}[0]`);
        }
      } else if (typeof value === 'string') {
        // Type check
        const expectedType = value;
        const actualType = typeof obj[key];
        if (actualType !== expectedType) {
          errors.push(`Field ${currentPath} should be ${expectedType}, got ${actualType}`);
        }
      }
    }
  }
  
  checkStructure(response.body, expected);
  
  if (errors.length > 0) {
    throw new Error(`Response structure mismatch:\n${errors.join('\n')}`);
  }
}

/**
 * Assert array response has expected length
 * @param {Object} response - Response object
 * @param {number} expectedLength - Expected array length
 */
function assertArrayLength(response, expectedLength) {
  if (!Array.isArray(response.body)) {
    throw new Error('Response body is not an array');
  }
  
  if (response.body.length !== expectedLength) {
    throw new Error(`Expected array length ${expectedLength}, got ${response.body.length}`);
  }
}

/**
 * Assert response is successful (2xx status code)
 * @param {Object} response - Response object
 */
function assertSuccess(response) {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Expected successful response, got status ${response.status}`);
  }
}

/**
 * Assert response is error (4xx or 5xx status code)
 * @param {Object} response - Response object
 */
function assertError(response) {
  if (response.status < 400) {
    throw new Error(`Expected error response, got status ${response.status}`);
  }
}

/**
 * Extract field from response
 * @param {Object} response - Response object
 * @param {string} path - Field path (e.g., 'data.devices[0].name')
 * @returns {*} Field value
 */
function extractField(response, path) {
  const parts = path.split('.');
  let value = response.body;
  
  for (const part of parts) {
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      value = value[arrayMatch[1]][parseInt(arrayMatch[2])];
    } else {
      value = value[part];
    }
    
    if (value === undefined) {
      throw new Error(`Field ${path} not found in response`);
    }
  }
  
  return value;
}

/**
 * Create request headers with custom values
 * @param {Object} overrides - Header overrides
 * @returns {Object} Headers
 */
function createHeaders(overrides = {}) {
  return { ...DEFAULT_HEADERS, ...overrides };
}

/**
 * Generate correlation ID for requests
 * @returns {string} Correlation ID
 */
function generateCorrelationId() {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Wait for API to be ready
 * @param {number} maxAttempts - Maximum connection attempts
 * @param {number} delayMs - Delay between attempts
 * @returns {Promise<boolean>} True if API is ready
 */
async function waitForAPI(maxAttempts = 30, delayMs = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await get('/v1/provide-list-of-devices-in-nep');
      if (response.status === 200 || response.status === 404) {
        return true;
      }
    } catch (error) {
      // API not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  return false;
}

module.exports = {
  makeRequest,
  get,
  post,
  put,
  del,
  assertStatus,
  assertHasFields,
  assertResponseStructure,
  assertArrayLength,
  assertSuccess,
  assertError,
  extractField,
  createHeaders,
  generateCorrelationId,
  waitForAPI
};

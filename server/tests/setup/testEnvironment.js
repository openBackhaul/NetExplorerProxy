/**
 * Test environment setup
 * Runs before each test file
 * 
 * This file:
 * - Configures test-specific settings
 * - Adds custom matchers
 * - Sets up common test utilities
 */

// Increase timeout for integration and E2E tests
jest.setTimeout(30000);

// Custom matchers for database assertions
expect.extend({
  /**
   * Check if a database record exists with specific properties
   */
  toHaveRecord(received, expected) {
    const pass = received && 
                 typeof received === 'object' &&
                 Object.keys(expected).every(key => received[key] === expected[key]);

    if (pass) {
      return {
        message: () => `expected database not to have record with properties ${JSON.stringify(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected database to have record with properties ${JSON.stringify(expected)}, but got ${JSON.stringify(received)}`,
        pass: false,
      };
    }
  },

  /**
   * Check if timestamp is recent (within last N seconds)
   */
  toBeRecentTimestamp(received, secondsAgo = 60) {
    const receivedTime = new Date(received).getTime();
    const now = Date.now();
    const threshold = now - (secondsAgo * 1000);
    const pass = receivedTime >= threshold && receivedTime <= now;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a recent timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within last ${secondsAgo} seconds`,
        pass: false,
      };
    }
  },

  /**
   * Check if API response matches database record
   */
  toMatchDatabaseRecord(received, dbRecord, fieldMapping = {}) {
    const errors = [];
    
    // Check each field in the API response
    for (const [apiField, value] of Object.entries(received)) {
      const dbField = fieldMapping[apiField] || apiField;
      
      if (dbRecord.hasOwnProperty(dbField)) {
        if (dbRecord[dbField] !== value) {
          errors.push(`Field '${apiField}': expected ${value} to equal ${dbRecord[dbField]}`);
        }
      }
    }

    const pass = errors.length === 0;

    if (pass) {
      return {
        message: () => 'expected API response not to match database record',
        pass: true,
      };
    } else {
      return {
        message: () => `API response does not match database record:\n${errors.join('\n')}`,
        pass: false,
      };
    }
  },

  /**
   * Check if all required fields are present
   */
  toHaveRequiredFields(received, requiredFields) {
    const missingFields = requiredFields.filter(field => !received.hasOwnProperty(field));
    const pass = missingFields.length === 0;

    if (pass) {
      return {
        message: () => `expected object not to have all required fields`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected object to have fields: ${missingFields.join(', ')}`,
        pass: false,
      };
    }
  }
});

// Global test utilities available in all tests
global.testUtils = {
  /**
   * Sleep for specified milliseconds
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate a test mount name
   */
  generateMountName: (prefix = 'test-device') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Generate a test UUID
   */
  generateUUID: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Create timestamp string
   */
  now: () => new Date().toISOString(),
};

// Suppress console output during tests (except errors)
// Comment out if you need to see console logs for debugging
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error output
  error: console.error,
};

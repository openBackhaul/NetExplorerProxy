/**
 * Custom Assertion Helpers
 * 
 * Provides custom assertion functions for common test scenarios
 */

/**
 * Assert that all required database tables exist
 * @param {Array<string>} tables - List of table names
 * @param {Array<string>} required - Required table names
 */
function assertRequiredTablesExist(tables, required) {
  const missing = required.filter(table => !tables.includes(table));
  
  if (missing.length > 0) {
    throw new Error(`Missing required tables: ${missing.join(', ')}`);
  }
}

/**
 * Assert database record matches expected values
 * @param {Object} actual - Actual record from database
 * @param {Object} expected - Expected values
 * @param {Array<string>} fields - Fields to check (if not specified, check all expected fields)
 */
function assertRecordMatches(actual, expected, fields = null) {
  if (!actual) {
    throw new Error('Record not found in database');
  }

  const fieldsToCheck = fields || Object.keys(expected);
  const errors = [];

  for (const field of fieldsToCheck) {
    if (expected.hasOwnProperty(field)) {
      const actualValue = actual[field];
      const expectedValue = expected[field];

      // Handle timestamps specially (allow small differences)
      if (field === 'timestamp' || field.includes('time')) {
        if (!isTimestampClose(actualValue, expectedValue)) {
          errors.push(`Field '${field}': timestamps differ significantly`);
        }
      } else if (actualValue !== expectedValue) {
        errors.push(`Field '${field}': expected '${expectedValue}', got '${actualValue}'`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Record mismatch:\n${errors.join('\n')}`);
  }
}

/**
 * Assert API response matches database record
 * @param {Object} apiResponse - Response from API
 * @param {Object} dbRecord - Record from database
 * @param {Object} fieldMapping - Map API fields to DB fields
 */
function assertAPIMatchesDatabase(apiResponse, dbRecord, fieldMapping = {}) {
  const errors = [];

  for (const [apiField, dbField] of Object.entries(fieldMapping)) {
    if (!apiResponse.hasOwnProperty(apiField)) {
      errors.push(`API response missing field: ${apiField}`);
      continue;
    }

    if (!dbRecord.hasOwnProperty(dbField)) {
      errors.push(`Database record missing field: ${dbField}`);
      continue;
    }

    const apiValue = apiResponse[apiField];
    const dbValue = dbRecord[dbField];

    if (apiValue !== dbValue) {
      errors.push(`Field mismatch - API '${apiField}' (${apiValue}) != DB '${dbField}' (${dbValue})`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`API-Database mismatch:\n${errors.join('\n')}`);
  }
}

/**
 * Assert array contains record with properties
 * @param {Array} array - Array to search
 * @param {Object} properties - Properties to match
 */
function assertArrayContainsRecord(array, properties) {
  const found = array.some(record => {
    return Object.entries(properties).every(([key, value]) => {
      return record[key] === value;
    });
  });

  if (!found) {
    throw new Error(
      `Array does not contain record with properties: ${JSON.stringify(properties)}\n` +
      `Array contents: ${JSON.stringify(array)}`
    );
  }
}

/**
 * Assert all records in array have required fields
 * @param {Array} array - Array of records
 * @param {Array<string>} requiredFields - Required field names
 */
function assertAllRecordsHaveFields(array, requiredFields) {
  const errors = [];

  array.forEach((record, index) => {
    for (const field of requiredFields) {
      if (!record.hasOwnProperty(field)) {
        errors.push(`Record ${index} missing field: ${field}`);
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(`Records missing required fields:\n${errors.join('\n')}`);
  }
}

/**
 * Assert database schema column definition
 * @param {Object} column - Column definition from database
 * @param {Object} expected - Expected column properties
 */
function assertColumnDefinition(column, expected) {
  const errors = [];

  if (expected.type && !column.type.includes(expected.type)) {
    errors.push(`Column type: expected '${expected.type}', got '${column.type}'`);
  }

  if (expected.nullable !== undefined && column.allowNull !== expected.nullable) {
    errors.push(`Column nullable: expected ${expected.nullable}, got ${column.allowNull}`);
  }

  if (expected.primaryKey !== undefined && column.primaryKey !== expected.primaryKey) {
    errors.push(`Column primaryKey: expected ${expected.primaryKey}, got ${column.primaryKey}`);
  }

  if (expected.defaultValue !== undefined && column.defaultValue !== expected.defaultValue) {
    errors.push(`Column defaultValue: expected '${expected.defaultValue}', got '${column.defaultValue}'`);
  }

  if (errors.length > 0) {
    throw new Error(`Column definition mismatch:\n${errors.join('\n')}`);
  }
}

/**
 * Assert timestamp is within acceptable range
 * @param {Date|string} timestamp - Timestamp to check
 * @param {number} maxSecondsAgo - Maximum seconds in the past (default: 60)
 */
function assertTimestampRecent(timestamp, maxSecondsAgo = 60) {
  const ts = new Date(timestamp).getTime();
  const now = Date.now();
  const threshold = now - (maxSecondsAgo * 1000);

  if (ts < threshold || ts > now) {
    throw new Error(
      `Timestamp ${timestamp} is not recent (within last ${maxSecondsAgo} seconds)`
    );
  }
}

/**
 * Assert two timestamps are close to each other
 * @param {Date|string} timestamp1 - First timestamp
 * @param {Date|string} timestamp2 - Second timestamp
 * @param {number} maxDiffSeconds - Maximum difference in seconds (default: 5)
 * @returns {boolean}
 */
function isTimestampClose(timestamp1, timestamp2, maxDiffSeconds = 5) {
  const ts1 = new Date(timestamp1).getTime();
  const ts2 = new Date(timestamp2).getTime();
  const diff = Math.abs(ts1 - ts2);
  
  return diff <= (maxDiffSeconds * 1000);
}

/**
 * Assert foreign key relationship exists
 * @param {Object} childRecord - Child record
 * @param {Object} parentRecord - Parent record
 * @param {string} foreignKey - Foreign key field name
 * @param {string} parentKey - Parent key field name
 */
function assertForeignKeyRelationship(childRecord, parentRecord, foreignKey, parentKey = foreignKey) {
  if (!childRecord[foreignKey]) {
    throw new Error(`Child record missing foreign key: ${foreignKey}`);
  }

  if (!parentRecord[parentKey]) {
    throw new Error(`Parent record missing key: ${parentKey}`);
  }

  if (childRecord[foreignKey] !== parentRecord[parentKey]) {
    throw new Error(
      `Foreign key mismatch: child.${foreignKey} (${childRecord[foreignKey]}) != ` +
      `parent.${parentKey} (${parentRecord[parentKey]})`
    );
  }
}

/**
 * Assert no duplicate records by key
 * @param {Array} records - Array of records
 * @param {string|Array<string>} keys - Key field(s) to check for duplicates
 */
function assertNoDuplicates(records, keys) {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  const seen = new Set();

  for (const record of records) {
    const keyValue = keyArray.map(k => record[k]).join('|');
    
    if (seen.has(keyValue)) {
      throw new Error(`Duplicate record found with key: ${keyValue}`);
    }
    
    seen.add(keyValue);
  }
}

/**
 * Assert data type of field
 * @param {*} value - Value to check
 * @param {string} expectedType - Expected type (string, number, boolean, object, array, date)
 */
function assertDataType(value, expectedType) {
  let actualType;

  if (Array.isArray(value)) {
    actualType = 'array';
  } else if (value instanceof Date) {
    actualType = 'date';
  } else if (value === null) {
    actualType = 'null';
  } else {
    actualType = typeof value;
  }

  if (actualType !== expectedType) {
    throw new Error(`Expected type '${expectedType}', got '${actualType}'`);
  }
}

/**
 * Assert field is not null or undefined
 * @param {*} value - Value to check
 * @param {string} fieldName - Field name for error message
 */
function assertNotNull(value, fieldName = 'Field') {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is null or undefined`);
  }
}

/**
 * Assert value is in allowed list
 * @param {*} value - Value to check
 * @param {Array} allowedValues - List of allowed values
 * @param {string} fieldName - Field name for error message
 */
function assertValueInList(value, allowedValues, fieldName = 'Value') {
  if (!allowedValues.includes(value)) {
    throw new Error(
      `${fieldName} '${value}' is not in allowed values: ${allowedValues.join(', ')}`
    );
  }
}

/**
 * Assert count equals expected
 * @param {number} actual - Actual count
 * @param {number} expected - Expected count
 * @param {string} itemName - Name of items being counted
 */
function assertCount(actual, expected, itemName = 'items') {
  if (actual !== expected) {
    throw new Error(`Expected ${expected} ${itemName}, got ${actual}`);
  }
}

/**
 * Assert count is at least minimum
 * @param {number} actual - Actual count
 * @param {number} minimum - Minimum expected count
 * @param {string} itemName - Name of items being counted
 */
function assertMinimumCount(actual, minimum, itemName = 'items') {
  if (actual < minimum) {
    throw new Error(`Expected at least ${minimum} ${itemName}, got ${actual}`);
  }
}

module.exports = {
  assertRequiredTablesExist,
  assertRecordMatches,
  assertAPIMatchesDatabase,
  assertArrayContainsRecord,
  assertAllRecordsHaveFields,
  assertColumnDefinition,
  assertTimestampRecent,
  isTimestampClose,
  assertForeignKeyRelationship,
  assertNoDuplicates,
  assertDataType,
  assertNotNull,
  assertValueInList,
  assertCount,
  assertMinimumCount
};

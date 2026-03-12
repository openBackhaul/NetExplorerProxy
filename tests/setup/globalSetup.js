/**
 * Global setup for Jest tests
 * Runs once before all test suites
 * 
 * This file:
 * - Initializes test database configuration
 * - Sets up environment variables for testing
 * - Creates necessary test directories
 */

const path = require('path');
const fs = require('fs');

module.exports = async () => {
  console.log('\n🚀 Setting up NetExplorerProxy test environment...\n');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB = 'true';
  
  // Use SQLite in-memory for tests (faster and isolated)
  process.env.DB_DIALECT = 'sqlite';
  process.env.DB_STORAGE = ':memory:';
  
  // Disable external DB connection for tests
  process.env.USER = 'test_user';
  process.env.PASSWORD = Buffer.from('test_pass').toString('base64');
  process.env.HOST = 'localhost';
  process.env.PORT = '5432';
  process.env.DB_NAME = 'nep_test_db';

  // Disable throttling for tests
  process.env.TIME_CC_RETR = 'false';

  // Set test port (different from production)
  process.env.TEST_PORT = '4019';

  // Create coverage directory if it doesn't exist
  const coverageDir = path.join(__dirname, '..', 'coverage');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  // Recreate test logs directory for each run to keep only latest logs
  const testLogsDir = path.join(__dirname, '..', 'logs');
  if (fs.existsSync(testLogsDir)) {
    fs.rmSync(testLogsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testLogsDir, { recursive: true });

  console.log('✅ Test environment configured');
  console.log('   - Database: SQLite (in-memory)');
  console.log('   - Environment: test');
  console.log('   - Port: 4019');
  console.log('\n');
};

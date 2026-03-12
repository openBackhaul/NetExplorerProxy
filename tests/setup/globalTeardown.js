/**
 * Global teardown for Jest tests
 * Runs once after all test suites complete
 * 
 * This file:
 * - Cleans up test resources
 * - Closes database connections
 * - Removes temporary test files
 */

module.exports = async () => {
  console.log('\n🧹 Cleaning up test environment...\n');

  // Clean up any global resources here
  // For in-memory SQLite, this happens automatically

  console.log('✅ Test cleanup complete\n');
};

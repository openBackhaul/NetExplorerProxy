/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  rootDir: '../..',
  testMatch: ['<rootDir>/server/tests/scenarios/**/*.test.js'],
  globalSetup: '<rootDir>/server/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/server/tests/setup/globalTeardown.js',
  verbose: true,
  bail: false,
  testTimeout: 180000,
  collectCoverage: false,
  maxWorkers: 1,
  testSequencer: '<rootDir>/server/tests/setup/orderedSequencer.js',
  moduleDirectories: ['node_modules', '<rootDir>/server/node_modules'],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
  forceExit: true,
  setupFiles: ['<rootDir>/server/tests/setup/testConfig.js'],
  globals: {
    SKIP_DB_CHECK: false,
    DB_OPTIONAL: false
  }
};

module.exports = config;

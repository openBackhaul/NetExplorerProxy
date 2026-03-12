/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['<rootDir>/tests/scenarios/**/*.test.js'],
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  verbose: true,
  bail: false,
  testTimeout: 180000,
  collectCoverage: false,
  maxWorkers: 1,
  testSequencer: '<rootDir>/tests/setup/orderedSequencer.js',
  moduleDirectories: ['node_modules', '<rootDir>/server/node_modules'],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
  forceExit: true
};

module.exports = config;

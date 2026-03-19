const { ensureBasicDeviceRow, ensureIfPresentString } = require('./shared');

module.exports = function provideGeneralInformationValidator({ responseRows }) {
  expect(responseRows.length).toBeGreaterThan(0);
  for (const row of responseRows) {
    ensureBasicDeviceRow(row);
    expect(ensureIfPresentString(row['external-label'])).toBe(true);
    expect(ensureIfPresentString(row['device-model-name'])).toBe(true);
    expect(ensureIfPresentString(row['system-name'])).toBe(true);
  }
};

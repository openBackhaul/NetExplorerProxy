const { ensureBasicDeviceRow, ensureIfPresentString } = require('./shared');

module.exports = function provideActualEquipmentValidator({ responseRows }) {
  expect(responseRows.length).toBeGreaterThan(0);
  for (const row of responseRows) {
    ensureBasicDeviceRow(row);
    expect(row.uuid).toBeTruthy();
    expect(ensureIfPresentString(row['local-id'])).toBe(true);
    expect(ensureIfPresentString(row.version)).toBe(true);
    expect(ensureIfPresentString(row.description)).toBe(true);
    expect(ensureIfPresentString(row['model-identifier'])).toBe(true);
    expect(ensureIfPresentString(row['part-type-identifier'])).toBe(true);
    expect(ensureIfPresentString(row['type-name'])).toBe(true);
  }
};

const { hasValidTimestamp, ensureIfPresentString } = require('./shared');

module.exports = function provideLtpEquipmentMappingsValidator({ responseRows }) {
  expect(responseRows.length).toBeGreaterThan(0);
  for (const row of responseRows) {
    expect(row['mount-name']).toBeTruthy();
    expect(row.uuid).toBeTruthy();
    expect(row.timestamp).toBeTruthy();
    expect(hasValidTimestamp(row.timestamp)).toBe(true);
    expect(ensureIfPresentString(row.connector)).toBe(true);
    expect(ensureIfPresentString(row.equipment)).toBe(true);
  }
};

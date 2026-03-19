const { hasValidTimestamp, ensureNonEmptyString } = require('./shared');

module.exports = function provideListOfDevicesInNepValidator({ response, responseRows }) {
  if (Array.isArray(responseRows) && responseRows.length > 0) {
    for (const row of responseRows) {
      expect(ensureNonEmptyString(row['mount-name'])).toBe(true);
      expect(row['last-data-update-timestamp']).toBeTruthy();
      expect(hasValidTimestamp(row['last-data-update-timestamp'])).toBe(true);
    }
    return;
  }

  const mountList = response && response.body && response.body['mount-name-list'];
  expect(Array.isArray(mountList)).toBe(true);
  expect(mountList.length).toBeGreaterThan(0);
  for (const item of mountList) {
    expect(ensureNonEmptyString(item['mount-name'])).toBe(true);
    expect(item['last-data-update-timestamp']).toBeTruthy();
    expect(hasValidTimestamp(item['last-data-update-timestamp'])).toBe(true);
  }
};

const { ensureLtpIdentityRow } = require('./shared');

const ALLOWED_INTERFACE_STATUSES = ['UP', 'DOWN', 'UNKNOWN', 'TESTING', 'DORMANT', 'NOT_PRESENT', 'NOT_YET_DEFINED'];

module.exports = function provideInterfacesPerDeviceValidator({ response, responseRows }) {
  if (Array.isArray(responseRows) && responseRows.length > 0) {
    for (const row of responseRows) {
      ensureLtpIdentityRow(row);
      expect(row['interface-status']).toBeTruthy();
      expect(ALLOWED_INTERFACE_STATUSES).toContain(row['interface-status']);
    }
    return;
  }

  const body = response && response.body;
  expect(body && typeof body === 'object').toBe(true);

  const merged = [];
  for (const value of Object.values(body || {})) {
    if (Array.isArray(value)) {
      merged.push(...value);
    }
  }

  expect(merged.length).toBeGreaterThan(0);
  for (const row of merged) {
    expect(row['mount-name']).toBeTruthy();
    expect(row.uuid).toBeTruthy();
    expect(row['local-id']).toBeTruthy();
    expect(ALLOWED_INTERFACE_STATUSES).toContain(row['interface-status']);
  }
};

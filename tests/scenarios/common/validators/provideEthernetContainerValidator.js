const { ensureLtpIdentityRow, isBoolish } = require('./shared');

const ALLOWED_OPERATIONAL_STATES = ['ENABLED', 'DISABLED'];
const ALLOWED_ADMINISTRATIVE_STATES = ['UNLOCKED', 'LOCKED'];
const ALLOWED_INTERFACE_STATUSES = ['UP', 'DOWN', 'UNKNOWN', 'TESTING', 'DORMANT', 'NOT_PRESENT', 'NOT_YET_DEFINED'];

module.exports = function provideEthernetContainerValidator({ responseRows }) {
  expect(responseRows.length).toBeGreaterThan(0);
  for (const row of responseRows) {
    ensureLtpIdentityRow(row);
    expect(ALLOWED_OPERATIONAL_STATES).toContain(row['operational-state']);
    expect(ALLOWED_ADMINISTRATIVE_STATES).toContain(row['administrative-state']);
    expect(ALLOWED_INTERFACE_STATUSES).toContain(row['interface-status']);

    if (row['bundling-is-on'] !== '' && row['bundling-is-on'] != null) {
      expect(isBoolish(row['bundling-is-on'])).toBe(true);
    }
  }
};

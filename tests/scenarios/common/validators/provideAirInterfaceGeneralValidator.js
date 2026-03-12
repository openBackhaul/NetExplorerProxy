const { ensureLtpIdentityRow } = require('./shared');

const ALLOWED_OPERATIONAL_STATES = ['ENABLED', 'DISABLED'];
const ALLOWED_ADMINISTRATIVE_STATES = ['UNLOCKED', 'LOCKED'];

module.exports = function provideAirInterfaceGeneralValidator({ responseRows }) {
  expect(responseRows.length).toBeGreaterThan(0);
  for (const row of responseRows) {
    ensureLtpIdentityRow(row);

    // Explicit timestamp format assertion for easier debugging in this scenario.
    expect(Number.isNaN(Date.parse(row.timestamp))).toBe(false);

    expect(ALLOWED_OPERATIONAL_STATES).toContain(row['operational-state']);
    expect(ALLOWED_ADMINISTRATIVE_STATES).toContain(row['administrative-state']);
  }
};

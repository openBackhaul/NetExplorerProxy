const { runApiDbCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-ltp-equipment-mappings', () => {
  test('returns response and ltp_equipment_mappings columns exist', async () => {
    await runApiDbCase(cases.provideLtpEquipmentMappings);
  });
});

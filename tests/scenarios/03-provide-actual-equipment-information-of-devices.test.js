const { runApiDbCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-actual-equipment-information-of-devices', () => {
  test('returns response and equipment_general_info columns exist', async () => {
    await runApiDbCase(cases.provideActualEquipmentInformationOfDevices);
  });
});

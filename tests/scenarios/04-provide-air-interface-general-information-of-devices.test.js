const { runApiDbCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-air-interface-general-information-of-devices', () => {
  test('returns response and air_interface_general_info columns exist', async () => {
    await runApiDbCase(cases.provideAirInterfaceGeneralInformationOfDevices);
  });
});

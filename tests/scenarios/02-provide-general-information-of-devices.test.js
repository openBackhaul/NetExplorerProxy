const { runApiDbCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-general-information-of-devices', () => {
  test('returns response and devices_general_info columns exist', async () => {
    await runApiDbCase(cases.provideGeneralInformationOfDevices);
  });
});

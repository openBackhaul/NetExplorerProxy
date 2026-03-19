const { runApiDbCase, runInvalidJsonCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-list-of-devices-in-nep', () => {
  test('returns response and devices_general_info columns exist', async () => {
    await runApiDbCase(cases.provideListOfDevicesInNep);
  });

  test('returns 400 when request body is invalid JSON', async () => {
    await runInvalidJsonCase(cases.provideListOfDevicesInNep);
  });
});


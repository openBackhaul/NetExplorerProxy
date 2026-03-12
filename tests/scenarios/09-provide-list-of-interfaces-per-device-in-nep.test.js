const { runApiDbCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-list-of-interfaces-per-device-in-nep', () => {
  test('returns response and interface table columns exist', async () => {
    await runApiDbCase(cases.provideInterfacesPerDevice);
  });
});

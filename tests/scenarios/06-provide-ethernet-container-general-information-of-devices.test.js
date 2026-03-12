const { runApiDbCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-ethernet-container-general-information-of-devices', () => {
  test('returns response and ethernet_container_general_info columns exist', async () => {
    await runApiDbCase(cases.provideEthernetContainerGeneralInfo);
  });
});

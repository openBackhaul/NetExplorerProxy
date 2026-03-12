const { runApiDbCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

describe('API: /v1/provide-air-interface-transmission-mode-lists-of-devices', () => {
  test('returns response and air_interface_transmission_mode columns exist', async () => {
    await runApiDbCase(cases.provideAirInterfaceTransmissionMode);
  });
});

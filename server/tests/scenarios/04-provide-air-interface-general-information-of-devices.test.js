const { runApiDbCase, runInvalidJsonCase, runInvalidFieldTypeCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

function assertErrorContract(response) {
  expect(response.body && typeof response.body).toBe('object');
  expect(typeof response.body.code).toBe('number');
  expect(typeof response.body.message).toBe('string');
}

describe('API: /v1/provide-air-interface-general-information-of-devices', () => {
  test('returns response and air_interface_general_info columns exist', async () => {
    await runApiDbCase(cases.provideAirInterfaceGeneralInformationOfDevices);
  });

  test('returns 400 with structured error body when request body is invalid JSON', async () => {
    const response = await runInvalidJsonCase(cases.provideAirInterfaceGeneralInformationOfDevices);
    assertErrorContract(response);
  });

  test('returns 400 when mount-name-list contains non-string items', async () => {
    await runInvalidFieldTypeCase(cases.provideAirInterfaceGeneralInformationOfDevices, {
      'mount-name-list': [12345]
    });
  });

  test('returns 400 with structured error body when known field has wrong type', async () => {
    const response = await runInvalidFieldTypeCase(cases.provideAirInterfaceGeneralInformationOfDevices, {
      'data-age': 'not-a-number'
    });
    assertErrorContract(response);
  });

  test('returns 400 when mount-name-list is not an array', async () => {
    await runInvalidFieldTypeCase(cases.provideAirInterfaceGeneralInformationOfDevices, {
      'mount-name-list': 'not-an-array'
    });
  });
});


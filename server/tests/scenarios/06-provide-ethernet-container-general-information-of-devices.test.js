const { runApiDbCase, runInvalidJsonCase, runInvalidFieldTypeCase } = require('./common/liveApiDbHelper');
const cases = require('./common/apiDbCases');

function assertErrorContract(response) {
  expect(response.body && typeof response.body).toBe('object');
  expect(typeof response.body.code).toBe('number');
  expect(typeof response.body.message).toBe('string');
}

describe('API: /v1/provide-ethernet-container-general-information-of-devices', () => {
  test('returns response and ethernet_container_general_info columns exist', async () => {
    await runApiDbCase(cases.provideEthernetContainerGeneralInfo);
  });

  test('returns 400 with structured error body when request body is invalid JSON', async () => {
    const response = await runInvalidJsonCase(cases.provideEthernetContainerGeneralInfo);
    assertErrorContract(response);
  });

  test('returns 400 when mount-name-list contains non-string items', async () => {
    await runInvalidFieldTypeCase(cases.provideEthernetContainerGeneralInfo, {
      'mount-name-list': [12345]
    });
  });

  test('returns 400 with structured error body when known field has wrong type', async () => {
    const response = await runInvalidFieldTypeCase(cases.provideEthernetContainerGeneralInfo, {
      'data-age': 'not-a-number'
    });
    assertErrorContract(response);
  });

  test('returns 400 when mount-name-list is not an array', async () => {
    await runInvalidFieldTypeCase(cases.provideEthernetContainerGeneralInfo, {
      'mount-name-list': 'not-an-array'
    });
  });
});


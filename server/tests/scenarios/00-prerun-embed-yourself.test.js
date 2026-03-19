const { ensureDataLoaded } = require('./common/liveApiDbHelper');

describe('Test 0: Pre-run embed-yourself', () => {
  test('ensures NEP has loaded data before other API tests', async () => {
    await ensureDataLoaded({ allowEmbed: true });
  });
});


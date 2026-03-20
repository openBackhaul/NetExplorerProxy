

const jestConfig = require('../jest.config');

const globals = (jestConfig && jestConfig.globals) || {};

if (globals.SKIP_DB_CHECK !== undefined) {
  process.env.NEP_SKIP_DB_CHECK = String(globals.SKIP_DB_CHECK);
}

if (globals.DB_OPTIONAL !== undefined) {
  process.env.NEP_DB_OPTIONAL = String(globals.DB_OPTIONAL);
}

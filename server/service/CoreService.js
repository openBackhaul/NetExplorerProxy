'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

/**
 * Returns entire data tree
 *
 **/
exports.getControlConstruct = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync("core-model-1-4:control-construct");

  return {
    "core-model-1-4:control-construct": value
  };
}

/**
 * Returns entire instance of Profile
 *
 * url String
 **/
exports.getProfileInstance = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "core-model-1-4:profile": value
  };
}

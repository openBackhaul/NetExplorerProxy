'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

/**
 * Returns the reference on the consequent operation
 *
 * url String
 **/
exports.getActionProfileConsequentOperationReference = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "action-profile-1-0:consequent-operation-reference" : value
  };
}

/**
 * Returns whether to be presented in new browser window
 *
 * url String
 **/
exports.getActionProfileDisplayInNewBrowserWindow = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "action-profile-1-0:display-in-new-browser-window": value
  };
}

/**
 * Returns the list of input values
 *
 * url String
 **/
exports.getActionProfileInputValueListt = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "action-profile-1-0:input-value-list": value
  };
}

/**
 * Returns the Label of the Action
 *
 * url String
 **/
exports.getActionProfileLabel = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "action-profile-1-0:label": value
  };
}

/**
 * Returns the name of the Operation
 *
 * url String
 **/
exports.getActionProfileOperationName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "action-profile-1-0:operation-name": value
  };
}

/**
 * Configures the reference on the consequent operation
 *
 * url String
 * body Actionprofileconfiguration_consequentoperationreference_body
 * no response value expected for this operation
 **/
exports.putActionProfileConsequentOperationReference = async function (url, body) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}

'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const operationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');

/**
 * Returns detailed logging configuration.
 *
 * url String
 **/
exports.getOperationClientDetailedLoggingIsOn = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-client-interface-1-0:detailed-logging-is-on": value
  };
}

/**
 * Returns life cycle state of the operation
 *
 * url String
 **/
exports.getOperationClientLifeCycleState = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-client-interface-1-0:life-cycle-state": value
  };
}

/**
 * Returns key used for connecting to server.
 *
 * url String
 **/
exports.getOperationClientOperationKey = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-client-interface-1-0:operation-key": value
  };
}

/**
 * Returns operation name
 *
 * url String
 **/
exports.getOperationClientOperationName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-client-interface-1-0:operation-name": value
  };
}

/**
 * Returns operational state of the operation
 *
 * url String
 **/
exports.getOperationClientOperationalState = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-client-interface-1-0:operational-state": value
  };
}

/**
 * Configures detailed logging on/off.
 *
 * url String
 * body Operationclientinterfaceconfiguration_detailedloggingison_body
 * no response value expected for this operation
 **/
exports.putOperationClientDetailedLoggingIsOn = async function (url, body) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}

/**
 * Configures key used for connecting to server.
 *
 * url String
 * body Operationclientinterfaceconfiguration_operationkey_body
 * no response value expected for this operation
 **/
exports.putOperationClientOperationKey = async function (body, url) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}

/**
 * Configures operation name
 *
 * body Operationclientinterfaceconfiguration_operationname_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putOperationClientOperationName = async function (url, body, uuid) {
  let isUpdated = await operationClientInterface.setOperationNameAsync(uuid, body["operation-client-interface-1-0:operation-name"]);
  if (isUpdated) {
    let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
      uuid
    );
    ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
      forwardingAutomationInputList
    );
  }
}

'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

/**
 * Returns the configured life cycle state of the operation
 *
 * url String
 **/
exports.getOperationServerLifeCycleState = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-server-interface-1-0:life-cycle-state": value
  };
}

/**
 * Returns key for connecting
 *
 * url String
 **/
exports.getOperationServerOperationKey = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-server-interface-1-0:operation-key": value
  };
}

/**
 * Returns operation name
 *
 * url String
 **/
exports.getOperationServerOperationName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "operation-server-interface-1-0:operation-name": value
  };
}

/**
 * Configures life cycle state
 *
 * url String
 * body Operationserverinterfaceconfiguration_lifecyclestate_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putOperationServerLifeCycleState = async function (url, body, uuid) {
  const isUpdated = await fileOperation.writeToDatabaseAsync(url, body, false);

  if (isUpdated) {
    let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
      uuid
    );
    ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
      forwardingAutomationInputList
    );
  }
}

/**
 * Changes key for connecting
 *
 * body Operationserverinterfaceconfiguration_operationkey_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putOperationServerOperationKey = async function (url, body, uuid) {
  let isUpdated = await operationServerInterface.setOperationKeyAsync(uuid, body["operation-server-interface-1-0:operation-key"]);
  if (isUpdated) {
    let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
      uuid
    );
    ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
      forwardingAutomationInputList
    );
  }
}

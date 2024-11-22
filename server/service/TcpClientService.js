'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');

/**
 * Returns remote address
 *
 * url String
 **/
exports.getTcpClientRemoteAddress = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "tcp-client-interface-1-0:remote-address": value
  };
}

/**
 * Returns target TCP port at server
 *
 * url String
 **/
exports.getTcpClientRemotePort = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "tcp-client-interface-1-0:remote-port": value
  };
}

/**
 * Returns protocol for addressing remote side
 *
 * url String
 **/
exports.getTcpClientRemoteProtocol = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "tcp-client-interface-1-0:remote-protocol": value
  };
}

/**
 * Configures remote address
 *
 * body Tcpclientinterfaceconfiguration_remoteaddress_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putTcpClientRemoteAddress = async function (url, body, uuid) {
  let isUpdated = await fileOperation.writeToDatabaseAsync(uuid, body, false);
  /****************************************************************************************
   * Prepare attributes to automate forwarding-construct
   ****************************************************************************************/
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
 * Configures target TCP port at server
 *
 * body Tcpclientinterfaceconfiguration_remoteport_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putTcpClientRemotePort = async function (url, body, uuid) {
  let isUpdated = await fileOperation.writeToDatabaseAsync(uuid, body, false);
  /****************************************************************************************
   * Prepare attributes to automate forwarding-construct
   ****************************************************************************************/
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
 * Configures protocol for addressing remote side
 *
 * body Tcpclientinterfaceconfiguration_remoteprotocol_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putTcpClientRemoteProtocol = async function (url, body, uuid) {
  let isUpdated = await fileOperation.writeToDatabaseAsync(uuid, body, false);
  /****************************************************************************************
   * Prepare attributes to automate forwarding-construct
   ****************************************************************************************/
  if (isUpdated) {
    let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
      uuid
    );
    ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
      forwardingAutomationInputList
    );
  }
}

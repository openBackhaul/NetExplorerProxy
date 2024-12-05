'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');

/**
 * Returns Description of TcpServer
 *
 * url String
 **/
exports.getTcpServerDescription = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "tcp-server-interface-1-0:description": value
  };
}

/**
 * Returns address of the server
 *
 * url String
 **/
exports.getTcpServerLocalAddress = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "tcp-server-interface-1-0:local-address": value
  };
}

/**
 * Returns TCP port of the server
 *
 * url String
 **/
exports.getTcpServerLocalPort = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "tcp-server-interface-1-0:local-port": value
  };
}

/**
 * Returns Protocol of TcpServer
 *
 * url String
 **/
exports.getTcpServerLocalProtocol = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "tcp-server-interface-1-0:local-protocol": value
  };
}

/**
 * Documents Description of TcpServer
 *
 * url String
 * body Tcpserverinterfaceconfiguration_description_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putTcpServerDescription = async function (url, body, uuid) {
  let isUpdated = await fileOperation.writeToDatabaseAsync(url, body, false);
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
 * Documents address of the server
 *
 * url String
 * body Tcpserverinterfaceconfiguration_localaddress_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putTcpServerLocalAddress = async function (url, body, uuid) {
  let isUpdated = await tcpServerInterface.setLocalAddressAsync(uuid, body["tcp-server-interface-1-0:local-address"]);
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
 * Documents TCP port of the server
 *
 * url String
 * body Tcpserverinterfaceconfiguration_localport_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putTcpServerLocalPort = async function (url, body, uuid) {
  let isUpdated = await tcpServerInterface.setLocalPortAsync(uuid, body["tcp-server-interface-1-0:local-port"]);
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
 * Documents Protocol of TcpServer
 *
 * url String
 * body Tcpserverinterfaceconfiguration_localprotocol_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putTcpServerLocalProtocol = async function (url, body, uuid) {
  let isUpdated = await fileOperation.writeToDatabaseAsync(url, body, false);
  if (isUpdated) {
    let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
      uuid
    );
    ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
      forwardingAutomationInputList
    );
  }
}

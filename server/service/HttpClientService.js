'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');

/**
 * Returns name of application to be addressed
 *
 * url String
 **/
exports.getHttpClientApplicationName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-client-interface-1-0:application-name": value
  };
}

/**
 * Returns release number of application to be addressed
 *
 * url String
 **/
exports.getHttpClientReleaseNumber = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-client-interface-1-0:release-number": value
  };
}

/**
 * Configures name of application to be addressed
 *
 * body Httpclientinterfaceconfiguration_applicationname_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putHttpClientApplicationName = async function (url, body, uuid) {
  let isUpdated = await httpClientInterface.setApplicationNameAsync(uuid, body["http-client-interface-1-0:application-name"]);
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
 * Configures release number of application to be addressed
 *
 * body Httpclientinterfaceconfiguration_releasenumber_body
 * uuid String
 * no response value expected for this operation
 **/
exports.putHttpClientReleaseNumber = async function (url, body, uuid) {
  let isUpdated = await httpClientInterface.setReleaseNumberAsync(uuid, body["http-client-interface-1-0:release-number"]);
  if (isUpdated) {
    let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
      uuid
    );
    ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
      forwardingAutomationInputList
    );
  }
}

'use strict';

const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const responseCodeEnum = require("onf-core-model-ap/applicationPattern/rest/server/ResponseCode");

const bequeathHandler = require('./individualServices/BequeathHandler');
const requestHandler = require('./individualServices/RequestHandler');
const { getLtpIfConfigFromUuid } = require("./individualServices/ControlConstructUtil");
const individualServicesUtility = require('./individualServices/IndividualServicesUtility');
const requestUtil = require("./individualServices/RequestUtil");
const restClient = require("./individualServices/RestClient");
const { HTTP_CODES } = require("./individualServices/RestClient");

const logger = require('./LoggingService.js').getLogger();
const dbHandler = require('./db/dbHandler');

/**
 * Initiates process of embedding a new release
 *
 * body V1_bequeathyourdataanddie_body
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]'
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.bequeathYourDataAndDie = function (requestUrl, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {
      let success = await bequeathHandler.handleRequest(body, requestUrl);

      if (success) {
        resolve();
      } else {
        reject(new Error("bequeathHandler.handleRequest failed."));
      }
    } catch (exception) {
      logger.error(exception, "bequeath was not successful");
      reject(exception);
    }
  });
}


/**
 * Provides list of devices that are connected to the controller
 * returns mount-name-list in ret.message
 **/
exports.provideListOfConnectedDevices = async function (requestUrl) {
  const ret = await requestHandler.postRequestDataFromOtherApp(requestUrl, "PromptForProvidingListOfConnectedDeviceCausesReadingMwdiDeviceList", {});

  return ret;
}


/**
 * Respond with a list of MAC tables of all connected devices.
 *
 * returns List in ret.message
 **/
exports.provideMacTableOfAllDevices = async function (requestUrl) {
  const ret = await requestHandler.postRequestDataFromOtherApp(requestUrl, "PromptForProvidingAllMacTablesCausesReadingMacTablesFromMatrCache", {});

  return ret;
}


/**
 * Respond with the MAC table of a specific device.
 *
 * body V1_providemactableofspecificdevice_body 
 * returns List in ret.message
 **/
exports.provideMacTableOfSpecificDevice = async function (requestUrl, body) {
  const ret = await requestHandler.postRequestDataFromOtherApp(requestUrl, "PromptForProvidingMacTableOfSpecificDeviceCausesReadingMacTableFromMatrCache", body);

  return ret;
}


let callHistory = [];

// remove all calls before date from the callHistory
function removeOldCalls(date) {
  while (callHistory.length > 0 && callHistory[0] < date) {
    callHistory.shift();
  }
}


// MAC table request map
let requestMap = new Map();

function cleanupRequestMap(date) {
  for (const [key, value] of requestMap.entries()) {
    if (value.timestamp < date) {
      requestMap.delete(key);
    }
  }
}


/**
 * Responds with the current MAC table of a specific device.
 * On success, the response includes the request ID in `ret.message["request-id"]`.
 */
exports.readCurrentMacTableFromDevice = async function(requestUrl, body) {

  // Throttling
  let maxNumberOfParallelCcRequests = await individualServicesUtility.getIntegerProfileInstanceValue(
    "maxNumberOfParallelReadCurrentMacTableFromDeviceRequests"); // Default 10
  let maxNumberOfCcRequestsPerDay = await individualServicesUtility.getIntegerProfileInstanceValue(
    "maxNumberOfReadCurrentMacTableFromDeviceRequestsPerDay");  // Default 100

  let now = new Date();
  removeOldCalls(now - 24 * 3600000); // 24*3600 s
  callHistory.push(now);

  // Remaining requests older than 1 hour can also be deleted.
  cleanupRequestMap(now - 3600000);

  const numberOfParallelRequests = requestMap.size;
  const numberOfRequestsPerDay = callHistory.length;

  if (numberOfParallelRequests + 1 > maxNumberOfParallelCcRequests) {
    // rejection due to throttling
    let requestHeader = requestUtil.createRequestHeader(undefined);
    return {
      code: 429,
      message: "Too many requests. The maximum amount of requests that can executed in parallel or per day has been reached",
      header: requestHeader
    };
  } else if (numberOfRequestsPerDay > maxNumberOfCcRequestsPerDay) {
    // rejection due to too many requests per day
    let requestHeader = requestUtil.createRequestHeader(undefined);
    return {
      code: 429,
      message: "Too many requests. The maximum amount of requests that can executed in parallel or per day has been reached",
      header: requestHeader
    };
  }

  const mountName = body["mount-name"];

  // read callback info from request body
  const protocol = body["requestor-protocol"];
  let address = body["requestor-address"];
  const port = body["requestor-port"];
  const operation = body["requestor-receive-operation"];

  // write NEP callback info into the request body
  const forwardingName = "PromptForRegisteringCausesRegistrationRequest";
  const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  let prefix = forwardingConstruct.uuid.split('op')[0];

  let ifConfig = await getLtpIfConfigFromUuid(prefix + "tcp-s-000");

  body["requestor-protocol"] = ifConfig["protocol"];
  body["requestor-address"] = { "ip-address": ifConfig["ip-address"] };
  body["requestor-port"] = ifConfig["port"];
  body["requestor-receive-operation"] = "/v1/receive-current-mac-table-of-device";

  const ret = await requestHandler.postRequestDataFromOtherApp(requestUrl, "PromptForProvidingMacTableOfSpecificDeviceCausesReadingMacTableFromMatrCache",
    body, "/v1/read-current-mac-table-from-device");

  // check result code
  if (ret.code === 200) {
    // get the request ID out of the MATR response
    const requestId = ret.message["request-id"];

    if (requestId) {
      if (requestMap.has(requestId)) {
        logger.warn("Request ID already present in the request map: %s", requestId);
      }

      // store callback data of the caller by request ID in requestMap
      const timestamp = new Date();
      const operationKey = ret.operationKey;
      const appName = ret.appName;
      const appRelease = ret.appRelease;
      const request = {mountName, protocol, address, port, operation, timestamp, operationKey, appName, appRelease};
      requestMap.set(requestId, request);
      //      ++numberOfParallelRequests;
    } else {
      logger.error("Missing request ID in the MATR readCurrentMacTableFromDevice response, mountName=" + mountName);
    }
  } else {
    if (ret.code === 500 && String(ret.message).includes("Request failed with status code 404")) {
      // immediateErrorResponse
      ret.code = 404;
    } else {
      let errorMessage = ret.message?.message ? ret.message.message : JSON.stringify(ret.message);
      logger.error(`Unexpected result code ${ret.code} for MATR readCurrentMacTableFromDevice call: ${errorMessage}`);
      ret.message = `MATR message: ${errorMessage}`;
    }
  }

  return ret;
}


/**
 * Receives the current mac table of device from MATR and sends answer to requestor
 *
 * body List 
 * no response value expected for this operation
 **/
exports.receiveCurrentMacTableOfDevice = async function (requestUrl, body) {
  let errorCode = undefined;
  let errorMessage = undefined;

  let requestsToDelete = new Set();

  for (let entry of body) {
    if (!entry["request-id"] || !entry["mac-address-data"]) {
      logger.info({ entry }, "Invalid entry in mac table body");
      continue;
    }

    const requestId = entry["request-id"];

    const request = requestMap.get(requestId);

    if (request) {
      const macAddressData = entry["mac-address-data"];
      const data = [
        {
          "request-id": requestId,
          "mac-address-data": macAddressData
        }
      ];

      // forward received data to the requestor
      let targetUrl = requestUtil.buildRequestTargetPath(request.protocol, request.address, request.port) + request.operation;

      logger.debug({ targetUrl, requestId }, "Forwarding MAC table data");

      const ret = await restClient.startPostDataRequest(targetUrl, data, requestUrl, request.operationKey, request.appName, request.appRelease);

      if (ret.code === responseCodeEnum.code.OK || ret.code === responseCodeEnum.code.NO_CONTENT) {
        // store request to remove later from requestMap
        requestsToDelete.add(requestId);

        // if (--numberOfParallelRequests < 0) {
        //   logger.warn("numberOfParallelRequests: %d", numberOfParallelRequests);
        //   numberOfParallelRequests = 0;
        // }
      } else {
        errorCode = ret.code;
        errorMessage = `Requestor callback result: ${ret.code} - ${ret.message}`;
        logger.error({ errorCode, errorMessage, requestId }, "Failed to forward MAC table data");
      }
    } else {
      logger.warn({ requestId }, "Unknown request ID in receiveCurrentMacTableOfDevice");

      // Response in case that the application wants to call a service specified by the requestor
      // (e.g., to return data after a long taking data retrieval) during a service call to the application
      // and the service information cannot be found.
      errorCode = HTTP_CODES.REQUESTOR_NOT_FOUND; // 550
      errorMessage = "Requestor information for callback execution not found.";
    }
  }

  for(let requestId of requestsToDelete) {
    requestMap.delete(requestId);
  }

  if (errorMessage) {
    return {
      code: errorCode ?? responseCodeEnum.code.INTERNAL_SERVER_ERROR,
      message: { code: 500, message: errorMessage }
    };
  } else {
    return {
      code: responseCodeEnum.code.NO_CONTENT
      // no message body and headers
    };
  }
}

// Functions for NEP 1.1.0

/*
 * Function that retrieve General information of Device from DB and return data in CSV format
 */
module.exports.provideGeneralInformationOfDevices = async function (req, body) {
  // Get filters structure from body
  const filters = getFiltersFromBody(body);

  // Get data from DB
  let result = await dbHandler.readDeviceInfo(filters, true);

  return result;
}

/*
 * Function that retrieve Actual equipment information of Device from DB and return data in CSV format
 */
module.exports.provideActualEquipmentInformationOfDevices = async function (req, body) {
  // Get filters structure from body
  const filters = getFiltersFromBody(body);

  // Get data from DB
  let result = await dbHandler.readEquipmentInfo(filters, true);

  return result;
}

/*
 * Function that retrieve Ethernet container information of Device from DB and return data in CSV format
 */
module.exports.provideEthernetContainerGeneralInformationOfDevices = async function (req, body) {
  // Get filters structure from body
  const filters = getFiltersFromBody(body);

  // Get data from DB
  let result = await dbHandler.readEthernetContInfo(filters, true);

  return result;
}

/*
 * Function that retrieve Wire interface information of Device from DB and return data in CSV format
 */
module.exports.provideWireInterfaceGeneralInformationOfDevices = async function (req, body) {
  // Get filters structure from body
  const filters = getFiltersFromBody(body);

  // Get data from DB
  let result = await dbHandler.readWireInterfaceInfo(filters, true);

  return result;
}

/*
 * Function that retrieve Air interface information of Device from DB and return data in CSV format
 */
module.exports.provideAirInterfaceGeneralInformationOfDevices = async function (req, body) {
  // Get filters structure from body
  const filters = getFiltersFromBody(body);

  // Get data from DB
  let result = await dbHandler.readAirInterfaceInfo(filters, true);

  return result;
}

/*
 * Function that retrieve Air interface Transimission Mode information of Device from DB and return data in CSV format
 */
module.exports.provideAirInterfaceTransmissionModeListsInformationOfDevices = async function (req, body) {
  // Get filters structure from body
  const filters = getFiltersFromBody(body);

  // Get data from DB
  let result = await dbHandler.readAirTransMode(filters, true);

  return result;
}

/*
 * Function that retrieve The list of general interface information of Device from DB and return data in CSV format
 * - Air interfaces
 * - Ethernet container interfaces
 * - Wire interfaces
 */
module.exports.provideListOfInterfacesPerDeviceInNep = async function provideListOfInterfacesPerDeviceInNep(req, body) {
  // Get filters structure from body
  const filters = getFiltersFromBody(body);

  // Get data from DB
  let result = await dbHandler.readInterfaceInfoPerDevice(filters, true);

  return result;
}

/*
 * Function to retrieve the list of devices store in the nep cache
 */
module.exports.provideListOfDevicesInNep = async function provideListOfDevicesInNep(req, body) {
  // Get data from DB
  let result = await dbHandler.readListOfDevices(true);

  let dataArray = [];
  for (let i = 0; i < result.length; i++) {
    let tmpData = result[i];
    let temp = {
      "mount-name": tmpData['mount-name'],
      "last-data-update-timestamp": new Date(tmpData.timestamp).toISOString(),
    }
    dataArray.push(temp);
  }

  let returnValue = {
    "mount-name-list": dataArray
  };

  return returnValue;
}

function getFiltersFromBody(body) {
  let mountNameList = "";
  let timeStampFilter = "";
  if (body && body !== undefined) {
    mountNameList = body["mount-name-list"];
    const dataAge = body["data-age"];

    if (dataAge && dataAge != undefined) {
      timeStampFilter = convertDataAgeToTimeStamp(dataAge);
    }
  } else {
    logger.debug("Body to parse is empty");
  }

  const filters = {
    mountNames: mountNameList,
    timeStamp: timeStampFilter
  }

  return filters;
}

/*
 * Function that convert data age into timestamp, in order to use to retrieve data from the DB
 *
 * dataAge
 */
function convertDataAgeToTimeStamp(dataAge) {
  let date = new Date(Date.now());
  let millisec = (dataAge * 60 * 60 * 1000);

  date.setTime(Date.now() - millisec);

  return date;
}

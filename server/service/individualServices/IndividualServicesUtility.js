'use strict';

const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const IndividualServiceUtility = require('./IndividualServicesUtility');
const eventDispatcher = require('./EventDispatcherWithResponse');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');
const createHttpError = require('http-errors');

const fileSystem = require('fs');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

const logger = require('../LoggingService.js').getLogger();

/**
 * This function fetches the integer value from the integer profile based on the expected integer name.
 * @param {String} expectedIntegerName name of the integer profile.
 * @return {String} value of the integer profile.
 */
exports.getIntegerProfileInstanceValue = async function(expectedIntegerName) {
  let integerValue = "";
  try {
    let integerProfileName = "integer-profile-1-0:PROFILE_NAME_TYPE_INTEGER_PROFILE";
    let integerProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(integerProfileName);

    for (let i = 0; i < integerProfileInstanceList.length; i++) {
      let integerProfileInstance = integerProfileInstanceList[i];
      let integerProfilePac = integerProfileInstance[onfAttributes.INTEGER_PROFILE.PAC];
      let integerProfileCapability = integerProfilePac[onfAttributes.INTEGER_PROFILE.CAPABILITY];
      let integerName = integerProfileCapability[onfAttributes.INTEGER_PROFILE.INTEGER_NAME];
      if (integerName == expectedIntegerName) {
        let integerProfileConfiguration = integerProfilePac[onfAttributes.INTEGER_PROFILE.CONFIGURATION];
        integerValue = integerProfileConfiguration[onfAttributes.INTEGER_PROFILE.INTEGER_VALUE];
        break;
      }
    }

    return integerValue;
  } catch (error) {
    console.log(`getIntegerProfileInstanceValue is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

/**
 * This function fetches the string value from the string profile based on the expected string name.
 * @param {String} expectedStringName string name of the string profile.
 * @return {String} string value of the string profile.
 */
exports.getStringProfileInstanceValue = async function (expectedStringName) {
  let stringValue = "";
  try {
    let stringProfileName = "string-profile-1-0:PROFILE_NAME_TYPE_STRING_PROFILE";
    let stringProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(stringProfileName);

    for (let i = 0; i < stringProfileInstanceList.length; i++) {
      let stringProfileInstance = stringProfileInstanceList[i];
      let stringProfilePac = stringProfileInstance[onfAttributes.STRING_PROFILE.PAC];
      let stringProfileCapability = stringProfilePac[onfAttributes.STRING_PROFILE.CAPABILITY];
      let stringName = stringProfileCapability[onfAttributes.STRING_PROFILE.STRING_NAME];
      if (stringName == expectedStringName) {
        let stringProfileConfiguration = stringProfilePac[onfAttributes.STRING_PROFILE.CONFIGURATION];
        stringValue = stringProfileConfiguration[onfAttributes.STRING_PROFILE.STRING_VALUE];
        break;
      }
    }
    return stringValue;

  } catch (error) {
    console.log(`getStringProfileInstanceValue is not success with ${error}`);
    return new createHttpError.InternalServerError(`${error}`);
  }
}

/**
 * This function formulates the query and path parameters from operationName and fields.
 * @param {String} operationName name of the operation to fetch path parameters key .
 * @param {List} pathParamList path parameters value list.
 * @param {String} fields query parameters.
 * @return {Object} params that contains query and path parameters.
 */
exports.getQueryAndPathParameter = function (operationName, pathParamList, fields) {
  try {
    logger.debug(pathParamList, "getQuery And Path Param");
    let pathParams = new Map();
    let queryParams = {};
    let params = {};

    if (pathParamList && (pathParamList.length !== 0)) {
      let pathParamMatches = operationName.match(/\{(.*?)\}/g);
      for (let i = 0; i < pathParamList.length; i++) {
        pathParams.set(pathParamMatches[i], pathParamList[i]);
      }
      params.path = pathParams;
    } else {
      logger.error("pathparam seem empty");
    }

    if (fields !== "") {
      queryParams.fields = fields;
      params.query = queryParams;
    }

    return params;

  } catch (error) {
    logger.error(error, "getQueryAndPathParameter is not success");
    return new createHttpError.InternalServerError(`${error}`);
  }
}


/**
 * This function gets the consequent operation details like op-c uuid , operation-name, field parameters.
 * @param {String} forwardingConstructName name of the forwarding construct to fetch consequent op-c uuid.
 * @param {String} stringName string name to fetch the field parameter.
 * @return {Object} consequentOperationClientAndFieldParams that contains op-c uuid , operation-name, field parameters.
 */
exports.getConsequentOperationClientAndFieldParams = async function(forwardingConstructName, stringName = forwardingConstructName) {
  let consequentOperationClientAndFieldParams = {};
  try {
    let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingConstructName);
    let outputFcPortForFc = await ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructInstance[onfAttributes.GLOBAL_CLASS.UUID]);
    consequentOperationClientAndFieldParams.operationClientUuid = outputFcPortForFc[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]; 
    consequentOperationClientAndFieldParams.operationName = await OperationClientInterface.getOperationNameAsync(consequentOperationClientAndFieldParams.operationClientUuid);
    consequentOperationClientAndFieldParams.fields = IndividualServiceUtility.getStringProfileInstanceValue(stringName);
  } catch(error) {
    logger.error(error, "getConsequentOperationClientAndFieldParams is not success");
    return new createHttpError.InternalServerError(`${error}`);
  }

  return consequentOperationClientAndFieldParams;
}

/**
 * @description This function automates the forwarding of request with related pathParameters and consequent op-c.
 * @param {Object} operationClientAndFieldParams operationClientAndFieldParams that contains op-c uuid , operation-name, field parameters of the request.
 * @param {list}   pathParamList list of path parameters values to be sent in request.
 * @param {Integer} traceIndicatorIncrementer incrementer value to increment the trace indicator.
 * @returns {Object} response data fetched for the forwarded request
 **/
exports.forwardRequest = async function (operationClientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer) {
  try {
    logger.debug(`Forwarding request, Traceindicator incrementer: ${traceIndicatorIncrementer}`);

    let operationName = operationClientAndFieldParams.operationName;
    let fields = operationClientAndFieldParams.fields;
    let operationClientUuid = operationClientAndFieldParams.operationClientUuid;
    let params = IndividualServiceUtility.getQueryAndPathParameter(operationName, pathParamList, fields);

    let responseData = await eventDispatcher.dispatchEvent(
      operationClientUuid,
      {},
      requestHeaders.user,
      requestHeaders.xCorrelator,
      // "1.3.1" + incr,
      requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
      requestHeaders.customerJourney,
      "GET",
      params
    );

    // logger.debug(responseData); // Better to avoid printing

    return responseData;
  } catch (error) {
    logger.error(error, "forwardRequest is not success");
    return new createHttpError.InternalServerError(`${error}`);
  }
}

exports.extractProfileConfiguration = async function (uuid) {
  let profile = await ProfileCollection.getProfileAsync(uuid);
  let objectKey = Object.keys(profile)[2];
  profile = profile[objectKey];
  return profile["integer-profile-configuration"]["integer-value"];
}


/** 
 * Write to the filesystem.<br>
 * @param {JSON} coreModelJsonObject json object that needs to be updated
 * @returns {Boolean} return true if the value is updated, otherwise returns false
 **/
exports.resetCompleteFile = async function (coreModelJsonObject) { 
  let controlConstructPath = onfPaths.CONTROL_CONSTRUCT;
  let resultDel = await fileOperation.deletefromDatabaseAsync(controlConstructPath);
  if (!resultDel) {
    return resultDel;
  }
  
  return await lock.acquire(global.databasePath, async () => {
    let result = writeToFile(coreModelJsonObject);
    return result;
  });

  /**
   * Write to the filesystem.<br>
   * @param {JSON} coreModelJsonObject json object that needs to be updated
   * @returns {Boolean} return true if the value is updated, otherwise returns false
   **/
  function writeToFile(coreModelJsonObject) {
    try {
      fileSystem.writeFileSync(global.databasePath, JSON.stringify(coreModelJsonObject));
      return true;
    } catch (error) {
      console.log('write failed:', error)
      return false;
    }
  }
}

exports.generateRequestIdForHistoricalPMDataAPI = async function () {
  const timestamp = Date.now(); // Get current timestamp
  const randomNumber = Math.floor(Math.random() * 100); // Generate a random number up to 100 

  // Combine timestamp and random number to form the request ID
  return `${timestamp}${randomNumber}`;
}

exports.generateRequestId = async function (mountName,linkId){
  const timestamp = Date.now(); // Get current timestamp
  return mountName + "-" + linkId + "-" + `${timestamp}`;
}

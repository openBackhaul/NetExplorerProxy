'use strict';

const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const OnfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const RestRequestBuilder = require('onf-core-model-ap/applicationPattern/rest/client/RequestBuilder');
const ExecutionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');
const Qs = require('qs');
const restClient = require('onf-core-model-ap/applicationPattern/rest/client/Client');
const createHttpError = require('http-errors');

const logger = require('../LoggingService.js').getLogger();

/**
 * Monkey-patch for RestRequestBuilder.BuildAndTriggerRestRequest to support timeout
 */
const originalBuildAndTriggerRestRequest = RestRequestBuilder.BuildAndTriggerRestRequest;
RestRequestBuilder.BuildAndTriggerRestRequest = async function (operationClientUuid, method, requestHeader, requestBody, params, timeout) {
    try {
        let queryParams;
        let pathParams;
        let operationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        if (params) {
            queryParams = params.query;
            pathParams = params.path;
            if (pathParams) {
                pathParams.forEach((value, param) => {
                    operationName = operationName.replace(param, value)
                });
            }
        }
        if (operationName.indexOf("/") !== 0) {
            operationName = "/" + operationName
        }
        let clientConnectionInfo = await OperationClientInterface.getTcpClientConnectionInfoAsync(operationClientUuid);
        let url = clientConnectionInfo + operationName;
        let request = {
            params: queryParams,
            method: method,
            url: url,
            headers: requestHeader,
            data: requestBody,
            timeout: timeout,
            paramsSerializer: function (params) {
                return Qs.stringify(params, { arrayFormat: 'brackets' })
            }
        }
        let response = await restClient.post(request);
        console.log("\n callback : " + method + " " + url + " header :" + JSON.stringify(requestHeader) +
            "body :" + JSON.stringify(requestBody) + "response code:" + response.status)
        return response;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else if (error.request) {
            console.log(`Request errored with ${error}`);
            let requestTimeoutError = new createHttpError.RequestTimeout();
            requestTimeoutError.url = error.config ? error.config.url ? error.config.url : undefined : undefined;
            return requestTimeoutError;
        }
        console.log(`Unknown request error: ${error}`);
        return new createHttpError.InternalServerError();
    }
};

/**
 * This function formulates the request body based on the operation name and application 
 * @param {String} operationClientUuid uuid of the client operation that needs to be addressed
 * @param {object} httpRequestBody request body for the operation
 * @param {String} user username of the request initiator. 
 * @param {String} xCorrelator UUID for the service execution flow that allows to correlate requests and responses. 
 * @param {String} traceIndicator Sequence number of the request. 
 * @param {String} customerJourney Holds information supporting customer’s journey to which the execution applies.
 * @param {String} httpMethod method of the request if undefined defaults to POST
 * @param {Object} params path and query parameters
 * @param {Integer} timeout request timeout in milliseconds
 */
exports.dispatchEvent = async function(operationClientUuid, httpRequestBody, user, xCorrelator, traceIndicator, customerJourney, httpMethod, params, timeout) {
    let responseData = {};
    let operationKey = await OperationClientInterface.getOperationKeyAsync(
        operationClientUuid);
    let operationName = await OperationClientInterface.getOperationNameAsync(
        operationClientUuid);
 
    let httpClientUuid = await LogicalTerminationPoint.getServerLtpListAsync(operationClientUuid);
    let serverApplicationName = await HttpClientInterface.getApplicationNameAsync(httpClientUuid[0]);
    let serverApplicationReleaseNumber = await HttpClientInterface.getReleaseNumberAsync(httpClientUuid[0]);
    let originator = await HttpServerInterface.getApplicationNameAsync();

    logger.debug("RequestorHeader:");
    let httpRequestHeader = new RequestHeader(
        user, 
        originator,
        xCorrelator, 
        traceIndicator, 
        customerJourney, 
        operationKey
    );
    httpRequestHeader = OnfAttributeFormatter.modifyJsonObjectKeysToKebabCase(httpRequestHeader);
    logger.debug(httpRequestHeader);
    logger.debug(operationClientUuid);
    logger.debug(httpMethod);
    logger.debug(httpRequestBody)
    logger.debug(params);
    let response = await RestRequestBuilder.BuildAndTriggerRestRequest(
        operationClientUuid,
        httpMethod,
        httpRequestHeader,
        httpRequestBody,
        params,
        timeout
    );

    let responseCode = response.status;
    if (responseCode.toString().startsWith("2")) {
        logger.debug(`Response ok: ${responseCode}`);
        responseData = response.data;

    } else {
        logger.error(`Error in the request: Response code: ${responseCode}`);
        if (responseCode == 408) {
            ExecutionAndTraceService.recordServiceRequestFromClient(serverApplicationName, serverApplicationReleaseNumber, xCorrelator, traceIndicator, user, originator, operationName, responseCode, httpRequestBody, response.data)
                .catch((error) => console.log(`record service request ${JSON.stringify({
                    xCorrelator,
                    traceIndicator,
                    user,
                    originator,
                    serverApplicationName,
                    serverApplicationReleaseNumber,
                    operationName,
                    responseCode,
                    reqBody: httpRequestBody,
                    resBody: response.data
                })} failed with error: ${error.message}`));
        } else {
            logger.error(responseCode);
        }
        throw response;
    }

    return responseData;
}

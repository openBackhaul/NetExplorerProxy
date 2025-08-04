const axios = require('axios');
const executionAndTraceService = require("onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService");
const logger = require('../LoggingService.js').getLogger();
const requestUtil = require("./RequestUtil");


const HTTP_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    REQUEST_TIMEOUT: 408,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    DATA_INVALID: 530,  // Response in case the referenced resource exists (e.g. device connected and resource exists in internal datatree), but response data is either not available, lost during transmission, incomplete or corrupted
    BAD_GATEWAY_AUTHENTICATION: 531,
    BAD_GATEWAY_NOT_RESPONDING: 532,
    REQUESTOR_NOT_FOUND: 550    // Requestor information for callback execution not found.
};

module.exports.HTTP_CODES = HTTP_CODES;


/**
 * Translate errors received when calling the upstream server.
 * @param ret
 * @returns {Object} An object containing:
 *  - {integer} code: The standardized status code.
 *  - {string} message: A human-readable message.
 */
function translateProxyResponse(ret) {
    // Ensure the response code is a valid number
    const code = Number(ret.code);

    if (isNaN(code)) {
        ret.code = HTTP_CODES.INTERNAL_SERVER_ERROR;
        ret.message = "Invalid response code received from upstream.";
    }
    // Translate specific codes
    else switch (code) {
        case HTTP_CODES.INTERNAL_SERVER_ERROR: // 500
            ret.code = HTTP_CODES.BAD_GATEWAY; // 502
            ret.message = "Bad Gateway";
            break;

        case HTTP_CODES.UNAUTHORIZED: // 401
        case HTTP_CODES.FORBIDDEN: // 403
            ret.code = HTTP_CODES.BAD_GATEWAY_AUTHENTICATION;
            ret.message = "Bad Gateway. Authentication at upstream server failed.";
            break;

        case HTTP_CODES.REQUEST_TIMEOUT: // 408
            ret.code = HTTP_CODES.BAD_GATEWAY_NOT_RESPONDING;
            ret.message = "Bad Gateway. Upstream server not responding.";
            break;

        case HTTP_CODES.DATA_INVALID:
            ret.message = "Data invalid. Response data not available, incomplete or corrupted";
            break;
    }

    return ret;
}


/**
 * start sync post request and await success return value
 *
 * @param targetUrl
 * @param payload
 * @param operationName
 * @param operationKey
 * @param serverAppName
 * @param serverAppRelease
 * @return {Promise<boolean>}
 */
exports.startPostRequest = async function (targetUrl, payload, operationName, operationKey, serverAppName, serverAppRelease) {
    const requestHeader = requestUtil.createRequestHeader(operationKey);

    try {
        const response = await axios.post(targetUrl, payload, {
            headers: {
                'x-correlator': requestHeader.xCorrelator,
                'trace-indicator': requestHeader.traceIndicator,
                'user': requestHeader.user,
                'originator': requestHeader.originator,
                'customer-journey': requestHeader.customerJourney,
                ...(requestHeader.operationKey && { 'operation-key': requestHeader.operationKey })
            }
        });

        logger.debug(`${operationName} success. Result: ${response.status}`);

        // For example if the response code is 408 (server timeout), then that means the server didn't receive the request
        // Execute the EATL request only if the response code is 408 or such similar case.
        if (response.status >= 400) {
            executionAndTraceService.recordServiceRequestFromClient(
              serverAppName,
              serverAppRelease,
              requestHeader.xCorrelator,
              requestHeader.traceIndicator,
              requestHeader.user,
              requestHeader.originator,
              operationName,
              response.status,
              payload,
              response.data,
              targetUrl
            );
        }

        return true;
    } catch (e) {
        logger.error(`Error during ${operationName}: ${e.message}`, e);

        const status = e.response?.status || HTTP_CODES.DATA_INVALID;

        executionAndTraceService.recordServiceRequestFromClient(
          serverAppName,
          serverAppRelease,
          requestHeader.xCorrelator,
          requestHeader.traceIndicator,
          requestHeader.user,
          requestHeader.originator,
          operationName,
          status,
          payload,
          e.response?.data || e,
          targetUrl
        );

        return false;
    }
};


exports.startPostDataRequest = async function (targetUrl, payload, operationName, operationKey, serverAppName, serverAppRelease) {
    const requestHeader = requestUtil.createRequestHeader(operationKey);

    let ret;

    try {
        const response = await axios.post(targetUrl, payload, {
            headers: {
                'x-correlator': requestHeader.xCorrelator,
                'trace-indicator': requestHeader.traceIndicator,
                'user': requestHeader.user,
                'originator': requestHeader.originator,
                'customer-journey': requestHeader.customerJourney,
                ...(requestHeader.operationKey && { 'operation-key': requestHeader.operationKey })
            }
        });

        logger.debug(`${operationName} success. Result: ${response.status} Data: ${JSON.stringify(response.data)}`);

        // For example if the response code is 408 (server timeout), then that means the server didn't receive the request
        // Execute the EATL request only if the response code is 408 or such similar case.
        if (response.status >= 400) {
            executionAndTraceService.recordServiceRequestFromClient(
              serverAppName,
              serverAppRelease,
              requestHeader.xCorrelator,
              requestHeader.traceIndicator,
              requestHeader.user,
              requestHeader.originator,
              operationName,
              response.status,
              payload,
              response.data,
              targetUrl
            );
        }

        ret = { code: response.status, message: response.data, headers: requestHeader };
    } catch (e) {
        logger.error(`Error during ${operationName}: ${e.message}`, e);

        const status = e.response?.status || HTTP_CODES.DATA_INVALID;
        const data = e.response?.data || e;

        executionAndTraceService.recordServiceRequestFromClient(
          serverAppName,
          serverAppRelease,
          requestHeader.xCorrelator,
          requestHeader.traceIndicator,
          requestHeader.user,
          requestHeader.originator,
          operationName,
          status,
          payload,
          data,
          targetUrl
        );

        ret = { code: status, message: data, headers: requestHeader };
    }

    // Translate error codes
    const translatedResponse = translateProxyResponse(ret);
    logger.debug(`Translated response: ${JSON.stringify(translatedResponse)}`);

    return translatedResponse;
};


/**
 * Execute GET request and await success return value.
 *
 * @param targetUrl
 * @param operationName
 * @param operationKey
 * @oaram serverAppName
 * @oaram serverAppRelease
 * @return {Promise}
 */
exports.startGetRequest = async function (targetUrl, operationName, operationKey, serverAppName, serverRelease) {
    const requestHeader = requestUtil.createRequestHeader(operationKey);

    let ret;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'x-correlator': requestHeader.xCorrelator,
                'trace-indicator': requestHeader.traceIndicator,
                'user': requestHeader.user,
                'originator': requestHeader.originator,
                'customer-journey': requestHeader.customerJourney,
                ...(requestHeader.operationKey && { 'operation-key': requestHeader.operationKey })
            }
        });

        logger.debug(`${operationName} success. Result: ${response.status}`);

        // For example if the response code is 408 (server timeout), then that means the server didn't receive the request
        // Execute the EATL request only if the response code is 408 or such similar case.
        if (response.status >= 400) {
            executionAndTraceService.recordServiceRequestFromClient(
              serverAppName,
              serverAppRelease,
              requestHeader.xCorrelator,
              requestHeader.traceIndicator,
              requestHeader.user,
              requestHeader.originator,
              operationName,
              response.status,
              undefined,
              response.data,
              targetUrl
            );
        }

        ret = { code: response.status, message: response.data, headers: requestHeader };
    } catch (e) {
        logger.error(`Error during ${operationName}: ${e.message}`, e);

        const status = e.response?.status || HTTP_CODES.BAD_GATEWAY;
        const data = e.response?.data || e;

        executionAndTraceService.recordServiceRequestFromClient(
          serverAppName,
          serverAppRelease,
          requestHeader.xCorrelator,
          requestHeader.traceIndicator,
          requestHeader.user,
          requestHeader.originator,
          operationName,
          status,
          undefined,
          data,
          targetUrl
        );

        ret = { code: status, message: data, headers: requestHeader };
    }

    // Translate error codes
    const translatedResponse = translateProxyResponse(ret);
    logger.debug(`Translated Response: ${JSON.stringify(translatedResponse)}`);

    return translatedResponse;
};

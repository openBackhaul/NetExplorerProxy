const restClient = require('./RestClient');
const requestUtil = require("./RequestUtil");
const controlConstructUtils = require("./ControlConstructUtil");
const logger = require('../LoggingService.js').getLogger();


const HTTP_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    REQUEST_TIMEOUT: 408,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    BAD_GATEWAY_AUTHENTICATION: 531,
    BAD_GATEWAY_NOT_RESPONDING: 532
};


/**
 * Build target URL, optionally including a fields filter parameter.
 * @param protocol
 * @param address
 * @param port
 * @param operationUrl
 * @param fieldsFilter
 * @returns {string}
 */
function buildTargetUrl(protocol, address, port, operationUrl, fieldsFilter = undefined) {
    let url = requestUtil.buildRequestTargetPath(protocol, address, port) + operationUrl;

    if (fieldsFilter) {
        url += "?fields=" + encodeURIComponent(fieldsFilter);

        // Manually encode parentheses
        url = url.replaceAll("(", "%28").replaceAll(")", "%29");
    }

    return url;
}


/**
 * Forward request to another app depending on use case.
 *
 * @param requestUrl
 * @param callbackName
 * @param payload
 * @return {Promise<*|null>}
 */
exports.postRequestDataFromOtherApp = async function(requestUrl, callbackName, payload, apiUrl=undefined) {
    let opData = await controlConstructUtils.getForwardingConstructOutputOperationData(callbackName);
    if (!opData) {
        const msg = `Operation data could not be queried for callback: ${callbackName}`;
        logger.error(msg);
        return { code: HTTP_CODES.INTERNAL_SERVER_ERROR, message: msg };
    }

    let operationUrl = apiUrl ?? opData.operationName;

    const targetUrl = buildTargetUrl(opData.protocol, opData.address, opData.port, operationUrl);

    logger.debug(`Forwarding post data request to '${targetUrl}'`);

    const ret = await restClient.startPostDataRequest(targetUrl, payload, requestUrl, opData.operationKey, opData.appName, opData.appRelease);

    return {
        ...ret,
        operationName: opData.operationName,
        operationKey: opData.operationKey,
        appName: opData.appName,
        appRelease: opData.appRelease
    };
}

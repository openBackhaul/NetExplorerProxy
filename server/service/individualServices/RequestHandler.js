const restClient = require('./RestClient');
const requestUtil = require("./RequestUtil");
const controlConstructUtils = require("./ControlConstructUtil");
const logger = require('../LoggingService.js').getLogger();


/**
 * forward request to another app depending on use case
 *
 * @param requestUrl
 * @param callbackName
 * @param payload
 * @return {Promise<*|null>}
 */
exports.postRequestDataFromOtherApp = async function(requestUrl, callbackName, payload, apiUrl =undefined) {
    let opData = await controlConstructUtils.getForwardingConstructOutputOperationData(callbackName);
    if (!opData) {
        const msg = "Operation data could not queried: " + callbackName;
        logger.error(msg);
        return {code: 500, message: msg};
    }

    let operationUrl = apiUrl ?? opData.operationName;

    let targetUrl = requestUtil.buildRequestTargetPath(opData.protocol, opData.address, opData.port) + operationUrl;

    logger.debug("forwarding post data request to '" + targetUrl + "'");

    const ret = await restClient.startPostDataRequest(targetUrl, payload, requestUrl, opData.operationKey);

    return {
        code: ret.code,
        message: ret.message,
        headers: ret.headers,
        operationName: opData.operationName
    };
}

const BasicServices = require("onf-core-model-ap-bs/basicServices/BasicServicesService");
const logger = require('../LoggingService.js').getLogger();
const RequestHeader = require("onf-core-model-ap/applicationPattern/rest/client/RequestHeader");

let appInformation = null;

/**
 * Query and cache app information from the load file.
 * @returns appInformation with application-name and release-number
 */
exports.getAppInformation = async function() {
    if (!appInformation) {
        appInformation = {};

        try {
            appInformation = await BasicServices.informAboutApplication();
        } catch (exception) {
            logger.error(exception, "no application information found, using fallback");
            appInformation["application-name"] = "NetExplorerProxy";
            appInformation["release-number"] = "1.0.0";
        }
    }

    return appInformation;
}

exports.createRequestHeader = function (operationKey) {
    return new RequestHeader("NetExplorerProxy", "NetExplorerProxy", undefined, "1", undefined, operationKey);
}

exports.buildRequestTargetPath = function (protocol, address, port) {
    let addressPart;

    if (address["domain-name"]) {
        addressPart = address["domain-name"];
    } else if (address["ip-address"]) {
        addressPart = address["ip-address"]["ipv-4-address"];
    } else {
        addressPart = address
    }

    return protocol
      + "://" + addressPart
      + ":" + port;
}

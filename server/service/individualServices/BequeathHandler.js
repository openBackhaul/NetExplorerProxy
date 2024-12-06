const controlConstructUtils = require("./ControlConstructUtil");
const restClient = require("./RestClient");
const logger = require('../LoggingService.js').getLogger();
const requestUtil = require('./RequestUtil');
const TcpObject = require("onf-core-model-ap/applicationPattern/onfModel/services/models/TcpObject");
const logicalTerminationPointServices = require("onf-core-model-ap/applicationPattern/onfModel/services/LogicalTerminationPointServices");
const LogicalTerminationPointConfigurationInput = require("onf-core-model-ap/applicationPattern/onfModel/services/models/logicalTerminationPoint/ConfigurationInput");
const individualServicesOperationsMapping = require('./IndividualServicesOperationsMapping');

exports.handleRequest = async function (body, requestUrl) {

    let appName = body["new-application-name"];
    let appRelease = body["new-application-release"];
    let appAddress = body["new-application-address"];
    let appPort = body["new-application-port"];

    let success = await addNewReleaseInfoToConfig(appName, appRelease, appAddress, appPort, requestUrl);

    let appInformation = requestUtil.getAppInformation();

    if (success) {
        success = await broadcastInfoAboutServerReplacement(appInformation, appName, appRelease, appAddress, appPort);
    }

    if (success) {
        success = await triggerDeregisterOfOldRelease(appInformation);
    }

    if (success) {
        success = await broadcastOfBackwardCompatibleOperationUpdates();
    }

    if (success) {
        logger.info("bequeath finished successfully");
        return true;
    } else {
        logger.error("bequeath reported error, abandoning process");
        return false;
    }
}

async function broadcastInfoAboutServerReplacement(appInformation, appName, appRelease, appAddress, appPort) {
    //PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement

    try {
        let targetAddressWrapperServerReplacement = await controlConstructUtils.getForwardingConstructOutputOperationData("PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement");

        let serverReplacementMessage = {
            "current-application-name": appInformation["application-name"],
            "current-release-number": appInformation["release-number"],
            "future-application-name": appName,
            "future-release-number": appRelease,
            "future-protocol": "HTTP",
            "future-address": appAddress,
            "future-port": appPort
        };

        let targetAppUrlServerReplacement = requestUtil.buildRequestTargetPath(targetAddressWrapperServerReplacement.protocol, targetAddressWrapperServerReplacement.address, targetAddressWrapperServerReplacement.port) + targetAddressWrapperServerReplacement.operationName;
        return await restClient.startPostRequest(targetAppUrlServerReplacement, serverReplacementMessage, targetAddressWrapperServerReplacement.operationName, targetAddressWrapperServerReplacement.operationKey);
    } catch (exception) {
        logger.error(exception, "broadcastInfoAboutServerReplacement failed");
        return false;
    }
}

/**
 * @param appName
 * @param appRelease
 * @param appAddress
 * @param appPort
 * @param requestUrl
 * @return {Promise<boolean>} success
 */
async function addNewReleaseInfoToConfig(appName, appRelease, appAddress, appPort, requestUrl) {

    try {
        //update name, release, address and port of "NewRelease"
        let newReleaseHttpAndTcpUUID = await controlConstructUtils.getHttpAndTcpUUIDForNewRelease();
        let newReleaseHttpUUID = newReleaseHttpAndTcpUUID["httpClientUuid"];

        let operationNamesByAttributes = new Map();

        let tcpServerList = [new TcpObject("HTTP", appAddress, appPort)];

        let ltpConfigurationInput = new LogicalTerminationPointConfigurationInput(
            newReleaseHttpUUID,
            appName,
            appRelease,
            tcpServerList,
            requestUrl,
            operationNamesByAttributes,
            individualServicesOperationsMapping.individualServicesOperationsMapping
        );
        await logicalTerminationPointServices.createOrUpdateApplicationLtpsAsync(
            ltpConfigurationInput, false
        );
        return true;
    } catch (exception) {
        logger.error(exception, "addNewReleaseInfoToConfig failed");
        return false;
    }
}

async function triggerDeregisterOfOldRelease(appInformation) {
    //PromptForBequeathingDataCausesRequestForDeregisteringOfOldRelease

    try {
        let targetAddressWrapperDeregister = await controlConstructUtils.getForwardingConstructOutputOperationData("PromptForBequeathingDataCausesRequestForDeregisteringOfOldRelease");

        let deregisterNotification = {
            "application-name": appInformation["application-name"],
            "release-number": appInformation["release-number"]
        };

        let targetDeregisterApplicationURL = requestUtil.buildRequestTargetPath(targetAddressWrapperDeregister.protocol, targetAddressWrapperDeregister.address, targetAddressWrapperDeregister.port) + targetAddressWrapperDeregister.operationName;
        return await restClient.startPostRequest(targetDeregisterApplicationURL, deregisterNotification, targetAddressWrapperDeregister.operationName, targetAddressWrapperDeregister.operationKey);
    } catch (exception) {
        logger.error(exception, "triggerDeregisterOfOldRelease failed");
        return false;
    }
}

async function broadcastOfBackwardCompatibleOperationUpdates() {
    //PromptingNewReleaseForUpdatingServerCausesRequestForBroadcastingInfoAboutBackwardCompatibleUpdateOfOperation

    // try {
    // let targetAddressWrapperBroadcastInfo = await controlConstructUtils.getForwardingConstructOutputOperationData("PromptingNewReleaseForUpdatingServerCausesRequestForBroadcastingInfoAboutBackwardCompatibleUpdateOfOperation");
    //
    // let broadcastInfoMessage = {
    //     "application-name": appInformation["application-name"],
    //     "release-number": appInformation["release-number"],
    //     "old-operation-name": "/v1/register-application",
    //     "new-operation-name": "/v2/register-application"
    // };
    //
    // let targetAppUrlBroadcastInfo = requestUtil.buildRequestTargetPath(targetAddressWrapperBroadcastInfo.protocol, targetAddressWrapperBroadcastInfo.address, targetAddressWrapperBroadcastInfo.port) + targetAddressWrapperBroadcastInfo.operationName;
    // return await restClient.startPostRequest(targetAppUrlBroadcastInfo, broadcastInfoMessage, targetAddressWrapperBroadcastInfo.operationName, targetAddressWrapperBroadcastInfo.operationKey);
    // } catch (exception) {
    //     logger.error(exception, "broadcastOfBackwardCompatibleOperationUpdates failed");
    //     return false;
    // }

    return true;
}

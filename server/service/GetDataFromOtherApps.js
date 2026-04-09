'use strict';
const requestHandler = require('./individualServices/RequestHandler');
const IndividualServiceUtility = require('./individualServices/IndividualServicesUtility');
const logger = require('./LoggingService.js').getLogger();

// Used on old MWDI < 2.0.0 - MWDI://v1/provide-list-of-connected-devices
module.exports.provideListOfConnectedDevicesfromMWDI = async function provideListOfConnectedDevicesfromMWDI(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    logger.info("Get list of mountname from MWDI://v1/provide-list-of-connected-devices");
    const ListOfConnectedDevices = await requestHandler.postRequestDataFromOtherApp(
        url, "PromptForProvidingListOfConnectedDeviceCausesReadingMwdiDeviceList", {});

    return ListOfConnectedDevices;
}

// From MWDI 2.0.0 - MWDI://v1/provide-list-of-cached-devices
module.exports.provideListOfCachedDevicesfromMWDI = async function provideListOfCachedDevicesfromMWDI(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    logger.info("Get list of mountname from MWDI://v1/provide-list-of-cached-devices");
    const ListOfConnectedDevices = await requestHandler.postRequestDataFromOtherApp(
        url, "PromptForEmbeddingCausesCyclicLoadingOfDeviceListFromMwdi", {});

    return ListOfConnectedDevices;
}

module.exports.retriveTheCC = async function retriveTheCC(requestHeaders, traceIndicatorIncrementer, mountName) {
    const CyclicDeviceDataRetrievalFromMwdi = "PromptForEmbeddingCausesCyclicDeviceDataRetrievalFromMwdi";
    const DeviceDataFromMwdi = "EmbeddingCausesRequestForDeviceDataFromMwdi";
    let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(
        CyclicDeviceDataRetrievalFromMwdi, DeviceDataFromMwdi);
    let pathParamList = [];

    pathParamList.push(mountName);

    logger.debug(`Forward request for mountname ${mountName}`);
    let ccOfMountname = await IndividualServiceUtility.forwardRequest(
        consequentOperationClientAndFieldParams, pathParamList, requestHeaders, traceIndicatorIncrementer);

    return ccOfMountname;
}

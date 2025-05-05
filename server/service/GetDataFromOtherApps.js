'use strict';
const requestHandler = require('./individualServices/RequestHandler');
const IndividualServiceUtility = require('./individualServices/IndividualServicesUtility');



module.exports.provideListOfConnectedDevicesfromMWDI = async function provideListOfConnectedDevicesfromMWDI(body, user, xCorrelator, traceIndicator, customerJourney, url)
 {

        const ListOfConnectedDevices = await requestHandler.postRequestDataFromOtherApp(url, "PromptForProvidingListOfConnectedDeviceCausesReadingMwdiDeviceList", {});
    
        return ListOfConnectedDevices;
 }
module.exports.retriveTheCC = async function retriveTheCC(body, user,requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName) {

       const CyclicDeviceDataRetrievalFromMwdi = "PromptForEmbeddingCausesCyclicDeviceDataRetrievalFromMwdi";
       const DeviceDataFromMwdi = "EmbeddingCausesRequestForDeviceDataFromMwdi";
       let consequentOperationClientAndFieldParams = await IndividualServiceUtility.getConsequentOperationClientAndFieldParams(CyclicDeviceDataRetrievalFromMwdi, DeviceDataFromMwdi);
       let pathParamList = [];
       pathParamList.push(mountName);

       let ccOfMountname = await IndividualServiceUtility.forwardRequest(consequentOperationClientAndFieldParams, pathParamList, requestHeaders, traceIndicator);
       
       return ccOfMountname;;
}

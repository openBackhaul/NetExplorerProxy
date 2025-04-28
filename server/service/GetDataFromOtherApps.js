'use strict';
const individualServices = require('./IndividualServicesService');
const requestHandler = require('./individualServices/RequestHandler');


module.exports.provideListOfConnectedDevicesfromMWDI = async function provideListOfConnectedDevicesfromMWDI(body, user, xCorrelator, traceIndicator, customerJourney, url)
 {

        const ListOfConnectedDevices = await individualServices.provideListOfConnectedDevices(url);
    
        return ListOfConnectedDevices;
 }

module.exports.retriveTheCC = async function retriveTheCC(body, user, xCorrelator, traceIndicator, customerJourney, url) {

       const ccOfMountname = await requestHandler.postRequestDataFromOtherApp(url, "EmbeddingCausesRequestForDeviceDataFromMwdi",body);
       
       return ccOfMountname;
}

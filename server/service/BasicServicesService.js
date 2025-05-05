'use strict';
const getDataFromOtherApp=require('./GetDataFromOtherApps');
const requestHandler = require('./individualServices/RequestHandler');

  module.exports.embedYourself = async function embedYourself(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    let startTime = process.hrtime();
    let listOfConnectedDevices = await getDataFromOtherApp.provideListOfConnectedDevicesfromMWDI(body, user, xCorrelator, traceIndicator++, customerJourney, url);
    if(undefined != listOfConnectedDevices && 
      Object.keys(listOfConnectedDevices).length > 0 &&
      listOfConnectedDevices.hasOwnProperty("message") &&
      listOfConnectedDevices.message["mount-name-list"].length > 0){
      
    const mountNameList = listOfConnectedDevices.message["mount-name-list"];
    let requestHeaders = {
      user: user,
      // originator: originator,
      xCorrelator: xCorrelator,
      traceIndicator: traceIndicator,
      customerJourney: customerJourney
    };
 
    for (let mountName of mountNameList) {
   
    let ccOfMountname = await exports.retriveTheCCofMountname(body, user,requestHeaders, xCorrelator, traceIndicator++, customerJourney, url, mountName);
    }
  }
  };

  module.exports.retriveTheCCofMountname = async function retriveTheCCofMountname(body, user,requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName) {
    let startTime = process.hrtime();
    let ccOfMountname = getDataFromOtherApp.retriveTheCC(body, user, requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName);
    return ccOfMountname;
  }; 

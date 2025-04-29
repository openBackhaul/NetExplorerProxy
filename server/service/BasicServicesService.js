'use strict';
const getDataFromOtherApp=require('./GetDataFromOtherApps');
const requestHandler = require('./individualServices/RequestHandler');

module.exports.embedYourself = async function embedYourself(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    let startTime = process.hrtime();
    let ListOfConnectedDevices = getDataFromOtherApp.provideListOfConnectedDevicesfromMWDI(body, user, xCorrelator, traceIndicator, customerJourney, url);
    
  };

  module.exports.retriveTheCCofMountname = async function retriveTheCCofMountname(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    let startTime = process.hrtime();
    let ccOfMountname = getDataFromOtherApp.retriveTheCC(body, user, xCorrelator, traceIndicator, customerJourney, url);
  }; 

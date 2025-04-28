'use strict';
<<<<<<< HEAD
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
=======

module.exports.embedYourself = async function embedYourself(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    let startTime = process.hrtime();
    };
>>>>>>> c041d7e26f2fde8aa6510426bfb2201c8981c959

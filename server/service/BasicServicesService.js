'use strict';
const getDataFromOtherApp=require('./GetDataFromOtherApps');
const requestHandler = require('./individualServices/RequestHandler');

  module.exports.embedYourself = async function embedYourself(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    let startTime = process.hrtime();
    let ListOfConnectedDevices = await getDataFromOtherApp.provideListOfConnectedDevicesfromMWDI(body, user, xCorrelator, traceIndicator, customerJourney, url);
    if(ListOfConnectedDevices.message["mount-name-list"]){
    // let ListOfConnectedDevices= 
 
    // {
    
    //   code: 200,
    
    //   message: {
    
    //     "mount-name-list": [
    
    //       "CO17797",
    
    //       "CO12123",
    
    //       "CO12252",
    
    //       "CO01716",
    
    //       "513250007",
    
    //       "CO01715",
    
    //       "513250006",
    
    //       "CO01714",
    
    //       "CO06250",
    
    //       "513250009",
    
    //       "513250008",
    
    //       "CO06317",
    
    //       "513250010",
    
    //       "513250011",
    
    //       "CO13305",
    
    //       "CO12995",
    
    //       "513559991B",
    
    //       "CO15338",
    
    //       "CO12126",
    
    //       "CO15951",
    
    //       "CO12994",
    
    //       "CO06252",
    
    //       "CO06254",
    
    //       "CO06253",
    
    //       "CO15950",
    
    //       "CO12259",
    
    //       "CO12258",
    
    //       "CO13306",
    
    //       "CO12255",
    
    //       "CO12254",
    
    //       "CO06263",
    
    //       "513559991A",
    
    //       "CO17798",
    
    //       "CO17799",
    
    //       "CO15337",
    
    //       "CO17553",
    
    //       "CO17796",
    
    //       "CO06318",
    
    //       "CO17806",
    
    //       "CO03045",
    
    //       "513250013",
    
    //     ],
    
    //   },
    
    //   headers: {
    
    //     user: "NetExplorerProxy",
    
    //     originator: "NetExplorerProxy",
    
    //     xCorrelator: "40d7d6c9-cC7b-9bbc-F7C9-4c929ebC4CCb",
    
    //     traceIndicator: "1",
    
    //     customerJourney: "unknown",
    
    //     operationKey: "Operation key not yet provided.",
    
    //     contentType: "application/json",
    
    //   },
    
    //   operationName: "/v1/provide-list-of-connected-devices",
    
    // }
     
     
     
    const mountNameList = ListOfConnectedDevices.message["mount-name-list"];
 
    for (let mountName of mountNameList) {
   
    let ccOfMountname = await exports.retriveTheCCofMountname(body, user, xCorrelator, traceIndicator, customerJourney, url, mountName);
    }
  }
  };

  module.exports.retriveTheCCofMountname = async function retriveTheCCofMountname(body, user, xCorrelator, traceIndicator, customerJourney, url, mountName) {
    let startTime = process.hrtime();
    let requestHeaders = {
      user: user,
      // originator: originator,
      xCorrelator: xCorrelator,
      traceIndicator: traceIndicator,
      customerJourney: customerJourney
    };
    let ccOfMountname = getDataFromOtherApp.retriveTheCC(body, user, requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName);
    return ccOfMountname;
  }; 

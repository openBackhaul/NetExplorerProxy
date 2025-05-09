'use strict';
const getDataFromOtherApp=require('./GetDataFromOtherApps');
const ltpStructureUtility = require('./LtpStructureUtility');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

const ETHERNET_INTERFACE = {
  MODULE: "ethernet-container-2-0",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_ETHERNET_CONTAINER_LAYER",
  CONFIGURATION: "ethernet-container-configuration",
  CAPABILITY: "ethernet-container-capability",
  STATUS: "ethernet-container-status",
  NAME: "ethernet-container-name",
  PAC: "ethernet-container-pac",
  HISTORICAL_PERFORMANCES: "ethernet-container-historical-performances",
  HISTORICAL_PERFORMANCES_DATA_LIST: "historical-performance-data-list"
};


  module.exports.embedYourself = async function embedYourself(body, user, xCorrelator, traceIndicator, customerJourney, url) {
    let startTime = process.hrtime();
    const timestamp = Date.now();
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
      await exports.processTheCCOfMountname(ccOfMountname,timestamp,mountName);
    }
  }
  };

  module.exports.retriveTheCCofMountname = async function retriveTheCCofMountname(body, user,requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName) {
    let startTime = process.hrtime();
    let ccOfMountname = getDataFromOtherApp.retriveTheCC(body, user, requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName);
    return ccOfMountname;
  }; 


  module.exports.processTheCCOfMountname = async function processTheCCOfMountname(ccOfMountname,timestamp,mountName) {
    
    
    if(ccOfMountname.hasOwnProperty("core-model-1-4:control-construct")){
        

        //fetch the ethernet container general info

        const ethInterfaceLtpList = await ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
           ETHERNET_INTERFACE.MODULE + ":" + ETHERNET_INTERFACE.PAC, ccOfMountname);
  
        const ethernetContainerGeneralInfo = await extractEthernetContainerInfo(
          ethInterfaceLtpList,
          mountName,
          timestamp
        );
            
        // Pretty-printed with indentation for better readability
        console.log('Ethernet Container General Info:', JSON.stringify(ethernetContainerGeneralInfo, null, 2));
        
    
    }
  };


  /**
 * Extracts ethernet container information from LTP structure
 * @param {Array} ethInterfaceLtpList - List of LTPs with ethernet interface
 * @param {string} mountName - Name of the mount point
 * @param {string} timestamp - Current timestamp
 * @return {Array} List of ethernet container information objects
 */
async function extractEthernetContainerInfo(ethInterfaceLtpList, mountName, timestamp) {
  const ethernetContainerGeneralInfo = [];
  
  for (let ltp of ethInterfaceLtpList) {
      const layerProtocol = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0];
      const ethernetContainerPac = layerProtocol["ethernet-container-2-0:ethernet-container-pac"];
      
      // Create ethernet container object with basic information
      let ethObj = {
          "mount_name": mountName,
          "uuid": ltp[onfAttributes.GLOBAL_CLASS.UUID],
          "local_id": layerProtocol[onfAttributes.LOCAL_CLASS.LOCAL_ID],
          "timestamp": timestamp,
          "operational_state": ltp[onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE],
          "administrative_state": layerProtocol["administrative-state"],
          "original_ltp_name": ltp["ltp-augment-1-0:ltp-augment-pac"]["original-ltp-name"]
      };
      
      // Add ethernet container specific attributes
      if (ethernetContainerPac) {
          const configuration = ethernetContainerPac[ETHERNET_INTERFACE.CONFIGURATION];
          const status = ethernetContainerPac[ETHERNET_INTERFACE.STATUS];
          
          ethObj["interface_name"] = configuration["interface-name"];
          ethObj["bundling_is_on"] = configuration["bundling-is-on"];
          ethObj["interface_status"] = status["interface-status"];
      }
      
      ethernetContainerGeneralInfo.push(ethObj);
  }
  
  return ethernetContainerGeneralInfo;
}



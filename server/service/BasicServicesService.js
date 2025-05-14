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

const AIR_INTERFACE = {
  MODULE: "air-interface-2-0",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_AIR_LAYER",
  CONFIGURATION: "air-interface-configuration",
  CAPABILITY: "air-interface-capability",
  STATUS: "air-interface-status",
  NAME: "air-interface-name",
  PAC: "air-container-pac",
  HISTORICAL_PERFORMANCES: "air-interface-historical-performances",
  HISTORICAL_PERFORMANCE_DATA_LIST: "historical-performance-data-list"
};

const WIRE_INTERFACE = {
  MODULE: "wire-interface-2-0",
  LAYER_PROTOCOL_NAME: "LAYER_PROTOCOL_NAME_TYPE_WIRE_LAYER",
  CAPABILITY: "wire-interface-capability",
  STATUS: "wire-interface-status",
  SUPPORTED_PMD_LIST: "supported-pmd-kind-list",
  PMD_NAME: "pmd-name",
  PAC: "wire-interface-pac",
  PMD_KIND_CUR: "pmd-kind-cur",
  CONFIGURATION: "wire-interface-configuration"
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
      let ccOfMountname = await exports.retriveTheccOfMountname(body, user,requestHeaders, xCorrelator, traceIndicator++, customerJourney, url, mountName);
      await exports.processTheccOfMountname(ccOfMountname,timestamp,mountName);
    }
  }
  };

  module.exports.retriveTheccOfMountname = async function retriveTheccOfMountname(body, user,requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName) {
    let startTime = process.hrtime();
    let ccOfMountname = getDataFromOtherApp.retriveTheCC(body, user, requestHeaders, xCorrelator, traceIndicator, customerJourney, url, mountName);
    return ccOfMountname;
  }; 


  module.exports.processTheccOfMountname = async function processTheccOfMountname(ccOfMountname,timestamp,mountName) {
    
    
    if(ccOfMountname.hasOwnProperty("core-model-1-4:control-construct")){
        

      //fetch the device general info
      const deviceGenereInfo=await exports.retriveTheGeneralInfo(ccOfMountname,mountName,timestamp);

        //fetch the ethernet container general info

        const ethInterfaceLtpList = await ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
           ETHERNET_INTERFACE.MODULE + ":" + ETHERNET_INTERFACE.PAC, ccOfMountname);
  
        const ethernetContainerGeneralInfo = await extractEthernetContainerInfo(
          ethInterfaceLtpList,
          mountName,
          timestamp
        );

        const airinterfceLtpList= await ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
          AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.PAC, ccOfMountname);

          const airContainerGeneralInfo = await extractairContainerGeneralInfo(
            airinterfceLtpList,
            mountName,
            timestamp
          );
            
        const wireinterfceLtpList= await ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
          WIRE_INTERFACE.MODULE + ":" + WIRE_INTERFACE.PAC, ccOfMountname);
 
          const wireInterfaceGeneralInfo = await extractWireInterfaceGeneralInfo(
            wireinterfceLtpList,
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

async function extractairContainerGeneralInfo(airinterfceLtpList, mountName, timestamp) {
  const airContainerGeneralInfo = [];
  
  for (let ltp of airinterfceLtpList) {
      const layerProtocol = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0];
      const airContainerPac = layerProtocol["air-interface-2-0:air-interface-pac"];
      const augumentContainerPac=ltp["ltp-augment-1-0:ltp-augment-pac"];

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
      
      // Add air container specific attributes
      if (airContainerPac) {
          const configuration = airContainerPac[AIR_INTERFACE.CONFIGURATION];
          const status = airContainerPac[AIR_INTERFACE.STATUS];
          const capibility = airContainerPac[AIR_INTERFACE.CAPABILITY];

          ethObj["transmission_mode_min"] = configuration["transmission-mode-min"];
          ethObj["transmission_mode_max"] = configuration["transmission-mode-max"];
          ethObj["xpic_is_on"] = configuration["xpic-is-on"];
          ethObj["power_is_on"] = configuration["power-is-on"];
          ethObj["transmitter_is_on"] = configuration["transmitter-is-on"];
          ethObj["interface_status"] = status["interface-status"];
          ethObj["type_of_equipment"] = capibility["type-of-equipment"];

      }
      if(augumentContainerPac){
        ethObj["external_label"] = augumentContainerPac["external-label"];
      }
      airContainerGeneralInfo.push(ethObj);
  }
  
  return airContainerGeneralInfo;
}

async function extractWireInterfaceGeneralInfo(wireinterfceLtpList, mountName, timestamp) {
  const wireContainerGeneralInfo = [];
 
  for (let ltp of wireinterfceLtpList) {
      const layerProtocol = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0];
      const wireContainerPac = layerProtocol["wire-interface-2-0:wire-interface-pac"];
     
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
      // Add wire container specific attributes
      if (wireContainerPac) {
          const configuration = wireContainerPac[WIRE_INTERFACE.CONFIGURATION];
          const status = wireContainerPac[WIRE_INTERFACE.STATUS];
          const capibility = wireContainerPac[WIRE_INTERFACE.CAPABILITY][WIRE_INTERFACE.SUPPORTED_PMD_LIST][0];
 
          ethObj["interface_name"] = configuration["interface-name"];
          ethObj["fixed_pmd_kind"] = configuration["fixed-pmd-kind"];
          ethObj["interface_status"] = status["interface-status"];
          ethObj["pmd_kind_cur"] = status["pmd-kind-cur"];
          ethObj["pmd_name"] = capibility["pmd-name"];
          ethObj["duplex"] = capibility["duplex"];
          ethObj["speed"] = capibility["speed"]; 
      }
     
      wireContainerGeneralInfo.push(ethObj);
  }
 
  return wireContainerGeneralInfo;
}



  module.exports.retriveTheGeneralInfo = async function retriveTheGeneralInfo(ccOfMountname,mountName,timestamp){
      
    let deviceModelName = "";
    let externallabelName = "";
    const deviceModelData = ccOfMountname?.["core-model-1-4:control-construct"]?.[0]?.["equipment-augment-1-0:control-construct-pac"];


    if (deviceModelData?.["device-model-name"] && deviceModelData?.["external-label"]) {
    deviceModelName = deviceModelData["device-model-name"];
    externallabelName=deviceModelData["external-label"];
    console.log("deviceModelName",deviceModelName);
    console.log("externallabelName",externallabelName);
  }

  const systemName = ccOfMountname?.["core-model-1-4:control-construct"]?.[0]
  ?.["equipment-augment-1-0:protocol-collection"]?.protocol?.[0]
  ?.["lldp-1-0:lldp-pac"]?.["local-system-data"]?.["system-name"];

  if (systemName) {
    console.log("System Name:", systemName);
  }
  const result = {
    "mount_name":mountName,
    "timestamp": timestamp,
    "external_label":externallabelName,
    "device_model_name":deviceModelName,
    "system_name": systemName,
  };
  return result;

    }
  


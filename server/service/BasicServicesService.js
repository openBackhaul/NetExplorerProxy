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
  PAC: "air-interface-pac",
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

          const airContainerGeneralInfo = await extractAirContainerGeneralInfo(
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

          const equipmentGeneralInfo=await equipmentDataOutputMapping(ccOfMountname,mountName,timestamp); 
        // Pretty-printed with indentation for better readability
        console.log('Ethernet Container General Info:', JSON.stringify(ethernetContainerGeneralInfo, null, 2));
        
    
    }
  };

  async function equipmentDataOutputMapping(ccOfMountname, mountName, timestamp) {
       const result = [];

      // Check if ccOfMountname has the required properties
      if (ccOfMountname && 
          ccOfMountname.hasOwnProperty("core-model-1-4:control-construct") && 
          Array.isArray(ccOfMountname["core-model-1-4:control-construct"]) && 
          ccOfMountname["core-model-1-4:control-construct"].length > 0) {
          
          const equipmentArray = ccOfMountname["core-model-1-4:control-construct"][0] && 
                                ccOfMountname["core-model-1-4:control-construct"][0].hasOwnProperty("equipment") && 
                                Array.isArray(ccOfMountname["core-model-1-4:control-construct"][0].equipment) ? 
                                ccOfMountname["core-model-1-4:control-construct"][0].equipment : [];

          for (const equipment of equipmentArray) {


              if (!equipment || !equipment.hasOwnProperty("actual-equipment") || !equipment["actual-equipment"]) continue;

              // Check if required nested properties exist
              if ( !equipment["actual-equipment"].hasOwnProperty("manufactured-thing")) continue;

              const manufacturedThing = equipment["actual-equipment"]["manufactured-thing"];
              

              const equipmentType = manufacturedThing["equipment-type"];
              const manufacturerProps = manufacturedThing["manufacturer-properties"];
              
              // Create object with only properties that exist
              const equipmentObj = {
                  "mount_name": mountName,
                  "timestamp": timestamp
              };
              
              // Only add properties if they exist
              if (equipment.hasOwnProperty("uuid")) {
                  equipmentObj["uuid"] = equipment["uuid"];
              }
              
              if (equipment.hasOwnProperty("local-id")) {
                  equipmentObj["local_id"] = equipment["local-id"];
              }
              
              if (equipmentType && equipmentType.hasOwnProperty("version")) {
                  equipmentObj["version"] = equipmentType["version"];
              }
              
              if (equipmentType && equipmentType.hasOwnProperty("description")) {
                  equipmentObj["description"] = equipmentType["description"];
              }
              
              if (equipmentType && equipmentType.hasOwnProperty("model-identifier")) {
                  equipmentObj["model_identifier"] = equipmentType["model-identifier"];
              }
              
              if (equipmentType && equipmentType.hasOwnProperty("part-type-identifier")) {
                  equipmentObj["part_type_identifier"] = equipmentType["part-type-identifier"];
              }
              
              if (equipmentType && equipmentType.hasOwnProperty("type-name")) {
                  equipmentObj["type_name"] = equipmentType["type-name"];
              }
              
              if (manufacturerProps && manufacturerProps.hasOwnProperty("manufacturer-name")) {
                  equipmentObj["manufacturer_name"] = manufacturerProps["manufacturer-name"];
              }
              
              if (manufacturerProps && manufacturerProps.hasOwnProperty("manufacturer-identifier")) {
                  equipmentObj["manufacturer_identifier"] = manufacturerProps["manufacturer-identifier"];
              }
              
              result.push(equipmentObj);
          }
      }

      return result;

      }
 
 
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
      let ethObj = {};
      // Create ethernet container object with basic information

      ethObj["mount_name"] = mountName;

      if (ltp && ltp.hasOwnProperty(onfAttributes.GLOBAL_CLASS.UUID)) {
        ethObj["uuid"] = ltp[onfAttributes.GLOBAL_CLASS.UUID];
      }

      if (layerProtocol && layerProtocol.hasOwnProperty(onfAttributes.LOCAL_CLASS.LOCAL_ID)) {
        ethObj["local_id"] = layerProtocol[onfAttributes.LOCAL_CLASS.LOCAL_ID];
      }

      ethObj["timestamp"] = timestamp;

      if (ltp && ltp.hasOwnProperty(onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE)) {
        ethObj["operational_state"] = ltp[onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE];
      }

      if (layerProtocol && layerProtocol.hasOwnProperty("administrative-state")) {
        ethObj["administrative_state"] = layerProtocol["administrative-state"];
      }

      if (ltp && ltp.hasOwnProperty("ltp-augment-1-0:ltp-augment-pac") && 
          ltp["ltp-augment-1-0:ltp-augment-pac"] && 
          ltp["ltp-augment-1-0:ltp-augment-pac"].hasOwnProperty("original-ltp-name")) {
        ethObj["original_ltp_name"] = ltp["ltp-augment-1-0:ltp-augment-pac"]["original-ltp-name"];
      }

      

      // Add ethernet container specific attributes
      if (ethernetContainerPac && ethernetContainerPac.hasOwnProperty(ETHERNET_INTERFACE.CONFIGURATION)) {
        const configuration = ethernetContainerPac[ETHERNET_INTERFACE.CONFIGURATION];
        
        if (configuration && configuration.hasOwnProperty("interface-name")) {
          ethObj["interface_name"] = configuration["interface-name"];
        }
        
        if (configuration && configuration.hasOwnProperty("bundling-is-on")) {
          ethObj["bundling_is_on"] = configuration["bundling-is-on"];
        }
      }

      if (ethernetContainerPac && ethernetContainerPac.hasOwnProperty(ETHERNET_INTERFACE.STATUS)) {
        const status = ethernetContainerPac[ETHERNET_INTERFACE.STATUS];
        
        if (status && status.hasOwnProperty("interface-status")) {
          ethObj["interface_status"] = status["interface-status"];
        }
      }
      
      ethernetContainerGeneralInfo.push(ethObj);
  }
  
  return ethernetContainerGeneralInfo;
}

async function extractAirContainerGeneralInfo(airinterfceLtpList, mountName, timestamp) {
  const airContainerGeneralInfo = [];
  
  for (let ltp of airinterfceLtpList) {
          
          let ethObj = {
              "mount_name": mountName,
              "timestamp": timestamp
          };
        // Check if required properties exist before accessing
        if (ltp && ltp.hasOwnProperty(onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL) && 
            Array.isArray(ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]) && 
            ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL].length > 0) {
            
          const layerProtocol = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0];
          const airContainerPac = layerProtocol && layerProtocol.hasOwnProperty("air-interface-2-0:air-interface-pac") ? 
                                  layerProtocol["air-interface-2-0:air-interface-pac"] : null;
          const augumentContainerPac = ltp && ltp.hasOwnProperty("ltp-augment-1-0:ltp-augment-pac") ? 
                                      ltp["ltp-augment-1-0:ltp-augment-pac"] : null;

          // Create ethernet container object with basic information
          
          
          // Add properties only if they exist
          if (ltp && ltp.hasOwnProperty(onfAttributes.GLOBAL_CLASS.UUID)) {
              ethObj["uuid"] = ltp[onfAttributes.GLOBAL_CLASS.UUID];
          }
          
          if (layerProtocol && layerProtocol.hasOwnProperty(onfAttributes.LOCAL_CLASS.LOCAL_ID)) {
              ethObj["local_id"] = layerProtocol[onfAttributes.LOCAL_CLASS.LOCAL_ID];
          }
          
          if (ltp && ltp.hasOwnProperty(onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE)) {
              ethObj["operational_state"] = ltp[onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE];
          }
          
          if (layerProtocol && layerProtocol.hasOwnProperty("administrative-state")) {
              ethObj["administrative_state"] = layerProtocol["administrative-state"];
          }
          
          if (augumentContainerPac && augumentContainerPac.hasOwnProperty("original-ltp-name")) {
              ethObj["original_ltp_name"] = augumentContainerPac["original-ltp-name"];
          }
          
          // Add air container specific attributes
          if (airContainerPac) {
              const configuration = airContainerPac.hasOwnProperty(AIR_INTERFACE.CONFIGURATION) ? 
                                  airContainerPac[AIR_INTERFACE.CONFIGURATION] : null;
              const status = airContainerPac.hasOwnProperty(AIR_INTERFACE.STATUS) ? 
                            airContainerPac[AIR_INTERFACE.STATUS] : null;
              const capibility = airContainerPac.hasOwnProperty(AIR_INTERFACE.CAPABILITY) ? 
                                airContainerPac[AIR_INTERFACE.CAPABILITY] : null;

              if (configuration) {
                  if (configuration.hasOwnProperty("transmission-mode-min")) {
                      ethObj["transmission_mode_min"] = configuration["transmission-mode-min"];
                  }
                  if (configuration.hasOwnProperty("transmission-mode-max")) {
                      ethObj["transmission_mode_max"] = configuration["transmission-mode-max"];
                  }
                  if (configuration.hasOwnProperty("xpic-is-on")) {
                      ethObj["xpic_is_on"] = configuration["xpic-is-on"];
                  }
                  if (configuration.hasOwnProperty("power-is-on")) {
                      ethObj["power_is_on"] = configuration["power-is-on"];
                  }
                  if (configuration.hasOwnProperty("transmitter-is-on")) {
                      ethObj["transmitter_is_on"] = configuration["transmitter-is-on"];
                  }
              }
              
              if (status && status.hasOwnProperty("interface-status")) {
                  ethObj["interface_status"] = status["interface-status"];
              }
              
              if (capibility && capibility.hasOwnProperty("type-of-equipment")) {
                  ethObj["type_of_equipment"] = capibility["type-of-equipment"];
              }
          }
          
          if (augumentContainerPac && augumentContainerPac.hasOwnProperty("external-label")) {
              ethObj["external_label"] = augumentContainerPac["external-label"];
          }
        }


         airContainerGeneralInfo.push(ethObj);
  }
  
  return airContainerGeneralInfo;
}

async function extractWireInterfaceGeneralInfo(wireinterfceLtpList, mountName, timestamp) {
  const wireContainerGeneralInfo = [];
 
for (let ltp of wireinterfceLtpList) {
  // Check if ltp has the required properties
      if (ltp && 
          ltp.hasOwnProperty(onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL) && 
          Array.isArray(ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL]) && 
          ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL].length > 0) {
          
          const layerProtocol = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0];
          
          // Check if layerProtocol has wire-interface-pac
          if (layerProtocol && layerProtocol.hasOwnProperty("wire-interface-2-0:wire-interface-pac")) {
              const wireContainerPac = layerProtocol["wire-interface-2-0:wire-interface-pac"];

              if (wireContainerPac) {
                  // Check for configuration, status, and capability properties
                  const configuration = wireContainerPac.hasOwnProperty(WIRE_INTERFACE.CONFIGURATION) ? 
                                      wireContainerPac[WIRE_INTERFACE.CONFIGURATION] : null;
                  
                  const status = wireContainerPac.hasOwnProperty(WIRE_INTERFACE.STATUS) ? 
                                wireContainerPac[WIRE_INTERFACE.STATUS] : null;
                  
                  // Check if capability exists and has the required property
                  const capability = (wireContainerPac.hasOwnProperty(WIRE_INTERFACE.CAPABILITY) && 
                                    wireContainerPac[WIRE_INTERFACE.CAPABILITY].hasOwnProperty(WIRE_INTERFACE.SUPPORTED_PMD_LIST) &&
                                    Array.isArray(wireContainerPac[WIRE_INTERFACE.CAPABILITY][WIRE_INTERFACE.SUPPORTED_PMD_LIST])) ? 
                                    wireContainerPac[WIRE_INTERFACE.CAPABILITY][WIRE_INTERFACE.SUPPORTED_PMD_LIST] : [];

                  if (capability.length === 0) {
                      let ethObj = {};
                      await extractIfCapabilityNotFound(configuration, status, mountName, timestamp, layerProtocol, ltp, ethObj);
                      wireContainerGeneralInfo.push(ethObj);
                  } else {
                      for (let cap of capability) {
                          let ethObj = {};
                          await extractIfCapabilityNotFound(configuration, status, mountName, timestamp, layerProtocol, ltp, ethObj);
                          if (cap) {
                              await extractFromSupportedPmdKindList(cap, ethObj);
                          }
                          wireContainerGeneralInfo.push(ethObj);
                      }
                  }
              }
          }
      }


  }

  return wireContainerGeneralInfo;
}

async function extractIfCapabilityNotFound(configuration, status, mountName, timestamp, layerProtocol, ltp, ethObj) {
  
       // Only set properties if the corresponding values exist
      if (configuration && configuration.hasOwnProperty("interface-name")) {
          ethObj["interface_name"] = configuration["interface-name"];
      }

      if (configuration && configuration.hasOwnProperty("fixed-pmd-kind")) {
          ethObj["fixed_pmd_kind"] = configuration["fixed-pmd-kind"];
      }

      if (status && status.hasOwnProperty("interface-status")) {
          ethObj["interface_status"] = status["interface-status"];
      }

      if (status && status.hasOwnProperty("pmd-kind-cur")) {
          ethObj["pmd_kind_cur"] = status["pmd-kind-cur"];
      }

      // Always set mount_name and timestamp
      ethObj["mount_name"] = mountName;
      ethObj["timestamp"] = timestamp;

      if (ltp && ltp.hasOwnProperty(onfAttributes.GLOBAL_CLASS.UUID)) {
          ethObj["uuid"] = ltp[onfAttributes.GLOBAL_CLASS.UUID];
      }

      if (layerProtocol && layerProtocol.hasOwnProperty(onfAttributes.LOCAL_CLASS.LOCAL_ID)) {
          ethObj["local_id"] = layerProtocol[onfAttributes.LOCAL_CLASS.LOCAL_ID];
      }

      if (ltp && ltp.hasOwnProperty(onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE)) {
          ethObj["operational_state"] = ltp[onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE];
      }

      if (layerProtocol && layerProtocol.hasOwnProperty("administrative-state")) {
          ethObj["administrative_state"] = layerProtocol["administrative-state"];
      }

      if (ltp && ltp.hasOwnProperty("ltp-augment-1-0:ltp-augment-pac") && 
          ltp["ltp-augment-1-0:ltp-augment-pac"] && 
          ltp["ltp-augment-1-0:ltp-augment-pac"].hasOwnProperty("original-ltp-name")) {
          ethObj["original_ltp_name"] = ltp["ltp-augment-1-0:ltp-augment-pac"]["original-ltp-name"];
      }

}

async function extractFromSupportedPmdKindList(cap, ethObj) {
    if (cap && cap.hasOwnProperty("pmd-name")) {
    ethObj["pmd_name"] = cap["pmd-name"];
    }

    if (cap && cap.hasOwnProperty("duplex")) {
    ethObj["duplex"] = cap["duplex"];
    }

    if (cap && cap.hasOwnProperty("speed")) {
    ethObj["speed"] = cap["speed"];
    }
}



  module.exports.retriveTheGeneralInfo = async function retriveTheGeneralInfo(ccOfMountname,mountName,timestamp){
      
    let deviceModelName;
    let externallabelName;
    let systemName;

    // Check if required properties exist before accessing
    if (ccOfMountname && 
        ccOfMountname.hasOwnProperty("core-model-1-4:control-construct") && 
        Array.isArray(ccOfMountname["core-model-1-4:control-construct"]) && 
        ccOfMountname["core-model-1-4:control-construct"].length > 0 &&
        ccOfMountname["core-model-1-4:control-construct"][0].hasOwnProperty("equipment-augment-1-0:control-construct-pac")) {
        
        const deviceModelData = ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:control-construct-pac"];
        
        if (deviceModelData && deviceModelData.hasOwnProperty("device-model-name")) {
            deviceModelName = deviceModelData["device-model-name"];
        }
        
        if (deviceModelData && deviceModelData.hasOwnProperty("external-label")) {
            externallabelName = deviceModelData["external-label"];
        }
    }

    // Check for system name with nested property checks
    if (ccOfMountname && 
        ccOfMountname.hasOwnProperty("core-model-1-4:control-construct") && 
        Array.isArray(ccOfMountname["core-model-1-4:control-construct"]) && 
        ccOfMountname["core-model-1-4:control-construct"].length > 0 &&
        ccOfMountname["core-model-1-4:control-construct"][0].hasOwnProperty("equipment-augment-1-0:protocol-collection") &&
        ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:protocol-collection"].hasOwnProperty("protocol") &&
        Array.isArray(ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:protocol-collection"]["protocol"]) &&
        ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:protocol-collection"]["protocol"].length > 0 &&
        ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:protocol-collection"]["protocol"][0].hasOwnProperty("lldp-1-0:lldp-pac") &&
        ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:protocol-collection"]["protocol"][0]["lldp-1-0:lldp-pac"].hasOwnProperty("local-system-data") &&
        ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:protocol-collection"]["protocol"][0]["lldp-1-0:lldp-pac"]["local-system-data"].hasOwnProperty("system-name")) {
        
        systemName = ccOfMountname["core-model-1-4:control-construct"][0]["equipment-augment-1-0:protocol-collection"]["protocol"][0]["lldp-1-0:lldp-pac"]["local-system-data"]["system-name"];
    }

    // Create result object with only required and available properties
    const result = {
        "mount_name": mountName,
        "timestamp": timestamp
    };

    // Only add properties if they have values
    if (externallabelName) {
        result["external_label"] = externallabelName;
    }

    if (deviceModelName) {
        result["device_model_name"] = deviceModelName;
    }

    if (systemName) {
        result["system_name"] = systemName;
    }
    
    return result;

    }
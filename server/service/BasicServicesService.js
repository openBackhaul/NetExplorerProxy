'use strict';
// ONF imports
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const IndividualServiceUtility = require('../service/individualServices/IndividualServicesUtility.js');

const getDataFromOtherApp = require('./GetDataFromOtherApps');
const ltpStructureUtility = require('./LtpStructureUtility');

const dbHandler = require('./db/dbHandler.js');
const processMountNames=require('./ProcessMountNames.js');
const logger = require('./LoggingService.js').getLogger();


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
  HISTORICAL_PERFORMANCE_DATA_LIST: "historical-performance-data-list",
  MODE_LIST: "transmission-mode-list"
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

// From NEP 1.2.0
const LTP_INTERFACE = {
  MODULE: "ltp-augment-1-0",
  PAC: "ltp-augment-pac",
};

const INTERFACE_STATUS = {
  UP: "INTERFACE_STATUS_TYPE_UP",
  DOWN: "INTERFACE_STATUS_TYPE_DOWN",
  TESTING: "INTERFACE_STATUS_TYPE_TESTING",
  UNKNOWN: "INTERFACE_STATUS_TYPE_UNKNOWN",
  DORMANT: "INTERFACE_STATUS_TYPE_DORMANT",
  NOT_PRESENT: "INTERFACE_STATUS_TYPE_NOT_PRESENT",
  NOT_YET_DEFINED: "INTERFACE_STATUS_TYPE_NOT_YET_DEFINED"
}

// --------------  Constant Strings Definition----------------------
const CORE_MODEL_CC = "core-model-1-4:control-construct";
const EQUIP_AUG_PC = "equipment-augment-1-0:protocol-collection";
const LTP_AUG_PAC = "ltp-augment-1-0:ltp-augment-pac";
// -----------------------------------------------------------------

async function processMountNamesInBatches(mountNameList, requestHeaders, taskTraceId, timestamp) {
  const forwardingName = "PromptForRegisteringCausesRegistrationRequest";
  const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  const prefix = forwardingConstruct.uuid.split('op')[0];
  const MAX_CONCURRENT = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-002");
  const MAX_TIMEOUT = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-003") * 1000;
  const N_OF_RETRIES = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-004");
  const DELAY_RETRY = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-005") * 1000 * 60;
  // From NEP 1.2.0
  const TIME_BTW_CC_RETRIVALS =  await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-008");

  const results = [];
  const errors = [];
  let index = 0;

  logger.info(`Doing Cyclic process with:\n- Max Concurrent: ${MAX_CONCURRENT}\n- Max Timeout: ${MAX_TIMEOUT}ms\n- N Of Retries: ${N_OF_RETRIES}\n- Delay Retry: ${DELAY_RETRY}ms`);

  async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function doWorkWithRetry(mountName) {
    let attempt = 0;
    while (attempt < N_OF_RETRIES) {
      try {
        const start = Date.now();
        logger.info(`[${mountName}] Attempt ${attempt + 1}/${N_OF_RETRIES}`);
        await exports.doWorkThread(requestHeaders, taskTraceId, mountName, timestamp);

        const elapsed = Date.now() - start;
        logger.info(`[${mountName}] Completed in ${elapsed}ms`);
        results.push({ mountName, elapsed, attempts: attempt + 1 });
        return; // success, exit retry loop
      } catch (err) {
        attempt++;
        logger.warn(`[${mountName}] Attempt ${attempt} failed: ${err.message || err}`);
        if (attempt < N_OF_RETRIES) {
          logger.info(`[${mountName}] Retrying in ${DELAY_RETRY} ms...`);
          await delay(DELAY_RETRY);
        } else {
          logger.error(` [${mountName}] All ${N_OF_RETRIES} attempts failed`);
          errors.push({ mountName, error: err });
        }
      }
    }
  }

  async function worker() {
    while (true) {
      const currentIndex = index++;
      if (currentIndex >= mountNameList.length) {
        break;
      }

      const mountName = mountNameList[currentIndex];
      await doWorkWithRetry(mountName);
    }
  }

  const workerCount = Math.min(MAX_CONCURRENT, mountNameList.length);
  const workers = [];
  for (let i = 0; i < workerCount; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  logger.info(`All Mount-Names processed. Success: ${results.length}, Failed: ${errors.length}`);
  if (errors.length > 0) {
    logger.warn(`Failed Mount-Names: ${errors.map(e => e.mountName).join(", ")}`);
  }

  return { results, errors };
}

// OLD routine
// async function processMountNamesInBatches(mountNameList, requestHeaders, taskTraceId, timestamp) {
//   const forwardingName = "PromptForRegisteringCausesRegistrationRequest";
//   const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
//   let prefix = forwardingConstruct.uuid.split('op')[0];
//   let MAX_CONCURRENT = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-002");

//   let activePromises = [];
//   let index = 0;

//   async function processNext() {
//     if (index >= mountNameList.length) {
//       logger.debug(`Index is > mountnamelist length, so return ${index} >= ${mountNameList.length}`);
//       return;
//     }

//     const mountName = mountNameList[index++];
//     const start = Date.now();

//     logger.info(`Starting processing for Mount-Name: ${mountName}`);
//     const promise = exports.doWorkThread(requestHeaders, taskTraceId, mountName, timestamp)
//       .then(ccOfMountname => {
//         const stop = Date.now() - timestamp;
//         logger.info(`Finished retrieving cc for Mount-Name: ${mountName} with time: ${stop}`);
//       })
//       .finally(() => {
//         activePromises.splice(activePromises.indexOf(promise), 1);
//         return processNext();
//       });

//     activePromises.push(promise);
//   }

//   // Start the first batch of concurrent tasks
//   for (let i = 0; i < MAX_CONCURRENT && i < mountNameList.length; i++) {
//     await processNext();
//   }

//   // Wait for all remaining tasks to complete
//   await Promise.all(activePromises);
// }
//////

let traceIncrement= 1;
module.exports.embedYourself = async function embedYourself(body, user, xCorrelator, traceIndicator, customerJourney, url) {

  const timestamp = Date.now();
  const listOfConnectedDevices = await getDataFromOtherApp.provideListOfConnectedDevicesfromMWDI(
    body, user, xCorrelator, traceIndicator, customerJourney, url
  );

  if (
    listOfConnectedDevices &&
    Object.keys(listOfConnectedDevices).length > 0 &&
    listOfConnectedDevices.hasOwnProperty("message") &&
    listOfConnectedDevices.message.hasOwnProperty("mount-name-list") &&
    listOfConnectedDevices.message["mount-name-list"].length > 0
  ) {
    const mountNameList = listOfConnectedDevices.message["mount-name-list"];
    logger.info(mountNameList, "List of connected device exists");
    const requestHeaders = { // using shorthand
      user,
      xCorrelator,
      traceIndicator,
      customerJourney
    };
     
const dbMountNames = (await dbHandler.readListOfDevices()).map(d => d['mount-name']);
const newMounts = mountNameList.filter(m => !dbMountNames.includes(m));
const existingMounts = mountNameList.filter(m => dbMountNames.includes(m));
const prioritizedMountNames = [...newMounts, ...existingMounts];
await processMountNames.addNewDataInNEPdeviceList(prioritizedMountNames);
   
    // Call the batch processor here
    traceIncrement += 1;
    await processMountNamesInBatches(
      prioritizedMountNames, requestHeaders, traceIncrement++, timestamp
    );
  } else {
    logger.warn(listOfConnectedDevices, "List of connected device is empty or wrong");
  }
};

module.exports.doWorkThread = async function doWorkThread(requestHeaders, traceIndicatorIncrementer, mountName, timestamp) {
let ccOfMountName = await getDataFromOtherApp.retriveTheCC(requestHeaders, traceIndicatorIncrementer, mountName);
  // Calculate Timestamp when data is retrieved from MWDI
  let newTimeStamp = Date.now();
  logger.debug(`Data retrieved from MWDI for Mountname: ${mountName} at the time: ${newTimeStamp}`);
  await exports.processTheccOfMountname(ccOfMountName, newTimeStamp, mountName);
  return ccOfMountName;
};


module.exports.processTheccOfMountname = async function processTheccOfMountname(ccOfMountname, timestamp, mountName) {
  logger.info(`Retrieving data for Mount-Name ${mountName}`);
  if (ccOfMountname.hasOwnProperty(CORE_MODEL_CC)) {
    processGeneralInfo(ccOfMountname, mountName, timestamp);
    processEthernetContainergeneralInfo(ccOfMountname, mountName, timestamp);
    processWireInterfaceGeneralInfo(ccOfMountname, mountName, timestamp);
    processEquipmentGeneralInfo(ccOfMountname, mountName, timestamp);
 //   processLtpEquipmentMappings(ccOfMountname, mountName, timestamp); // From NEP 1.2.0
    await processAirContainerGeneralInfoAndTransmissionInfo(ccOfMountname, mountName, timestamp);
    logger.info(`Data has been commited in the DB for Mount-Name: ${mountName}`);
  } else {
    logger.error(`Not able to extract data from CC of Mount-Name ${mountName}`);
  }
};

function processGeneralInfo(ccOfMountname, mountName, timestamp) {
  logger.debug(`Processing General info for Mount-Name: ${mountName}`);
  const deviceGeneralInfo = extractGeneralInfo(ccOfMountname, mountName, timestamp);
    // .catch((err) => logger.error(err));

  if (deviceGeneralInfo) {
    dbHandler.updateDeviceInfo(deviceGeneralInfo).catch((err) => logger.error(err));
  } else {
    logger.warn(`No deviceGeneralInfo for Mount-Name ${mountName}`);
  }
}

function processEquipmentGeneralInfo(ccOfMountname, mountName, timestamp) {
  logger.debug(`Processing Equipment info for Mount-Name: ${mountName}`);
  const equipmentGeneralInfo = extractEquipmentData(ccOfMountname, mountName, timestamp);
    // .catch((err) => logger.error(`${err}`));

  if (equipmentGeneralInfo) {
    dbHandler.updateEquipmentInfo(equipmentGeneralInfo).catch((err) => logger.error(err));
  } else {
    logger.warn(`No equipmentGeneralInfo for Mount-Name: ${mountName}`);
  }
}

function processWireInterfaceGeneralInfo(ccOfMountname, mountName, timestamp) {
  logger.debug(`Processing Wire interface info for Mount-Name: ${mountName}`);
  const wireInterfaceLtpList = ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
    WIRE_INTERFACE.MODULE + ":" + WIRE_INTERFACE.PAC, ccOfMountname);

  const wireInterfaceGeneralInfo = extractWireInterfaceGeneralInfo(
    wireInterfaceLtpList,
    mountName,
    timestamp
  );
  // ).catch((err) => logger.error(err));

  if (wireInterfaceGeneralInfo) {
    dbHandler.updateWireInterface(wireInterfaceGeneralInfo)
      .catch((err) => logger.error(err));
  } else {
    logger.warn(`No wireIfGeneralInfo for Mount-Name: ${mountName}`);
  }
}

async function processAirContainerGeneralInfoAndTransmissionInfo(ccOfMountname, mountName, timestamp) {
  logger.debug(`Processing Air interface info for Mount-Name: ${mountName}`);
  const airInterfaceLtpList = ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
    AIR_INTERFACE.MODULE + ":" + AIR_INTERFACE.PAC, ccOfMountname);

  const airContainerGeneralInfoAndTransmissionInfo = extractAirContainerGeneralInfoAndTransmissionInfo(
    airInterfaceLtpList,
    mountName,
    timestamp
  );
  // ).catch((err) => logger.error(`${err}`));

  if (airContainerGeneralInfoAndTransmissionInfo) {
    if (airContainerGeneralInfoAndTransmissionInfo["airContainerGeneralInfo"]) {
      dbHandler.updateAirInterface(airContainerGeneralInfoAndTransmissionInfo["airContainerGeneralInfo"])
        .catch((err) => logger.error(err));
    } else {
      logger.warn(`No airContainerGeneralInfo for Mount-Name: ${mountName}`);
    }
    if (airContainerGeneralInfoAndTransmissionInfo["transMissionListInfo"] &&
      airContainerGeneralInfoAndTransmissionInfo["transMissionListInfo"].length !== 0) {
      await dbHandler.updateAirTransMode(airContainerGeneralInfoAndTransmissionInfo["transMissionListInfo"])
        .catch((err) => logger.error(err));
    } else {
      logger.warn(`No Transmission mode for Mount-Name: ${mountName}`);
    }
  } else {
    logger.warn(`No airContainerGeneralInfo and Transmission for Mount-Name: ${mountName}`);
  }
}

function processEthernetContainergeneralInfo(ccOfMountname, mountName, timestamp) {
  logger.debug(`Processing Ethernet info for Mount-Name: ${mountName}`);
  const ethInterfaceLtpList = ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
    ETHERNET_INTERFACE.MODULE + ":" + ETHERNET_INTERFACE.PAC, ccOfMountname);

  const ethernetContainerGeneralInfo = extractEthernetContainerInfo(
    ethInterfaceLtpList,
    mountName,
    timestamp
  );
  // ).catch((err) => logger.error(err));

  if (ethernetContainerGeneralInfo) {
    dbHandler.updateEthernetContainer(ethernetContainerGeneralInfo)
      .catch((err) => logger.error(err));
  } else {
    logger.warn(`No ethContainerInfo and Transmission for Mount-Name: ${mountName}`);
  }
}

// Added from NEP 1.2.0
async function processLtpEquipmentMappings(ccOfMountname, mountName, timestamp) {
  logger.debug(`Processing LTP Equipment for Mount-Name: ${mountName}`);
  const ltpEquipmentList = ltpStructureUtility.getLtpsContainsObjectFromLtpStructure(
    LTP_INTERFACE.MODULE + ":" + LTP_INTERFACE.PAC, ccOfMountname);

  const ltpEquipmentListData = extractLtpEquipmentData(
    ltpEquipmentList,
    mountName,
    timestamp
  );

  if (ltpEquipmentListData) {
    dbHandler.updateLtpEqpMap(ltpEquipmentListData)
      .catch((err) => logger.error(err));
  } else {
    logger.warn(`No LTP Equipment Mappings for Mount-Name: ${mountName}`);
  }
}
// ---------------

function extractEquipmentData(ccOfMountname, mountName, timestamp) {
  const result = [];

  // Check if ccOfMountname has the required properties
  if (ccOfMountname &&
    ccOfMountname.hasOwnProperty(CORE_MODEL_CC) &&
    Array.isArray(ccOfMountname[CORE_MODEL_CC]) &&
    ccOfMountname[CORE_MODEL_CC].length > 0) {

    const equipmentArray = ccOfMountname[CORE_MODEL_CC][0] &&
      ccOfMountname[CORE_MODEL_CC][0].hasOwnProperty("equipment") &&
      Array.isArray(ccOfMountname[CORE_MODEL_CC][0].equipment) ?
      ccOfMountname[CORE_MODEL_CC][0].equipment : [];

    for (const equipment of equipmentArray) {
      if (!equipment || !equipment.hasOwnProperty("actual-equipment") || !equipment["actual-equipment"]) {
        continue;
      }

      // Check if required nested properties exist
      if (!equipment["actual-equipment"].hasOwnProperty("manufactured-thing")) {
        continue
      };

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
function extractEthernetContainerInfo(ethInterfaceLtpList, mountName, timestamp) {
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
      const rawValue = ltp[onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE];
      ethObj["operational_state"] = rawValue.substring(rawValue.lastIndexOf("_") + 1);
    }

    if (layerProtocol && layerProtocol.hasOwnProperty("administrative-state")) {
     const rawValue = layerProtocol["administrative-state"];
     ethObj["administrative_state"] = rawValue.substring(rawValue.lastIndexOf("_") + 1);
    }

    if (ltp && ltp.hasOwnProperty(LTP_AUG_PAC) &&
      ltp[LTP_AUG_PAC] &&
      ltp[LTP_AUG_PAC].hasOwnProperty("original-ltp-name")) {
      ethObj["original_ltp_name"] = ltp[LTP_AUG_PAC]["original-ltp-name"];
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
      
      // Trim interface status
      if (status && status.hasOwnProperty("interface-status")) {
        ethObj["interface_status"] = extractInterfaceStatus(status["interface-status"]);
      }
    }

    ethernetContainerGeneralInfo.push(ethObj);
  }

  return ethernetContainerGeneralInfo;
}

function extractAirContainerGeneralInfoAndTransmissionInfo(airInterfaceLtpList, mountName, timestamp) {
  const airContainerGeneralInfo = [];
  const returnObj = {};
  const transMissionListInfo = [];

  for (let ltp of airInterfaceLtpList) {
    const layerProtocol = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0];
    const airContainerPac = layerProtocol["air-interface-2-0:air-interface-pac"];
    const augumentContainerPac = ltp[LTP_AUG_PAC];

    let airContObj = {
      "mount_name": mountName,
      "uuid": ltp[onfAttributes.GLOBAL_CLASS.UUID],
      "timestamp": timestamp
    };

    if (layerProtocol && layerProtocol.hasOwnProperty(onfAttributes.LOCAL_CLASS.LOCAL_ID)) {
      airContObj["local_id"] = layerProtocol[onfAttributes.LOCAL_CLASS.LOCAL_ID];
    }

    if (ltp && ltp.hasOwnProperty(onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE)) {
      // Trim the prefix
      const rawValue = ltp[onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE];
      airContObj["operational_state"] = rawValue.substring(rawValue.lastIndexOf("_") + 1);
    }

    if (layerProtocol && layerProtocol.hasOwnProperty("administrative-state")) {
      // Trim the prefix
      const rawValue = layerProtocol["administrative-state"];
      airContObj["administrative_state"] = rawValue.substring(rawValue.lastIndexOf("_") + 1);
    }

    if (ltp && ltp.hasOwnProperty(LTP_AUG_PAC) &&
      ltp[LTP_AUG_PAC].hasOwnProperty("original-ltp-name")) {
      airContObj["original_ltp_name"] = ltp[LTP_AUG_PAC]["original-ltp-name"];
    }

    // Add air container specific attributes
    if (airContainerPac) {
      const configuration = airContainerPac[AIR_INTERFACE.CONFIGURATION];
      const status = airContainerPac[AIR_INTERFACE.STATUS];
      const capibility = airContainerPac[AIR_INTERFACE.CAPABILITY];
      const transmissionList = capibility[AIR_INTERFACE.MODE_LIST];

      if (configuration && configuration.hasOwnProperty("transmission-mode-min")) {
        airContObj["transmission_mode_min"] = configuration["transmission-mode-min"];
      }

      if (configuration && configuration.hasOwnProperty("transmission-mode-max")) {
        airContObj["transmission_mode_max"] = configuration["transmission-mode-max"];
      }

      if (configuration && configuration.hasOwnProperty("xpic-is-on")) {
        airContObj["xpic_is_on"] = configuration["xpic-is-on"];
      }

      if (configuration && configuration.hasOwnProperty("power-is-on")) {
        airContObj["power_is_on"] = configuration["power-is-on"];
      }

      if (configuration && configuration.hasOwnProperty("transmitter-is-on")) {
        airContObj["transmitter_is_on"] = configuration["transmitter-is-on"];
      }

      // Trim interface status
      if (status && status.hasOwnProperty("interface-status")) {
        airContObj["interface_status"] = extractInterfaceStatus(status["interface-status"]);
      }
      if (capibility && capibility.hasOwnProperty("type-of-equipment")) {
        airContObj["type_of_equipment"] = capibility["type-of-equipment"];
      }

      if (transmissionList) {
        for (let transmissionListObj of transmissionList) {
          // Skipping entries with code-rate = -1
          if (transmissionListObj && transmissionListObj.hasOwnProperty("code-rate") &&
            (transmissionListObj["code-rate"] == -1 || transmissionListObj["code-rate"] == "-1")) {
            continue;
          }
          let traMis = {};
          traMis["mount_name"] = mountName;
          traMis["uuid"] = ltp[onfAttributes.GLOBAL_CLASS.UUID];
          traMis["local_id"] = layerProtocol[onfAttributes.LOCAL_CLASS.LOCAL_ID];
          traMis["timestamp"] = timestamp;

          // Add existing properties with null checks
          if (transmissionListObj && transmissionListObj.hasOwnProperty("transmission-mode-name")) {
            traMis["transmission_mode_name"] = transmissionListObj["transmission-mode-name"];
          }

          if (transmissionListObj && transmissionListObj.hasOwnProperty("symbol-rate-reduction-factor")) {
            traMis["symbol_rate_reduction_factor"] = transmissionListObj["symbol-rate-reduction-factor"];
          }

          if (transmissionListObj && transmissionListObj.hasOwnProperty("channel-bandwidth")) {
            traMis["channel_bandwidth"] = transmissionListObj["channel-bandwidth"];
          }

          if (transmissionListObj && transmissionListObj.hasOwnProperty("modulation-scheme-name-at-lct")) {
            traMis["modulation_scheme_at_lct"] = transmissionListObj["modulation-scheme-name-at-lct"];
          }

          if (transmissionListObj && transmissionListObj.hasOwnProperty("modulation-scheme")) {
            traMis["modulation_scheme"] = transmissionListObj["modulation-scheme"];
          }

          if (transmissionListObj && transmissionListObj.hasOwnProperty("code-rate")) {
            traMis["code_rate"] = transmissionListObj["code-rate"];
          }

          if (transmissionListObj && transmissionListObj.hasOwnProperty("xpic-is-avail")) {
            traMis["xpic_is_avail"] = transmissionListObj["xpic-is-avail"];
          }

          // Calculate and add capa-factor
          const capaFactor = calculateCapaFactor(transmissionListObj);
          if (capaFactor !== null) {
            traMis["capa_factor"] = capaFactor;
          }
          transMissionListInfo.push(traMis);
        };
      }
    }
    if (augumentContainerPac) {
      airContObj["external_label"] = augumentContainerPac["external-label"];
    }
    airContainerGeneralInfo.push(airContObj);
  }

  returnObj["airContainerGeneralInfo"] = airContainerGeneralInfo;
  returnObj["transMissionListInfo"] = transMissionListInfo;

  return returnObj;
}

function extractWireInterfaceGeneralInfo(wireinterfceLtpList, mountName, timestamp) {
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
            extractIfCapabilityNotFound(configuration, status, mountName, timestamp, layerProtocol, ltp, ethObj);
            wireContainerGeneralInfo.push(ethObj);
          } else {
            for (let cap of capability) {
              let ethObj = {};
              extractIfCapabilityNotFound(configuration, status, mountName, timestamp, layerProtocol, ltp, ethObj);
              if (cap) {
                extractFromSupportedPmdKindList(cap, ethObj);
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

function extractIfCapabilityNotFound(configuration, status, mountName, timestamp, layerProtocol, ltp, ethObj) {

  // Only set properties if the corresponding values exist
  if (configuration && configuration.hasOwnProperty("interface-name")) {
    ethObj["interface_name"] = configuration["interface-name"];
  }

  if (configuration && configuration.hasOwnProperty("fixed-pmd-kind")) {
    ethObj["fixed_pmd_kind"] = configuration["fixed-pmd-kind"];
  }

  // Trim interface status
  if (status && status.hasOwnProperty("interface-status")) {
    ethObj["interface_status"] = extractInterfaceStatus(status["interface-status"]);
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
    const rawValue = ltp[onfAttributes.OPERATION_CLIENT.OPERATIONAL_STATE];
    ethObj["operational_state"] = rawValue.substring(rawValue.lastIndexOf("_") + 1);
  }

  if (layerProtocol && layerProtocol.hasOwnProperty("administrative-state")) {
    const rawValue = layerProtocol["administrative-state"];
    ethObj["administrative_state"] = rawValue.substring(rawValue.lastIndexOf("_") + 1);
  }

  if (ltp && ltp.hasOwnProperty(LTP_AUG_PAC) &&
    ltp[LTP_AUG_PAC] &&
    ltp[LTP_AUG_PAC].hasOwnProperty("original-ltp-name")) {
    ethObj["original_ltp_name"] = ltp[LTP_AUG_PAC]["original-ltp-name"];
  }

}

function extractFromSupportedPmdKindList(cap, ethObj) {
  if (cap && cap.hasOwnProperty("pmd-name")) {
    ethObj["pmd_name"] = cap["pmd-name"];
  }

  if (cap && cap.hasOwnProperty("duplex")) {
    const fullDuplex = cap["duplex"];
    const lastColon = fullDuplex.lastIndexOf(":");
    const afterColon = fullDuplex.substring(lastColon + 1); // "DUPLEX_TYPE_NOT_YET_DEFINED"
    const prefix = "DUPLEX_TYPE_";

    if (afterColon.startsWith(prefix)) {
      ethObj["duplex"] = afterColon.substring(prefix.length); // "NOT_YET_DEFINED"
    }
  }

  if (cap && cap.hasOwnProperty("speed")) {
    ethObj["speed"] = cap["speed"];
  }
}

function extractGeneralInfo(ccOfMountname, mountName, timestamp) {

  let deviceModelName;
  let externallabelName;
  let systemName;
  let result = [];

  // Check if required properties exist before accessing
  if (ccOfMountname &&
    ccOfMountname.hasOwnProperty(CORE_MODEL_CC) &&
    Array.isArray(ccOfMountname[CORE_MODEL_CC]) &&
    ccOfMountname[CORE_MODEL_CC].length > 0 &&
    ccOfMountname[CORE_MODEL_CC][0].hasOwnProperty("equipment-augment-1-0:control-construct-pac")) {

    const deviceModelData = ccOfMountname[CORE_MODEL_CC][0]["equipment-augment-1-0:control-construct-pac"];

    if (deviceModelData && deviceModelData.hasOwnProperty("device-model-name")) {
      deviceModelName = deviceModelData["device-model-name"];
    }

    if (deviceModelData && deviceModelData.hasOwnProperty("external-label")) {
      externallabelName = deviceModelData["external-label"];
    }
  }

  // Check for system name with nested property checks
  if (ccOfMountname &&
    ccOfMountname.hasOwnProperty(CORE_MODEL_CC) &&
    Array.isArray(ccOfMountname[CORE_MODEL_CC]) &&
    ccOfMountname[CORE_MODEL_CC].length > 0 &&
    ccOfMountname[CORE_MODEL_CC][0].hasOwnProperty(EQUIP_AUG_PC) &&
    ccOfMountname[CORE_MODEL_CC][0][EQUIP_AUG_PC].hasOwnProperty("protocol") &&
    Array.isArray(ccOfMountname[CORE_MODEL_CC][0][EQUIP_AUG_PC]["protocol"]) &&
    ccOfMountname[CORE_MODEL_CC][0][EQUIP_AUG_PC]["protocol"].length > 0 &&
    ccOfMountname[CORE_MODEL_CC][0][EQUIP_AUG_PC]["protocol"][0].hasOwnProperty("lldp-1-0:lldp-pac") &&
    ccOfMountname[CORE_MODEL_CC][0][EQUIP_AUG_PC]["protocol"][0]["lldp-1-0:lldp-pac"].hasOwnProperty("local-system-data") &&
    ccOfMountname[CORE_MODEL_CC][0][EQUIP_AUG_PC]["protocol"][0]["lldp-1-0:lldp-pac"]["local-system-data"].hasOwnProperty("system-name")) {

    systemName = ccOfMountname[CORE_MODEL_CC][0][EQUIP_AUG_PC]["protocol"][0]["lldp-1-0:lldp-pac"]["local-system-data"]["system-name"];
  }

  // Create result object with only required and available properties
  const deviceGeneralObj = {
    "mount_name": mountName,
    "timestamp": timestamp
  };

  // Only add properties if they have values
  if (externallabelName) {
    deviceGeneralObj["external_label"] = externallabelName;
  }

  if (deviceModelName) {
    deviceGeneralObj["device_model_name"] = deviceModelName;
  }

  if (systemName) {
    deviceGeneralObj["system_name"] = systemName;
  }

  result.push(deviceGeneralObj);
  return result;
}

// From NEP 1.2.0
function extractLtpEquipmentData(ccOfMountname, mountName, timestamp) {
  const result = [];

  // Check if ccOfMountname has the required properties
  if (ccOfMountname &&
    ccOfMountname.hasOwnProperty(CORE_MODEL_CC) &&
    Array.isArray(ccOfMountname[CORE_MODEL_CC]) &&
    ccOfMountname[CORE_MODEL_CC].length > 0) {

    const ltpEquipmentArray = ccOfMountname[CORE_MODEL_CC][0] &&
      ccOfMountname[CORE_MODEL_CC][0].hasOwnProperty("logical-termination-point");
      //  &&
      // Array.isArray(ccOfMountname[CORE_MODEL_CC][0].) ?
      // ccOfMountname[CORE_MODEL_CC][0].equipment : [];

    for (const ltpEqp of ltpEquipmentArray) {
      const uuid = ltpEqp["UUID"];
      const connector = ltpEqp["connector"];
      const equipment = ltpEqp["equipment"];
    

      // Create object with only properties that exist
      const ltpEquipmentObj = {
        "mount_name": mountName,
        "timestamp": timestamp,
        "uuid": ltpEqp["UUID"],
        "connector": ltpEqp["connector"],
        "equipment": ltpEqp["equipment"]
      };

      result.push(ltpEquipmentObj);
    }
  }

  return result;
}
// --------------------

// Trim interface status
function extractInterfaceStatus(interfaceStatus) {
  let status = "";
  if (interfaceStatus.endsWith(INTERFACE_STATUS.UP)) {
    status = "UP";
  } else if (interfaceStatus.endsWith(INTERFACE_STATUS.DOWN)) {
    status = "DOWN";
  } else if (interfaceStatus.endsWith(INTERFACE_STATUS.TESTING)) {
    status = "TESTING";
  } else if (interfaceStatus.endsWith(INTERFACE_STATUS.UNKNOWN)) {
    status = "UNKNOWN";
  } else if (interfaceStatus.endsWith(INTERFACE_STATUS.DORMANT)) {
    status = "DORMANT";
  } else if (interfaceStatus.endsWith(INTERFACE_STATUS.NOT_PRESENT)) {
    status = "NOT_PRESENT";
  } else if (interfaceStatus.endsWith(INTERFACE_STATUS.NOT_YET_DEFINED)) {
    status = "NOT_YET_DEFINED";
  } else {
    status = "-----------"
  }

  return status;
}

function calculateCapaFactor(transmissionListObj) {
  // Check if all required properties exist
  if (!transmissionListObj == undefined ||
    !transmissionListObj["channel-bandwidth"] == undefined ||
    !transmissionListObj["symbol-rate-reduction-factor"] == undefined ||
    !transmissionListObj["modulation-scheme"] == undefined ||
    !transmissionListObj["code-rate"] == undefined) {
    logger.warn("Missing required parameters for capa-factor calculation");
    return null;
  }

  if (transmissionListObj["code-rate"] == -1 ||
    transmissionListObj["code-rate"] == "-1") {
      logger.warn("Code Rate is -1, drop the entry");
      return null;
  }

  // Extract values from transmissionList
  const channelBandwidth = parseFloat(transmissionListObj["channel-bandwidth"]);
  const symbolRateReductionFactor = parseFloat(transmissionListObj["symbol-rate-reduction-factor"]);
  const modulationScheme = parseFloat(transmissionListObj["modulation-scheme"]);
  const codeRate = parseFloat(transmissionListObj["code-rate"]);

  // Calculate log2 of modulation scheme (number of states)
  const log2ModulationScheme = Math.log2(modulationScheme);

  // Constant factor (1/1.15 kbps)
  const constantFactor = 1 / 1.15;

  // Calculate capa-factor in mbps
  const capaFactor = ((channelBandwidth / symbolRateReductionFactor) *
    log2ModulationScheme *
    codeRate *
    constantFactor) / 1000;

  // Add the calculated capa-factor to traMis
  return capaFactor;
}

'use strict';

const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');

const IndividualServiceUtility = require('../service/individualServices/IndividualServicesUtility.js');
const dbHandler = require('./db/dbHandler.js');

const logger = require('./LoggingService.js').getLogger();

let currentTime, dataRetentionTime, dataRetention, thresholdTime, thresholdTimeinDate;

module.exports.addNewDataInNEPdeviceList = async function (mountNameList) {
  const forwardingName = "PromptForRegisteringCausesRegistrationRequest";
  const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  let prefix = forwardingConstruct.uuid.split('op')[0];
  dataRetention = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-007");
  currentTime = Date.now();
  dataRetentionTime = dataRetention * 24 * 60 * 60 * 1000;
  thresholdTime = currentTime - dataRetentionTime;
  thresholdTimeinDate = new Date(thresholdTime);

  // Step 1: Update timestamps for received mount names
  mountNameList.forEach(mountName => {
    mountMap.set(mountName, currentTime);
  });
  // Step 2: Remove entries older than dataRetention time
  // let offlinemountsToDeleteFromDB=[];
  for (const [mountName, timestamp] of mountMap.entries()) {
    if (currentTime - timestamp > dataRetentionTime) {
      // Store for offline mountNames
      //  offlinemountsToDeleteFromDB.push(mountName);
      mountMap.delete(mountName);
    }
  }

  await module.exports.deleteFromDb(thresholdTimeinDate);
};

module.exports.deleteFromDb = async function(retentionTs) {
  // Create a timefilter object
  let dateFilter = {
    timeStamp: retentionTs
  };
  logger.info(`Data Retention, delete entries older than ${retentionTs}`);
  let res = await dbHandler.removeAllReferences(dateFilter);
  logger.info(`Entries deleted in the DB: ${res}`);
};

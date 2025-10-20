'use strict';

const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');

const IndividualServiceUtility = require('../service/individualServices/IndividualServicesUtility.js');
const dbHandler = require('./db/dbHandler.js');

const logger = require('./LoggingService.js').getLogger();

let dataRetention = -1;
let dataRetentionTime = -1;

module.exports.addNewDataInNEPdeviceList = async function (mountNameList) {
  if (dataRetention < 0) {
    const forwardingName = "PromptForRegisteringCausesRegistrationRequest";
    const forwardingConstruct = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
    const prefix = forwardingConstruct.uuid.split('op')[0];
    dataRetention = await IndividualServiceUtility.extractProfileConfiguration(prefix + "integer-p-007");
    dataRetentionTime = dataRetention * 24 * 60 * 60 * 1000; // Transform data retention into milliseconds
  }

  let thresholdTimeinDate = new Date(Date.now() - dataRetentionTime);
  await deleteFromDb(thresholdTimeinDate);
};

async function deleteFromDb(retentionTs) {
  // Create a timefilter object
  let dateFilter = {
    timeStamp: retentionTs
  };

  logger.info(`Data Retention, delete entries older than ${retentionTs}`);
  let res = await dbHandler.removeAllReferences(dateFilter);
  logger.info(res, "Entries deleted in the DB");
};

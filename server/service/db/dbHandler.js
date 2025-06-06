'use strict';
// const { Sequelize, Model, DataTypes } = require('sequelize');
const { Sequelize, Op } = require('sequelize');

const logger = require('../LoggingService.js').getLogger();

const devicesInfo = require('./devicesGeneralInfoClass');
const equipmentInfo = require('./equipmentClass.js');
const airIf = require('./airIfClass');
const airTransMode = require('./airTransModeClass');
const ethContIf = require('./ethContClass');
const wireIf = require('./wireIfClass');

// Default name of NEP DB
const NEP_DB = "nep_db"

const SEPARATOR = ";"
const EOL = "\n";

let devices_general_info;
let equipment_general_info;
let air_interface_general_info;
let air_interface_transmission_mode;
let ethernet_container_general_info;
let wire_interface_general_info;


/*
 * Init function
 * config contains all the info to initialize the DB
 * {
 *  db_name: name of DB to use
 *  user: username to access to DB system
 *  password: password to access to DB system
 *  host: ip address where db server is listening
 *  port: port number where db server is listening
 *  dialect: | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' |
 * }
 */
exports.initDB = async function(config) {

  try {
    // Extract DB name, if doesn't exist use default
    let db_name = config.db_name;
    if (config.db_name == "" || config.db_name == undefined) {
      logger.warn("DB name is not defined, so using default: " + NEP_DB);
      db_name = config.db_name;
    }

    let sequelize;
    // Init sequelize with DB params
    logger.info("Init DB with:\nUsername: " + config.user + "\nDB Name: " + config.db_name + 
      "\nHost: " + config.host + "\nPort: " + config.port + "\nDialect: " + config.dialect);
    if (config.dialect == 'sqlite') {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: '', //':memory:', // or ''
        pool: { max: 1, idle: Infinity, maxUses: Infinity },
        logging: msg => logger.debug(msg)
      });
    } else {
      sequelize = new Sequelize(db_name, config.user, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect, /* | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
        logging: msg => logger.debug(msg)
      });
    }

    // Try to connect to the DB
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');

    // IF DB doesn't exist I have to create a new one
    // try {
    //   logger.info("Using DB: " + db_name);
    //   let res = await sequelize.query("USE " + db_name + ";");
    //   logger.info("DB " + db_name + " exists");
    // } catch (db_error) {
    //   logger.warn("DB " + db_name + " doesn't exists, try to create it");
    //   let res = await sequelize.query("CREATE DATABASE " + db_name + ";");
    //   logger.info("DB: " + db_name + " created");
    //   res = await sequelize.query("USE " + db_name + ";");
    //   logger.info("using DB: " + db_name);
    // }

    // Init the tables
    devices_general_info = devicesInfo.init(sequelize);
    logger.debug("Device general info Table created");
    equipment_general_info = equipmentInfo.init(sequelize);
    logger.debug("Equipment general info Table created");
    air_interface_general_info = airIf.init(sequelize);
    logger.debug("Air Interface info Table created");
    air_interface_transmission_mode = airTransMode.init(sequelize);
    logger.debug("Air Transmission mode Table created");
    ethernet_container_general_info = ethContIf.init(sequelize);
    logger.debug("Ethernet container general info Table created");
    wire_interface_general_info = wireIf.init(sequelize);
    logger.debug("Wire interface general info Table created");

    // Synchronize the DB
    await sequelize.sync({alter: true});
    logger.info("DB synchronized");

    return true;
  } catch (error) {
    logger.error(error, 'Unable to connect to the database:');
    return false;
  }
}

// Create/Update elements from DB =====================================================================

/*
 * Function to create/update Device information table
 * dataArray is an array with fields to be store in the DB:
 * {
 *    mount_name,
 *    timestamp,
 *    device_model_name,
 *    system_name
 * }
 */
exports.updateDeviceInfo = async function (dataArray) {
  let result = { added: 0, updated: 0 };

  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await devices_general_info.update({
        "timestamp": new Date(data.timestamp),
        "external-label": data.external_label,
        "device-model-name": data.device_model_name,
        "system-name": data.system_name,
      },{
        where: {
          "mount-name": data.mount_name,
        },
      });

      if (cc == 0) {
        cc = await devices_general_info.create({
          "mount-name": data.mount_name,
          "timestamp": new Date(data.timestamp),
          "external-label": data.external_label,
          "device-model-name": data.device_model_name,
          "system-name": data.system_name,
        });
        logger.info("Entry devices_general_info Created with PK: " + data.mount_name);
        result.added = result.added + 1;
      } else {
        logger.info("Entry devices_general_info Updated with PK: " + data.mount_name);
        result.updated = result.updated + 1;

      }

    } catch(error) {
      logger.error(error);
    }
  }

  return result;
}

/*
 * Function to create/update Equipment information table
 * dataArray is an array with fields to be store in the DB:
 * {
 *    mount_name,
 *    uuid,
 *    local_id,
 *    timestamp,
 *    version,
 *    description,
 *    model_identifier,
 *    part_type_identifier,
 *    type_name,
 *    manufacturer_name,
 *    manufacturer_identifier
 * }
 */
exports.updateEquipmentInfo = async function (dataArray) {
  let result = { added: 0, updated: 0 };

  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await equipment_general_info.update({
        "local-id": data.local_id,

        // Timestamp reference
        "timestamp": new Date(data.timestamp),

        "version": data.version,
        "description": data.description,
        "model-identifier": data.model_identifier,
        "part-type-identifier": data.part_type_identifier,
        "type-name": data.type_name,

        "manufacturer-name": data.manufacturer_name,
        "manufacturer-identifier": data.manufacturer_identifier
      },{
        where: {
          "mount-name": data.mount_name,
          "uuid": data.uuid,
        },
      });

      if (cc == 0) {
        cc = await equipment_general_info.create({
          "mount-name": data.mount_name,
          "uuid": data.uuid,
          "local-id": data.local_id,
  
          // Timestamp reference
          "timestamp": new Date(data.timestamp),

          "version": data.version,
          "description": data.description,
          "model-identifier": data.model_identifier,
          "part-type-identifier": data.part_type_identifier,
          "type-name": data.type_name,

          "manufacturer-name": data.manufacturer_name,
          "manufacturer-identifier": data.manufacturer_identifier
        });
        logger.info("Entry equipment_general_info Created with PK: " + data.mount_name);
        result.added = result.added + 1;
      } else {
        logger.info("Entry equipment_general_info Updated with PK: " + data.mount_name);
        result.updated = result.updated + 1;
      }

    } catch(error) {
        logger.error(error);
    }
  }
}

/*
 * Function to create/update Air interface information table
 * dataArray is an array with fields to be store in the DB:
 * {
 *    mount_name,
 *    uuid,
 *    local_id,
 *    timestamp,
 *    operational_state,
 *    administrative_state,
 *    original_ltp_name,
 *    external_label,
 *    transmission_mode_min,
 *    transmission_mode_max,
 *    xpic_is_on,
 *    power_is_on,
 *    transmitter_is_on,
 *    interface_status,
 *    type_of_equipment
 * }
 */
exports.updateAirInterface = async function(dataArray) {
  let result = { added: 0, updated: 0 };

  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await air_interface_general_info.update({
        "local-id": data.local_id,

        // Timestamp reference
        "timestamp": new Date(data.timestamp),

        "operational-state": data.operational_state,
        "administrative-state": data.administrative_state,
        "original-ltp-name": data.original_ltp_name,
        "external-label": data.external_label,
        "transmission-mode-min": data.transmission_mode_min,
        "transmission-mode-max": data.transmission_mode_max,
        "xpic-is-on": data.xpic_is_on,
        "power-is-on": data.power_is_on,
        "transmitter-is-on": data.transmitter_is_on,
        "interface-status": data.interface_status,
        "type-of-equipment": data.type_of_equipment
      },{
        where: {
          "mount-name": data.mount_name,
          "uuid": data.uuid,
        },
      });

      if (cc == 0) {
        cc = await air_interface_general_info.create({
          "mount-name": data.mount_name,
          "uuid": data.uuid,
          "local-id": data.local_id,
  
          // Timestamp reference
          "timestamp": new Date(data.timestamp),

          "operational-state": data.operational_state,
          "administrative-state": data.administrative_state,
          "original-ltp-name": data.original_ltp_name,
          "external-label": data.external_label,
          "transmission-mode-min": data.transmission_mode_min,
          "transmission-mode-max": data.transmission_mode_max,
          "xpic-is-on": data.xpic_is_on,
          "power-is-on": data.power_is_on,
          "transmitter-is-on": data.transmitter_is_on,
          "interface-status": data.interface_status,
          "type-of-equipment": data.type_of_equipment
        });
        logger.info("Entry air_interface_general_info Created with PK: " + data.mount_name);
        result.added = result.added + 1;
      } else {
        logger.info("Entry air_interface_general_info Updated with PK: " + data.mount_name);
        result.updated = result.updated + 1;
      }

    } catch(error) {
        logger.error(error);
    }
  }
}

/*
 * Function to create/update Air Transmission Mode table
 * dataArray is an array with fields to be store in the DB:
 * {
 *    mount_name,
 *    uuid,
 *    local_id,
 *    timestamp,
 *    transmission_mode_name,
 *    symbol_rate_reduction_factor,
 *    modulation_scheme_at_lct,
 *    modulation_scheme,
 *    code_rate,
 *    channel_bandwidth,
 *    xpic_is_avail,
 *    capa_factor
 * }
 */
exports.updateAirTransMode = async function(dataArray) {
  let result = { added: 0, updated: 0 };

  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await air_interface_transmission_mode.update({
        "local-id": data.local_id,
        "uuid": data.uuid,
        // Timestamp reference
        "timestamp": new Date(data.timestamp),

        "transmission-mode-name": data.transmission_mode_name,
        "symbol-rate-reduction-factor": data.symbol_rate_reduction_factor,
        "modulation-scheme-at-lct": data.modulation_scheme_at_lct,
        "modulation-scheme": data.modulation_scheme,
        "code-rate": data.code_rate,
        "channel-bandwidth": data.code_rate,
        "xpic-is-avail": data.xpic_is_avail,
        "capa-factor": data.capa_factor
      },{
        where: {
          "mount-name": data.mount_name,
          "uuid": data.uuid,
          "transmission-mode-name": data.transmission_mode_name
        },
      });

      if (cc == 0) {
        cc = await air_interface_transmission_mode.create({
          "mount-name": data.mount_name,
          "uuid": data.uuid,
          "local-id": data.local_id,
  
          // Timestamp reference
          "timestamp": new Date(data.timestamp),

          "transmission-mode-name": data.transmission_mode_name,
          "symbol-rate-reduction-factor": data.symbol_rate_reduction_factor,
          "modulation-scheme-at-lct": data.modulation_scheme_at_lct,
          "modulation-scheme": data.modulation_scheme,
          "code-rate": data.code_rate,
          "channel-bandwidth": data.code_rate,
          "xpic-is-avail": data.xpic_is_avail,
          "capa-factor": data.capa_factor
        });
        logger.info("Entry air_interface_transmission_mode Created with PK: " + data.mount_name);
        result.added = result.added + 1;
      } else {
        logger.info("Entry air_interface_transmission_mode Updated with PK: " + data.mount_name);
        result.updated = result.updated + 1;
      }

    } catch(error) {
        logger.error(error);
    }
  }  
}

/*
 * Function to create/update Ethernet Container information table
 * dataArray is an array with fields to be store in the DB:
 * {
 *    mount_name,
 *    uuid,
 *    local_id,
 *    timestamp,
 *    operational_state,
 *    administrative_state,
 *    original_ltp_name,
 *    interface_name,
 *    bundling_is_on,
 *    interface_status
 * }
 */
exports.updateEthernetContainer = async function (dataArray) {
  let result = { added: 0, updated: 0 };

  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await ethernet_container_general_info.update({
        "local-id": data.local_id,

        // Timestamp reference
        "timestamp": new Date(data.timestamp),

        "operational-state": data.operational_state,
        "administrative-state": data.administrative_state,
        "original-ltp-name": data.original_ltp_name,
        "interface-name": data.interface_name,
        "bundling-is-on": data.bundling_is_on,
        "interface-status": data.interface_status
      },{
        where: {
          "mount-name": data.mount_name,
          "uuid": data.uuid,
        },
      });

      if (cc == 0) {
        cc = await ethernet_container_general_info.create({
          "mount-name": data.mount_name,
          "uuid": data.uuid,
          "local-id": data.local_id,
  
          // Timestamp reference
          "timestamp": new Date(data.timestamp),

          "operational-state": data.operational_state,
          "administrative-state": data.administrative_state,
          "original-ltp-name": data.original_ltp_name,
          "interface-name": data.interface_name,
          "bundling-is-on": data.bundling_is_on,
          "interface-status": data.interface_status
        });
        logger.info("Entry ethernet_container_general_info Created with PK: " + data.mount_name);
        result.added = result.added + 1;
      } else {
        logger.info("Entry ethernet_container_general_info Updated with PK: " + data.mount_name);
        result.updated = result.updated + 1;
      }

    } catch(error) {
        logger.error(error);
    }
  }
}

/*
 * Function to create/update Wire interface information table
 * dataArray is an array with fields to be store in the DB:
 * {
 *    mount_name,
 *    uuid,
 *    local_id,
 *    timestamp,
 *    operational_state,
 *    administrative_state,
 *    original_ltp_name,
 *    interface_name,
 *    fixed_pmd_kind,
 *    interface_status,
 *    pmd_kind_cur,
 *    pmd_name,
 *    duplex,
 *    speed
 * }
 */
exports.updateWireInterface = async function (dataArray) {
  let result = { added: 0, updated: 0 };

  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await wire_interface_general_info.update({
        "local-id": data.local_id,

        // Timestamp reference
        "timestamp": new Date(data.timestamp),

        "operational-state": data.operational_state,
        "administrative-state": data.administrative_state,
        "original-ltp-name": data.original_ltp_name,
        "interface-name": data.interface_name,
        "fixed-pmd-kind": data.fixed_pmd_kind,
        "interface-status": data.interface_status,
        "pmd-kind-cur": data.pmd_kind_cur,
        "pmd-name": data.pmd_name,
        "duplex": data.duplex,
        "speed": data.speed
      },{
        where: {
          "mount-name": data.mount_name,
          "uuid": data.uuid,
        },
      });

      if (cc == 0) {
        cc = await wire_interface_general_info.create({
          "mount-name": data.mount_name,
          "uuid": data.uuid,
          "local-id": data.local_id,
  
          // Timestamp reference
          "timestamp": new Date(data.timestamp),

          "operational-state": data.operational_state,
          "administrative-state": data.administrative_state,
          "original-ltp-name": data.original_ltp_name,
          "interface-name": data.interface_name,
          "fixed-pmd-kind": data.fixed_pmd_kind,
          "interface-status": data.interface_status,
          "pmd-kind-cur": data.pmd_kind_cur,
          "pmd-name": data.pmd_name,
          "duplex": data.duplex,
          "speed": data.speed
        });
        logger.info("Entry wire_interface_general_info Created with PK: " + data.mount_name);
        result.added = result.added + 1;
      } else {
        logger.info("Entry wire_interface_general_info Updated with PK: " + data.mount_name);
        result.updated = result.updated + 1;
      }

    } catch(error) {
        logger.error(error);
    }
  }
}


// Read elements from DB =====================================================================

/*
 * This function will retrieve the list of devices
 * 
 * isCSV: force the routine to extract raw data ready for CSV
 */
exports.readListOfDevices = async function(isCSV=false) {
  let resultFetched = await devices_general_info.findAll({
    attributes: ['mount-name', 'timestamp'],
    raw : isCSV
  });

  if (isCSV) {
    if (resultFetched.length == 0) {
      resultFetched = "";
    } else {
      resultFetched = convertToCSV(resultFetched);
    }
  }

  return resultFetched;
}

/**
 * Read from Device Information table
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be greater than
 * }
 * isCSV: true/false with true return RAW data
 */
exports.readDeviceInfo = async function(filters, isCSV=false) {
  const attr = ['mount-name', 'timestamp', 'external-label', 'device-model-name', 'system-name' ];

  let resultFetched = await readGeneralData(devices_general_info, attr, filters, isCSV);

  return resultFetched;
}

/**
 * Read from Equipment Information table
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be greater than
 * }
 * isCSV: true/false with true return RAW data
 */
exports.readEquipmentInfo = async function(filters, isCSV=false) {
  // DB fields to read
  const attr = [
    'mount-name',
    'uuid',
    'local-id',
    'timestamp', 
    'version',
    'description',
    'model-identifier',
    'part-type-identifier',
    'type-name',
    'manufacturer-name',
    'manufacturer-identifier'
  ];

  let resultFetched = await readGeneralData(equipment_general_info, attr, filters, isCSV);

  return resultFetched;
}

/**
 * Read from Air Interface Information table
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be greater than
 * }
 * isCSV: true/false with true return RAW data
 */
exports.readAirInterfaceInfo = async function(filters, isCSV=false) {
  // DB fields to read
  const attr = [
    'mount-name',
    'uuid',
    'local-id',
    'timestamp', 
    'operational-state',
    'administrative-state',
    'original-ltp-name',
    'external-label',
    'transmission-mode-min',
    'transmission-mode-max',
    'xpic-is-on',
    'power-is-on',
    'transmitter-is-on',
    'interface-status',
    'type-of-equipment',
  ];

  let resultFetched = await readGeneralData(air_interface_general_info, attr, filters, isCSV);

  return resultFetched;
}

/**
 * Read from Air Interface Transmission Mode table
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be greater than
 * }
 * isCSV: true/false with true return RAW data
 */
exports.readAirTransMode = async function(filters, isCSV=false) {
  // DB fields to read
  const attr = [
    'mount-name',
    'uuid',
    'local-id',
    'timestamp',
    'transmission-mode-name',
    'symbol-rate-reduction-factor',
    'modulation-scheme-at-lct',
    'modulation-scheme',
    'code-rate',
    'channel-bandwidth',
    'xpic-is-avail',
    'capa-factor'
  ];

  let resultFetched = await readGeneralData(air_interface_transmission_mode, attr, filters, isCSV);

  return resultFetched;
}

/**
 * Read from Ethernet Container Information table
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be greater than
 * }
 * isCSV: true/false with true return RAW data
 */
exports.readEthernetContInfo = async function(filters, isCSV=false) {
  // DB fields to read
  const attr = [
    'mount-name',
    'uuid',
    'local-id',
    'timestamp', 
    'operational-state',
    'administrative-state',
    'original-ltp-name',
    'interface-name',
    'bundling-is-on',
    'interface-status'
  ];

  // Retrieve data
  let resultFetched = await readGeneralData(ethernet_container_general_info, attr, filters, isCSV);

  return resultFetched;
}

/*
 * Read from Wire Interface Information table
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be greater than
 * }
 * isCSV: true/false with true return RAW data
 */
exports.readWireInterfaceInfo = async function(filters, isCSV=false) {
  // Fields to read from DB
  const attr = [
    'mount-name',
    'uuid',
    'local-id',
    'timestamp',
    'operational-state',
    'administrative-state',
    'original-ltp-name',
    'interface-name',
    'fixed-pmd-kind',
    'interface-status',
    'pmd-kind-cur',
    'pmd-name',
    'duplex',
    'speed'
  ];

  // Retrieve data
  let resultFetched = await readGeneralData(wire_interface_general_info, attr, filters, isCSV);

  return resultFetched;
}


/*
 * Read data for Interface info per Device
 * 
 * This function will union 3 tables:
 * - air_interface_general_info
 * - ethernet_container_general_info
 * - wire_interface_general_info
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be greater than
 * }
 * isCSV: true/false with true return RAW data
 */
exports.readInterfaceInfoPerDevice = async function(filters, isCSV=false) {
  const whereCondition = getWhereConditionForRead(filters);
  // DB fields to read
  const attr = [
    'mount-name',
    'uuid',
    'local-id',
    'timestamp',
    'original-ltp-name',
    'interface-status',
    'interface-type' // fake entry
  ];

  // Retrieve data
  // TODO @latta-siae this has to be reworked. It will not works properly with empty data
  let resultFetched = await readGeneralData(air_interface_general_info, attr, whereCondition, true);
  let stringReplace = attr.toString();
  stringReplace = stringReplace.replaceAll(",", ";");

  let resultData = await readGeneralData(ethernet_container_general_info, attr, whereCondition, true);
  resultFetched += resultData.replace(stringReplace, "");

  resultData = await readGeneralData(wire_interface_general_info, attr, whereCondition, true);
  resultFetched += resultData.replace(stringReplace, "");

  return resultFetched;
}

/*
 * This is internal general routine to read data from DB model
 */
async function readGeneralData(tableModel, fields, filters, isCSV=false) {
  const whereCondition = getWhereConditionForRead(filters);

  let resultFetched = await tableModel.findAll({
    attributes: fields,
    where: whereCondition,
    raw : isCSV
  });

  if (isCSV) { // Convert into CSV format
    if (resultFetched.length == 0) {
      logger.warn("Query result empty");
      resultFetched = fields.toString().replaceAll(",", ";") + "\n";
    } else {
      resultFetched = convertToCSV(resultFetched);
    }
  }

  return resultFetched;
}


// Remove elements from DB =====================================================================

/*
 * Delete entries from Device information table
 * 
 * filters: {
 *   mountNames: [list of mountname],
 *   timeStamp: timeStamp to filter, time that must be lower than
 * }
 */
exports.removeDeviceInfo = async function(filters) {
  // Retrieve where condition based on filters
  const whereCondition = getWhereConditionForDelete(filters);
  let resultFetched = await devices_general_info.destroy({ where: whereCondition});

  return resultFetched;
}

/*
 * Delete entries from Equipment information table
 * 
 * filters: {
 *   mountNames: [list of mountname],
 *   timeStamp: timeStamp to filter, time that must be lower than
 * }
 */
exports.removeEquipmentInfo = async function(filters) {
  // Retrieve where condition based on filters
  const whereCondition = getWhereConditionForDelete(filters);
  let resultFetched = await equipment_general_info.destroy({ where: whereCondition});

  return resultFetched;
}

/*
 * Delete entries from Air interface information table
 * 
 * filters: {
 *   mountNames: [list of mountname],
 *   timeStamp: timeStamp to filter, time that must be lower than
 * }
 */
exports.removeAirInterface = async function(filters) {
  // Retrieve where condition based on filters
  const whereCondition = getWhereConditionForDelete(filters);
  let resultFetched = await air_interface_general_info.destroy({ where: whereCondition});

  return resultFetched;
}

/*
 * Delete entries from Air Transmission mode table
 * 
 * filters: {
 *   mountNames: [list of mountname],
 *   timeStamp: timeStamp to filter, time that must be lower than
 * }
 */
exports.removeAirTransMode = async function(filters) {
  // Retrieve where condition based on filters
  const whereCondition = getWhereConditionForDelete(filters);
  let resultFetched = await air_interface_transmission_mode.destroy({ where: whereCondition});

  return resultFetched;
}

/*
 * Delete entries from Ethernet container table
 * 
 * filters: {
 *   mountNames: [list of mountname],
 *   timeStamp: timeStamp to filter, time that must be lower than
 * }
 */
exports.removeEthernetContInfo = async function(filters) {
  // Retrieve where condition based on filters
  const whereCondition = getWhereConditionForDelete(filters);
  let resultFetched = await ethernet_container_general_info.destroy({ where: whereCondition});

  return resultFetched;
}

/*
 * Delete entries from Wire interface information table
 * 
 * filters: {
 *    mountNames: [list of mountname],
 *    timeStamp: timeStamp to filter, time that must be lower than
 * }
 */
exports.removeWireInterfaceInfo = async function(filters) {
  // Retrieve where condition based on filters
  const whereCondition = getWhereConditionForDelete(filters);
  let resultFetched = await wire_interface_general_info.destroy({ where: whereCondition});

  return resultFetched;
}

/*
 * Delete all references in the DB Tables if match the filters provide
 * filters: {
 *   mountNames: [list of mountname],
 *   timeStamp: timeStamp to filter, time that must be lower than
 * }
 */
exports.removeAllReferences = async function(filters) {
  // let resultFetched = 0; // Define return Data
  let resultFetched = {
    'device_general_info': 0,
    'equipment_general_info': 0,
    'air_interface_general_info': 0,
    'air_interface_transmission_mode': 0,
    'ethernet_container_general_info': 0,
    'wire_interface_general_info': 0,
  }
  let whereCondition = getWhereConditionForDelete(filters);

  resultFetched.device_general_info = await devices_general_info.destroy({ where: whereCondition});
  resultFetched.equipment_general_info = await equipment_general_info.destroy({ where: whereCondition});
  resultFetched.air_interface_general_info = await air_interface_general_info.destroy({ where: whereCondition});
  resultFetched.air_interface_transmission_mode = await air_interface_transmission_mode.destroy({ where: whereCondition});
  resultFetched.ethernet_container_general_info = await ethernet_container_general_info.destroy({ where: whereCondition});
  resultFetched.wire_interface_general_info = await wire_interface_general_info.destroy({ where: whereCondition});

  return resultFetched;
}

/*
 * Internal routine to extract WHERE condition in READ operation
 */
function getWhereConditionForRead(filters) {
  let { mountNames, timeStamp } = filters;
  let whereCondition = {}
  if (timeStamp == undefined || timeStamp == null || timeStamp == "") {
    timeStamp = new Date(0); // from epoch
  }

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "")) {
    whereCondition = {
      timestamp: { [Op.gte]: timeStamp }
    }
  } else {
    whereCondition = {
      timestamp: { [Op.gte]: timeStamp },
      "mount-name": { [Op.in]: mountNames }
    }
  }

  return whereCondition;
}

/*
 * Internal routine to extract WHERE condition in DELETE operation
 */
function getWhereConditionForDelete(filters) {
  let { mountNames, timeStamp } = filters;
  let whereCondition = {}
  if (timeStamp == undefined || timeStamp == null || timeStamp == '') {
    timeStamp = new Date(Date.now()); // NOW
  }

  // if mountname is not valid
  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "")) {
    whereCondition = {
      timestamp: { [Op.lte]: timeStamp }
    }
  } else {
    whereCondition = {
      timestamp: { [Op.lte]: timeStamp },
      "mount-name": { [Op.in]: mountNames }
    }
  }

  return whereCondition;
}

/*
 * Internal routine to convert the result into CSV format
 */
function convertToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr);

  let retValue = array.map(it => {
    return Object.values(it).toString();
  }).join(EOL);
  
  retValue = retValue.replaceAll(',', SEPARATOR);
  return retValue;
}

/*
 * Internal routine to convert the result into CSV format
 */
function convertToCSVEnh(arr, onlyHeader=true) {
    let csv = '';

    if (onlyHeader) {
      // Extract headers
      logger.debug("Extract only Headers");
      const headers = Object.keys(arr[0]);
      csv += headers.join(SEPARATOR) + EOL;
    } else {
      // Extract values
      logger.debug("Extract only Data values");
      arr.forEach(obj => {
          const values = headers.map(header => obj[header]);
          csv += values.join(SEPARATOR) + EOL;
      });
    }

    return csv;
}

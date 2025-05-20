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
  const db_name = (config.db_name == "" || config.db_name == undefined) ?
      NEP_DB : config.db_name;

  try {
    // Init sequelize with DB params
    logger.info("Init DB with:\nUsername: " + config.user + "\nDB Name: " + config.db_name + "\nHost: " + config.host + "\nPort: " + config.port + "\nDialect: " + config.dialect);
    // let sequelize = new Sequelize(config.db_name, config.user, config.password, {
    //     host: config.host,
    //     port: config.port,
    //     dialect: config.dialect
    //     /* | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
    // });

    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: '', //':memory:', // or ''
      pool: { max: 1, idle: Infinity, maxUses: Infinity },
    });

    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');

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
    equipment_general_info = equipmentInfo.init(sequelize);
    air_interface_general_info = airIf.init(sequelize);
    air_interface_transmission_mode = airTransMode.init(sequelize);
    ethernet_container_general_info = ethContIf.init(sequelize);
    wire_interface_general_info = wireIf.init(sequelize);

    // Synchronize the DB
    await sequelize.sync({alter: true});
    logger.info("DB synchronized");

    return true;
  } catch (error) {
    logger.error(error, 'Unable to connect to the database:');
    return false;
  }

}

/*
 * Function to update Device information table
 * dataArray is an array with fields to be store in the DB:
 * {
 *    mount_name,
 *    timestamp,
 *    device_model_name,
 *    system_name
 * }
 */
exports.updateDeviceInfo = async function (dataArray) {
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await devices_general_info.update({
        timestamp: new Date(data.timestamp),
        external_label: data.external_label,
        device_model_name: data.device_model_name,
        system_name: data.system_name,
      },{
        where: {
          mount_name: data.mount_name,
        },
      });

      if (cc == 0) {
        cc = await devices_general_info.create({
          mount_name: data.mount_name,
          timestamp: new Date(data.timestamp),
          external_label: data.external_label,
          device_model_name: data.device_model_name,
          system_name: data.system_name,
        });
        logger.info("Entry devices_general_info Created with PK: " + data.mount_name);
      } else {
        logger.info("Entry devices_general_info Updated with PK: " + data.mount_name);
      }

    } catch(error) {
      logger.error(error);
    }
  }
}

/*
 * Function to update Equipment information table
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
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await equipment_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: new Date(data.timestamp),

        version: data.version,
        description: data.description,
        model_identifier: data.model_identifier,
        part_type_identifier: data.part_type_identifier,
        type_name: data.type_name,

        manufacturer_name: data.manufacturer_name,
        manufacturer_identifier: data.manufacturer_identifier
      },{
        where: {
          mount_name: data.mount_name,
          uuid: data.uuid,
        },
      });

      if (cc == 0) {
        cc = await equipment_general_info.create({
          mount_name: data.mount_name,
          uuid: data.uuid,
          local_id: data.local_id,
  
          // Timestamp reference
          timestamp: new Date(data.timestamp),
  
          version: data.version,
          description: data.description,
          model_identifier: data.model_identifier,
          part_type_identifier: data.part_type_identifier,
          type_name: data.type_name,
  
          manufacturer_name: data.manufacturer_name,
          manufacturer_identifier: data.manufacturer_identifier
        });
        logger.info("Entry equipment_general_info Created with PK: " + data.mount_name);
      } else {
        logger.info("Entry equipment_general_info Updated with PK: " + data.mount_name);
      }

    } catch(error) {
        logger.error(error);
    }
  }
}

/*
 * Function to update Air interface information table
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
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await air_interface_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: new Date(data.timestamp),

        operational_state: data.operational_state,
        administrative_state: data.administrative_state,
        original_ltp_name: data.original_ltp_name,
        external_label: data.external_label,
        transmission_mode_min: data.transmission_mode_min,
        transmission_mode_max: data.transmission_mode_max,
        xpic_is_on: data.xpic_is_on,
        power_is_on: data.power_is_on,
        transmitter_is_on: data.transmitter_is_on,
        interface_status: data.interface_status,
        type_of_equipment: data.type_of_equipment
      },{
        where: {
          mount_name: data.mount_name,
          uuid: data.uuid,
        },
      });

      if (cc == 0) {
        cc = await air_interface_general_info.create({
          mount_name: data.mount_name,
          uuid: data.uuid,
          local_id: data.local_id,
  
          // Timestamp reference
          timestamp: new Date(data.timestamp),

          operational_state: data.operational_state,
          administrative_state: data.administrative_state,
          original_ltp_name: data.original_ltp_name,
          external_label: data.external_label,
          transmission_mode_min: data.transmission_mode_min,
          transmission_mode_max: data.transmission_mode_max,
          xpic_is_on: data.xpic_is_on,
          power_is_on: data.power_is_on,
          transmitter_is_on: data.transmitter_is_on,
          interface_status: data.interface_status,
          type_of_equipment: data.type_of_equipment
        });
        logger.info("Entry air_interface_general_info Created with PK: " + data.mount_name);
      } else {
        logger.info("Entry air_interface_general_info Updated with PK: " + data.mount_name);
      }

    } catch(error) {
        logger.error(error);
    }
  }
}

/*
 * Function to update Air Transmission Mode table
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
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await air_interface_transmission_mode.update({
        local_id: data.local_id,
        uuid: data.uuid,
        // Timestamp reference
        timestamp: new Date(data.timestamp),

        transmission_mode_name: data.transmission_mode_name,
        symbol_rate_reduction_factor: data.symbol_rate_reduction_factor,
        modulation_scheme_at_lct: data.modulation_scheme_at_lct,
        modulation_scheme: data.modulation_scheme,
        code_rate: data.code_rate,
        channel_bandwidth: data.code_rate,
        xpic_is_avail: data.xpic_is_avail,
        capa_factor: data.capa_factor
      },{
        where: {
          mount_name: data.mount_name,
          uuid: data.uuid,
          transmission_mode_name: data.transmission_mode_name
        },
      });

      if (cc == 0) {
        cc = await air_interface_transmission_mode.create({
          mount_name: data.mount_name,
          uuid: data.uuid,
          local_id: data.local_id,
  
          // Timestamp reference
          timestamp: new Date(data.timestamp),

          transmission_mode_name: data.transmission_mode_name,
          symbol_rate_reduction_factor: data.symbol_rate_reduction_factor,
          modulation_scheme_at_lct: data.modulation_scheme_at_lct,
          modulation_scheme: data.modulation_scheme,
          code_rate: data.code_rate,
          channel_bandwidth: data.code_rate,
          xpic_is_avail: data.xpic_is_avail,
          capa_factor: data.capa_factor
        });
        logger.info("Entry air_interface_transmission_mode Created with PK: " + data.mount_name);
      } else {
        logger.info("Entry air_interface_transmission_mode Updated with PK: " + data.mount_name);
      }

    } catch(error) {
        logger.error(error);
    }
  }  
}

/*
 * Function to update Air Transmission Mode table
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
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await ethernet_container_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: new Date(data.timestamp),

        operational_state: data.operational_state,
        administrative_state: data.administrative_state,
        original_ltp_name: data.original_ltp_name,
        interface_name: data.interface_name,
        bundling_is_on: data.bundling_is_on,
        interface_status: data.interface_status
      },{
        where: {
          mount_name: data.mount_name,
          uuid: data.uuid,
        },
      });

      if (cc == 0) {
        cc = await ethernet_container_general_info.create({
          mount_name: data.mount_name,
          uuid: data.uuid,
          local_id: data.local_id,
  
          // Timestamp reference
          timestamp: new Date(data.timestamp),

          operational_state: data.operational_state,
          administrative_state: data.administrative_state,
          original_ltp_name: data.original_ltp_name,
          interface_name: data.interface_name,
          bundling_is_on: data.bundling_is_on,
          interface_status: data.interface_status
        });
        logger.info("Entry ethernet_container_general_info Created with PK: " + data.mount_name);
      } else {
        logger.info("Entry ethernet_container_general_info Updated with PK: " + data.mount_name);
      }

    } catch(error) {
        logger.error(error);
    }
  }
}

/*
 * Function to update Air Transmission Mode table
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
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await wire_interface_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: new Date(data.timestamp),

        operational_state: data.operational_state,
        administrative_state: data.administrative_state,
        original_ltp_name: data.original_ltp_name,
        interface_name: data.interface_name,
        fixed_pmd_kind: data.fixed_pmd_kind,
        interface_status: data.interface_status,
        pmd_kind_cur: data.pmd_kind_cur,
        pmd_name: data.pmd_name,
        duplex: data.duplex,
        speed: data.speed
      },{
        where: {
          mount_name: data.mount_name,
          uuid: data.uuid,
        },
      });

      if (cc == 0) {
        cc = await wire_interface_general_info.create({
          mount_name: data.mount_name,
          uuid: data.uuid,
          local_id: data.local_id,
  
          // Timestamp reference
          timestamp: new Date(data.timestamp),

          operational_state: data.operational_state,
          administrative_state: data.administrative_state,
          original_ltp_name: data.original_ltp_name,
          interface_name: data.interface_name,
          fixed_pmd_kind: data.fixed_pmd_kind,
          interface_status: data.interface_status,
          pmd_kind_cur: data.pmd_kind_cur,
          pmd_name: data.pmd_name,
          duplex: data.duplex,
          speed: data.speed
        });
        logger.info("Entry wire_interface_general_info Created with PK: " + data.mount_name);
      } else {
        logger.info("Entry wire_interface_general_info Updated with PK: " + data.mount_name);
      }

    } catch(error) {
        logger.error(error);
    }
  }
}


exports.readListOfDevices = async function(isCSV=false) {
  let resultFetched = await devices_general_info.findAll({
    attributes: ['mount_name', 'timestamp'],
    raw : isCSV
  });

  if (isCSV) {
    if (resultFetched[0].length == 0) {
      return "";
    }
    resultFetched = convertToCSV(resultFetched);
  }

  return resultFetched;
}

exports.readDeviceInfo = async function(filters, isCSV=false) {
  // Read the parameters
  let { mountNames, timeStamp } = filters;
  let resultFetched; // Define return Data

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "")) {
    resultFetched = await devices_general_info.findAll({
      attributes: [
        'mount_name',
        'timestamp',
        'external_label',
        'device_model_name',
        'system_name'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp }
      },
      raw : isCSV
    });
  } else { // If mountNames list is not empty
    resultFetched = await devices_general_info.findAll({
      attributes: [
        'mount_name',
        'timestamp',
        'external_label',
        'device_model_name',
        'system_name'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp },
        mount_name: { [Op.in]: mountNames }
      },
      raw : isCSV
    });
  }

  if (isCSV) {
    if (resultFetched[0].length == 0) {
      return "";
    }
    resultFetched = convertToCSV(resultFetched);
  }

  return resultFetched;
}

exports.readEquipmentInfo = async function(filters, isCSV=false) {
  // Read the parameters
  let { mountNames, timeStamp } = filters;
  let resultFetched; // Define return Data

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "")) {
    resultFetched = await equipment_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp', 
        'version',
        'description',
        'model_identifier',
        'part_type_identifier',
        'type_name',
        'manufacturer_name',
        'manufacturer_identifier'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp }
      },
      raw : isCSV
    });
  } else {
    resultFetched = await equipment_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp', 
        'version',
        'description',
        'model_identifier',
        'part_type_identifier',
        'type_name',
        'manufacturer_name',
        'manufacturer_identifier'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp },
        mount_name: { [Op.in]: mountNames }
      },
      raw : isCSV
    });
  }

  if (isCSV) {
    if (resultFetched[0].length == 0) {
      return "";
    }
    resultFetched = convertToCSV(resultFetched);
  }

  return resultFetched;
}

exports.readAirInterfaceInfo = async function(filters, isCSV=false) {
  // Read the parameters
  let { mountNames, timeStamp } = filters;
  let resultFetched; // Define return Data

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "")) {
    resultFetched = await air_interface_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp', 
        'operational_state',
        'administrative_state',
        'original_ltp_name',
        'external_label',
        'transmission_mode_min',
        'transmission_mode_max',
        'xpic_is_on',
        'power_is_on',
        'transmitter_is_on',
        'interface_status',
        'type_of_equipment',
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp }
      },
      raw : isCSV
    });
  } else {
    resultFetched = await air_interface_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp', 
        'operational_state',
        'administrative_state',
        'original_ltp_name',
        'external_label',
        'transmission_mode_min',
        'transmission_mode_max',
        'xpic_is_on',
        'power_is_on',
        'transmitter_is_on',
        'interface_status',
        'type_of_equipment',
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp },
        mount_name: { [Op.in]: mountNames }
      },
      raw : isCSV
    });
  }

  if (isCSV) {
    if (resultFetched[0].length == 0) {
      return "";
    }
    resultFetched = convertToCSV(resultFetched);
  }

  return resultFetched;
}

exports.readAirTransMode = async function(filters, isCSV=false) {
  // Read the parameters
  let { mountNames, timeStamp } = filters;
  let resultFetched; // Define return Data

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") ) {
    resultFetched = await air_interface_transmission_mode.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp',
        'transmission_mode_name',
        'symbol_rate_reduction_factor',
        'modulation_scheme_at_lct',
        'modulation_scheme',
        'code_rate',
        'channel_bandwidth',
        'xpic_is_avail',
        'capa_factor'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp }
      },
      raw : isCSV
    });
  } else {
    resultFetched = await air_interface_transmission_mode.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp',
        'transmission_mode_name',
        'symbol_rate_reduction_factor',
        'modulation_scheme_at_lct',
        'modulation_scheme',
        'code_rate',
        'channel_bandwidth',
        'xpic_is_avail',
        'capa_factor'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp },
        mount_name: { [Op.in]: mountNames }
      },
      raw : isCSV
    });
  }

  if (isCSV) {
    if (resultFetched[0].length == 0) {
      return "";
    }
    resultFetched = convertToCSV(resultFetched);
  }

  return resultFetched;
}

exports.readEthernetContInfo = async function(filters, isCSV=false) {
  // Read the parameters
  let { mountNames, timeStamp } = filters;
  let resultFetched; // Define return Data

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") ) {
    resultFetched = await ethernet_container_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp', 
        'operational_state',
        'administrative_state',
        'original_ltp_name',
        'interface_name',
        'bundling_is_on',
        'interface_status'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp }
      },
      raw : isCSV
    });
  } else {
    resultFetched = await ethernet_container_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp', 
        'operational_state',
        'administrative_state',
        'original_ltp_name',
        'interface_name',
        'bundling_is_on',
        'interface_status'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp },
        mount_name: { [Op.in]: mountNames }
      },
      raw : isCSV
    });
  }

  if (isCSV) {
    if (resultFetched[0].length == 0) {
      return "";
    }
    resultFetched = convertToCSV(resultFetched);
  }

  return resultFetched;
}

exports.readWireInterfaceInfo = async function(filters, isCSV=false) {
  // Read the parameters
  let { mountNames, timeStamp } = filters;
  let resultFetched; // Define return Data

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "")) {
    resultFetched = await wire_interface_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp',
        'operational_state',
        'administrative_state',
        'original_ltp_name',
        'interface_name',
        'fixed_pmd_kind',
        'interface_status',
        'pmd_kind_cur',
        'pmd_name',
        'duplex',
        'speed'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp }
      },
      raw : isCSV
    });
  } else {
    resultFetched = await wire_interface_general_info.findAll({
      attributes: [
        'mount_name',
        'uuid',
        'local_id',
        'timestamp',
        'operational_state',
        'administrative_state',
        'original_ltp_name',
        'interface_name',
        'fixed_pmd_kind',
        'interface_status',
        'pmd_kind_cur',
        'pmd_name',
        'duplex',
        'speed'
      ],
      where: {
        timestamp: { [Op.gte]: timeStamp },
        mount_name: { [Op.in]: mountNames }
      },
      raw : isCSV
    });
  }

  if (isCSV) {
    if (resultFetched[0].length == 0) {
      return "";
    }
    resultFetched = convertToCSV(resultFetched);
  }

  return resultFetched;
}

// Routine to convert the result into CSV format
function convertToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr)

  return array.map(it => {
    return Object.values(it).toString()
  }).join('\n')
}
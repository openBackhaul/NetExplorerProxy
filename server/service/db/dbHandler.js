'use strict';
// const { Sequelize, Model, DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');

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


exports.initDB = async function(config) {
  const db_name = (config.db_name == "" || config.db_name == undefined) ?
      NEP_DB : config.db_name;

  try {
    // Init sequelize with DB params
    logger.info("Init DB with:\nUsername: " + config.user + "\nDB Name: " + config.db_name + "\nHost: " + config.host + "\nPort: " + config.port + "\nDialect: " + config.dialect);
    let sequelize = new Sequelize(config.db_name, config.user, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect
        /* | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
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

exports.updateDeviceInfo = async function (dataArray) {
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await devices_general_info.update({
        timestamp: data.timestamp,
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
          timestamp: data.timestamp,
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

exports.updateEquipmentInfo = async function (dataArray) {
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await equipment_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: data.timestamp,

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
          timestamp: data.timestamp,
  
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

exports.updateAirInterface = async function(dataArray) {
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await air_interface_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: data.timestamp,

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
          timestamp: data.timestamp,

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

exports.updateAirTransMode = async function(dataArray) {
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await air_interface_transmission_mode.update({
        local_id: data.local_id,
        uuid: data.uuid,
        // Timestamp reference
        timestamp: data.timestamp,

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
          timestamp: data.timestamp,

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

exports.updateEthernetContainer = async function (dataArray) {
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await ethernet_container_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: data.timestamp,

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
          timestamp: data.timestamp,

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

exports.updateWireInterface = async function (dataArray) {
  for (let i = 0; i< dataArray.length; i++) {
    let data = dataArray[i];
    try {
      let cc = await wire_interface_general_info.update({
        local_id: data.local_id,

        // Timestamp reference
        timestamp: data.timestamp,

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
          timestamp: data.timestamp,

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
  let rawResult = await devices_general_info.findAll({
    attributes: ['mount_name', 'timestamp'],
    raw : isCSV
  });

  if (isCSV) {
    rawResult = convertToCSV(rawResult);
  }

  return rawResult;
}

exports.readDeviceInfo = async function(mountNames, params, isCSV=false) {
  let rawResult;
  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") && (params == undefined)) {
    rawResult = await devices_general_info.findAll({
      attributes: [
        'mount_name',
        'timestamp',
        'external_label',
        'device_model_name',
        'system_name'
      ],
      raw : isCSV
    });
  } else {
    // Create by default
    let ts = new Date(Date.now);
    if (params.timestamp) {
      ts = new Date(params.timestamp);
    }
    if (params != undefined && mountNames && mountNames.length > 0) {
      let ts = params.timestamp; // Get the timestamp
      rawResult = await devices_general_info.findAll({
        attributes: [
          'mount_name',
          'timestamp',
          'external_label',
          'device_model_name',
          'system_name'
        ],
        raw : isCSV,
        where: {
          [Op.gte]: [{ 'timestamp': new Date(ts) }],

        },
      });
    }
  }

  if (isCSV) {
    rawResult = convertToCSV(rawResult);
  }

  return rawResult;
}

exports.readEquipmentInfo = async function(mountNames, params, isCSV=false) {
  let rawResult;

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") && (params == undefined)) {
    rawResult = await equipment_general_info.findAll({
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
      raw : isCSV
    });
  } else {

  }

  if (isCSV) {
    rawResult = convertToCSV(rawResult);
  }

  return rawResult;
}

exports.readAirInterfaceInfo = async function(mountNames, params, isCSV=false) {
  let rawResult;

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") && (params == undefined)) {
    rawResult = await air_interface_general_info.findAll({
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
      raw : isCSV
    });
  } else {

  }

  if (isCSV) {
    rawResult = convertToCSV(rawResult);
  }

  return rawResult;
}

exports.readAirTransMode = async function(mountNames, params, isCSV=false) {
  let rawResult;

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") && (params == undefined)) {
    rawResult = await air_interface_general_info.findAll({
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
      raw : isCSV
    });
  } else {

  }

  if (isCSV) {
    rawResult = convertToCSV(rawResult);
  }

  return rawResult;
}

exports.readEthernetContInfo =  async function(mountNames, params, isCSV=false) {
  let rawResult;

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") && (params == undefined)) {
    rawResult = await ethernet_container_general_info.findAll({
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
      raw : isCSV
    });
  } else {

  }

  if (isCSV) {
    rawResult = convertToCSV(rawResult);
  }

  return rawResult;
}

exports.readWireInterfaceInfo =  async function(mountNames, params, isCSV=false) {
  let rawResult;

  if ((!mountNames || mountNames == undefined || mountNames.length == 0 || mountNames == "") && (params == undefined)) {
    rawResult = await wire_interface_general_info.findAll({
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
      raw : isCSV
    });
  } else {

  }

  if (isCSV) {
    rawResult = convertToCSV(rawResult);
  }

  return rawResult;
}

    // return;
    // 100254566;2024-12-11T16:00:00+01:00;100254566;OptiXRTN950;System xyz
    // const cc = await devices_general_info.update({
    //   timestamp: new Date(Date.now()),
    //   external_label: "Lorenzo",
    //   device_model_name: "OptiXRTN950",
    //   system_name: "System xyz"
    // },{
    //   where: {
    //     mount_name: "100254566",
    //   },
    // });


    
//     /*
//       class User extends Model {}
//         User.init(
//             {
//                 username: DataTypes.STRING,
//                 birthday: DataTypes.DATE,
//             },
//             {
//                 sequelize,
//                 modelName: 'user'
//             },
//         );

//         (async () => {
//             await sequelize.sync();
//             const jane = await User.create({
//                 username: 'janedoe',
//                 birthday: new Date(1980, 6, 20),
//             });
//             logger.info(jane.toJSON());
//         })();
// */
          //  const test = sequelize.define('user', {
          //      username: DataTypes.STRING,
          //      password: {
          //        type: DataTypes.STRING,
          //        set(value) {
          //          // Storing passwords in plaintext in the database is terrible.
          //          // Hashing the value with an appropriate cryptographic hash function is better.
          //          this.setDataValue('password', hash(value));
          //        },
          //      },
          //    });
   
          //    const user = test.build({
          //      username: 'someone',
          //      password: 'NotSo§tr0ngP4$SW0RD!',
          //    });

  function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)
  
    return array.map(it => {
      return Object.values(it).toString()
    }).join('\n')
  }
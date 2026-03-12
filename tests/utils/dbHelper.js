/**
 * Database Test Helper Utilities
 * 
 * Provides utilities for:
 * - Setting up test database
 * - Cleaning database between tests
 * - Seeding test data
 * - Querying database for assertions
 */

const { Sequelize } = require('sequelize');

/**
 * Create a test database instance
 * Uses SQLite in-memory for speed and isolation
 */
function createTestDatabase() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false, // Disable SQL logging in tests
    define: {
      timestamps: false, // Disable automatic timestamps
      freezeTableName: true // Use table names as-is
    }
  });

  return sequelize;
}

/**
 * Initialize all database models
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Object} Object containing all models
 */
function initializeModels(sequelize) {
  const devicesGeneralInfo = require('../../server/service/db/devicesGeneralInfoClass').init(sequelize);
  const wireInterface = require('../../server/service/db/wireIfClass').init(sequelize);
  const airInterface = require('../../server/service/db/airIfClass').init(sequelize);
  const equipment = require('../../server/service/db/equipmentClass').init(sequelize);
  const airTransmission = require('../../server/service/db/airTransModeClass').init(sequelize);
  const ethernetContainer = require('../../server/service/db/ethContClass').init(sequelize);
  const ltpEquipment = require('../../server/service/db/ltpEqpMapClass').init(sequelize);

  return {
    devicesGeneralInfo,
    wireInterface,
    airInterface,
    equipment,
    airTransmission,
    ethernetContainer,
    ltpEquipment
  };
}

/**
 * Setup test database with all tables
 * @returns {Promise<{sequelize: Sequelize, models: Object}>}
 */
async function setupTestDatabase() {
  const sequelize = createTestDatabase();
  const models = initializeModels(sequelize);

  // Force sync creates tables fresh
  await sequelize.sync({ force: true });

  return { sequelize, models };
}

/**
 * Clean all data from database
 * @param {Object} models - Database models
 */
async function cleanDatabase(models) {
  // Delete in order to respect potential foreign key constraints
  await models.airTransmission.destroy({ where: {}, truncate: true });
  await models.ltpEquipment.destroy({ where: {}, truncate: true });
  await models.ethernetContainer.destroy({ where: {}, truncate: true });
  await models.wireInterface.destroy({ where: {}, truncate: true });
  await models.airInterface.destroy({ where: {}, truncate: true });
  await models.equipment.destroy({ where: {}, truncate: true });
  await models.devicesGeneralInfo.destroy({ where: {}, truncate: true });
}

/**
 * Close database connection
 * @param {Sequelize} sequelize - Sequelize instance
 */
async function closeDatabase(sequelize) {
  await sequelize.close();
}

/**
 * Verify database schema structure
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Promise<Object>} Schema information
 */
async function verifyDatabaseSchema(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();

  const schema = {};
  for (const table of tables) {
    schema[table] = await queryInterface.describeTable(table);
  }

  return schema;
}

/**
 * Count records in a table
 * @param {Model} model - Sequelize model
 * @param {Object} where - Where clause (optional)
 * @returns {Promise<number>} Record count
 */
async function countRecords(model, where = {}) {
  return await model.count({ where });
}

/**
 * Get all records from a table
 * @param {Model} model - Sequelize model
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Records
 */
async function getAllRecords(model, options = {}) {
  return await model.findAll(options);
}

/**
 * Get single record by primary key
 * @param {Model} model - Sequelize model
 * @param {Object} pk - Primary key values
 * @returns {Promise<Object|null>} Record or null
 */
async function getRecordByPK(model, pk) {
  return await model.findOne({ where: pk });
}

/**
 * Seed device data
 * @param {Model} model - DevicesGeneralInfo model
 * @param {Array} devices - Array of device data
 */
async function seedDevices(model, devices) {
  for (const device of devices) {
    await model.create({
      'mount-name': device.mountName,
      'timestamp': device.timestamp || new Date(),
      'external-label': device.externalLabel,
      'device-model-name': device.deviceModelName,
      'system-name': device.systemName
    });
  }
}

/**
 * Seed wire interface data
 * @param {Model} model - WireInterface model
 * @param {Array} interfaces - Array of interface data
 */
async function seedWireInterfaces(model, interfaces) {
  for (const iface of interfaces) {
    await model.create({
      'mount-name': iface.mountName,
      'uuid': iface.uuid,
      'local-id': iface.localId,
      'timestamp': iface.timestamp || new Date(),
      'operational-state': iface.operationalState,
      'administrative-state': iface.administrativeState,
      'original-ltp-name': iface.originalLtpName,
      'interface-name': iface.interfaceName,
      'fixed-pmd-kind': iface.fixedPmdKind,
      'interface-status': iface.interfaceStatus,
      'pmd-kind-cur': iface.pmdKindCur,
      'pmd-name': iface.pmdName,
      'duplex': iface.duplex,
      'speed': iface.speed
    });
  }
}

/**
 * Seed air interface data
 * @param {Model} model - AirInterface model
 * @param {Array} interfaces - Array of interface data
 */
async function seedAirInterfaces(model, interfaces) {
  for (const iface of interfaces) {
    await model.create({
      'mount-name': iface.mountName,
      'uuid': iface.uuid,
      'local-id': iface.localId,
      'timestamp': iface.timestamp || new Date(),
      'operational-state': iface.operationalState,
      'administrative-state': iface.administrativeState,
      'original-ltp-name': iface.originalLtpName,
      'external-label': iface.externalLabel,
      'transmission-mode-min': iface.transmissionModeMin,
      'transmission-mode-max': iface.transmissionModeMax,
      'xpic-is-on': iface.xpicIsOn,
      'power-is-on': iface.powerIsOn,
      'transmitter-is-on': iface.transmitterIsOn,
      'interface-status': iface.interfaceStatus,
      'type-of-equipment': iface.typeOfEquipment
    });
  }
}

/**
 * Seed equipment data
 * @param {Model} model - Equipment model
 * @param {Array} equipment - Array of equipment data
 */
async function seedEquipment(model, equipment) {
  for (const eq of equipment) {
    await model.create({
      'mount-name': eq.mountName,
      'uuid': eq.uuid,
      'local-id': eq.localId,
      'timestamp': eq.timestamp || new Date(),
      'version': eq.version,
      'description': eq.description,
      'model-identifier': eq.modelIdentifier,
      'part-type-identifier': eq.partTypeIdentifier,
      'type-name': eq.typeName,
      'manufacturer-name': eq.manufacturerName,
      'manufacturer-identifier': eq.manufacturerIdentifier
    });
  }
}

/**
 * Assert record exists in database
 * @param {Model} model - Sequelize model
 * @param {Object} where - Where clause
 * @returns {Promise<void>}
 */
async function assertRecordExists(model, where) {
  const record = await model.findOne({ where });
  if (!record) {
    throw new Error(`Expected record with ${JSON.stringify(where)} to exist, but it doesn't`);
  }
  return record;
}

/**
 * Assert record count
 * @param {Model} model - Sequelize model
 * @param {number} expectedCount - Expected count
 * @param {Object} where - Where clause (optional)
 */
async function assertRecordCount(model, expectedCount, where = {}) {
  const count = await model.count({ where });
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} records, but found ${count}`);
  }
}

/**
 * Assert tables exist
 * @param {Sequelize} sequelize - Sequelize instance
 * @param {Array<string>} expectedTables - Expected table names
 */
async function assertTablesExist(sequelize, expectedTables) {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  
  for (const expectedTable of expectedTables) {
    if (!tables.includes(expectedTable)) {
      throw new Error(`Expected table '${expectedTable}' to exist, but it doesn't`);
    }
  }
}

module.exports = {
  createTestDatabase,
  initializeModels,
  setupTestDatabase,
  cleanDatabase,
  closeDatabase,
  verifyDatabaseSchema,
  countRecords,
  getAllRecords,
  getRecordByPK,
  seedDevices,
  seedWireInterfaces,
  seedAirInterfaces,
  seedEquipment,
  assertRecordExists,
  assertRecordCount,
  assertTablesExist
};

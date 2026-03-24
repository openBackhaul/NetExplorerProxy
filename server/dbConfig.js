const logger = require('./service/LoggingService.js').getLogger();

// Examples of DB connection
let db_config_default = { 
    user: 'root', password: 'mypass', host: "localhost",
    port: 3306, dialect: "mariadb", db_name: "nep_db",
    max_rows_fetched: 100000,
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 1000,
        evict: 1000
    },
    dialectOptions: {
        // Maria DB options
        connectTimeout: 5000,

        // Postgresql DB options
        // keepAlive: true, // Not supported yet
        statementTimeout: 0,
        idleInTransactionSessionTimeout: 0
    }
 };
const db_config_sqlLite = { user: 'root', password: 'mypass', dialect: "sqlite", sqlite_path: "" };

exports.readDBSettings = function (process) {
  let dbConfig;

  if (process.env.TIME_CC_RETR && process.env.TIME_CC_RETR.toLowerCase() === "true") {
    global.throttle = true;
  } else if (process.env.TIME_CC_RETR && process.env.TIME_CC_RETR.toLowerCase() === "false") {
    global.throttle = false;
  } else {
    global.throttle = true; // If is not specified, enabled by default
  }

  if (process.env.DB && process.env.DB.toLowerCase() === "true") {
    logger.warn("Working using external DB");
    if (process.env.USER) {
      db_config_default.user = process.env.USER;
    }
    if (process.env.PASSWORD) {
      let decPass = atob(process.env.PASSWORD);
      db_config_default.password = decPass;
    }
    if (process.env.HOST) {
      db_config_default.host = process.env.HOST;
    }
    if (process.env.PORT) {
      try {
        db_config_default.port = parseInt(process.env.PORT);
      } catch (e) {
        db_config_default.port = 3306;
        logger.warn("Using default port for DB");
      }
    }
    if (process.env.DIALECT) {
      db_config_default.dialect = process.env.DIALECT;
    }
    if (process.env.DB_NAME) {
      db_config_default.db_name = process.env.DB_NAME;
    }

    // Extra pool parameters
    if (process.env.POOL_MAX) {
      try {
        db_config_default.pool.max = parseInt(process.env.POOL_MAX);
      } catch (e) {
        db_config_default.pool.max = 5;
        logger.warn("Using default value for pool.max");
      }
    }
    if (process.env.POOL_MIN) {
      try {
        db_config_default.pool.min = parseInt(process.env.POOL_MIN);
      } catch (e) {
        db_config_default.pool.min = 0;
        logger.warn("Using default value for pool.min");
      }
    }
    if (process.env.POOL_ACQUIRE) {
      try {
        db_config_default.pool.acquire = parseInt(process.env.POOL_ACQUIRE);
      } catch (e) {
        db_config_default.pool.acquire = 30000;
        logger.warn("Using default value for pool.acquire");
      }
    }
    if (process.env.POOL_IDLE) {
      try {
        db_config_default.pool.idle = parseInt(process.env.POOL_IDLE);
      } catch (e) {
        db_config_default.pool.idle = 10000;
        logger.warn("Using default value for pool.idle");
      }
    }
    if (process.env.POOL_EVICT) {
      try {
        db_config_default.pool.evict = parseInt(process.env.POOL_EVICT);
      } catch (e) {
        db_config_default.pool.evict = 1000;
        logger.warn("Using default value for pool.evict");
      }
    }

    if (process.env.DIALECT_CONNTIMEOUT) {  // This properties is only for MariaDB
      try {
        db_config_default.dialectOptions.connectTimeout = parseInt(process.env.DIALECT_CONNTIMEOUT);
      } catch (e) {
        db_config_default.dialectOptions.connectTimeout = 1000;
        logger.warn("Using default value for dialect connection timeout");
      }
    }

    // if (process.env.DIALECT_KEEPALIVE) {  // This properties is only for PostreSQL
    //     try {
    //         db_config_default.dialectOptions.keepAlive = process.env.DIALECT_KEEPALIVE;
    //     } catch (e) {
    //         db_config_default.dialectOptions.applicationName = true;
    //         logger.warn("Using default value for dialect connection timeout");
    //     }
    // }

    if (process.env.DIALECT_STATEMENT_TIMEOUT) {  // This properties is only for PostreSQL
      try {
        db_config_default.dialectOptions.statementTimeout =
          parseInt(process.env.DIALECT_STATEMENT_TIMEOUT);
      } catch (e) {
        db_config_default.dialectOptions.statementTimeout = 0;
        logger.warn("Using default value for dialect Statement Timeout");
      }
    }

    if (process.env.DIALECT_IDLE_IN_TRANSACTION_SESSION_TIMEOUT) {  // This properties is only for PostreSQL
      try {
        db_config_default.dialectOptions.idleInTransactionSessionTimeout =
          parseInt(process.env.DIALECT_IDLE_IN_TRANSACTION_SESSION_TIMEOUT);
      } catch (e) {
        db_config_default.dialectOptions.idleInTransactionSessionTimeout = 0;
        logger.warn("Using default value for dialect Idle In Transaction Session Timeout");
      }
    }

    if (process.env.MAX_ROWS_FETCHED) {
      try {
        db_config_default.max_rows_fetched =
          parseInt(process.env.MAX_ROWS_FETCHED);
      } catch (e) {
        db_config_default.max_rows_fetched = 100000;
        logger.warn("Using default value for max row fetched");
      }
    }

    dbConfig = db_config_default;
  } else {
    logger.warn("No DB selected, using by default sqlite");
    if (process.env.DB_SQLITE_PATH) {
      db_config_sqlLite.sqlite_path = process.env.DB_SQLITE_PATH;
    }
    dbConfig = db_config_sqlLite;
  }

  return dbConfig;
}

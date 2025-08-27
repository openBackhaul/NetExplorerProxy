'use strict';

// Examples of DB connection
let db_config_default = { user: 'root', password: 'mypass', host: "localhost", port: 3306, dialect: "mariadb", db_name: "nep_db" };
const db_config_sqlLite = { user: 'root', password: 'mypass', dialect: "sqlite" }

const logger = require('./service/LoggingService.js').getLogger();

var initConfig = require('./initConfig');

var path = require('path');
var http = require('http');

var oas3Tools = require('oas3-tools');
var appCommons = require('onf-core-model-ap/applicationPattern/commons/AppCommons');
var dbHandler = require('./service/db/dbHandler');
const dummyData = require('./service/db/dummyData.js'); // Some dummy Data

var serverPort = 4018;

// uncomment if you do not want to validate security e.g. operation-key, basic auth, etc
//appCommons.openApiValidatorOptions.validateSecurity = false;

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
    openApiValidator: appCommons.openApiValidatorOptions
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();

logger.debug("NetExplorerProxy starting.");

appCommons.setupExpressApp(app);


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

// perform application registration
appCommons.performApplicationRegistration();


let dbConfig = db_config_sqlLite;
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
        db_config_default.port = process.env.PORT;
    }
    if (process.env.DIALECT) {
        db_config_default.dialect = process.env.DIALECT;
    }
    if (process.env.DB_NAME) {
        db_config_default.db_name = process.env.DB_NAME;
    }
    dbConfig = db_config_default;
} else {
    logger.warn("No DB selected, using by default sqlite");
}


logger.info("Connecting to the DB");
(async () => {
    try {
        let dbResult = await dbHandler.initDB(dbConfig);

        // Enable the code to test dummy data update / read data from DB
        // if (dbResult) {
        //     await dummyData.fillDB();
        //     await dummyData.readData();
        //     await dummyData.deleteData();
        // }
    } catch (error) {
        logger.error(error);
    }
})();

logger.info("NetExplorerProxy is up.");



const gracefulShutdown = async () => {
logger.info('Shutting down DB connection...');
  await dbHandler.closeDataBaseConnection(); // properly close connection pool
  process.exit();
};

process.on('SIGINT', async () => {
  await gracefulShutdown();
});

process.on('SIGTERM', async () => {
  await gracefulShutdown();
});


global.mountMap = new Map();


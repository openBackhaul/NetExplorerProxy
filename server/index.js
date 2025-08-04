'use strict';

// Examples of DB connection
// const db_config_mysql = { user: 'root', password: 'mypass', host: "localhost", port: 3306, dialect: "mysql", db_name: "nep_db" };
const db_config_mariaDB = { user: 'root', password: 'mypass', host: "localhost", port: 3306, dialect: "mariadb", db_name: "nep_db" };
// const db_config_posgres = { user: 'postgres', password: 'mypass', host: "localhost", port: 3308, dialect: "postgres", db_name: "nep_db" };
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
    logger.warn("Working using Maria DB");
    dbConfig = db_config_mariaDB;
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

global.mountMap = new Map();


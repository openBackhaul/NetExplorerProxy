'use strict';

const logger = require('./service/LoggingService.js').getLogger();

var initConfig = require('./initConfig');
var dbConf = require('./dbConfig');

var path = require('path');
var http = require('http');

var oas3Tools = require('oas3-tools');
var appCommons = require('onf-core-model-ap/applicationPattern/commons/AppCommons');
var dbHandler = require('./service/db/dbHandler');
const dummyData = require('./service/db/dummyData.js'); // Some dummy Data

var serverPort = 4018;

// uncomment if you do not want to validate security e.g. operation-key, basic auth, etc
//appCommons.openApiValidatorOptions.validateSecurity = false;
if (process.env.DEBUG && process.env.DEBUG.toLowerCase() === "true") {
    logger.warn("Working in debug mode");
    logger.warn("Checking validation")
    appCommons.openApiValidatorOptions.validateSecurity = false;
    // appCommons.openApiValidatorOptions.validateResponses = false;
    // appCommons.openApiValidatorOptions.validateRequests = false;
    logger.warn("Validate Security: " + appCommons.openApiValidatorOptions.validateSecurity);
    logger.warn("Validate Responses: " + appCommons.openApiValidatorOptions.validateResponses);
    logger.warn("Validate Requests: " + appCommons.openApiValidatorOptions.validateRequests);
}

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

let dbConfig = dbConf.readDBSettings(process);

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
    logger.info('Receiving SIGINT');
    await gracefulShutdown();
});

process.on('SIGTERM', async () => {
    logger.info('Receiving SIGTERM');
    await gracefulShutdown();
});

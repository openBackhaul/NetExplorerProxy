const forwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const logicalTerminationPoint = require("onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint");
const fileOperation = require("onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver");
const onfPaths = require("onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths");
const FcPort = require("onf-core-model-ap/applicationPattern/onfModel/models/FcPort");
const controlConstruct = require("onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct");
const tcpClientInterface = require("onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface");
const {GLOBAL_CLASS, LOGICAL_TERMINATION_POINT, LAYER_PROTOCOL, TCP_SERVER, STRING_PROFILE} = require("onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes");
const TcpServerInterface = require("onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface");


function recursiveSearchForKey(obj, targetKey) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (key === targetKey) {
                return obj[key];
            }

            if (typeof obj[key] === 'object') {
                // Recursively search through nested objects
                const result = recursiveSearchForKey(obj[key], targetKey);
                if (result !== undefined) {
                    return result; // Return the result if found in the recursion
                }
            }
        }
    }
}

async function getForwardingConstructOutputOperationData(forwardingName) {

    //get forwardConstruct output operation, get server ltp (http), get server ltp (tcp), get protocol, address and port
    let forwardingConstructInstance = await forwardingDomain.getForwardingConstructForTheForwardingNameAsync(
        forwardingName);

    let opData = null;
    for (const singleFcPort of forwardingConstructInstance['fc-port']) {
        if (FcPort.portDirectionEnum.OUTPUT === singleFcPort['port-direction']) {

            //get http, tcp and operationName of subscriber
            let operationLTP = await controlConstruct.getLogicalTerminationPointAsync(singleFcPort['logical-termination-point']);
            if (!operationLTP) {
                continue;
            }
            let httpUUID = operationLTP['server-ltp'][0];
            let httpLTP = await controlConstruct.getLogicalTerminationPointAsync(httpUUID);
            let tcpUUID = httpLTP['server-ltp'][0];
            let tcpLTP = await controlConstruct.getLogicalTerminationPointAsync(tcpUUID);

            let enumProtocol = tcpLTP['layer-protocol'][0]['tcp-client-interface-1-0:tcp-client-interface-pac']['tcp-client-interface-configuration']['remote-protocol'];
            let stringProtocol = tcpClientInterface.getProtocolFromProtocolEnum(enumProtocol)[0];

            let operationName = operationLTP['layer-protocol'][0]['operation-client-interface-1-0:operation-client-interface-pac']['operation-client-interface-configuration']['operation-name'];
            let port = tcpLTP['layer-protocol'][0]['tcp-client-interface-1-0:tcp-client-interface-pac']['tcp-client-interface-configuration']['remote-port'];

            let address = tcpLTP['layer-protocol'][0]['tcp-client-interface-1-0:tcp-client-interface-pac']['tcp-client-interface-configuration']['remote-address'];
            // let targetOperationUrl = buildDeviceSubscriberOperationPath(stringProtocol, address, port, operationName);
            let operationKey = operationLTP['layer-protocol'][0]['operation-client-interface-1-0:operation-client-interface-pac']['operation-client-interface-configuration']['operation-key'];
            //let operationUUID = operationLTP['uuid'];

            opData = {
                "protocol": stringProtocol,
                "address": address,
                "port": port,
                // "targetOperationURL": targetOperationUrl,
                // "operationKey": operationKey,
                // "operationUUID": operationUUID,
                "appName": httpLTP['layer-protocol'][0]['http-client-interface-1-0:http-client-interface-pac']['http-client-interface-configuration']['application-name'],
                "appRelease": httpLTP['layer-protocol'][0]['http-client-interface-1-0:http-client-interface-pac']['http-client-interface-configuration']['release-number'],
                "operationName": operationName,
                "operationKey": operationKey,
            }
            break;
        }
    }

    return opData;
}

function getHttpAndTcpUUIDForNewRelease() {
    return new Promise(async function (resolve, reject) {
        try {
            let uuidOfHttpAndTcpClient = {};
            let nrHttpLTP = await getFirstHttpLTPByApplicationName("NewRelease");
            let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(nrHttpLTP.uuid))[0];
            let httpClientUuid = nrHttpLTP.uuid;
            uuidOfHttpAndTcpClient = {httpClientUuid, tcpClientUuid}
            resolve(uuidOfHttpAndTcpClient)
        } catch (error) {
            reject(error)
        }
    })
}

async function getFirstHttpLTPByApplicationName(applicationName) {

    let logicalTerminationPointList = await fileOperation.readFromDatabaseAsync(
        onfPaths.LOGICAL_TERMINATION_POINT
    );

    for (const ltp of logicalTerminationPointList) {
        //get by application-name if existent
        let ltpApplicationName = recursiveSearchForKey(ltp, HTTP_CLIENT.APPLICATION_NAME);
        if (ltpApplicationName === applicationName) {
            return ltp;
        }
    }

    return null;
}


function convertProtocolEnum(protocol) {
    let protocolEnum = TcpServerInterface.TcpServerInterfacePac.TcpServerInterfaceConfiguration.localProtocolEnum;

    for(const [key, value] of Object.entries(protocolEnum)) {
        if (protocol === value) {
            return key;
        }
    }

    return protocol;
}

async function getLtpIfConfigFromUuid(uuid) {
    let ltpList = await fileOperation.readFromDatabaseAsync(
      onfPaths.LOGICAL_TERMINATION_POINT
    );

    let opLTPList = [];
    for(const ltp of ltpList) {
        // filter by uuid
        if (ltp[GLOBAL_CLASS.UUID] === uuid) {
            const layerProtocol = ltp[LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0];

            if (layerProtocol) {
                const pac = layerProtocol[LAYER_PROTOCOL.TCP_SERVER_INTERFACE_PAC];

                if (pac) {
                    const ifConf = pac[TCP_SERVER.CONFIGURATION];

                    if (ifConf) {
                        return {
                            "protocol": convertProtocolEnum(ifConf[TCP_SERVER.LOCAL_PROTOCOL]),
                            "ip-address": ifConf[TCP_SERVER.LOCAL_ADDRESS],
                            "port": ifConf[TCP_SERVER.LOCAL_PORT]
                        };
                    }
                }
            }
        }
    }

    return null;
}


module.exports = {
    getForwardingConstructOutputOperationData,
    getHttpAndTcpUUIDForNewRelease,
    getLtpIfConfigFromUuid
}

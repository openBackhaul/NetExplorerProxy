const dbHandler = require('./dbHandler');
const fs = require('fs');

const dataPrefix = "server/service/db/";

exports.fillDB = async function () {
    let dataFile = fs.readFileSync(dataPrefix + 'dummyDataDevice.json', 'utf8');
    let deviceGenArray = JSON.parse(dataFile);

    let result = await dbHandler.updateDeviceInfo(deviceGenArray);
    console.log(result);
    result = await dbHandler.updateDeviceInfo(deviceGenArray);
    console.log(result);
    deviceGenArray = [
        {
            mount_name: "A00000",
            timestamp: "2024-12-11T16:00:00+01:00",
        },
        {
            mount_name: "B00000",
            timestamp: "2024-12-11T16:00:00+01:00",
        },
    ];
    result = await dbHandler.updateDeviceInfo(deviceGenArray);
    console.log(result);

    // Equipment
    dataFile = fs.readFileSync(dataPrefix + 'dummyDataEquipment.json', 'utf8');// load from file
    let equipmentArray = JSON.parse(dataFile);
    await dbHandler.updateEquipmentInfo(equipmentArray);

    // Wire
    dataFile = fs.readFileSync(dataPrefix + 'dummyDataWire.json', 'utf8');// load from file
    let wireArray = JSON.parse(dataFile);
    await dbHandler.updateWireInterface(wireArray);

    // Ethernet Container
    dataFile = fs.readFileSync(dataPrefix + 'dummyDataEth.json', 'utf8');// load from file
    let ethArray = JSON.parse(dataFile);
    await dbHandler.updateEthernetContainer(ethArray);

    // Air Interface
    dataFile = fs.readFileSync(dataPrefix + 'dummyDataAirIf.json', 'utf8');
    let airArray = JSON.parse(dataFile);
    await dbHandler.updateAirInterface(airArray);

    dataFile = fs.readFileSync(dataPrefix + "dummyDataAirTransMode.json", 'utf8');
    let airTransArray = JSON.parse(dataFile);
    await dbHandler.updateAirTransMode(airTransArray);

    dataFile = fs.readFileSync(dataPrefix + "dummyDataLtpEquipment.json", 'utf8');
    let ltpEqpArray = JSON.parse(dataFile);
    await dbHandler.updateLtpEqpMap(ltpEqpArray);
}

exports.readData = async function() {
    // Read part
    try {
        const pagination = {
            rows: 10000,
            offset: 0
        };

        let filters = {
            mountNames: [],
            // timeStamp: new Date(0),
        }
        let res = await dbHandler.readEquipmentInfo(filters, pagination, true);
        fs.writeFileSync('./Equipment.csv', res, 'utf8');
        res = await dbHandler.readAirInterfaceInfo(filters, pagination, true);
        fs.writeFileSync('./AirInterface.csv', res, 'utf8');


        filters = {
            mountNames: ['100000', '200000'],
            timeStamp: new Date(Date.now()),
        }
        res = await dbHandler.readEquipmentInfo(filters, pagination, false);

        filters = {
            mountNames: ['100000', '200000'],
            timeStamp: new Date(0),
        }
        res = await dbHandler.readDeviceInfo(filters, pagination, true);
        filters = {
            mountNames: [],
            // timeStamp: new Date(0),
        }
        res = await dbHandler.readDeviceInfo(filters, pagination, true);
        console.log(res)

        // Try to get union
        filters = {
            mountNames: [],
            timeStamp: new Date(0),
        }
        res = await dbHandler.readInterfaceInfoPerDevice(filters, pagination, true);
        fs.writeFileSync('./GeneralInterface.csv', res, 'utf8');

        res =  await dbHandler.readLtpEquipmentMappings(filters, pagination, true);
        fs.writeFileSync('./LtpEqp.csv', res, 'utf8');

    } catch (err) {
        console.error(err);
    }
}

exports.deleteData = async function() {
    try {
        let filters = {
            mountNames: ['100000', '300000'],
            timeStamp: new Date(0),
        }
        let res = await dbHandler.readDeviceInfo(filters, true);
        console.log(res);
        filters = {
            mountNames: ['100000', '300000'],
            timeStamp: new Date(Date.now()),
        }
        res = await dbHandler.removeDeviceInfo(filters);
        console.log(res);
        filters = {
            mountNames: ['100000', '300000'],
            timeStamp: new Date(0),
        }
        res = await dbHandler.readDeviceInfo(filters, true);
        console.log(res);
        
        filters = {
            mountNames: ['100000', '300000'],
            timeStamp: new Date(Date.now()),
        }
        let dataDeleted = await dbHandler.removeAllReferences(filters);
        console.log(dataDeleted);
        res = await dbHandler.readAirInterfaceInfo(filters, true);
        console.log(res);

        filters = {
            mountNames: ['100250001', '200250003'],
            timeStamp: new Date(Date.now()),
        }
        dataDeleted = await dbHandler.removeAllReferences(filters);
        res = await dbHandler.readLtpEquipmentMappings(filters, true);

    } catch (err) {
        console.error(err);
    }
}
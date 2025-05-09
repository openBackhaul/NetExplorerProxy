const dbHandler = require('./dbHandler');
const fs = require('fs');

exports.fillDB = async function () {
    let deviceGenArray = [
        {
            mount_name: "100254566",
            timestamp: "2024-12-11T16:00:00+01:00",
            external_label: "100254566",
            device_model_name: "OptiXRTN950",
            system_name: "System xyz",
        },
        {
            mount_name: "200259999",
            timestamp: "2024-12-11T18:00:00+01:00",
            external_label: "20025999",
            device_model_name: "MINI-LINK Traffic Node",
            system_name: "",
        },
        {
            mount_name: "200559999",
            timestamp: "2024-12-11T18:00:00+01:00",
            external_label: "20025999",
            device_model_name: "MINI-LINK Traffic Node",
            system_name: "System OS",
        },
        {
            mount_name: "200359999",
            timestamp: "2024-12-11T18:00:00+01:00",
            external_label: "20025999",
            device_model_name: "MINI-LINK Traffic Node",
            system_name: "Linux",
        },
        {
            mount_name: "200159999",
            timestamp: "2024-12-11T18:00:00+01:00",
            external_label: "20025999",
            device_model_name: "MINI-LINK Traffic Node",
            system_name: "Windows",
        },
    ];
    await dbHandler.updateDeviceInfo(deviceGenArray);

    // Equipment
    equipmentArray = [
        {
            mount_name: "200159999",
            timestamp: "2024-12-11T18:00:00+01:00",
            uuid: '1921282559',
            local_id: '',
            version: 'R1C',
            description: 'Removable Memory Module',
            model_identifier: 'RRM',
            part_type_identifier: 'RYS 110 243/1',
            type_name: 'RRM',
            manufacturer_name: 'Ericsson',
            manufacturer_identifier: ''
        },
        {
            mount_name: "200251234",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'LAN-1 SFP',
            local_id: 'LAN-1 SFP',
            version: 'V2.0',
            description: 'SFP module in LAN-1 SFP connector',
            model_identifier: 'Generic',
            part_type_identifier: 'AXGD-1354-0533',
            type_name: 'SFP module',
            manufacturer_name: 'Axcen Photonics',
            manufacturer_identifier: ''
        },
        {
            mount_name: "211251234",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'LAN-1 SFP',
            local_id: 'LAN-1 SFP',
            version: 'V2.0',
            description: 'SFP module in LAN-1 SFP connector',
            model_identifier: 'Generic',
            part_type_identifier: 'AXGD-1354-0533',
            type_name: 'SFP module',
            manufacturer_name: 'Axcen Photonics',
            manufacturer_identifier: ''
        },
        {
            mount_name: "267251234",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'LAN-1 SFP',
            local_id: 'LAN-1 SFP',
            version: 'V2.0',
            description: 'SFP module in LAN-1 SFP connector',
            model_identifier: 'Generic',
            part_type_identifier: 'AXGD-1354-0533',
            type_name: 'SFP module',
            manufacturer_name: 'Axcen Photonics',
            manufacturer_identifier: ''
        },
    ];
    await dbHandler.updateEquipmentInfo(equipmentArray);

    // Wire
    wireArray = [
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETY-2134639491',
            local_id: '2134639491',
            operational_state: 'core-model-1-4:OPERATIONAL_STATE_DISABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/3',
            interface_name: 'VendorX interfaceName',
            fixed_pmd_kind: '1000BASE_FD',
            interface_status: 'DOWN',
            pmd_kind_cur: '1000BASE_FD',
            pmd_name: 'NOT_YET_DEFINED',
            duplex: 'NOT_YET_DEFINED',
            speed: 'NOT_YET_DEFINED'
        },
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETY-2135639491',
            local_id: '2135639491',
            operational_state: 'core-model-1-4:OPERATIONAL_STATE_DISABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/3',
            interface_name: 'VendorX interfaceName',
            fixed_pmd_kind: '1000BASE_FD',
            interface_status: 'DOWN',
            pmd_kind_cur: '1000BASE_FD',
            pmd_name: '1000BASE_FD',
            duplex: 'FULL_DUPLEX',
            speed: '1000Mbit/s'
        },
        {
            mount_name: "100270001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETY-2135639491',
            local_id: '2135639491',
            operational_state: 'core-model-1-4:OPERATIONAL_STATE_DISABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/3',
            interface_name: 'VendorX interfaceName',
            fixed_pmd_kind: '1000BASE_FD',
            interface_status: 'DOWN',
            pmd_kind_cur: '1000BASE_FD',
            pmd_name: '1000BASE_FD',
            duplex: 'FULL_DUPLEX',
            speed: '1000Mbit/s'
        },
        {
            mount_name: "200250003",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETY-2135639491',
            local_id: '2135639491',
            operational_state: 'core-model-1-4:OPERATIONAL_STATE_DISABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/3',
            interface_name: 'VendorX interfaceName',
            fixed_pmd_kind: '1000BASE_FD',
            interface_status: 'DOWN',
            pmd_kind_cur: '1000BASE_FD',
            pmd_name: '1000BASE_FD',
            duplex: 'FULL_DUPLEX',
            speed: '1000Mbit/s'
        },
    ];
    await dbHandler.updateWireInterface(wireArray);

    // Ethernet Container
    ethArray = [
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETH-2134639490',
            local_id: '2134639490',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/2',
            interface_name: '15PN2855_M2-2',
            bundling_is_on: false,
            interface_status: 'UP'
        },
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETH-2134639491',
            local_id: '2134639491',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/2',
            interface_name: '15PN2855_M2-2',
            bundling_is_on: true,
            interface_status: 'UP'
        },
        {
            mount_name: "100250002",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETH-2134639491',
            local_id: '2134639491',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/2',
            interface_name: '15PN2855_M2-2',
            bundling_is_on: true,
            interface_status: 'UP'
        },
        {
            mount_name: "100250002",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETH-2134639492',
            local_id: '2134639492',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/2',
            interface_name: '15PN2855_M2-2',
            bundling_is_on: true,
            interface_status: 'DOWN'
        },
        {
            mount_name: "100250003",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'ETH-2134639492',
            local_id: '2134639492',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
            original_ltp_name: 'LAN 1/7/2',
            interface_name: '15PN2855_M2-2',
            bundling_is_on: true,
            interface_status: 'DOWN'
        },
    ];
    await dbHandler.updateEthernetContainer(ethArray);

    // Air Interface
    airArray = [
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'RF-123456789',
            local_id: '123456789',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'UNLOCKED',
            original_ltp_name: 'RF 1/2.1/1',
            external_label:'100551233B',
            transmission_mode_min: '56000-16-v0',
            transmission_mode_max: '56000-256-v0',
            xpic_is_on: false,
            power_is_on: true,
            transmitter_is_on: true,
            interface_status: 'UP',
            type_of_equipment: 'RAU2 X 32/13 R3A'
        },
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'RF-234234234',
            local_id: '234234234',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'UNLOCKED',
            original_ltp_name: 'RF 1/3.1/1',
            external_label:'100551234B',
            transmission_mode_min: '56000-16-v0',
            transmission_mode_max: '56000-1024-v0',
            xpic_is_on: false,
            power_is_on: true,
            transmitter_is_on: true,
            interface_status: 'UP',
            type_of_equipment: 'RAU2 X 32/13 R3A'
        },
        {
            mount_name: "200250003",
            timestamp: "2024-12-11T16:07:00+01:00",
            uuid: 'ltpB-1',
            local_id: 'ltpB-1-localId-1',

            operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
            administrative_state: 'UNLOCKED',
            original_ltp_name: 'RF 1/5.1/1',
            external_label:'200550020A',
            transmission_mode_min: '4QAM',
            transmission_mode_max: '2048QAM',
            xpic_is_on: false,
            power_is_on: true,
            transmitter_is_on: true,
            interface_status: 'UP',
            type_of_equipment: 'RAU2 X 32/13 R3A'
        },
    ]
    await dbHandler.updateAirInterface(airArray);

    airTransArray = [
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'RF-123456789',
            local_id: '123456789',

            transmission_mode_name: '56000-64-v0',
            symbol_rate_reduction_factor: '1',
            modulation_scheme_at_lct: '64 QAM',
            modulation_scheme: 64,
            code_rate: 97,
            channel_bandwidth: 56000,
            xpic_is_avail: true,
            capa_factor: 28340.9
        },
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'RF-123456789',
            local_id: '123456789',

            transmission_mode_name: '56000-256-v0',
            symbol_rate_reduction_factor: '1',
            modulation_scheme_at_lct: '256 QAM',
            modulation_scheme: 256,
            code_rate: 95,
            channel_bandwidth: 56000,
            xpic_is_avail: true,
            capa_factor: 37008.7
        },
        {
            mount_name: "100250001",
            timestamp: "2024-12-11T16:00:00+01:00",
            uuid: 'RF-123456789',
            local_id: '123456789',

            transmission_mode_name: '56000-16-v0',
            symbol_rate_reduction_factor: '1',
            modulation_scheme_at_lct: '16 QAM',
            modulation_scheme: 16,
            code_rate: 97,
            channel_bandwidth: 56000,
            xpic_is_avail: true,
            capa_factor: 18893.9
        },
    ];
    await dbHandler.updateAirTransMode(airTransArray);

}

exports.readData = async function() {
    // Read part
    try {
        let res = await dbHandler.readEquipmentInfo(undefined, undefined, true);
        fs.writeFileSync('./Equipment.csv', res, 'utf8');
        res = await dbHandler.readAirInterfaceInfo(undefined, undefined, true);
        fs.writeFileSync('./AirInterface.csv', res, 'utf8');


    } catch (err) {
        console.error(err);
    }

}
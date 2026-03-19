const validators = require('./validators');

module.exports = {
  provideListOfDevicesInNep: {
    method: 'POST',
    endpoint: '/v1/provide-list-of-devices-in-nep',
    requestBody: {},
    validateResponse: validators.provideListOfDevicesInNep,
    tableChecks: [
      {
        table: 'devices_general_infos',
        matchApiResponse: true,
        responseSource: 'json',
        responsePath: 'mount-name-list',
        compareColumns: ['mount-name', 'timestamp'],
        responseColumnMap: {
          'mount-name': 'mount-name',
          timestamp: 'last-data-update-timestamp'
        },
        expectedColumns: ['mount-name', 'timestamp', 'external-label', 'device-model-name', 'system-name']
      }
    ]
  },
  provideGeneralInformationOfDevices: {
    method: 'POST',
    endpoint: '/v1/provide-general-information-of-devices',
    requestBody: {},
    validateResponse: validators.provideGeneralInformationOfDevices,
    tableChecks: [
      {
        table: 'devices_general_infos',
        matchApiResponse: true,
        expectedColumns: ['mount-name', 'timestamp', 'external-label', 'device-model-name', 'system-name']
      }
    ]
  },
  provideActualEquipmentInformationOfDevices: {
    method: 'POST',
    endpoint: '/v1/provide-actual-equipment-information-of-devices',
    requestBody: {},
    validateResponse: validators.provideActualEquipmentInformationOfDevices,
    tableChecks: [
      {
        table: 'equipment_general_infos',
        matchApiResponse: true,
        expectedColumns: [
          'mount-name',
          'uuid',
          'local-id',
          'timestamp',
          'version',
          'description',
          'model-identifier',
          'part-type-identifier',
          'type-name',
          'manufacturer-name',
          'manufacturer-identifier'
        ]
      }
    ]
  },
  provideAirInterfaceGeneralInformationOfDevices: {
    method: 'POST',
    endpoint: '/v1/provide-air-interface-general-information-of-devices',
    requestBody: {},
    validateResponse: validators.provideAirInterfaceGeneralInformationOfDevices,
    tableChecks: [
      {
        table: 'air_interface_general_infos',
        matchApiResponse: true,
        expectedColumns: [
          'mount-name',
          'uuid',
          'local-id',
          'timestamp',
          'operational-state',
          'administrative-state',
          'original-ltp-name',
          'external-label',
          'transmission-mode-min',
          'transmission-mode-max',
          'xpic-is-on',
          'power-is-on',
          'transmitter-is-on',
          'interface-status',
          'type-of-equipment'
        ]
      }
    ]
  },
  provideAirInterfaceTransmissionMode: {
    method: 'POST',
    endpoint: '/v1/provide-air-interface-transmission-mode-lists-of-devices',
    requestBody: {},
    validateResponse: validators.provideAirInterfaceTransmissionMode,
    tableChecks: [
      {
        table: 'air_interface_transmission_modes',
        matchApiResponse: true,
        expectedColumns: [
          'mount-name',
          'uuid',
          'local-id',
          'timestamp',
          'transmission-mode-name',
          'symbol-rate-reduction-factor',
          'modulation-scheme-at-lct',
          'modulation-scheme',
          'code-rate',
          'channel-bandwidth',
          'xpic-is-avail',
          'capa-factor'
        ]
      }
    ]
  },
  provideEthernetContainerGeneralInfo: {
    method: 'POST',
    endpoint: '/v1/provide-ethernet-container-general-information-of-devices',
    requestBody: {},
    validateResponse: validators.provideEthernetContainerGeneralInfo,
    tableChecks: [
      {
        table: 'ethernet_container_general_infos',
        matchApiResponse: true,
        expectedColumns: [
          'mount-name',
          'uuid',
          'local-id',
          'timestamp',
          'operational-state',
          'administrative-state',
          'original-ltp-name',
          'interface-name',
          'bundling-is-on',
          'interface-status'
        ]
      }
    ]
  },
  provideWireInterfaceGeneralInfo: {
    method: 'POST',
    endpoint: '/v1/provide-wire-interface-general-information-of-devices',
    requestBody: {},
    validateResponse: validators.provideWireInterfaceGeneralInfo,
    tableChecks: [
      {
        table: 'wire_interface_general_infos',
        matchApiResponse: true,
        expectedColumns: [
          'mount-name',
          'uuid',
          'local-id',
          'timestamp',
          'operational-state',
          'administrative-state',
          'original-ltp-name',
          'interface-name',
          'fixed-pmd-kind',
          'interface-status',
          'pmd-kind-cur',
          'pmd-name',
          'duplex',
          'speed'
        ]
      }
    ]
  },
  provideLtpEquipmentMappings: {
    method: 'POST',
    endpoint: '/v1/provide-ltp-equipment-mappings',
    requestBody: {},
    validateResponse: validators.provideLtpEquipmentMappings,
    tableChecks: [
      {
        table: 'ltp_equipment_mappings',
        matchApiResponse: true,
        expectedColumns: ['mount-name', 'uuid', 'timestamp', 'connector', 'equipment']
      }
    ]
  },
  provideInterfacesPerDevice: {
    method: 'POST',
    endpoint: '/v1/provide-list-of-interfaces-per-device-in-nep',
    requestBody: {},
    validateResponse: validators.provideInterfacesPerDevice,
    apiDbMatchChecks: [
      {
        name: 'interfaces_per_device_union',
        matchApiResponse: true,
        compareColumns: ['mount-name', 'uuid', 'local-id', 'interface-status'],
        dbQuery: `
          SELECT "mount-name", "uuid", "local-id", "interface-status" FROM "air_interface_general_infos"
          UNION ALL
          SELECT "mount-name", "uuid", "local-id", "interface-status" FROM "wire_interface_general_infos"
          UNION ALL
          SELECT "mount-name", "uuid", "local-id", "interface-status" FROM "ethernet_container_general_infos"
        `
      }
    ],
    tableChecks: [
      {
        table: 'air_interface_general_infos',
        expectedColumns: ['mount-name', 'uuid', 'local-id', 'interface-status']
      },
      {
        table: 'wire_interface_general_infos',
        expectedColumns: ['mount-name', 'uuid', 'local-id', 'interface-status']
      },
      {
        table: 'ethernet_container_general_infos',
        expectedColumns: ['mount-name', 'uuid', 'local-id', 'interface-status']
      }
    ]
  }
};

// Import Jest's mocking utilities
const rewire = require('rewire');

// Rewire the module to access private functions
const basicServicesService = rewire('../BasicServicesService');
const extractEthernetContainerInfo = basicServicesService.__get__('extractEthernetContainerInfo');
const  extractGeneralInfo  = basicServicesService.__get__('extractGeneralInfo');
const extractEquipmentData = basicServicesService.__get__('extractEquipmentData');
const extractAirContainerGeneralInfoAndTransmissionInfo = basicServicesService.__get__('extractAirContainerGeneralInfoAndTransmissionInfo');
const extractWireInterfaceGeneralInfo = basicServicesService.__get__('extractWireInterfaceGeneralInfo');


describe('extractWireInterfaceGeneralInfo', () => {
  
  test('should return an empty array when wireinterfceLtpList is empty', async () => {
    const result = await extractWireInterfaceGeneralInfo([], 'CO12123', 1748327909254);
    expect(result).toEqual([]);
  });

  test('should return an empty array when LTP has no layer protocol', async () => {
    const mockLtp = 
   [   
  {
    uuid: "ETY-86.1.4",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
     "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "",
      "original-ltp-name": "LAN:1/4",
    },
  }];
      
    
    const result = await extractWireInterfaceGeneralInfo(mockLtp, 'CO12123', 1748327909254);
    expect(result).toEqual([]);
  });

  test('should return an empty array when layer protocol does not contain wire-interface-pac', async () => {
    const mockLtp =  [ {
    uuid: "ETY-86.1.2",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.2",
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "Y-cable  to 6691",
      "original-ltp-name": "LAN:1/2",
    },
  }];
    const result = await extractWireInterfaceGeneralInfo(mockLtp, 'CO12123', 1748327909254);
    expect(result).toEqual([]);
  });

  test('should extract basic wire interface configuration, status, and capability', async () => {
    const mockLtp = [
      {
    uuid: "ETY-86.1.4",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.4",
        "wire-interface-2-0:wire-interface-pac": {
          "wire-interface-status": {
            "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_UP",
            "pmd-kind-cur": "10GBASE-LR-LW",
          },
          "wire-interface-configuration": {
            "interface-name": "",
            "fixed-pmd-kind": "NOT_YET_DEFINED",
          },
          "wire-interface-capability": {
            "supported-pmd-kind-list": [
              {
                "pmd-name": "10GBASE-LR-LW",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
              {
                "pmd-name": "NOT_YET_DEFINED",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
            ],
          },
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "",
      "original-ltp-name": "LAN:1/4",
    },
  },
  {
    uuid: "ETY-86.1.2",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.2",
        "wire-interface-2-0:wire-interface-pac": {
          "wire-interface-status": {
            "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
            "pmd-kind-cur": "10GBASE-LR-LW",
          },
          "wire-interface-configuration": {
            "interface-name": "Y-cable  to 6691",
            "fixed-pmd-kind": "NOT_YET_DEFINED",
          },
          "wire-interface-capability": {
            "supported-pmd-kind-list": [
              {
                "pmd-name": "10GBASE-LR-LW",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
              {
                "pmd-name": "NOT_YET_DEFINED",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
            ],
          },
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "Y-cable  to 6691",
      "original-ltp-name": "LAN:1/2",
    },
  },
    ];

    const result = await extractWireInterfaceGeneralInfo(mockLtp, 'CO12123', 1748327909254);
    expect(result).toMatchObject(
       [
      {
        interface_name: '',
        fixed_pmd_kind: 'NOT_YET_DEFINED',
        interface_status: 'wire-interface-2-0:INTERFACE_STATUS_TYPE_UP',
        pmd_kind_cur: '10GBASE-LR-LW',
        mount_name: 'CO12123',
        timestamp: 1748327909254,
        uuid: 'ETY-86.1.4',
        local_id: '86.1.4',
        operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
        administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
        original_ltp_name: 'LAN:1/4',
        pmd_name: '10GBASE-LR-LW',
        duplex: 'wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED',
        speed: 'NOT_YET_DEFINED'
      },
      {
        interface_name: '',
        fixed_pmd_kind: 'NOT_YET_DEFINED',
        interface_status: 'wire-interface-2-0:INTERFACE_STATUS_TYPE_UP',
        pmd_kind_cur: '10GBASE-LR-LW',
        mount_name: 'CO12123',
        timestamp: 1748327909254,
        uuid: 'ETY-86.1.4',
        local_id: '86.1.4',
        operational_state: 'core-model-1-4:OPERATIONAL_STATE_ENABLED',
        administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
        original_ltp_name: 'LAN:1/4',
        pmd_name: 'NOT_YET_DEFINED',
        duplex: 'wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED',
        speed: 'NOT_YET_DEFINED'
      },
      {
        interface_name: 'Y-cable  to 6691',
        fixed_pmd_kind: 'NOT_YET_DEFINED',
        interface_status: 'wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN',
        pmd_kind_cur: '10GBASE-LR-LW',
        mount_name: 'CO12123',
        timestamp: 1748327909254,
        uuid: 'ETY-86.1.2',
        local_id: '86.1.2',
        operational_state: 'core-model-1-4:OPERATIONAL_STATE_DISABLED',
        administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
        original_ltp_name: 'LAN:1/2',
        pmd_name: '10GBASE-LR-LW',
        duplex: 'wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED',
        speed: 'NOT_YET_DEFINED'
      },
      {
        interface_name: 'Y-cable  to 6691',
        fixed_pmd_kind: 'NOT_YET_DEFINED',
        interface_status: 'wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN',
        pmd_kind_cur: '10GBASE-LR-LW',
        mount_name: 'CO12123',
        timestamp: 1748327909254,
        uuid: 'ETY-86.1.2',
        local_id: '86.1.2',
        operational_state: 'core-model-1-4:OPERATIONAL_STATE_DISABLED',
        administrative_state: 'core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED',
        original_ltp_name: 'LAN:1/2',
        pmd_name: 'NOT_YET_DEFINED',
        duplex: 'wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED',
        speed: 'NOT_YET_DEFINED'
      }
    ]
  );
  });

  test('should handle missing configuration/status/capability blocks gracefully', async () => {
    const mockLtp = [{
    uuid: "ETY-86.1.1",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.1",
        "wire-interface-2-0:wire-interface-pac": {
         },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "",
      "original-ltp-name": "LAN:1/1",
    },
  }];
    const result = await extractWireInterfaceGeneralInfo(mockLtp, 'CO12123', 1748327909254);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      mount_name: 'CO12123',
      timestamp: 1748327909254
    });
    expect(result[0]).not.toHaveProperty('interface_name');
    expect(result[0]).not.toHaveProperty('interface_status');
    expect(result[0]).not.toHaveProperty('supported_speed');
  });

  test('should handle multiple wire interface LTPs correctly', async () => {
    const mockLtps = [
  {
    uuid: "ETY-86.1.4",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.4",
        "wire-interface-2-0:wire-interface-pac": {
          "wire-interface-status": {
            "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_UP",
            "pmd-kind-cur": "10GBASE-LR-LW",
          },
          "wire-interface-configuration": {
            "interface-name": "",
            "fixed-pmd-kind": "NOT_YET_DEFINED",
          },
          "wire-interface-capability": {
            "supported-pmd-kind-list": [
              {
                "pmd-name": "10GBASE-LR-LW",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
              {
                "pmd-name": "NOT_YET_DEFINED",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
            ],
          },
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "",
      "original-ltp-name": "LAN:1/4",
    },
  },
  {
    uuid: "ETY-86.1.2",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.2",
        "wire-interface-2-0:wire-interface-pac": {
          "wire-interface-status": {
            "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
            "pmd-kind-cur": "10GBASE-LR-LW",
          },
          "wire-interface-configuration": {
            "interface-name": "Y-cable  to 6691",
            "fixed-pmd-kind": "NOT_YET_DEFINED",
          },
          "wire-interface-capability": {
            "supported-pmd-kind-list": [
              {
                "pmd-name": "10GBASE-LR-LW",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
              {
                "pmd-name": "NOT_YET_DEFINED",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
            ],
          },
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "Y-cable  to 6691",
      "original-ltp-name": "LAN:1/2",
    },
  },
  {
    uuid: "ETY-86.1.3",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.3",
        "wire-interface-2-0:wire-interface-pac": {
          "wire-interface-status": {
            "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
            "pmd-kind-cur": "NOT_YET_DEFINED",
          },
          "wire-interface-configuration": {
            "interface-name": "",
            "fixed-pmd-kind": "NOT_YET_DEFINED",
          },
          "wire-interface-capability": {
            "supported-pmd-kind-list": [
              {
                "pmd-name": "NOT_YET_DEFINED",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
            ],
          },
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "External label not yet defined.",
      "original-ltp-name": "LAN:1/3",
    },
  },
  {
    uuid: "ETY-86.1.1",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    "layer-protocol": [
      {
        "local-id": "86.1.1",
        "wire-interface-2-0:wire-interface-pac": {
          "wire-interface-status": {
            "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
            "pmd-kind-cur": "1000BASE-T",
          },
          "wire-interface-configuration": {
            "interface-name": "",
            "fixed-pmd-kind": "NOT_YET_DEFINED",
          },
          "wire-interface-capability": {
            "supported-pmd-kind-list": [
              {
                "pmd-name": "1000BASE-T",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
              {
                "pmd-name": "NOT_YET_DEFINED",
                duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                speed: "NOT_YET_DEFINED",
              },
            ],
          },
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "",
      "original-ltp-name": "LAN:1/1",
    },
  },
];
  const result = await extractWireInterfaceGeneralInfo(mockLtps, 'CO12123', 1748327909254);
        expect(result[0]).toMatchObject(   
  {
    interface_name: "",
    fixed_pmd_kind: "NOT_YET_DEFINED",
    interface_status: "wire-interface-2-0:INTERFACE_STATUS_TYPE_UP",
    pmd_kind_cur: "10GBASE-LR-LW",
    mount_name: "CO12123",
    timestamp: 1748327909254,
    uuid: "ETY-86.1.4",
    local_id: "86.1.4",
    operational_state: "core-model-1-4:OPERATIONAL_STATE_ENABLED",
    administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
    original_ltp_name: "LAN:1/4",
    pmd_name: "10GBASE-LR-LW",
    duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
    speed: "NOT_YET_DEFINED",
  },
  {
    interface_name: "",
    fixed_pmd_kind: "NOT_YET_DEFINED",
    interface_status: "wire-interface-2-0:INTERFACE_STATUS_TYPE_UP",
    pmd_kind_cur: "10GBASE-LR-LW",
    mount_name: "CO12123",
    timestamp: 1748327909254,
    uuid: "ETY-86.1.4",
    local_id: "86.1.4",
    operational_state: "core-model-1-4:OPERATIONAL_STATE_ENABLED",
    administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
    original_ltp_name: "LAN:1/4",
    pmd_name: "NOT_YET_DEFINED",
    duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
    speed: "NOT_YET_DEFINED",
  },
  {
    interface_name: "Y-cable  to 6691",
    fixed_pmd_kind: "NOT_YET_DEFINED",
    interface_status: "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
    pmd_kind_cur: "10GBASE-LR-LW",
    mount_name: "CO12123",
    timestamp: 1748327909254,
    uuid: "ETY-86.1.2",
    local_id: "86.1.2",
    operational_state: "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
    original_ltp_name: "LAN:1/2",
    pmd_name: "10GBASE-LR-LW",
    duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
    speed: "NOT_YET_DEFINED",
  },
  {
    interface_name: "Y-cable  to 6691",
    fixed_pmd_kind: "NOT_YET_DEFINED",
    interface_status: "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
    pmd_kind_cur: "10GBASE-LR-LW",
    mount_name: "CO12123",
    timestamp: 1748327909254,
    uuid: "ETY-86.1.2",
    local_id: "86.1.2",
    operational_state: "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
    original_ltp_name: "LAN:1/2",
    pmd_name: "NOT_YET_DEFINED",
    duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
    speed: "NOT_YET_DEFINED",
  },
  {
    interface_name: "",
    fixed_pmd_kind: "NOT_YET_DEFINED",
    interface_status: "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
    pmd_kind_cur: "NOT_YET_DEFINED",
    mount_name: "CO12123",
    timestamp: 1748327909254,
    uuid: "ETY-86.1.3",
    local_id: "86.1.3",
    operational_state: "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
    original_ltp_name: "LAN:1/3",
    pmd_name: "NOT_YET_DEFINED",
    duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
    speed: "NOT_YET_DEFINED",
  },
  {
    interface_name: "",
    fixed_pmd_kind: "NOT_YET_DEFINED",
    interface_status: "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
    pmd_kind_cur: "1000BASE-T",
    mount_name: "CO12123",
    timestamp: 1748327909254,
    uuid: "ETY-86.1.1",
    local_id: "86.1.1",
    operational_state: "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
    original_ltp_name: "LAN:1/1",
    pmd_name: "1000BASE-T",
    duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
    speed: "NOT_YET_DEFINED",
  },
  {
    interface_name: "",
    fixed_pmd_kind: "NOT_YET_DEFINED",
    interface_status: "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
    pmd_kind_cur: "1000BASE-T",
    mount_name: "CO12123",
    timestamp: 1748327909254,
    uuid: "ETY-86.1.1",
    local_id: "86.1.1",
    operational_state: "core-model-1-4:OPERATIONAL_STATE_DISABLED",
    administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
    original_ltp_name: "LAN:1/1",
    pmd_name: "NOT_YET_DEFINED",
    duplex: "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
    speed: "NOT_YET_DEFINED",
  },      
    );
  });
});

describe('extractEthernetContainerInfo', () => {  
  test('should return an empty array when ethInterfaceLtpList is empty', async () => {
    const result = await extractEthernetContainerInfo([], 'test-mount', 12345);
    expect(result).toEqual([]);
  });
  
  test('should extract basic information from LTP without ethernet-container-pac', async () => {
    const mockLtp = {
        'uuid': 'test-uuid',
      'operational-state': 'ENABLED',
      'layer-protocol': [
        {
          'local-id': 'test-local-id',
          'administrative-state': 'UNLOCKED'
        }
      ],
      'ltp-augment-1-0:ltp-augment-pac': {
        'original-ltp-name': 'test-ltp-name'
      }
    };
    
    const result = await extractEthernetContainerInfo([mockLtp], 'test-mount', 12345);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      mount_name: 'test-mount',
      uuid: 'test-uuid',
      local_id: 'test-local-id',
      timestamp: 12345,
      operational_state: 'ENABLED',
      administrative_state: 'UNLOCKED',
      original_ltp_name: 'test-ltp-name'
    });
    expect(result[0]).not.toHaveProperty('interface_name');
    expect(result[0]).not.toHaveProperty('bundling_is_on');
    expect(result[0]).not.toHaveProperty('interface_status');
  });
  
  test('should extract complete information including ethernet-container-pac data', async () => {
    const mockLtp = {
      'uuid': 'test-uuid',
      'operational-state': 'ENABLED',
      'layer-protocol': [
        {
          'local-id': 'test-local-id',
          'administrative-state': 'UNLOCKED',
          'ethernet-container-2-0:ethernet-container-pac': {
            'ethernet-container-configuration': {
              'interface-name': 'eth0',
              'bundling-is-on': true
            },
            'ethernet-container-status': {
              'interface-status': 'UP'
            }
          }
        }
      ],
      'ltp-augment-1-0:ltp-augment-pac': {
        'original-ltp-name': 'test-ltp-name'
      }
    };    
    const result = await extractEthernetContainerInfo([mockLtp], 'test-mount', 12345);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      mount_name: 'test-mount',
      uuid: 'test-uuid',
      local_id: 'test-local-id',
      timestamp: 12345,
      operational_state: 'ENABLED',
      administrative_state: 'UNLOCKED',
      original_ltp_name: 'test-ltp-name',
      interface_name: 'eth0',
      bundling_is_on: true,
      interface_status: 'UP'
    });
  });
  
  test('should handle multiple LTPs correctly', async () => {
    const mockLtps = [
      {
        'uuid': 'uuid-1',
        'operational-state': 'ENABLED',
        'layer-protocol': [
          {
            'local-id': 'local-id-1',
            'administrative-state': 'UNLOCKED',
            'ethernet-container-2-0:ethernet-container-pac': {
              'ethernet-container-configuration': {
                'interface-name': 'eth0',
                'bundling-is-on': true
              },
              'ethernet-container-status': {
                'interface-status': 'UP'
              }
            }
          }
        ],
        'ltp-augment-1-0:ltp-augment-pac': {
          'original-ltp-name': 'ltp-name-1'
        }
      },
      {
        'uuid': 'uuid-2',
        'operational-state': 'DISABLED',
        'layer-protocol': [
          {
            'local-id': 'local-id-2',
            'administrative-state': 'LOCKED',
            'ethernet-container-2-0:ethernet-container-pac': {
              'ethernet-container-configuration': {
                'interface-name': 'eth1',
                'bundling-is-on': false
              },
              'ethernet-container-status': {
                'interface-status': 'DOWN'
              }
            }
          }
        ],
        'ltp-augment-1-0:ltp-augment-pac': {
          'original-ltp-name': 'ltp-name-2'
        }
      }
    ];
    
    const result = await extractEthernetContainerInfo(mockLtps, 'test-mount', 12345);
    
    expect(result).toHaveLength(2);
    
    expect(result[0]).toMatchObject({
      mount_name: 'test-mount',
      uuid: 'uuid-1',
      local_id: 'local-id-1',
      timestamp: 12345,
      operational_state: 'ENABLED',
      administrative_state: 'UNLOCKED',
      original_ltp_name: 'ltp-name-1',
      interface_name: 'eth0',
      bundling_is_on: true,
      interface_status: 'UP'
    });
    
    expect(result[1]).toMatchObject({
      mount_name: 'test-mount',
      uuid: 'uuid-2',
      local_id: 'local-id-2',
      timestamp: 12345,
      operational_state: 'DISABLED',
      administrative_state: 'LOCKED',
      original_ltp_name: 'ltp-name-2',
      interface_name: 'eth1',
      bundling_is_on: false,
      interface_status: 'DOWN'
    });
  });
  
  test('should handle missing ltp-augment-pac gracefully', async () => {
    const mockLtp = {
      'uuid': 'test-uuid',
      'operational-state': 'ENABLED',
      'layer-protocol': [
        {
          'local-id': 'test-local-id',
          'administrative-state': 'UNLOCKED'
        }
      ]
      // No ltp-augment-1-0:ltp-augment-pac
    };
    
    // Use Jest to spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await extractEthernetContainerInfo([mockLtp], 'test-mount', 12345);
    

    
    // Verify function still returns partial data
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      mount_name: 'test-mount',
      uuid: 'test-uuid',
      local_id: 'test-local-id',
      timestamp: 12345,
      operational_state: 'ENABLED',
      administrative_state: 'UNLOCKED'
    });
    
  });
  
  test('should handle malformed LTP data gracefully', async () => {
    const mockLtp = {
      // Missing required fields
      'uuid': 'test-uuid',
      'layer-protocol': [{}] // Empty layer protocol
    };
    
    // Use Jest to spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await extractEthernetContainerInfo([mockLtp], 'test-mount', 12345);
    

    
    // Verify function still returns partial data
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('uuid', 'test-uuid');
    expect(result[0]).toHaveProperty('mount_name', 'test-mount');
    expect(result[0]).toHaveProperty('timestamp', 12345);
  });
});

describe("extractGeneralInfo", () => {
            const mountName = "CO12123";
            const timestamp = "1747899140618";

            it("should return all values when all fields are present", async () => {
              const ccOfMountname={
                "core-model-1-4:control-construct": [
                  {
                   "equipment-augment-1-0:control-construct-pac": {
                      "device-model-name": "MINI-LINK 6352",
                      "external-label": "ML6352_ODUC",
                    },
                    "equipment-augment-1-0:protocol-collection": {
                      protocol: [
                        {
                          "lldp-1-0:lldp-pac": {
                            "local-system-data": {
                              "system-name": "ML6352_ODUC",
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              };

              const expected = [{
                                mount_name: "CO12123",
                                timestamp: timestamp,
                                external_label: "ML6352_ODUC",
                                device_model_name: "MINI-LINK 6352",
                                system_name: "ML6352_ODUC",
                              }];

              const result = await extractGeneralInfo(ccOfMountname, mountName, timestamp);
              expect(result).toEqual(expected);
            });

            it("should return only device_model_name and external_label when system_name is missing", async () => {
              const input = {
                "core-model-1-4:control-construct": [
                  {
                    "equipment-augment-1-0:control-construct-pac": {
                      "device-model-name": "MINI-LINK 6352",
                      "external-label": "ML6352_ODUC",
                    },
                    "equipment-augment-1-0:protocol-collection": {
                      protocol: [
                        {
                          "lldp-1-0:lldp-pac": {
                            "local-system-data": {
                              // "system-name": "ML6352_ODUC",
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              };

              const result = await extractGeneralInfo(input, mountName, timestamp);
              expect(result).toEqual([{
                mount_name: mountName,
                timestamp: timestamp,
                device_model_name: "MINI-LINK 6352",
                external_label: "ML6352_ODUC"
              }]);
            });

            it("should return only system_name when device-model-name and external-label are missing", async () => {
              const input ={
                "core-model-1-4:control-construct": [
                  {
                    
                    // "equipment-augment-1-0:control-construct-pac": {
                    //   "device-model-name": "MINI-LINK 6352",
                    //   "external-label": "ML6352_ODUC",
                    // },
                    "equipment-augment-1-0:protocol-collection": {
                      protocol: [
                        {
                          "lldp-1-0:lldp-pac": {
                            "local-system-data": {
                              "system-name": "ML6352_ODUC",
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              };

              const result = await extractGeneralInfo(input, mountName, timestamp);
              expect(result).toEqual([{
                mount_name: mountName,
                timestamp: timestamp,
                system_name: "ML6352_ODUC"
              }]);
            });

            it("should return only mount_name and timestamp when all optional fields are missing", async () => {
              const input = {
                "core-model-1-4:control-construct": [
                  {
                    // No equipment-augment fields at all
                  }
                ]
              };

              const result = await extractGeneralInfo(input, mountName, timestamp);
              expect(result).toEqual([{
                mount_name: mountName,
                timestamp: timestamp
              }]);
            });

            it("should return empty object with only mount_name and timestamp when input is empty", async () => {
              const result = await extractGeneralInfo({}, mountName, timestamp);
              expect(result).toEqual([{
                mount_name: mountName,
                timestamp: timestamp
              }]);
            });

            it("should return empty object with only mount_name and timestamp when input is null", async () => {
              const result = await extractGeneralInfo(null, mountName, timestamp);
              expect(result).toEqual([{
                mount_name: mountName,
                timestamp: timestamp
              }]);
            });
});

describe("extractEquipmentData", () => {
            const mountName = "CO12123";
            const timestamp = "1747899140618";

  it("should return full mapped equipment data when all fields are present", async () => {
    const input = {
  "core-model-1-4:control-construct": [
    {
      equipment: [
        {
          uuid: "RMM-1",
          "actual-equipment": {
            "manufactured-thing": {
              "equipment-type": {
                version: "R2A",
                description: "Removable Memory Module",
                "model-identifier": "Removable Memory Module",
                "part-type-identifier": "RYS 110 243/1",
                "type-name": "Removable Memory Module",
              },
              "manufacturer-properties": {
                "manufacturer-name": "",
              },
            },
          },
        }
      ],
    },
  ],
};

    const result = await extractEquipmentData(input, mountName, timestamp);
    expect(result).toEqual([
  {
    mount_name: "CO12123",
    timestamp: timestamp,
    uuid: "RMM-1",
    version: "R2A",
    description: "Removable Memory Module",
    model_identifier: "Removable Memory Module",
    part_type_identifier: "RYS 110 243/1",
    type_name: "Removable Memory Module",
    manufacturer_name: "",
  }
]);
  });

  it("should skip equipment without 'actual-equipment'", async () => {
    const input = {
  "core-model-1-4:control-construct": [
    {
     
      equipment: [
        {
          uuid: "RMM-1",         
        },
        {
          uuid: "SFP-1.2",
        },
        {
          uuid: "SFP-1.3",
        },
        {
          uuid: "SFP-1.4",
        },
        {
          uuid: "SLOT-1",
        },
      ],
      "equipment-augment-1-0:control-construct-pac": {
        "device-model-name": "MINI-LINK 6352",
        "external-label": "ML6352_ODUC",
      },
      "equipment-augment-1-0:protocol-collection": {
        protocol: [
          {
            "lldp-1-0:lldp-pac": {
              "local-system-data": {
                "system-name": "ML6352_ODUC",
              },
            },
          },
        ],
      },
    },
  ],
};
    const result = await extractEquipmentData(input, mountName, timestamp);
    expect(result).toEqual([]);
  });

  it("should skip equipment without 'manufactured-thing'", async () => {
    const input = {
  "core-model-1-4:control-construct": [
    {
      equipment: [
        {
          uuid: "RMM-1",
          "actual-equipment": {
          },
        },
        {
          uuid: "SFP-1.2",
          "actual-equipment": {
          },
        },
        {
          uuid: "SFP-1.3",
        },
        {
          uuid: "SFP-1.4",
          "actual-equipment": {
          },
        },
        {
          uuid: "SLOT-1",
          "actual-equipment": {
          },
        },
      ],
      "equipment-augment-1-0:control-construct-pac": {
        "device-model-name": "MINI-LINK 6352",
        "external-label": "ML6352_ODUC",
      },
    },
  ],
};

    const result = await extractEquipmentData(input, mountName, timestamp);
    expect(result).toEqual([]);
  });

  it("should return equipment object with only available fields", async () => {
    const input ={
  "core-model-1-4:control-construct": [
    {
      equipment: [
        {
          uuid: "RMM-1",
          "actual-equipment": {
            "manufactured-thing": {
              "equipment-type": {
                "type-name": "Removable Memory Module",
              },
              "manufacturer-properties": {
                "manufacturer-name": "",
              },
            },
          },
        }
      ],
    },
  ],
};

    const result = await extractEquipmentData(input, mountName, timestamp);
    expect(result).toEqual([
      {
        mount_name: mountName,
        timestamp: timestamp,
        uuid: "RMM-1",
        manufacturer_name: "",
        type_name: "Removable Memory Module"
      }
    ]);
  });

  it("should return empty array if input is empty", async () => {
    const result = await extractEquipmentData({}, mountName, timestamp);
    expect(result).toEqual([]);
  });

  it("should return empty array if input is null", async () => {
    const result = await extractEquipmentData(null, mountName, timestamp);
    expect(result).toEqual([]);
  });

  it("should return empty array if equipment is not an array", async () => {
    const input = {
      "core-model-1-4:control-construct": [
        {
          equipment: null
        }
      ]
    };

    const result = await extractEquipmentData(input, mountName, timestamp);
    expect(result).toEqual([]);
  });
});

describe("extractAirContainerGeneralInfoAndTransmissionInfo", () => {
  const mountName = "CO12123";
  const timestamp = "1747995605012";

  it("should return full airContainerGeneralInfo and transmissionListInfo when all properties exist", async () => {
    const input = [
  {
    uuid: "RF-819.1.1",
    "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
    "layer-protocol": [
      {
        "local-id": "819.1.1",
        "air-interface-2-0:air-interface-pac": {
          "air-interface-configuration": {
            "transmission-mode-min": "782.1.1.16.3",
            "transmitter-is-on": true,
            "transmission-mode-max": "782.1.1.16.19",
            "xpic-is-on": true,
            "power-is-on": true,
          },
          "air-interface-status": {
            "interface-status": "air-interface-2-0:INTERFACE_STATUS_TYPE_UP",
          },
          "air-interface-capability": {
            "transmission-mode-list": [
              {
                "transmission-mode-name": "782.1.1.15.22",
                "symbol-rate-reduction-factor": 1,
                "channel-bandwidth": 750000,
                "xpic-is-avail": true,
                "modulation-scheme-name-at-lct": "256 QAM",
                "modulation-scheme": 256,
                "code-rate": 87,
              },
              {
                "transmission-mode-name": "782.1.1.2.22",
                "symbol-rate-reduction-factor": 1,
                "channel-bandwidth": 250000,
                "xpic-is-avail": false,
                "modulation-scheme-name-at-lct": "256 QAM",
                "modulation-scheme": 256,
                "code-rate": 85,
              },
            ],
            "type-of-equipment": "UKL 501 003/21L R1A CXP9026371_3 R29E117",
          },
        },
        "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      },
    ],
    "ltp-augment-1-0:ltp-augment-pac": {
      "external-label": "External label not yet defined.",
      "original-ltp-name": "CT 1/1/1",
    },
  },
];
      const expected={
  airContainerGeneralInfo: [
    {
      mount_name: "CO12123",
      uuid: "RF-819.1.1",
      timestamp: timestamp,
      local_id: "819.1.1",
      operational_state: "core-model-1-4:OPERATIONAL_STATE_ENABLED",
      administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
      original_ltp_name: "CT 1/1/1",
      transmission_mode_min: "782.1.1.16.3",
      transmission_mode_max: "782.1.1.16.19",
      xpic_is_on: true,
      power_is_on: true,
      transmitter_is_on: true,
      interface_status: "air-interface-2-0:INTERFACE_STATUS_TYPE_UP",
      type_of_equipment: "UKL 501 003/21L R1A CXP9026371_3 R29E117",
      external_label: "External label not yet defined.",
    },
  ],
  transMissionListInfo: [
    {
      mount_name: "CO12123",
      uuid: "RF-819.1.1",
      local_id: "819.1.1",
      timestamp: timestamp,
      transmission_mode_name: "782.1.1.15.22",
      symbol_rate_reduction_factor: 1,
      channel_bandwidth: 750000,
      modulation_scheme_at_lct: "256 QAM",
      modulation_scheme: 256,
      code_rate: 87,
      xpic_is_avail: true,
      capa_factor: 453913.0434782609,
    },
    {
      mount_name: "CO12123",
      uuid: "RF-819.1.1",
      local_id: "819.1.1",
      timestamp: timestamp,
      transmission_mode_name: "782.1.1.2.22",
      symbol_rate_reduction_factor: 1,
      channel_bandwidth: 250000,
      modulation_scheme_at_lct: "256 QAM",
      modulation_scheme: 256,
      code_rate: 85,
      xpic_is_avail: false,
      capa_factor: 147826.08695652176,
    },
  ],
};
    const result = await extractAirContainerGeneralInfoAndTransmissionInfo(input, mountName, timestamp);


    expect(result).toEqual(expected);
  });

  it("should return empty arrays when input is empty", async () => {
    const result = await extractAirContainerGeneralInfoAndTransmissionInfo([], mountName, timestamp);
    expect(result).toEqual({
      airContainerGeneralInfo: [],
      transMissionListInfo: []
    });
  });

  it("should handle missing air-interface-pac properties", async () => {
  const input = [
    {
      uuid: "RF-819.1.1",
      "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
      "layer-protocol": [
        {
          "local-id": "819.1.1",
          "air-interface-2-0:air-interface-pac": {
            // Missing configuration and status
            "air-interface-capability": {
              "type-of-equipment": "UKL 501 003/21L R1A CXP9026371_3 R29E117",
            },
          },
          "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        },
      ],
      "ltp-augment-1-0:ltp-augment-pac": {
        "external-label": "External label not yet defined.",
        "original-ltp-name": "CT 1/1/1",
      },
    },
  ];

  const expected = {
    airContainerGeneralInfo: [
      {
        mount_name: "CO12123",
        uuid: "RF-819.1.1",
        timestamp: timestamp,
        local_id: "819.1.1",
        operational_state: "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
        original_ltp_name: "CT 1/1/1",
        type_of_equipment: "UKL 501 003/21L R1A CXP9026371_3 R29E117",
        external_label: "External label not yet defined.",
      },
    ],
    transMissionListInfo: [],
  };

  const result = await extractAirContainerGeneralInfoAndTransmissionInfo(input, mountName, timestamp);
  expect(result).toEqual(expected);
});

  it("should handle missing transmission-mode-list", async () => {
    const input = [
      {
        uuid: "RF-819.1.1",
        "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
        "layer-protocol": [
          {
            "local-id": "819.1.1",
            "air-interface-2-0:air-interface-pac": {
              "air-interface-configuration": {
                "transmission-mode-min": "782.1.1.16.3",
                "transmitter-is-on": true,
              },
              "air-interface-status": {
                "interface-status": "air-interface-2-0:INTERFACE_STATUS_TYPE_UP",
              },
              "air-interface-capability": {
                // Missing transmission-mode-list
                "type-of-equipment": "UKL 501 003/21L R1A CXP9026371_3 R29E117",
              },
            },
            "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
          },
        ],
      },
    ];

    const expected = {
      airContainerGeneralInfo: [
        {
          mount_name: "CO12123",
          uuid: "RF-819.1.1",
          timestamp: timestamp,
          local_id: "819.1.1",
          operational_state: "core-model-1-4:OPERATIONAL_STATE_ENABLED",
          administrative_state: "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED",
          transmission_mode_min: "782.1.1.16.3",
          transmitter_is_on: true,
          interface_status: "air-interface-2-0:INTERFACE_STATUS_TYPE_UP",
          type_of_equipment: "UKL 501 003/21L R1A CXP9026371_3 R29E117",
        },
      ],
      transMissionListInfo: [],
    };
    const result = await extractAirContainerGeneralInfoAndTransmissionInfo(input, mountName, timestamp);
    expect(result).toEqual(expected);
  });
});

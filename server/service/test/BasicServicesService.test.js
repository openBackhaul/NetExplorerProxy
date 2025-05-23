// Import Jest's mocking utilities
const rewire = require('rewire');

// Rewire the module to access private functions
const basicServicesService = rewire('../BasicServicesService');
const extractEthernetContainerInfo = basicServicesService.__get__('extractEthernetContainerInfo');
const  extractGeneralInfo  = basicServicesService.__get__('extractGeneralInfo');
// Mock the onfAttributes constant
const onfAttributes = {
  LOGICAL_TERMINATION_POINT: {
    LAYER_PROTOCOL: 'layer-protocol'
  },
  GLOBAL_CLASS: {
    UUID: 'uuid'
  },
  LOCAL_CLASS: {
    LOCAL_ID: 'local-id'
  },
  OPERATION_CLIENT: {
    OPERATIONAL_STATE: 'operational-state'
  }
};

// Mock the ETHERNET_INTERFACE constant
const ETHERNET_INTERFACE = {
  CONFIGURATION: 'ethernet-container-configuration',
  STATUS: 'ethernet-container-status'
};

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

              const expected = {
                                mount_name: "CO12123",
                                timestamp: timestamp,
                                external_label: "ML6352_ODUC",
                                device_model_name: "MINI-LINK 6352",
                                system_name: "ML6352_ODUC",
                              };

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
              expect(result).toEqual({
                mount_name: mountName,
                timestamp: timestamp,
                device_model_name: "MINI-LINK 6352",
                external_label: "ML6352_ODUC"
              });
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
              expect(result).toEqual({
                mount_name: mountName,
                timestamp: timestamp,
                system_name: "ML6352_ODUC"
              });
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
              expect(result).toEqual({
                mount_name: mountName,
                timestamp: timestamp
              });
            });

            it("should return empty object with only mount_name and timestamp when input is empty", async () => {
              const result = await extractGeneralInfo({}, mountName, timestamp);
              expect(result).toEqual({
                mount_name: mountName,
                timestamp: timestamp
              });
            });

            it("should return empty object with only mount_name and timestamp when input is null", async () => {
              const result = await extractGeneralInfo(null, mountName, timestamp);
              expect(result).toEqual({
                mount_name: mountName,
                timestamp: timestamp
              });
            });
          });

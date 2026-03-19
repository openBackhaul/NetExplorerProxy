/**
 * Mock Helper Utilities
 * 
 * Provides utilities for:
 * - Creating mock MWDI responses
 * - Mocking external service calls
 * - Creating test fixtures
 */

/**
 * Create mock MWDI device list response
 * @param {Array<string>} mountNames - Array of device mount names
 * @returns {Object} Mock response
 */
function createMockDeviceListResponse(mountNames = ['device-1', 'device-2']) {
  return {
    message: {
      'mount-name-list': mountNames
    }
  };
}

/**
 * Create empty MWDI device list response
 * @returns {Object} Mock response
 */
function createEmptyDeviceListResponse() {
  return {
    message: {
      'mount-name-list': []
    }
  };
}

/**
 * Create mock control construct (CC) response for a device
 * @param {string} mountName - Device mount name
 * @param {Object} options - Additional options
 * @returns {Object} Mock CC response
 */
function createMockControlConstruct(mountName, options = {}) {
  const {
    deviceModelName = 'Test-Model-X',
    externalLabel = `Label-${mountName}`,
    systemName = `System-${mountName}`,
    hasWireInterfaces = true,
    hasAirInterfaces = true,
    hasEquipment = true,
    hasEthernetContainers = true
  } = options;

  const cc = {
    'core-model-1-4:control-construct': [
      {
        'equipment-augment-1-0:control-construct-pac': {
          'device-model-name': deviceModelName,
          'external-label': externalLabel
        },
        'equipment-augment-1-0:protocol-collection': {
          protocol: [
            {
              'lldp-1-0:lldp-pac': {
                'local-system-data': {
                  'system-name': systemName
                }
              }
            }
          ]
        },
        'logical-termination-point': []
      }
    ]
  };

  // Add wire interfaces
  if (hasWireInterfaces) {
    cc['core-model-1-4:control-construct'][0]['logical-termination-point'].push(
      createMockWireInterface(mountName, 'wire-uuid-1', 0),
      createMockWireInterface(mountName, 'wire-uuid-2', 1)
    );
  }

  // Add air interfaces
  if (hasAirInterfaces) {
    cc['core-model-1-4:control-construct'][0]['logical-termination-point'].push(
      createMockAirInterface(mountName, 'air-uuid-1', 0),
      createMockAirInterface(mountName, 'air-uuid-2', 1)
    );
  }

  // Add ethernet containers
  if (hasEthernetContainers) {
    cc['core-model-1-4:control-construct'][0]['logical-termination-point'].push(
      createMockEthernetContainer(mountName, 'eth-uuid-1', 0)
    );
  }

  // Add equipment
  if (hasEquipment) {
    cc['core-model-1-4:control-construct'][0]['equipment'] = [
      createMockEquipment(mountName, 'eq-uuid-1', 0),
      createMockEquipment(mountName, 'eq-uuid-2', 1)
    ];
  }

  return cc;
}

/**
 * Create mock wire interface LTP
 */
function createMockWireInterface(mountName, uuid, index) {
  return {
    uuid: uuid,
    'operational-state': 'ENABLED',
    'ltp-augment-1-0:ltp-augment-pac': {
      'original-ltp-name': `wire-ltp-${index}`,
      'external-label': `Wire-${index}`
    },
    'layer-protocol': [
      {
        'local-id': `wire-lp-${index}`,
        'administrative-state': 'UNLOCKED',
        'wire-interface-2-0:wire-interface-pac': {
          'wire-interface-configuration': {
            'interface-name': `eth${index}`,
            'fixed-pmd-kind': '1000BASE-T'
          },
          'wire-interface-status': {
            'interface-status': 'UP',
            'pmd-kind-cur': '1000BASE-T',
            'pmd-name': 'Ethernet',
            duplex: 'FULL',
            speed: '1000'
          }
        }
      }
    ]
  };
}

/**
 * Create mock air interface LTP
 */
function createMockAirInterface(mountName, uuid, index) {
  return {
    uuid: uuid,
    'operational-state': 'ENABLED',
    'ltp-augment-1-0:ltp-augment-pac': {
      'original-ltp-name': `air-ltp-${index}`,
      'external-label': `Air-${index}`
    },
    'layer-protocol': [
      {
        'local-id': `air-lp-${index}`,
        'administrative-state': 'UNLOCKED',
        'air-interface-2-0:air-interface-pac': {
          'air-interface-configuration': {
            'transmission-mode-min': 'QAM-16',
            'transmission-mode-max': 'QAM-256'
          },
          'air-interface-status': {
            'xpic-is-on': true,
            'power-is-on': true,
            'transmitter-is-on': true,
            'interface-status': 'UP',
            'type-of-equipment': 'ODU'
          }
        }
      }
    ]
  };
}

/**
 * Create mock ethernet container LTP
 */
function createMockEthernetContainer(mountName, uuid, index) {
  return {
    uuid: uuid,
    'operational-state': 'ENABLED',
    'ltp-augment-1-0:ltp-augment-pac': {
      'original-ltp-name': `eth-cont-${index}`,
      'external-label': `EthCont-${index}`
    },
    'layer-protocol': [
      {
        'local-id': `eth-lp-${index}`,
        'administrative-state': 'UNLOCKED',
        'ethernet-container-2-0:ethernet-container-pac': {
          'ethernet-container-configuration': {
            'interface-name': `eth-cont-${index}`
          }
        }
      }
    ]
  };
}

/**
 * Create mock equipment
 */
function createMockEquipment(mountName, uuid, index) {
  return {
    uuid: uuid,
    'local-id': `eq-${index}`,
    'manufactured-thing': {
      'manufacturer-name': 'Test Manufacturer',
      'manufacturer-identifier': 'TM-001',
      'equipment-type': {
        version: 'v1.0',
        description: `Test Equipment ${index}`,
        'model-identifier': `MODEL-${index}`,
        'part-type-identifier': `PART-${index}`,
        'type-name': `Equipment-Type-${index}`
      }
    }
  };
}

/**
 * Create mock for MWDI service call
 * @param {jest.Mock} mockFn - Jest mock function
 * @param {Array<string>} mountNames - Mount names to return
 */
function mockMWDIDeviceList(mockFn, mountNames = ['device-1', 'device-2']) {
  mockFn.mockResolvedValue(createMockDeviceListResponse(mountNames));
}

/**
 * Create mock for MWDI control construct call
 * @param {jest.Mock} mockFn - Jest mock function
 * @param {string} mountName - Mount name
 * @param {Object} options - CC options
 */
function mockMWDIControlConstruct(mockFn, mountName, options = {}) {
  mockFn.mockResolvedValue(createMockControlConstruct(mountName, options));
}

/**
 * Create mock for failed MWDI call
 * @param {jest.Mock} mockFn - Jest mock function
 * @param {string} errorMessage - Error message
 */
function mockMWDIError(mockFn, errorMessage = 'MWDI service unavailable') {
  mockFn.mockRejectedValue(new Error(errorMessage));
}

/**
 * Verify mock was called with expected parameters
 * @param {jest.Mock} mockFn - Jest mock function
 * @param {Object} expectedParams - Expected parameters
 */
function verifyMockCalledWith(mockFn, expectedParams) {
  const calls = mockFn.mock.calls;
  const found = calls.some(call => {
    return Object.entries(expectedParams).every(([key, value]) => {
      return call[0] && call[0][key] === value;
    });
  });

  if (!found) {
    throw new Error(
      `Mock was not called with expected parameters: ${JSON.stringify(expectedParams)}\n` +
      `Actual calls: ${JSON.stringify(calls)}`
    );
  }
}

/**
 * Create comprehensive mock data set for testing
 * @param {number} deviceCount - Number of devices
 * @returns {Object} Complete mock dataset
 */
function createMockDataset(deviceCount = 2) {
  const mountNames = Array.from({ length: deviceCount }, (_, i) => `device-${i + 1}`);
  
  const deviceList = createMockDeviceListResponse(mountNames);
  
  const controlConstructs = {};
  mountNames.forEach(mountName => {
    controlConstructs[mountName] = createMockControlConstruct(mountName);
  });

  return {
    deviceList,
    controlConstructs,
    mountNames
  };
}

/**
 * Create mock database record for testing
 * @param {string} tableName - Table name
 * @param {Object} overrides - Field overrides
 * @returns {Object} Mock record
 */
function createMockDatabaseRecord(tableName, overrides = {}) {
  const baseRecords = {
    devices_general_info: {
      'mount-name': 'test-device',
      'timestamp': new Date(),
      'external-label': 'Test Label',
      'device-model-name': 'Test Model',
      'system-name': 'Test System'
    },
    wire_interface_general_info: {
      'mount-name': 'test-device',
      'uuid': 'wire-uuid-1',
      'local-id': 'wire-lp-1',
      'timestamp': new Date(),
      'operational-state': 'ENABLED',
      'administrative-state': 'UNLOCKED',
      'original-ltp-name': 'wire-ltp-1',
      'interface-name': 'eth0',
      'fixed-pmd-kind': '1000BASE-T',
      'interface-status': 'UP',
      'pmd-kind-cur': '1000BASE-T',
      'pmd-name': 'Ethernet',
      'duplex': 'FULL',
      'speed': '1000'
    },
    air_interface_general_info: {
      'mount-name': 'test-device',
      'uuid': 'air-uuid-1',
      'local-id': 'air-lp-1',
      'timestamp': new Date(),
      'operational-state': 'ENABLED',
      'administrative-state': 'UNLOCKED',
      'original-ltp-name': 'air-ltp-1',
      'external-label': 'Air-1',
      'transmission-mode-min': 'QAM-16',
      'transmission-mode-max': 'QAM-256',
      'xpic-is-on': true,
      'power-is-on': true,
      'transmitter-is-on': true,
      'interface-status': 'UP',
      'type-of-equipment': 'ODU'
    },
    equipment_general_info: {
      'mount-name': 'test-device',
      'uuid': 'eq-uuid-1',
      'local-id': 'eq-1',
      'timestamp': new Date(),
      'version': 'v1.0',
      'description': 'Test Equipment',
      'model-identifier': 'MODEL-1',
      'part-type-identifier': 'PART-1',
      'type-name': 'Equipment-Type-1',
      'manufacturer-name': 'Test Manufacturer',
      'manufacturer-identifier': 'TM-001'
    }
  };

  const base = baseRecords[tableName] || {};
  return { ...base, ...overrides };
}

module.exports = {
  createMockDeviceListResponse,
  createEmptyDeviceListResponse,
  createMockControlConstruct,
  createMockWireInterface,
  createMockAirInterface,
  createMockEthernetContainer,
  createMockEquipment,
  mockMWDIDeviceList,
  mockMWDIControlConstruct,
  mockMWDIError,
  verifyMockCalledWith,
  createMockDataset,
  createMockDatabaseRecord
};

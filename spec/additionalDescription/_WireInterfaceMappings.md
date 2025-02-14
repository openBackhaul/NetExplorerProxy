# Wire Interface Data Output Mapping

This document describes how the wire interface data shall be mapped from cached data into the required output formats.  
Data provisioning to Netexplorer will be split across several services.

### General information
- The data will shall provided in csv format, with a header line
  - therefore, data will be flattened
- The service will return data for all devices, not just for a single device
  - optional filtering for a list of specific devices, will be supported via a related requestBody parameter

### Mappings

A single service for delivering wire interface data is sufficient. (However, capability information could have also been delivered by a separate service to reduce data overhead. In case it is observed that there will be much overhead, the split can be done as part of a future release.)  
*Note that wire interface data is complemented by additional information from the equipment section of ControlConstruct data. The related service will be described in the EquipmentMappings document.*

#### 1. General interface information

Related service: */v1/provide-wire-interface-general-information-of-devices*  

The following data for all (target) devices should be gathered into the following columns:
- general information:
  - `mount-name`
  - `uuid`: *logical-termination-point/uuid*
  - `operational-state`: *logical-termination-point/operational-state*
  - `local-id`: *logical-termination-point/layer-protocol/uuid*
  - `timestamp`: the timestamp from when the data was gathered by the cyclic process and written to NEP cache. It just needs to be by a single of the services mentioned in this document.
  - `administrative-state`: *logical-termination-point/layer-protocol/administrative-state*
  - `original-ltp-name`: related *ltp-augment-1-0:ltp-augment-pac/original-ltp-name*
- from *wire-interface-configuration*:
  - `interface-name`
  - `fixed-pmd-kind`
- from *wire-interface-status*:
  - `interface-status`: provide without the substring "wire-interface-2-0:INTERFACE_STATUS_TYPE_"
  - `pmd-kind-cur`
- from *wire-interface-capability/supported-pmd-kind-list*:
  - `pmd-name`
  - `duplex`: the duplex mode without substring "wire-interface-2-0:DUPLEX_TYPE_"
  - `speed`

Note that there shall be a single line for each record in *wire-interface-capability/supported-pmd-kind-list*

See example for 100250001:
```
{
  "uuid": "ETY-2134639491",
  "operational-state": "core-model-1-4:OPERATIONAL_STATE_DISABLED",
  "layer-protocol": [
      {
          "local-id": "2134639491",
          "wire-interface-2-0:wire-interface-pac": {
              "wire-interface-status": {
                  "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN",
                  "pmd-kind-cur": "1000BASE_FD"
              },
              "wire-interface-configuration": {
                  "interface-name": "VendorX interfaceName",
                  "fixed-pmd-kind": "1000BASE_FD"
              },
              "wire-interface-capability": {
                  "supported-pmd-kind-list": [
                      {
                        "pmd-name": "NOT_YET_DEFINED",
                        "duplex": "wire-interface-2-0:DUPLEX_TYPE_NOT_YET_DEFINED",
                        "speed": "NOT_YET_DEFINED"
                      },
                      {
                        "pmd-name": "1000BASE_FD",
                        "duplex": "wire-interface-2-0:DUPLEX_TYPE_FULL_DUPLEX",
                        "speed": "1000Mbit/s"
                    }
                  ]
              }
          },
          "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED"
      }
  ],
  "ltp-augment-1-0:ltp-augment-pac": {
      "original-ltp-name": "LAN 1/7/3"
  }
},
```

Compiled response data:  
```
mount-name;uuid;operational-state;local-id;timestamp;administrative-state;original-ltp-name;interface-name;fixed-pmd-kind;interface-status;pmd-kind-cur;pmd-name;duplex;speed
100250001;ETY-2134639491;core-model-1-4:OPERATIONAL_STATE_DISABLED;2134639491;2024-12-11T16:00:00+01:00;core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED;LAN 1/7/3;VendorX interfaceName;1000BASE_FD;DOWN;1000BASE_FD;NOT_YET_DEFINED;NOT_YET_DEFINED;NOT_YET_DEFINED;
100250001;ETY-2134639491;core-model-1-4:OPERATIONAL_STATE_DISABLED;2134639491;2024-12-11T16:00:00+01:00;core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED;LAN 1/7/3;VendorX interfaceName;1000BASE_FD;DOWN;1000BASE_FD;1000BASE_FD;FULL_DUPLEX;1000Mbit/s
```

[go up to CyclicDataRetrievalMappings](CyclicDataRetrievalProcess.md)
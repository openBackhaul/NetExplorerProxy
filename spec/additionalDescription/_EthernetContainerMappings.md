# Ethernet Container Data Output Mapping

This document describes how the ethernet container data shall be mapped from cached data into the required output format.  
Data provisioning to Netexplorer will be done only via a single services, as PM data is not included.

### General information
- The data will shall provided in csv format, with a header line
  - therefore, data will be flattened
- Each services will return data for all devices, not just for a single device
  - optional filtering for a list of specific devices, will be supported via a related requestBody parameter

### Mappings

#### 1. General interface information

Related service: */v1/provide-ethernet-container-general-information-of-devices*  

The following data for all (target) devices should be gathered into the following columns:
- general information:
  - `mount-name`
  - `uuid`: *logical-termination-point/uuid*
  - `operational-state`: *logical-termination-point/operational-state*, provide without the substring "core-model-1-4:OPERATIONAL_STATE_"
  - `local-id`: *logical-termination-point/layer-protocol/uuid*
  - `timestamp`: the timestamp from when the data was gathered by the cyclic process and written to NEP cache. It just needs to be by a single of the services mentioned in this document.
  - `administrative-state`: *logical-termination-point/layer-protocol/administrative-state*, provide without the substring "core-model-1-4:ADMINISTRATIVE_STATE_"
  - `original-ltp-name`: related *ltp-augment-1-0:ltp-augment-pac/original-ltp-name*
- from *ethernet-container-configuration*:
  - `interface-name`
  - `bundling-is-on`
- from *ethernet-container-status*
  - `interface-status`: provide without the substring "ethernet-container-2-0:INTERFACE_STATUS_TYPE_"

See example for 100250001:
```
{
  "uuid": "ETH-2134639490",
  "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
  "layer-protocol": [
      {
          "local-id": "2134639490",
          "ethernet-container-2-0:ethernet-container-pac": {
              "ethernet-container-status": {
                  "interface-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_UP"
              },
              "ethernet-container-historical-performances": {
                  ...
              },
              "ethernet-container-configuration": {
                  "interface-name": "15PN2855_M2-2",
                  "bundling-is-on": false
              }
          },
          "administrative-state": "core-model-1-4:ADMINISTRATIVE_STATE_UNLOCKED"
      }
  ],
  "ltp-augment-1-0:ltp-augment-pac": {
      "original-ltp-name": "LAN 1/7/2"
  }
},
```
Compiled response data:  
```
mount-name;uuid;operational-state;local-id;timestamp;administrative-state;original-ltp-name;interface-name;bundling-is-on;interface-status
100250001;ETH-2134639490;ENABLED;2134639490;2024-12-11T16:00:00+01:00;UNLOCKED;LAN 1/7/2;15PN2855_M2-2;false;UP
```

[go up to CyclicDataRetrievalMappings](CyclicDataRetrievalProcess.md)
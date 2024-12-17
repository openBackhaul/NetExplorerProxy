# EthernetContainer Data Output Mapping

This document describes how the ethernet container data shall be mapped from cached data into the required output formats.  
Data provisioning to Netexplorer will be split across several services.

### General information
- The data will shall provided in csv format, with a header line
  - therefore, data will be flattened
- Each services will return data for all devices, not just for a single device
  - optional filtering for a list of specific devices, will be supported via a related requestBody parameter
- Data

### Mappings

The complete set of sample data will be given a the end of the document; for better understandability, parts of the data are presented here separately.

#### 1. General interface information

Related service: */v1/provide-ethernet-container-general-information-of-devices*  

The following data for all (target) devices should be gathered into the following columns:
- general information:
  - `mount-name`
  - `uuid`: logical-termination-point/uuid
  - `operational-state`: logical-termination-point/operational-state
  - `local-id`: logical-termination-point/layer-protocol/uuid
  - `timestamp`: the timestamp from when the data was gathered by the cyclic process and written to NEP cache. It just needs to be by a single of the services mentioned in this document.
  - `administrative-state` 
  - `original-ltp-name`: related ltp-augment-1-0:ltp-augment-pac/original-ltp-name
- from ethernet-container-configuration:
  - `interface-name`
  - `bundling-is-on`
- from ethernet-container-status
  - `interface-status`: provide without the substring "ethernet-container-2-0:INTERFACE_STATUS_TYPE"

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
100250001;ETH-2134639490;core-model-1-4:OPERATIONAL_STATE_ENABLED;2134639490;LAN 1/7/2;false;UP
```

#### 2. Ethernet performance data

Related service: */v1/provide-ethernet-container-pm-data-of-devices*  

The following data for all (target) devices should be gathered into the following columns:
- general information:
  - `mount-name`
  - `uuid`
  - `local-id`
  - `period-end-time`: from ethernet-container-historical-performances/historical-performance-data-list/period-end-time
- from the historical-performance-data-list/performance-data for the given period-end-time
  - `total-bytes-input`
  - `total-bytes-output`
  - `total-frames-input`
  - `total-frames-output`
  - `errored-frames-input`
  - `errored-frames-output`
  - `dropped-frames-input`
  - `dropped-frames-output`

See example for device 100250001:
```
{
  "uuid": "ETH-2134639490",
  "operational-state": "core-model-1-4:OPERATIONAL_STATE_ENABLED",
  "layer-protocol": [
      {
          "local-id": "2134639490",
          "ethernet-container-2-0:ethernet-container-pac": {
              ...
              "ethernet-container-historical-performances": {
                  "historical-performance-data-list": [
                      {
                          "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
                          "period-end-time": "2024-12-10T08:30:00+01:00",
                          "performance-data": {
                              "total-frames-input": "-1",
                              "total-bytes-input": "74054",
                              "total-bytes-output": "17333",
                              "total-frames-output": "-1",
                              "errored-frames-input": 0,
                              "dropped-frames-input": 899,
                              "dropped-frames-output": 0,
                              "errored-frames-output": 0
                          },
                          "history-data-id": "History Data ID not defined."
                      },
                      {
                          "granularity-period": "ethernet-container-2-0:GRANULARITY_PERIOD_TYPE_PERIOD-15-MIN",
                          "period-end-time": "2024-12-10T07:45:00+01:00",
                          "performance-data": {
                              "total-frames-input": "-1",
                              "total-bytes-input": "73444",
                              "total-bytes-output": "16016",
                              "total-frames-output": "-1",
                              "errored-frames-input": 0,
                              "dropped-frames-input": 899,
                              "dropped-frames-output": 0,
                              "errored-frames-output": 0
                          },
                          "history-data-id": "History Data ID not defined."
                      }
                  ]
              },
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
mount-name;uuid;local-id;period-end-time;total-bytes-input;total-bytes-output;total-frames-input;total-frames-output;errored-frames-input;errored-frames-output;dropped-frames-input;dropped-frames-output
100250001;ETH-2134639490;2134639490;2024-12-10T08:30:00+01:00;74054;17333;-1;-1;899;0;0;0
100250001;ETH-2134639490;2134639490;2024-12-10T07:45:00+01:00;73444;16016;-1;-1;899;0;0;0
```

[go up to CyclicDataRetrievalMappings](./CyclicDataRetrievalMappings.md)
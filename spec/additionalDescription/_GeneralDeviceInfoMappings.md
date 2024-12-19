# General Device Data Output Mapping

This document describes how the general device information shall be mapped from cached data into the required output formats.

### General information
- The data will shall provided in csv format, with a header line
  - therefore, data will be flattened
- The service will return data for all devices, not just for a single device
  - optional filtering for a list of specific devices, will be supported via a related requestBody parameter

### Mappings

#### 1. General interface information

Related service: */v1/provide-general-information-of-devices*  

The following data for all (target) devices should be gathered into the following columns:

- general information:
  - `mount-name`
  - `timestamp`: the timestamp from when the data was gathered by the cyclic process and written to NEP cache.
- from *core-model-1-4:control-construct/equipment-augment-1-0:control-construct-pac*:
  - `external-label`: if set correctly, should be the same as the mount-name
  - `device-model-name`
- from *core-model-1-4:control-construct/equipment-augment-1-0:protocol-collection*
  - `system-name`: from *protocol/lldp-1-0:lldp-pac/local-system-data* (in case there are multiple lldp-pacs, there shall be a separate record line in the output for each lldp-pac/system-name)

Note:  
- not all properties might be present for all data blocks; if this is the case leave the respective value in the output blank

---  

See example for two devices:  
Sample device 100254566:
```
{
  "core-model-1-4:control-construct": {
      "equipment-augment-1-0:control-construct-pac": {
          "external-label": "100254566",
          "device-model-name": "OptiXRTN950"
      },
      "equipment-augment-1-0:protocol-collection": {
          "protocol": [
              {
                  "uuid": "PC-LLDP-0",
                  "lldp-1-0:lldp-pac": {
                      "local-system-data": {
                          "system-name": "System xyz"
                      }
                  }
              }
          ]
      }
  }
}
```

Sample device 200259999:
```
{
  "core-model-1-4:control-construct": {
      "equipment-augment-1-0:control-construct-pac": {
          "external-label": "200259999",
          "device-model-name": "MINI-LINK Traffic Node"
      }
  }
}
```

Compiled response data:  
```
mount-name;timestamp;external-label;device-model-name;system-name
100254566;2024-12-11T16:00:00+01:00;100254566;OptiXRTN950;System xyz
200259999;2024-12-11T18:00:00+01:00;20025999;MINI-LINK Traffic Node
```

[go up to CyclicDataRetrievalMappings](CyclicDataRetrievalProcess.md)
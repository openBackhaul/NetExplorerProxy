
# Equipment Data Output Mapping

This document describes how the equipment data shall be mapped from cached data into the required output formats.  
Data provisioning to Netexplorer will be split across several services.

### General information
- The data will shall provided in csv format, with a header line
  - therefore, data will be flattened
- The will return data for all devices, not just for a single device
  - optional filtering for a list of specific devices, will be supported via a related requestBody parameter

### Mappings

#### 1. Relevant equipment info

Related service: */v1/provide-actual-equipment-information-of-devices*  

The following data for all (target) devices should be gathered into the following columns:

- general information:
  - `mount-name`
  - `uuid`: equipment/uuid
  - `local-id`: equipment/local-id
  - `timestamp`: the timestamp from when the data was gathered by the cyclic process and written to NEP cache.
- from equipment/actual-equipment/manufactured-thing:
  - `version`
  - `description`
  - `model-identifier`
  - `part-type-identifier`
  - `type-name`
- from equipment/actual-equipment/manufacturer-properties
  - `manufacturer-name`
  - `manufacturer-identifier`

Note:  
- equipment records shall be filtered for those, which contain an actual-equipment block
- not all properties might be present for all data blocks; if this is the case leave the respective value in the output blank

---  

See example for two devices:  
Example for device 100250001
```
"equipment": [
  {
      "uuid": "1921273855"
  },
  {
      "uuid": "1921282559",
      "actual-equipment": {
          "manufactured-thing": {
              "equipment-type": {
                  "version": "R1C",
                  "description": "Removable Memory Module",
                  "model-identifier": "RMM",
                  "part-type-identifier": "RYS 110 243/1",
                  "type-name": "RMM"
              },
              "manufacturer-properties": {
                  "manufacturer-name": "Ericsson"
              }
          }
      }
  }
]
```
Example for device 200251234
```
"equipment": [
    {
        "uuid": "LAN-1 SFP",
        "local-id": "LAN-1 SFP",
        "actual-equipment": {
            "manufactured-thing": {
                "equipment-type": {
                    "version": "V2.0",
                    "description": "SFP module in LAN-1 SFP connector",
                    "model-identifier": "Generic",
                    "part-type-identifier": "AXGD-1354-0533",
                    "type-name": "SFP module"
                },
                "manufacturer-properties": {
                    "manufacturer-name": "Axcen Photonics",
                    "manufacturer-identifier": ""
                }
            }
        }
    },
    {
        "uuid": "XGLAN-2 SFP",
        "local-id": "XGLAN-2 SFP"
    }
]
```

Compiled response data:  
```
mount-name;uuid;local-id;timestamp;version;description;model-identifier;part-type-identifier;type-name;manufacturer-name;manufacturer-identifier
100250001;1921282559;;2024-12-11T16:00:00+01:00;R1C;Removable Memory Module;RRM;RYS 110 243/1;RRM;Ericsson;;
200251234;LAN-1 SFP;LAN-1 SFP;2024-12-11T16:00:00+01:00;V2.0;SFP module in LAN-1 SFP connector;Generic;AXGD-1354-0533;SFP module;Axcen Photonics;;
```
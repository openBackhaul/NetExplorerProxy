# LTP-Equipment Mappings

This document describes how information for mapping LTPs and equipment shall be composed from the cached data into required output formats.

### General information
- The data will shall provided in csv format, with a header line
  - therefore, data will be flattened
- The service will return data for all devices, not just for a single device
- Note that the NEP does not keep all interfaces in its cache:
  - NEP also provides MAC interface information, but this information is retrieved on demand from MacAddressTableRecorder and *not* stored in the NEP cache
  - from the retrieved and filtered ControlConstruct data is only kept for air-interface, ethernet-container and wire-interface 

### Mappings

#### 1. Interface information

Related service: */v1/provide-ltp-equipment-mappings*  

The following data for all devices should be gathered into the following columns:

- from *generalDeviceInfo* (1):
  - `mount-name`
  - `timestamp`: the timestamp from when the data was gathered by the cyclic process and written to NEP cache.
- from *ltpAugment* (2):
  - `uuid`: this is the *logical-termination-point/uuid*
  - `connector`: this is the value from *ltp-augment-1-0:ltp-augment-pac/connector-identifier*
    - not every ltpAugment contains this attribute; in such cases leave the output field empty
    - connectorIdentifier contains the localId as a substing inside a path, the localId must be extracted from that path
  - `equipment`: this is the value is to be extracted from *ltp-augment-1-0:ltp-augment-pac/equipment-identifier*
    - equipmentIdentifier is an array, if the attribute contains multiple array items, the values shall be delimited by "|"
    - equipmentIdentifier contains the uuid as a substring inside a path, the uuid must be extracted from that path

**LtpAugment connector and equipment ID extraction**  
The equipmentIdentifier contains the equipment uuids in a path format, the uuid must be extracted from it.
The connectorIdentifier contains the connector localId in a path format, the local-id must be extracted from it.

E.g. from
```
  (1)
  "equipment-identifier": [
      "/core-model-1-4:control-construct/equipment[uuid='CTRL IduBoard Xpic 32E1']"
  ],
  (2)
  "connector-identifier": "/core-model-1-4:control-construct/equipment[uuid='CTRL IduBoard Xpic 32E1']/connector[local-id='LAN-2-RJ45-Connector']"
```
The equipment uuid must be extracted from (1) as "CTRL IduBoard Xpic 32E1".
The connector localId must be extracted from (2) as "LAN-2-RJ45-Connector"

Note:  
- for (1) see description of service [*/v1/provide-general-information-of-devices*](./_GeneralDeviceInfoMappings.md)
- for (2):
  - data for connector and equipment are stored only, if the layer-protocol belonging to the same LTP as the respective LtpAugment is one of the following: AirInterface, EthernetContainer, WireInterface

---  

Data is not to be taken from the filtered ControlConstruct data, but from the NEP cache. The following sample shows an examplary output.  

```
mount-name;timestamp;uuid;connector;equipment
100250001;2024-12-11T16:00:00+01:00;RF-123456789;819.1.1;SLOT-1
100250001;2024-12-11T16:00:00+01:00;RF-234234234;234234234;SLOT-2|xyz
200250003;2024-12-11T18:00:00+01:00;ltpB-1;86.1.4;SFP-1.4
```


[go up to CyclicDataRetrievalMappings](CyclicDataRetrievalProcess.md)
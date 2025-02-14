# Cyclic process for updating NEP cache by fetching device data from MWDI

The NetExplorerProxy will maintain an own deviceList and retrieve filtered ControlConstruct data from the MWDI periodically.

### Maintaining the deviceList and caching data  
- The NEP will periodically retrieve the list of all connected devices from the MWDI.
  - if there are new devices in the MWDI deviceList, which are not yet included in the NEP deviceList, those devices will be added to the NEP deviceList
  - devices which are no longer in connected state on the Controller, will also no longer be included in the MWDI deviceList, but those shall be kept in the NEP deviceList for a configurable retention period (*dataRetention*). This shall minimize data loss in case of devices which are disconnected, but become connected again shortly after.
- For each device in the NEP deviceList, filtered ControlConstruct data is queried from MWDI periodically and written to the NEP cache
  - the data is kept for a configurable amount of time (*dataRetention*), after that time has passed, old data is deleted
  - note on historical performances data: 
    - NEP will not retieve historical-performances data from MWDI. PM data will be included in a future NEP release and be fetched from a new PM data application (not yet specified).
    - Some devices can only store data for up to 8 hours, i.e. MWDI will only have 8 hours of PM data in its cache for those devices. If NEP were to also fetch PM data from MWDI, the periodic retrieval would have been required to be done multiple times a day per device. Without the PM data, however, one periodic retrieval of device data per day will suffice (however depending on the sliding window, this can happen more often)

---  

### Data retrieval interval  
The ControlConstruct data to be retrieved does not contain historical performances.  
Some device types only store historical performance data for the last 8 hours. Therefore, if PM data were to be fetched here too, it would need to be fetched from the MWDI before the data is overwritten in MWDI. But as PM data will be retrieved from a dedicated PM data application (still to be specified) in a future NEP release, it suffices to update the device data less often (still at least once a day).  

The retrieval interval is determined by the sliding window size. If new devices are added to the NEP deviceList, they are to queried with priority.

In case the data retrieval from MWDI fails for a device, retrieval retries shall be applied under consideration of the related retry profileInstances.

#### Consideration of notifications
MWDI offers notifications about device status changes and changes to stored ControlConstruct data.  
However, for this NEP release updates due to notifications are out of scope.  

---  

### Relevant profileInstances

The profileInstances directly relevant to the cyclic data retrieval process are listed below.

- `EmbeddingCausesRequestForDeviceDataFromMwdi`
  - the fields filter is to be applied to the ControlConstruct request to MWDI
- `slidingWindowSize`
- `responseTimeout`
- `maximumNumberOfRetries`
- `waitingTimeBeforeRetry`
- `deviceListSyncPeriod`
- `dataRetention`
  - the number of days for which old data shall be kept in NEP cache, before it is deleted
  - also determines how long devices are kept in the NEP cache once they are no longer in connected state
  - it is sufficient to delete on day granularity

---  

### Additional filtering off retrieved data
When ControlConstruct data is retrieved from MWDI a fields filter is applied.
As the fields filter can be just applied to properties but not properties values, some unneeded data will be retrieved by that. This data can be deleted from the retrieved data, before it it written to the NEP cache.

#### AirInterface capability: transmission-mode-list
The information from transmission-mode-list is required by Netexplorer for capacity computation.  
The list can get fairly big, but not all of its entries may contain useful information.  

I.e. all entries where the core-rate is -1 can be filtered out beforehand.  
See the following example:  
```
"air-interface-capability": {
    "transmission-mode-list": [
        {   # this one is to be kept
            "transmission-mode-name": "1360-56000-2048-Std",
            "symbol-rate-reduction-factor": 1,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "modulation-scheme-name-at-lct": "2048 QAM",
            "modulation-scheme": 2048,
            "code-rate": 96
        },
        {   # this one is to be filtered out
            "transmission-mode-name": "1359-40000-2048-Light",
            "symbol-rate-reduction-factor": 1,
            "channel-bandwidth": 56000,
            "xpic-is-avail": true,
            "modulation-scheme-name-at-lct": "2048 QAM Light",
            "modulation-scheme": 2048,
            "code-rate": -1
        }
    ]
}
```

#### Ltp blocks
The logical-termination-point list contains lots of ltps, for which no data is to be extracted. Those can be filtered out.
I.e. only keep blocks which are related to one of the following interfaces:
- air-interface 
- ethernet-container
- wire-interface

The following snippet gives an example, all blocks which are not marked as to be kept, can be filtered out.
<details>
    <summary>display example </summary>
```
{
  "core-model-1-4:control-construct": {
      "logical-termination-point": [
          {
              "uuid": "LTP-TDMCONTAINER-TTP-4-29",
              "layer-protocol": [
                  {
                      "local-id": "LP-TDMCONTAINER-TTP-4-29"
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "SL91SP3D/4/29"
              }
          },
          {
              "uuid": "LTP-MACINTERFACE-TTP-6-4",
              "layer-protocol": [
                  {
                      "local-id": "LP-MACINTERFACE-TTP-6-4"
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "SL91EM6FA/6/4"
              }
          },
          {
              "uuid": "LTP-SSMEXTCLOCK-TTP-0-240-1",
              "layer-protocol": [
                  {
                      "local-id": "LP-SSMEXTCLOCK-TTP-0-240-1"
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "CSH/0/240/1"
              }
          },
          {
              "uuid": "LTP-PURE-TTP-6-1",
              "layer-protocol": [
                  {
                      "local-id": "LP-PURE-TTP-6-1"
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "SL91EM6FA/6/1"
              }
          },
          ### keep ###
          {
              "uuid": "LTP-ETHERNETCONTAINER-TTP-6-4",
              "layer-protocol": [
                  {
                      "local-id": "LP-ETHERNETCONTAINER-TTP-6-4",
                      "ethernet-container-2-0:ethernet-container-pac": {
                          "ethernet-container-status": {
                              "interface-status": "ethernet-container-2-0:INTERFACE_STATUS_TYPE_DOWN"
                          }
                      }
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "SL91EM6FA/6/4"
              }
          },
          {
              "uuid": "LTP-TDMCONTAINER-TTP-4-32",
              "layer-protocol": [
                  {
                      "local-id": "LP-TDMCONTAINER-TTP-4-32"
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "SL91SP3D/4/32"
              }
          },
          ### keep ###
          {
              "uuid": "LTP-MWPS-TTP-1-1",
              "layer-protocol": [
                  {
                      "local-id": "LP-MWPS-TTP-1-1",
                      "air-interface-2-0:air-interface-pac": {
                          "air-interface-status": {
                              "interface-status": "air-interface-2-0:INTERFACE_STATUS_TYPE_UP"
                          }
                      }
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "SL91ISX2/1/1"
              }
          },
          ### keep ###
          {
              "uuid": "LTP-WIREINTERFACE-TTP-6-4",
              "layer-protocol": [
                  {
                      "local-id": "LP-WIREINTERFACE-TTP-6-4",
                      "wire-interface-2-0:wire-interface-pac": {
                          "wire-interface-status": {
                              "interface-status": "wire-interface-2-0:INTERFACE_STATUS_TYPE_DOWN"
                          }
                      }
                  }
              ],
              "ltp-augment-1-0:ltp-augment-pac": {
                  "original-ltp-name": "SL91EM6FA/6/4"
              }
          }
      ...
  }
}
```
</details>

### Data storage and mappings to output data

Information about gathered data
- data is gathered on device basis, i.e. separately for each device
- the data contains only non-performance data and performance data, which needs to be handled as follows:
    - if the new filtered ControlConstruct data has been obtained from MWDI for a device, all non-pm data in the NEP cache for that device is overwritten with the new set of data
    - the data shall be written to the NEP cache together with the timestamp from when the data was gathered

All data for a given device which has expired (according to *dataRetention*), shall be deleted. 
If the device is no longer in connected state and there is no data newer than the allowed data retention, the device will be deleted from NEP.

**Data storage inside NEP**  
How data will be stored internally in the NEP cache is up to the implementer, but it must be ensured that NEP provides sufficient performance. For deciding on how to store the data take the following information into consideration:
- NEP services will provide data to Netexplorer in csv format
- NEP services will not provide data per device, but each new service will provide data for all (target) devices
  - data provisioning is split logically into multiple services (e.g. provisioning of air interface data is distributed across multiple services)
  - optionally a list of device names can be provided in the requestBodies to filter output for those devices
- it might be advisable to directly store the data in a database table structure

**Data mapping**  
As data provisioning shall be distributed across multiple services for the "logical" data classes, detailed mapping descriptions can be found here:  
- [General device information](./_GeneralDeviceInfoMappings.md)
- [Air Interface](./_AirInterfaceMappings.md)
- [Ethernet Container](./_EthernetContainerMappings.md)
- [Wire Interface](./_WireInterfaceMappings.md)
- [Equipment](./_EquipmentMappings.md)

**No data found?**  
The new services will only return data that is actually found in the NEP cache.  
If no data is found, then
- the service to retrieve the list of devices in the NEP will simply return an empty list
- the services that return the csv data, will only return the respective csv header, without any data
  - this also applies in case the services are called with a list of devices the output data should be filtered for

I.e. in case there is no data found, there will be no error responses.

**Interface info per device**  
NEP also offers a service to retrieve information about which interfaces the NEP cache holds for the devices stored in the NEP cache.  
The related information are taken from cached data class information in the NEP cache.  

Detailed mapping: [InterfaceInfoPerDevice](./_InterfaceInfoPerDeviceMappings.md)  

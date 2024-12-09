# Cyclic process for updating NEP cache by fetching device data from MWDI

The NetExplorerProxy will maintain an own deviceList and retrieve filtered ControlConstruct data from the MWDI periodically.

### Maintaining the deviceList and caching data  
- The NEP will periodically retrieve the list of all connected devices from the MWDI.
  - if there are new devices in the MWDI deviceList, which are not yet included in the NEP deviceList, those devices will be added to the NEP deviceList
  - devices which are no longer in connected state on the Controller, will also no longer be included in the MWDI deviceList, but those shall be kept in the NEP deviceList for a configurable retention period. This shall minimize data loss in case of devices which are disconnected, but become connected again shortly after.
- For each device in the NEP deviceList, filtered ControlConstruct data is queried from MWDI periodically and written to the NEP cache
  - the data is kept for a configurable amount of time, after that time has passed, old data is deleted

### Data retrieval intervals  
The ControlConstruct data to be retrieved contains historical performances. Some device types only store historical performance data for the last 8 hours. Therefore, the data needs to be fetched from the MWDI before the data is overwritten.  
Therefore, the retrieval for each device should be done periodically, with a configurable interval.
To allow for performance and load balancing optimizations two retrieval interval thresholds will be specified:
- *lower threshold*: if the cached data for the given device is newer than the lower threshold, the device is skipped 
- *upper threshold*: if the cached data for the given device is older than the upper threshold, the device is queried with priority to ensure no data is lost

If there are devices with data older than the upper threshold, they shall be queried with priority. Apart from that the slidingWindow just goes over the devices in a cyclic manner and skips those, for which data is newer than configured in the lower threshold

Updates due to notifications are out of scope for this release.

## Relevant profileInstances

The profileInstances directly relevant to the cyclic data retrieval process are listed below.

- `EmbeddingCausesRequestForDeviceDataFromMwdi`
  - the fields filter is to be applied to the ControlConstruct request to MWDI
- `slidingWindowSize`
- `responseTimeout`
- `maximumNumberOfRetries`
- `deviceListSyncPeriod`
- `ccRetrievalMinThresholdTime`
  - the lower threshold (hours)
- `ccRetrievalMaxThresholdTime`
  - the upper threshold (hours)
- `dataRetention`
  - the number of days for which old data shall be kept in NEP cache, before it is deleted
  - it is sufficient to delete on day granularity
- `deviceRetention`
  - the number of days devices which are no longer connected are kept in the NEP deviceList before they are deleted

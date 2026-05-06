# NetExplorerProxy
Interface towards the NetExplorer

### Location
The NetExplorerProxy (NEP) represents the demarcation towards the out-of-sdn-domain application NetExplorer.  

### Description
In principle, the NetExplorerProxy is a passthrough of data from the MWDI (MicroWaveDeviceInventory) and the MATR (MacAddressTableRecorder).  

### Latest Update

#### v1.2.2

This release udpates the input source for /v1/provide-ltp-equipment-mappings data.
This service was added in 1.2.0_spec with ltpAugment::equipment and ltpAugment::connector being the input source for related equipment uuids and connector localIds.
These attributes have been marked as deprecated and therefore should no longer be used.
This release instead uses ltpAugment::equipmentIdentifier and ltpAugment::connectorIdentifier information (IDs have to be extracted).

See related issue collection [NEP v1.2.2_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/13).  

Note: a small bugfix for #337 has been added to develop for release v1.2.2 spec, but not yet been merged to main (would require re-issue of 1.2.2_spec release).

#### v1.2.1

This release adds updates for findings in v1.2.0_spec.  
This includes the following changes:  
- introduction of waitingTime between two ControlConstruct retrievals by slidingWindow (integerProfile)

See related issue collection [NEP v1.2.1_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/10).  

#### v1.2.0

This release adds the following changes:  
- Adds service for providing information about mapping between LTPs and equipment: */v1/provide-ltp-equipment-mappings*.
- Sets /v1/provide-list-of-connected-devices to deprecated
  - in the future this service shall no longer be served by MWDI, but by CDM
  - with introduction of API gateway, the service can be exposed to customers directly from the related CDM path
- Changes cyclic data retrieval to use MWDI://v1/provide-list-of-cached-devices instead of MWDI://v1/provide-list-of-connected-devices to retrieve the list of relevant devices from MWDI
- Updates testcase collection

See related issue collection [NEP v1.2.0_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/9?closed=1).  

#### v1.1.1
Fixes findings from 1.1.0, see related issue collection [NEP v1.1.1_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/7).  

#### v1.1.0: additional device data
With v1.0.0 additional data shall be provided:  
  - general device and interface information, including linkbundling information
  - sfp data (wire-interface)
  
For this release, the NEP shall fetch the required data into its cache in periodic intervals.  
All requests from Netexplorer, not related to Mac address data, shall be served using this cached data only,  
i.e. there will be no retrieval of data on demand.

*Scope*
- Note: sync data has been requested by Netexplorer team, but sync data offered by SDN is not what is needed by Netexplorer and, therefore, sync is out of scope.
- updates due to notifications from MWDI are out of scope for this release
- PM data provisioning is also out of scope
  - a new application will be introduced, which will gather the PM data from MWDI and cache it
  - NEP and other applications (e.g. MycomButler) then can retrieve the data they need from this new application
  - this application has not been specified, yet 

See related issue collection [NEP v1.1.0_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/3).  

#### v1.0.1: MAC address data
The following data shall be provided:  
  - MAC address table content of the devices

The following performance criteria shall be kept:  
  - No real-time data required (Information to be taken from MATR)  
  - Retrieval of the data at least once a day  
  - Throttling accepted:
    - Maximum 10 requests for current (live network) MAC address tables in parallel
    - Maximum 100 requests for current (live network) MAC address tables per day
  - Data integrity according to quality of MATR content  

See related issue collections [NEP v1.0.1_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/2) and [NEP v1.0.0_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/1).  

See related issue collection [NEP v1.1.0_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/3).  

#### v1.0.1: MAC address data
The following data shall be provided:  
  - MAC address table content of the devices

The following performance criteria shall be kept:  
  - No real-time data required (Information to be taken from MATR)  
  - Retrieval of the data at least once a day  
  - Throttling accepted:
    - Maximum 10 requests for current (live network) MAC address tables in parallel
    - Maximum 100 requests for current (live network) MAC address tables per day
  - Data integrity according to quality of MATR content  

See related issue collections [NEP v1.0.1_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/2) and [NEP v1.0.0_spec](https://github.com/openBackhaul/NetExplorerProxy/milestone/1).  

### Relevance
The NetExplorerProxy serves as a proxy to a planning and simulation tool for regular use.  

### Resources
- [Specification](./spec/)
- [TestSuite](./testing/)
- [Implementation](./server/)

### Dependencies
- [MacAddressTableRecorder](https://github.com/openBackhaul/MacAddressTableRecorder)  
- [MicroWaveDeviceInventory](https://github.com/openBackhaul/MicroWaveDeviceInventory)  

### Comments
./.


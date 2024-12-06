# NetExplorerProxy
Interface towards the NetExplorer

### Location
The NetExplorerProxy (NEP) represents the demarcation towards the out-of-sdn-domain application NetExplorer.  

### Description
In principle, the NetExplorerProxy is a passthrough of data from the MWDI (MicroWaveDeviceInventory) and the MATR (MacAddressTableRecorder).  


#### MAC address data (introduced with v1.0.1)
The following data shall be provided:  
  - MAC address table content of the devices

The following performance criteria shall be kept:  
  - No real-time data required (Information to be taken from MATR)  
  - Retrieval of the data at least once a day  
  - Throttling accepted:
    - Maximum 10 requests for current (live network) MAC address tables in parallel
    - Maximum 100 requests for current (live network) MAC address tables per day
  - Data integrity according to quality of MATR content  

#### Additional device data (introduced with v1.1.0)
With v1.0.0 additional data shall be provided:  
  - general device and interface information, including linkbundling information
  - air interface 15min performance data
    - also adaptive modulation information that Netexplorer can use for capacity computation
  - ethernet container 15min data
  - sfp data
  
For this release, the NEP shall fetch the required data into its cache in periodic intervals.  
All requests from Netexplorer, not related to Mac address data, shall be served using this cached data only,  
i.e. there will be no retrieval of data on demand.

Note: sync data has also been requested. It first has to be checked from Netexplorer side, if available sync data is sufficient.  

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


# NetExplorerProxy
Interface towards the NetExplorer

### Location
The NetExplorerProxy (NEP) represents the demarcation towards the out-of-sdn-domain application NetExplorer.  

### Description
In principle, the NetExplorerProxy is a passthrough of data from the MWDI (MicroWaveDeviceInventory) and the MATR (MacAddressTableRecorder).  

The following data shall be provided:  
  - MAC address table content of the devices

The following performance criteria shall be kept:  
  - No real-time data required (Information to be taken from MATR)  
  - Retrieval of the data at least once a day  
  - Throttling accepted:
    - Maximum 10 requests for current (live network) MAC address tables in parallel
    - Maximum 100 requests for current (live network) MAC address tables per day
  - Data integrity according to quality of MATR content  

### Relevance
The NetExplorerProxy serves as a proxy to a planning and simulation tool for regular use.  

### Resources
- [Specification](./spec/)
- [TestSuite](./testing/)
- [Implementation](./server/)

### Comments
./.


# NetExplorerProxy Testing

The following testcase collection(s) target NetExplorerProxy v1.0.0.

## NetExplorerProxyBasicTest_v1.0.0

The basic tests just test the individual services of v1.0.0 for valid responses.  
This includes:  
- responseBody completeness and validity against the specified schemas  
- correct error responses in case of invalid requestBodies or unknown devices.  

Other tests like performance or integration into the TAC framework are out-of-scope of this collection (those would be done in additional testcase collections).  

### Test Cases (Postman Export)
- [NetExplorerProxyBasicTest_v1.0.0+testcases](./NetExplorerProxyBasicTest_1.0.0.postman_collection.json)

### DATAfile
- [NetExplorerProxyBasicTest_v1.0.0+datafile](./NetExplorerProxy_v1.0.0_dataFile.json)

### MOCK-Server file
The used MOCK server (exported from Mockoon) for test development can be found in the linked json file.
It only covers NEP services, not MWDI or MATR services.
- [NetExplorerProxyBasicTest_v1.0.0+mockServerfile](./NetExplorerProxy_v1.0.0_mock.json)

### Comments
The NEP uses MATR services with the same name. The testcases for those, however, cannot be used to test the MATR services, because:  
- the input to the NEP services is not the same as for the corresponding MATR service in all cases
- there is a translation between MATR error responseCodes and NEP error responseCodes 

# NEP_1.0.2+validator

### Completeness
- [NEP_1.0.2+validator.completeness](./NEP_1.0.2+validator.completeness/NEP_1.0.2+validator.completeness.json)  
- [NEP_1.0.2+data.completeness](./NEP_1.0.2+validator.completeness/NEP_1.0.2+data.completeness.json)  

Note:  
The MAC address data and deviceList are just read from the MATR and MWDI via services with the same names and the response data is just passed through.  
I.e. there is no data manipulation. Therefore, the completeness tests for those services matches the completeness tests for those services from MATR and MWDI.  
Note: in case MATR cannot find all MAC address attributes for a given device, an incomplete dataset can be returned. According to specification this is not an error on SDN side (potential special handling would have to be implemented on Netexplorer side). 

# Functional Testing 

#### The content of the Functional Testing is summarized in the following index file:
- [Index](./NetExplorerProxy+test.functional.index.yaml)

#### Details on the individual testcases can be found here:
- [Completeness](./completeness/)  
  All individual services are tested for providing ResponseCode 200/204 as well as a valid ResponseBody according to the respectively defined reference schema.  

- [CsvResponseValidity](./csv_response_validity)  
  The individual services with responseBody schema defined as txt/csv shall always at least return the header, even if no data is found in the NEP cache.  
  The completeness testcase collection checks whether the response matches the reference schema, but for those services the reference schema acccepts any string.  
  Therefore this testcase collection provides an additional check on the header lines returned in the service responses.  
  Limitation: the testcases cannot check whether the actual data provided by a service is valid, as this in contrary to the header is not fixed.  

#### Manual test cases
- functional tests not covered by the provided testcases (yet)  


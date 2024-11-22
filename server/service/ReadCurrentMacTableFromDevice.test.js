const individualServicesService = require('./IndividualServicesService');
const requestHandler = require('./individualServices/RequestHandler');
const initConfig = require('../initConfig');
const { v4: uuidv4 } = require('uuid');

const axios = require('axios');
const executionAndTraceService = require("onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService");

jest.mock('./individualServices/RequestHandler'); // Mocking of RequestHandler
jest.mock('axios');

// mock recordServiceRequestFromClient to disable calling EATL
jest.mock("onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService", () => ({
  recordServiceRequestFromClient: jest.fn(),
}));

function getMockResultData(data)
{
  return {
    code: 200,
    message: data,
    headers: {},
    operationName: 'operationName'
  };
}


describe('readCurrentMacTableFromDevice', () => {
    const mockRequestUrl = 'http://localhost:4018/v1/provide-inventory-data-of-device';

    it('should call postRequestDataFromOtherApp with correct arguments and return the result', async () => {
        const mockResult = {
          "request-id": "aaa-bbb-ccc"
        };

        const expectedResult = {
          "request-id": "aaa-bbb-ccc"
        };

        const input = {
          "mount-name": "305251234",
        };

        // set the mock return value
        requestHandler.postRequestDataFromOtherApp.mockResolvedValue(getMockResultData(mockResult));

        // Execute the function
        const result = await individualServicesService.readCurrentMacTableFromDevice(mockRequestUrl, input);

        // Checks whether the function was called with the correct parameters
        expect(requestHandler.postRequestDataFromOtherApp).toHaveBeenCalledWith(
          mockRequestUrl,
          'PromptForProvidingMacTableOfSpecificDeviceCausesReadingMacTableFromMatrCache',
          {
            "mount-name": "305251234",
            "requestor-protocol": "HTTP",
            "requestor-address": {"ip-address": {"ipv-4-address": "127.0.0.1"}},
            "requestor-port": 4018,
            "requestor-receive-operation": "/v1/receive-current-mac-table-of-device"
          },
          "/v1/read-current-mac-table-from-device"
        );

        // Checks whether the result is correct
        expect(result.code).toBe(200);
        expect(result.message).toStrictEqual(expectedResult);
    });

    it('should handle errors and throw an exception if postRequestDataFromOtherApp fails', async () => {
        const mockError = new Error('Request failed');
        const body = {
          "mount-name": "xxxyyyzzz",
          "requestor-protocol": "HTTP",
          "requestor-address": "127.0.0.1",
          "requestor-port": 4000
        };

        // Mock an error case
        requestHandler.postRequestDataFromOtherApp.mockRejectedValue(mockError);

        // Checks whether the function throws the error correctly
        await expect(individualServicesService.readCurrentMacTableFromDevice(mockRequestUrl, body)).rejects.toThrow('Request failed');
    });
});


async function callReceiveCurrentMacTableOfDevice(requestId) {
  const receiveCurrentMacTableOfDeviceUrl = 'http://localhost:4018/v1/receive-current-mac-table-of-device';

  const receiveCurrentMacTableOfDeviceInput = [
    {
      "request-id": requestId,
      "mac-address-data": [
        {
          "mount-name": "305251234",
          "own-mac-address": "00:00:00:00:00:00",
          "egress-ltp-uuid": "305251234+mac-inf-1234",
          "original-ltp-name": "eth-1-0-3",
          "vlan-id": 17,
          "remote-mac-address": "01:01:01:01:01:01",
          "time-stamp-of-data": "2010-11-20T13:00:00.000Z"
        },
        {
          "mount-name": "305251234",
          "own-mac-address": "00:00:00:00:00:00",
          "egress-ltp-uuid": "305251234+mac-inf-1234",
          "original-ltp-name": "eth-1-0-3",
          "vlan-id": 17,
          "remote-mac-address": "FF:01:01:01:01:01",
          "time-stamp-of-data": "2010-11-20T13:00:00.000Z"
        }
      ]
    }
  ];

  axios.post.mockResolvedValue({
    status: 200,
    data: {},
    headers: {}
  });

  result = await individualServicesService.receiveCurrentMacTableOfDevice(receiveCurrentMacTableOfDeviceUrl, receiveCurrentMacTableOfDeviceInput);
  expect(result.code).toBe(204);
}

const readCurrentMacTableFromDeviceInput = {
  "mount-name": "305251234",
  "requestor-protocol": "HTTP",
  "requestor-address": {"ip-address": {"ipv-4-address": "127.0.0.1"}},
  "requestor-port": 4018,
  "requestor-receive-operation": "/v1/receive-current-mac-table-of-device"
};

function createRequestId() {
    const mockResult = {
      "request-id": uuidv4()
    };

    return getMockResultData(mockResult);
}

describe('readCurrentMacTableFromDevice throttling', () => {
  const mockRequestUrl = 'http://localhost:4018/v1/read-current-mac-table-from-device';

  it('should call postRequestDataFromOtherApp with correct arguments and return the result', async () => {
    let requestIds = [];

    // Mock implementation to generate a new request-id in each call
    requestHandler.postRequestDataFromOtherApp = jest.fn(createRequestId);

    let successCounter = 0;
    let errorCounter = 0;

    for (let i = 1; i < 20; ++i) {
      let result = await individualServicesService.readCurrentMacTableFromDevice(mockRequestUrl, readCurrentMacTableFromDeviceInput);

      if (result.code === 200) {
        ++successCounter;
        requestIds.push(result.message["request-id"]);
      } else if (result.code === 429) {
        ++errorCounter;
      }
    }

    // Ten parallel calls must be successful.
    expect(successCounter == 9 || successCounter == 10).toBeTruthy(); // There may be already one call before in the readCurrentMacTableFromDevice test.
    expect(requestHandler.postRequestDataFromOtherApp).toHaveBeenCalledTimes(9);
    // All 10 additional calls shall be rejected.
    expect(errorCounter).toBe(10);

    // After finishing a request, the next call must be successful again.
    await callReceiveCurrentMacTableOfDevice(requestIds.shift());

    result = await individualServicesService.readCurrentMacTableFromDevice(mockRequestUrl, readCurrentMacTableFromDeviceInput);
    expect(result.code).toBe(200);

    // After that, the limit of 10 parallel calls is reached again.
    result = await individualServicesService.readCurrentMacTableFromDevice(mockRequestUrl, readCurrentMacTableFromDeviceInput);
    expect(result.code).toBe(429);

    // Clear the request ID list
    while (requestIds.length > 0) {
      await callReceiveCurrentMacTableOfDevice(requestIds.shift());
    }
  });
});

describe('readCurrentMacTableFromDevice maximum call check', () => {
  const mockRequestUrl = 'http://localhost:4018/v1/read-current-mac-table-from-device';

  it('should refuse calls after 100 per day', async () => {
    // Mock implementation to generate a new request-id in each call
    requestHandler.postRequestDataFromOtherApp = jest.fn(createRequestId);

    let successCounter = 0;
    let errorCounter = 0;

    for (let i = 0; i < 150; ++i) {
      let result = await individualServicesService.readCurrentMacTableFromDevice(mockRequestUrl, readCurrentMacTableFromDeviceInput);

      if (result.code === 200) {
        ++successCounter;
        let requestId = result.message["request-id"];

        await callReceiveCurrentMacTableOfDevice(requestId);
      } else if (result.code === 429) {
        ++errorCounter;
      }
    }

    expect(successCounter + errorCounter).toBe(150);
    expect(successCounter > 70).toBeTruthy();
    expect(errorCounter >= 50).toBeTruthy();
  });
});

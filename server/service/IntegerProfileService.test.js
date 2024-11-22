const integerProfileService = require('./IntegerProfileService');
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');

jest.mock('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
jest.mock('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

const integerProfile = {
	"uuid": "ndlp-2-0-1-integer-p-000",
	"profile-name": "integer-profile-1-0:PROFILE_NAME_TYPE_INTEGER_PROFILE",
	"integer-profile-1-0:integer-profile-pac": {
		"integer-profile-capability": {
			"integer-name": "testInteger",
			"minimum": 0,
			"maximum": 999999
		},
		"integer-profile-configuration": {
			"integer-value": "integer-profile-1-0:PROFILE_NAME_TYPE_INTEGER_PROFILE"
		}
	}
};

beforeEach(() => {
	jest.spyOn(ProfileCollection, 'getProfileListForProfileNameAsync').mockImplementation(() => [integerProfile]);
})

test("putIntegerProfileIntegerValue - 12345", async () => {
	const url = "/rootpath";
	const input = {
		"integer-profile-1-0:integer-value": 12345
	};
	await integerProfileService.putIntegerProfileIntegerValue(url, input, "ndlp-2-0-1-integer-p-000");
	expect(fileOperation.writeToDatabaseAsync).toBeCalledWith(url, input, false);
});

test("putIntegerProfileIntegerValue - 23456", async () => {
	const url = "/rootpath";
	const input = {
		"integer-profile-1-0:integer-value": 23456
	};
	await integerProfileService.putIntegerProfileIntegerValue(url, input, "ndlp-2-0-1-integer-p-000");
	expect(fileOperation.writeToDatabaseAsync).toBeCalledWith(url, input, false);
});

afterEach(() => {
	jest.resetAllMocks();
});

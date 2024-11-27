'use strict';
const createHttpError = require('http-errors');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');

/**
 * This function fetches the integer value from the integer profile based on the expected integer name.
 * @param {String} expectedIntegerName name of the integer profile.
 * @return {String} value of the integer profile.
 */
exports.getIntegerProfileInstanceValue = async function(expectedIntegerName) {
  let integerValue = "";
  try {
    let integerProfileName = "integer-profile-1-0:PROFILE_NAME_TYPE_INTEGER_PROFILE";
    let integerProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(integerProfileName);

    for (let i = 0; i < integerProfileInstanceList.length; i++) {
      let integerProfileInstance = integerProfileInstanceList[i];
      let integerProfilePac = integerProfileInstance[onfAttributes.INTEGER_PROFILE.PAC];
      let integerProfileCapability = integerProfilePac[onfAttributes.INTEGER_PROFILE.CAPABILITY];
      let integerName = integerProfileCapability[onfAttributes.INTEGER_PROFILE.INTEGER_NAME];
      if (integerName == expectedIntegerName) {
        let integerProfileConfiguration = integerProfilePac[onfAttributes.INTEGER_PROFILE.CONFIGURATION];
        integerValue = integerProfileConfiguration[onfAttributes.INTEGER_PROFILE.INTEGER_VALUE];
        break;
      }
    }

    return integerValue;
  } catch (error) {
    console.log(`getIntegerProfileInstanceValue is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

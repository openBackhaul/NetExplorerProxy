'use strict';

const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

/**
 * This function fetches LTP list from LtpStructure if layerProtocolName is equal to given.
 * @param {String} object name of the layer-protocol.
 * @param {Object} ltpStructure control construct.
 * @return {List} ltp list that matches the given layerProtocolName.
 */
exports.getLtpsContainsObjectFromLtpStructure = function (objectName, ltpStructure) {
  let ltpsOfLayerProtocolName = [];
  let ltpList = ltpStructure["core-model-1-4:control-construct"][0][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT];
  if (ltpList != undefined) {
    ltpsOfLayerProtocolName = ltpList.filter(ltp =>
      ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL].find(layerProtocol =>
        layerProtocol.hasOwnProperty(objectName)));
  }
  return ltpsOfLayerProtocolName;
}

exports.getLtpsContainsObjectFromLtpStructureAugment = function (objectName, ltpStructure) {
  let ltpList = [];

  if (Array.isArray(ltpStructure)) {
    ltpList = ltpStructure;
  } else if (
    ltpStructure &&
    ltpStructure["core-model-1-4:control-construct"] &&
    Array.isArray(ltpStructure["core-model-1-4:control-construct"]) &&
    ltpStructure["core-model-1-4:control-construct"].length > 0
  ) {
    ltpList =
      ltpStructure["core-model-1-4:control-construct"][0][
        onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT
      ] || [];
  }

  return ltpList.filter(
    ltp => ltp && Object.prototype.hasOwnProperty.call(ltp, objectName)
  );
};

/**
 * This function fetches LTP list from LtpStructure if layerProtocolName is equal to given.
 * @param {String} LayerProtocolName name of the layer-protocol.
 * @param {Object} ltpStructure control construct.
 * @return {List} ltp list that matches the given layerProtocolName.
 */
exports.getLtpsOfLayerProtocolNameFromLtpStructure = function (LayerProtocolName, ltpStructure) {
  let ltpsOfLayerProtocolName = [];
  let ltpList = ltpStructure["core-model-1-4:control-construct"][0][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT];
  if (ltpList != undefined) {
    ltpsOfLayerProtocolName = ltpList.filter(ltp =>
      ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL].find(layerProtocol =>
        layerProtocol[onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME] === LayerProtocolName))
  }
  return ltpsOfLayerProtocolName;
}

/**
 * This function fetches LTP instance from LtpStructure if uuid is equal to given.
 * @param {String} uuid identifier of the logical-termination-point instance.
 * @param {Object} ltpStructure control construct.
 * @return {Object} ltp that matches the given uuid.
 */
exports.getLtpForUuidFromLtpStructure = function (uuid, ltpStructure) {
  let ltp = {};
  let ltpList = ltpStructure["core-model-1-4:control-construct"][0][onfAttributes.CONTROL_CONSTRUCT.LOGICAL_TERMINATION_POINT];
  if (ltpList != undefined) {
    ltp = ltpList.find(ltp =>
      ltp[onfAttributes.GLOBAL_CLASS.UUID] === uuid);
  }
  return ltp;
}

/**
 * This function finds the client LTP of the given ltp from ltp structure based on the list of layer-protocol-name given.
 * @param {Object} ltpInstance root instance for which client LTP of given layer shall be found.
 * @param {List} layerProtocolNameList list of layer-protocol-name of expected client interfaces.
 * @param {Object} ltpStructure control construct.
 * @return {Object} ltpInstance expected client LTP instance found.
 */
exports.getHierarchicalClientLtpForInterfaceListFromLtpStructure = async function (ltpInstance, layerProtocolNameList, ltpStructure) {
  try {
    for (let i = 0; i < layerProtocolNameList.length; i++) {
      let expectedClientLtp = {};
      let clientLtpList = [];
      if (ltpInstance != undefined) {
        if (ltpInstance.hasOwnProperty(onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP)) {
          clientLtpList = ltpInstance[onfAttributes.LOGICAL_TERMINATION_POINT.CLIENT_LTP];
        }
      } else {
        return {};
      }
      for (let j = 0; j < clientLtpList.length; j++) {
        let ltp = exports.getLtpForUuidFromLtpStructure(clientLtpList[j], ltpStructure);
        let layerProtocol = ltp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL];
        for (let k = 0; k < layerProtocol.length; k++) {
          let layerProtocolName = layerProtocol[k][onfAttributes.LAYER_PROTOCOL.LAYER_PROTOCOL_NAME];
          if (layerProtocolNameList[i].includes(layerProtocolName)) {
            expectedClientLtp = ltp;
            break;
          }
        }
      }
      if (Object.keys(expectedClientLtp).length > 0) {
        ltpInstance = expectedClientLtp;
      } else {
        ltpInstance = {};
      }
    }
    return ltpInstance;
  } catch (error) {
    console.log(error);
    return {};
  }
}
const prepareALTForwardingAutomation = require('onf-core-model-ap-bs/basicServices/services/PrepareALTForwardingAutomation');

/**
 * Return current runtime data to shut down the MS in preparation for an upgrade.
 * @param logicalTerminationPointconfigurationStatus
 * @returns {Promise<unknown>}
 */
exports.bequeathYourDataAndDie = async function (logicalTerminationPointconfigurationStatus) {
    let forwardingConstructAutomationList = [];

    /***********************************************************************************
     * forwardings for application layer topology
     ************************************************************************************/
    let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
      logicalTerminationPointconfigurationStatus,
      undefined
    );

    if (applicationLayerTopologyForwardingInputList) {
      for (let applicationLayerTopologyForwardingInput of applicationLayerTopologyForwardingInputList) {
        forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
      }
    }

    return forwardingConstructAutomationList;
}

/**
 * Process OAM layer request.
 * @param uuid
 * @returns {Promise<unknown>}
 * @constructor
 */
exports.OAMLayerRequest = async function (uuid) {
    let forwardingConstructAutomationList = [];

    /***********************************************************************************
     * forwardings for application layer topology
     ************************************************************************************/
    let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputForOamRequestAsync(
      uuid
    );

    if (applicationLayerTopologyForwardingInputList) {
      for (let applicationLayerTopologyForwardingInput of applicationLayerTopologyForwardingInputList) {
        forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
      }
    }

    return forwardingConstructAutomationList;
}

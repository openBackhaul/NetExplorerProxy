'use strict';

const oamLogService = require('onf-core-model-ap/applicationPattern/services/OamLogService');
const responseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
const responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
const core = require('../service/CoreService');

module.exports.getControlConstruct = async function getControlConstruct(req, res, next) {
  try {
    let responseBody = await core.getControlConstruct(req.url);
    let responseCode = responseCodeEnum.code.OK;
    responseBuilder.buildResponse(res, responseCode, responseBody);
    await oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
  } catch (response) {
    let responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
    let responseBody = response;
    responseBuilder.buildResponse(res, responseCode, responseBody);
    await oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
  }
};

module.exports.getProfileInstance = function getProfileInstance(req, res, next, uuid) {
  core.getProfileInstance(req.url)
    .then(async function (response) {
      let responseCode = responseCodeEnum.code.OK;
      let responseBody = response;
      responseBuilder.buildResponse(res, responseCode, responseBody);
      await oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
    })
    .catch(async function (response) {
      let responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
      let responseBody = response;
      responseBuilder.buildResponse(res, responseCode, responseBody);
      await oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
    });
};

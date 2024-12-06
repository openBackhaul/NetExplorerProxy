'use strict';

const elasticsearchClient = require('../service/ElasticsearchClientService');
const responseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
const responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
const oamLog = require('onf-core-model-ap/applicationPattern/services/OamLogService');

module.exports.getElasticsearchClientApiKey = async function getElasticsearchClientApiKey (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await elasticsearchClient.getElasticsearchClientApiKey(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getElasticsearchClientIndexAlias = async function getElasticsearchClientIndexAlias (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await elasticsearchClient.getElasticsearchClientIndexAlias(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getElasticsearchClientLifeCycleState = async function getElasticsearchClientLifeCycleState (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await elasticsearchClient.getElasticsearchClientLifeCycleState(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getElasticsearchClientOperationalState = async function getElasticsearchClientOperationalState (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await elasticsearchClient.getElasticsearchClientOperationalState(uuid)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getElasticsearchClientServiceRecordsPolicy = async function getElasticsearchClientServiceRecordsPolicy(req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await elasticsearchClient.getElasticsearchClientServiceRecordsPolicy(uuid)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putElasticsearchClientApiKey = async function putElasticsearchClientApiKey (req, res, next, body, uuid) {
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  await elasticsearchClient.putElasticsearchClientApiKey(req.url, body, uuid)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putElasticsearchClientIndexAlias = async function putElasticsearchClientIndexAlias (req, res, next, body, uuid) {
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  await elasticsearchClient.putElasticsearchClientIndexAlias(req.url, body, uuid)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putElasticsearchClientServiceRecordsPolicy = async function putElasticsearchClientServiceRecordsPolicy (req, res, next, body, uuid) {
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  await elasticsearchClient.putElasticsearchClientServiceRecordsPolicy(uuid, body)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = responseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  void oamLog.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

'use strict';

const oamLogService = require('onf-core-model-ap/applicationPattern/services/OamLogService');
const responseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
const responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
const tcpServer = require('../service/TcpServerService');

module.exports.getTcpServerDescription = function getTcpServerDescription(req, res, next, uuid) {
  tcpServer.getTcpServerDescription(req.url)
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

module.exports.getTcpServerLocalAddress = function getTcpServerLocalAddress(req, res, next, uuid) {
  tcpServer.getTcpServerLocalAddress(req.url)
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

module.exports.getTcpServerLocalPort = function getTcpServerLocalPort(req, res, next, uuid) {
  tcpServer.getTcpServerLocalPort(req.url)
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

module.exports.getTcpServerLocalProtocol = function getTcpServerLocalProtocol(req, res, next, uuid) {
  tcpServer.getTcpServerLocalProtocol(req.url)
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

module.exports.putTcpServerDescription = function putTcpServerDescription(req, res, next, body, uuid) {
  tcpServer.putTcpServerDescription(req.url, body, uuid)
    .then(async function (response) {
      let responseCode = responseCodeEnum.code.NO_CONTENT;
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

module.exports.putTcpServerLocalAddress = function putTcpServerLocalAddress(req, res, next, body, uuid) {
  tcpServer.putTcpServerLocalAddress(req.url, body, uuid)
    .then(async function (response) {
      let responseCode = responseCodeEnum.code.NO_CONTENT;
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

module.exports.putTcpServerLocalPort = function putTcpServerLocalPort(req, res, next, body, uuid) {
  tcpServer.putTcpServerLocalPort(req.url, body, uuid)
    .then(async function (response) {
      let responseCode = responseCodeEnum.code.NO_CONTENT;
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

module.exports.putTcpServerLocalProtocol = function putTcpServerLocalProtocol(req, res, next, body, uuid) {
  tcpServer.putTcpServerLocalProtocol(req.url, body, uuid)
    .then(async function (response) {
      let responseCode = responseCodeEnum.code.NO_CONTENT;
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

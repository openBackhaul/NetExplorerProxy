'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

/**
 * Returns application name
 *
 * url String
 **/
exports.getHttpServerApplicationName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-server-interface-1-0:application-name": value
  };
}

/**
 * Returns application purpose
 *
 * url String
 **/
exports.getHttpServerApplicationPurpose = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-server-interface-1-0:application-purpose": value
  };
}

/**
 * Returns update period
 *
 * url String
 **/
exports.getHttpServerDataUpdatePeriode = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-server-interface-1-0:data-update-period": value
  };
}

/**
 * Returns owner email address
 *
 * url String
 **/
exports.getHttpServerOwnerEmailAddress = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-server-interface-1-0:owner-email-address": value
  };
}

/**
 * Returns owner name
 *
 * url String
 **/
exports.getHttpServerOwnerName = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-server-interface-1-0:owner-name": value
  };
}

/**
 * Returns list of releases
 *
 * url String
 **/
exports.getHttpServerReleaseList = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-server-interface-1-0:release-list": value
  };
}

/**
 * Returns release number
 *
 * url String
 **/
exports.getHttpServerReleaseNumber = async function (url) {
  const value = await fileOperation.readFromDatabaseAsync(url);

  return {
    "http-server-interface-1-0:release-number": value
  };
}

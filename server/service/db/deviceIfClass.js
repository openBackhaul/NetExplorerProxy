const { Sequelize, DataTypes, Model } = require('sequelize');

/*
Table devices_if {
    // Primary key
    mount_name varchar [primary key]
    uuid varchar [primary key]
    local_id varchar [primary key] // or integer?? // to be checked as primary key
  
    // Timestamp reference
    timestamp timestamp
  
    // from device interface
    original_ltp_name varchar
    interface_type varchar // his indicates which of the following types the interface has, i.e. it's an enum:
    // 'air-interface',
    // 'ethernet-container',
    // 'wire-interface'
    interface_status varchar
  
    // from actual equipment
    version varchar
    description varchar
    model_identifier varchar
    part_type_identifier varchar
    type_name varchar
    manufacturer_name varchar
    manufacturer_identifier varchar
  }
*/

exports.init = function (sequelize) {
  class DeviceInterfaces extends Model { };

  DeviceInterfaces.init(
    {
      // Primary key
      mount_name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      local_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },

      // Time stamp
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Data

      // from device interface
      original_ltp_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interface_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interface_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // from actual equipment
      version: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      model_identifier: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      part_type_identifier: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manufacturer_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manufacturer_identifier: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'deviceInterface'
    },
  );

  return DeviceInterfaces;
}
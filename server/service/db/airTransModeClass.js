const { Sequelize, DataTypes, Model } = require('sequelize');
/*
air_interface_transmission_mode {
    // Primary key
    mount_name varchar [primary key]
    uuid varchar [primary key]
    local_id varchar [primary key] // or integer??
    
    // Timestamp reference
    timestamp timestamp
  
    // Data
    transmission_mode_name varchar
    symbol_rate_reduction_factor integer
    modulation_scheme_at_lct varchar
    modulation_scheme integer
    code_rate integer
    channel_bandwidth varchar
    xpic_is_avail boolean
    capa_factor float
  }
*/

exports.init = function (sequelize) {
  class AirTransmissionMode extends Model { };

  AirTransmissionMode.init(
    {
      // Primary key
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },

      mount_name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: false,
      },
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: false,
      },
      local_id: {
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: false,
      },

      // Time stamp
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Data
      transmission_mode_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      symbol_rate_reduction_factor: {
        type: DataTypes.STRING, //integer
        allowNull: true,
      },
      modulation_scheme_at_lct: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      modulation_scheme: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      code_rate: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      channel_bandwidth: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      xpic_is_avail: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      capa_factor: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'air_interface_transmission_mode'
    },
  );

  return AirTransmissionMode;
}
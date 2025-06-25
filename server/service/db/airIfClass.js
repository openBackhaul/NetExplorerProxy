const { Model, DataTypes } = require('sequelize');

// // Air interface
// Table air_interface_general_info {
//   // Primary Key
//   mount-name varchar [primary key]
//   uuid varchar [primary key]
//   local-id varchar [primary key]

//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   operational-state varchar
//   administrative-state varchar
//   original-ltp-name varchar
//   external-label varchar
//   transmission-mode-min varchar
//   transmission-mode-max varchar
//   xpic-is-on boolean
//   power-is-on boolean
//   transmitter-is-on boolean
//   interface-status varchar
//   type-of-equipment varchar
// }

exports.init = function(sequelize) {
    class AirInterface extends Model {}

    AirInterface.init(
    {
        // Primary key
      "mount-name": {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      "uuid": {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      "local-id": {
        type: DataTypes.STRING,
        allowNull: true,
        // primaryKey: true,
      },

       // Time stamp
      "timestamp": {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Data
      "operational-state": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "administrative-state": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "original-ltp-name" : {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "external-label": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "transmission-mode-min": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "transmission-mode-max": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "xpic-is-on": {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      "power-is-on": {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      "transmitter-is-on": {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      "interface-status": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "type-of-equipment": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "interface-type": {
        type: DataTypes.STRING,
        defaultValue: "air-interface",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'air_interface_general_info'
    },
  );

  return AirInterface;
}
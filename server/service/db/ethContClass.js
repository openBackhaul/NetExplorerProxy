const { Model, DataTypes } = require('sequelize');

// // Ethernet Data
// Table ethernet_container_general_info {
//   // Primary Key
//   mount-name varchar [primary key]
//   uuid varchar [primary key]
//   local-id varchar [primary key]

//   // Timestamp reference
//   timestamp timestamp

//   operational-state varchar
//   administrative-state varchar
//   original-ltp-name varchar
//   interface-name varchar
//   bundling-is-on varchar
//   interface-status varchar
// }

exports.init = function (sequelize) {
  class EthContainer extends Model { }

  EthContainer.init(
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
      "original-ltp-name": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "interface-name": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "bundling-is-on": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "interface-status": {
        type: DataTypes.STRING,
        allowNull: true,
      },
      "interface-type": {
        type: DataTypes.STRING,
        defaultValue: "ethernet-container",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ethernet_container_general_info'
    },
  );

  return EthContainer;
}
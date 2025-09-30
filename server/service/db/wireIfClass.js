const { Model, DataTypes } = require('sequelize');

// // Wired connection
// Table wire_interface_general_info {
//   // Primary key
//   mount-name varchar [primary key]
//   uuid  varchar [primary key]
//   local-id  varchar [primary key]
  
//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   operational-state varchar
//   administrative-state varchar
//   original-ltp-name varchar
//   interface-name varchar
//   fixed-pmd-kind varchar
//   interface-status varchar
//   pmd-kind-cur varchar
//   pmd-name varchar
//   duplex varchar
//   speed  varchar
// }

exports.init = function (sequelize) {
  class WireInterface extends Model { };

  WireInterface.init(
    {
      // Primary key
      "mount-name": {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      "uuid": {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      "local-id": {
        type: DataTypes.STRING,
        allowNull: true
      },

      // Time stamp
      "timestamp": {
        type: DataTypes.DATE,
        allowNull: false
      },

      // Data
      "operational-state": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "administrative-state": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "original-ltp-name": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "interface-name": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "fixed-pmd-kind": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "interface-status": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "pmd-kind-cur": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "pmd-name": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "duplex": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "speed": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "interface-type": {
        type: DataTypes.STRING,
        defaultValue: "wire-interface",
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'wire_interface_general_info'
    }
  );

  return WireInterface;
}
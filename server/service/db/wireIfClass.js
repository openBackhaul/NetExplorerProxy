const { Model, DataTypes } = require('sequelize');

// // Wired connection
// Table wire_interface_general_info {
//   // Primary key
//   mount_name varchar [primary key]
//   uuid  varchar [primary key]
//   local_id  varchar [primary key]
  
//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   operational_state varchar
//   administrative_state varchar
//   original_ltp_name varchar
//   interface_name varchar
//   fixed_pmd_kind varchar
//   interface_status varchar
//   pmd_kind_cur varchar
//   pmd_name varchar
//   duplex varchar
//   speed  varchar
// }

exports.init = function (sequelize) {
  class WireInterface extends Model { };

  WireInterface.init(
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
        allowNull: true,
        // primaryKey: true,
      },

      // Time stamp
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Data
      operational_state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      administrative_state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      original_ltp_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interface_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fixed_pmd_kind: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interface_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pmd_kind_cur: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pmd_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duplex: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      speed: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interface_type: {
        type: DataTypes.STRING,
        defaultValue: "wire-interface",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'wire_interface_general_info'
    },
  );

  return WireInterface;
}
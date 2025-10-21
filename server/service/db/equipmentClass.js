const { Model, DataTypes } = require('sequelize');

// Table equipment_general_info {
//   // Primary key
//   mount-name varchar [primary key]
//   uuid varchar
//   local-id varchar

//   // Timestamp reference
//   timestamp timestamp

//   version varchar
//   description varchar
//   model-identifier varchar
//   part-type-identifier varchar
//   type-name varchar

//   manufacturer-name varchar
//   manufacturer-identifier varchar
// }


exports.init = function (sequelize) {
  class EquipmentInfo extends Model { };

  EquipmentInfo.init(
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
        allowNull: true
      },

      // Time stamp
      "timestamp": {
        type: DataTypes.DATE,
        allowNull: false
      },

      // Data
      "version": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "description": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "model-identifier": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "part-type-identifier": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "type-name": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "manufacturer-name": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "manufacturer-identifier": {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'equipment_general_info'
    }
  );

  return EquipmentInfo;
}
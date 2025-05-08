const { Model, DataTypes } = require('sequelize');

// Table equipment_general_info {
//   // Primary key
//   mount_name varchar [primary key]
//   uuid varchar
//   local_id varchar

//   // Timestamp reference
//   timestamp timestamp

//   version varchar
//   description varchar
//   model_identifier varchar
//   part_type_identifier varchar
//   type_name varchar

//   manufacturer_name varchar
//   manufacturer_identifier varchar
// }


exports.init = function (sequelize) {
  class EquipmentInfo extends Model { };

  EquipmentInfo.init(
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
        // primaryKey: true, ???
      },

      // Time stamp
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Data
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
      modelName: 'equipment_general_info'
    },
  );

  return EquipmentInfo;
}
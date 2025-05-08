const { Model, DataTypes } = require('sequelize');

// Table devices_general_info {
//   // Primary key
//   mount_name varchar [primary key]

//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   external_label  varchar
//   device_model_name varchar
//   system_name varchar
// }

exports.init = function(sequelize) {
  class DeviceGeneralInfo extends Model {};

  DeviceGeneralInfo.init(
    {
      // Primary key
      mount_name: {
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
      external_label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      device_model_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      system_name: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'devices_general_info'
    },
  );

  return DeviceGeneralInfo;
}


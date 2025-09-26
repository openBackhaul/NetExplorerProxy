const { Model, DataTypes } = require('sequelize');

// Table devices_general_info {
//   // Primary key
//   mount-name varchar [primary key]

//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   external-label  varchar
//   device-model-name varchar
//   system-name varchar
// }

exports.init = function(sequelize) {
  class DeviceGeneralInfo extends Model {};

  DeviceGeneralInfo.init(
    {
      // Primary key
      "mount-name": {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
  
      // Time stamp
      "timestamp": {
        type: DataTypes.DATE,
        allowNull: false
      },
  
      // Data
      "external-label": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "device-model-name": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "system-name": {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'devices_general_info'
    },
  );

  return DeviceGeneralInfo;
}


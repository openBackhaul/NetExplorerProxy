const { Model, DataTypes } = require('sequelize');

// // LTP Equipment Map
// Table ltp_equipment_mappings {
//   // Primary Key
//   mount-name varchar [primary key]
//   uuid varchar [primary key]

//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   connector varchar
//   equipment varchar
// }

exports.init = function(sequelize) {
    class LTPEquipmentMappings extends Model {}

    LTPEquipmentMappings.init(
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

       // Time stamp
      "timestamp": {
        type: DataTypes.DATE,
        allowNull: false
      },

      // Data
      "connector": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "equipment": {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: 'ltp_equipment_mappings'
    }
  );

  return LTPEquipmentMappings;
}
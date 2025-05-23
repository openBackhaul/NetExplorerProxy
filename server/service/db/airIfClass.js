const { Model, DataTypes } = require('sequelize');

// // Air interface
// Table air_interface_general_info {
//   // Primary Key
//   mount_name varchar [primary key]
//   uuid varchar [primary key]
//   local_id varchar [primary key]

//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   operational_state varchar
//   administrative_state varchar
//   original_ltp_name varchar
//   external_label varchar
//   transmission_mode_min varchar
//   transmission_mode_max varchar
//   xpic_is_on boolean
//   power_is_on boolean
//   transmitter_is_on boolean
//   interface_status varchar
//   type_of_equipment varchar
// }

exports.init = function(sequelize) {
    class AirInterface extends Model {}

    AirInterface.init(
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
      original_ltp_name : {
        type: DataTypes.STRING,
        allowNull: true,
      },
      external_label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transmission_mode_min: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transmission_mode_max: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      xpic_is_on: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      power_is_on: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      transmitter_is_on: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      interface_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type_of_equipment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interface_type: {
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
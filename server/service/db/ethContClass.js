const { Model } = require('sequelize');

// // Ethernet Data
// Table ethernet_container_general_info {
//   // Primary Key
//   mount_name varchar [primary key]
//   uuid varchar [primary key]
//   local_id varchar [primary key]

//   // Timestamp reference
//   timestamp timestamp

//   operational_state varchar
//   administrative_state varchar
//   original_ltp_name varchar
//   interface_name varchar
//   bundling_is_on varchar
//   interface_status varchar
// }

exports.init = function (sequelize) {
  class EthContainer extends Model { }

  EthContainer.init(
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
      bundling_is_on: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interface_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ethernet_container_general_info'
    },
  );

  return EthContainer;
}
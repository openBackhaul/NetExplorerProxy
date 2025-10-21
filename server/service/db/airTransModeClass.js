const { Model, DataTypes } = require('sequelize');

// Table air_interface_transmission_mode {
//   // Primary key
//   mount-name varchar 
//   uuid varchar
//   local-id varchar
  
//   // Timestamp reference
//   timestamp timestamp

//   // Data
//   transmission-mode-name varchar
//   symbol-rate-reduction-factor varchar
//   modulation-scheme-at-lct varchar
//   modulation-scheme varchar
//   code-rate varchar
//   channel-bandwidth varchar
//   xpic-is-avail varchar
//   capa-factor varchar
// }

exports.init = function (sequelize) {
  class AirTransmissionMode extends Model { };

  AirTransmissionMode.init(
    {
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
      "transmission-mode-name": {
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: true
      },
      "symbol-rate-reduction-factor": {
        type: DataTypes.STRING, //integer
        allowNull: true
      },
      "modulation-scheme-at-lct": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "modulation-scheme": {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      "code-rate": {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      "channel-bandwidth": {
        type: DataTypes.STRING,
        allowNull: true
      },
      "xpic-is-avail": {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      "capa-factor": {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'air_interface_transmission_mode'
    }
  );

  return AirTransmissionMode;
}
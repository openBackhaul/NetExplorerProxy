module.exports = {
  provideListOfDevicesInNep: require('./provideListOfDevicesInNepValidator'),
  provideGeneralInformationOfDevices: require('./provideGeneralInformationValidator'),
  provideActualEquipmentInformationOfDevices: require('./provideActualEquipmentValidator'),
  provideAirInterfaceGeneralInformationOfDevices: require('./provideAirInterfaceGeneralValidator'),
  provideAirInterfaceTransmissionMode: require('./provideAirTransmissionModeValidator'),
  provideEthernetContainerGeneralInfo: require('./provideEthernetContainerValidator'),
  provideWireInterfaceGeneralInfo: require('./provideWireInterfaceValidator'),
  provideLtpEquipmentMappings: require('./provideLtpEquipmentMappingsValidator'),
  provideInterfacesPerDevice: require('./provideInterfacesPerDeviceValidator')
};

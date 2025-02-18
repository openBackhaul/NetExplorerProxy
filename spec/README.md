# NetExplorerProxy Specification

### Diagrams  
- [Collection of Diagrams](./diagrams)

### ServiceList
- [NetExplorerProxy+services](./NetExplorerProxy+services.yaml)

### ProfileList and ProfileInstanceList
- [NetExplorerProxy+profiles](./NetExplorerProxy+profiles.yaml)
- [NetExplorerProxy+profileInstances](./NetExplorerProxy+profileInstances.yaml)

### ForwardingList
- [NetExplorerProxy+forwardings](./NetExplorerProxy+forwardings.yaml)

### Open API specification (Swagger)
- [NetExplorerProxy](./NetExplorerProxy.yaml)

### CONFIGfile (JSON)
- [NetExplorerProxy+config](./NetExplorerProxy+config.json)

### Comments

#### Services
The following section outlines, which services have been introduced with which spec version.  

Services introduced with v1.0.0:
- */v1/provide-mac-table-of-all-devices*
- */v1/provide-mac-table-of-specific-device*
- */v1/read-current-mac-table-from-device*
- */v1/receive-current-mac-table-of-device*
- */v1/provide-list-of-connected-devices*

Services introduced with v1.1.0: 
- */v1/provide-list-of-devices-in-nep*
- */v1/provide-list-of-interfaces-per-device-in-nep*
- */v1/provide-general-information-of-devices*
- */v1/provide-actual-equipment-information-of-devices*
- */v1/provide-air-interface-general-information-of-devices*
- */v1/provide-air-interface-transmission-mode-lists-of-devices*
- */v1/provide-ethernet-container-general-information-of-devices*
- */v1/provide-wire-interface-general-information-of-devices*

Outlook - services currently planned to be introduced with v1.2.0 or later:
- */v1/provide-air-interface-non-qam-pm-data-of-devices*
- */v1/provide-air-interface-qam-pm-data-of-devices*
- */v1/provide-ethernet-container-pm-data-of-devices*



| Version | Services                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1.0.0   | - */v1/provide-mac-table-of-all-devices* - */v1/provide-mac-table-of-specific-device* - */v1/read-current-mac-table-from-device* - */v1/receive-current-mac-table-of-device* - */v1/provide-list-of-connected-devices*                                                                                                                                                                                                                                           |
| 1.1.0   | - */v1/provide-list-of-devices-in-nep* - */v1/provide-list-of-interfaces-per-device-in-nep* - */v1/provide-general-information-of-devices* - */v1/provide-actual-equipment-information-of-devices* - */v1/provide-air-interface-general-information-of-devices* - */v1/provide-air-interface-transmission-mode-lists-of-devices* - */v1/provide-ethernet-container-general-information-of-devices* - */v1/provide-wire-interface-general-information-of-devices* |
| 1.2.0+  | (currently planned) - */v1/provide-air-interface-non-qam-pm-data-of-devices* - */v1/provide-air-interface-qam-pm-data-of-devices* - */v1/provide-ethernet-container-pm-data-of-devices*                                                                                                                                                                                                                                                                          |
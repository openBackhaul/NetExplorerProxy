"""Test case definitions for NEP API tests."""

from validators import (
    provide_list_of_devices_in_nep_validator,
    provide_general_information_of_devices_validator,
    provide_actual_equipment_information_of_devices_validator,
    provide_air_interface_general_information_of_devices_validator,
    provide_air_interface_transmission_mode_validator,
    provide_ethernet_container_general_info_validator,
    provide_wire_interface_general_info_validator,
    provide_ltp_equipment_mappings_validator,
    provide_interfaces_per_device_validator,
)

# Test case definitions
PROVIDE_LIST_OF_DEVICES_IN_NEP = {
    "method": "POST",
    "endpoint": "/v1/provide-list-of-devices-in-nep",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_list_of_devices_in_nep_validator,
    "tableChecks": [
        {
            "table": "devices_general_infos",
            "matchApiResponse": True,
            "responseSource": "json",
            "responsePath": "mount-name-list",
            "compareColumns": ["mount-name", "timestamp"],
            "responseColumnMap": {
                "mount-name": "mount-name",
                "timestamp": "last-data-update-timestamp",
            },
            "expectedColumns": [
                "mount-name",
                "timestamp",
                "external-label",
                "device-model-name",
                "system-name",
            ],
            "minRows": 1,
        }
    ],
}

PROVIDE_GENERAL_INFORMATION_OF_DEVICES = {
    "method": "POST",
    "endpoint": "/v1/provide-general-information-of-devices",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_general_information_of_devices_validator,
    "tableChecks": [
        {
            "table": "devices_general_infos",
            "matchApiResponse": True,
            "expectedColumns": [
                "mount-name",
                "timestamp",
                "external-label",
                "device-model-name",
                "system-name",
            ],
            "compareColumns": [
                "mount-name",
                "timestamp",
                "external-label",
                "device-model-name",
                "system-name",
            ],
            "minRows": 1,
        }
    ],
}

PROVIDE_ACTUAL_EQUIPMENT_INFORMATION_OF_DEVICES = {
    "method": "POST",
    "endpoint": "/v1/provide-actual-equipment-information-of-devices",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_actual_equipment_information_of_devices_validator,
    "tableChecks": [
        {
            "table": "equipment_general_infos",
            "matchApiResponse": True,
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "version",
                "description",
                "model-identifier",
                "part-type-identifier",
                "type-name",
                "manufacturer-name",
                "manufacturer-identifier",
            ],
            "compareColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "version",
                "description",
                "model-identifier",
                "part-type-identifier",
                "type-name",
                "manufacturer-name",
                "manufacturer-identifier",
            ],
            "minRows": 1,
        }
    ],
}

PROVIDE_AIR_INTERFACE_GENERAL_INFORMATION_OF_DEVICES = {
    "method": "POST",
    "endpoint": "/v1/provide-air-interface-general-information-of-devices",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_air_interface_general_information_of_devices_validator,
    "tableChecks": [
        {
            "table": "air_interface_general_infos",
            "matchApiResponse": True,
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "operational-state",
                "administrative-state",
                "original-ltp-name",
                "external-label",
                "transmission-mode-min",
                "transmission-mode-max",
                "xpic-is-on",
                "power-is-on",
                "transmitter-is-on",
                "interface-status",
                "type-of-equipment",
            ],
            "compareColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "operational-state",
                "administrative-state",
                "original-ltp-name",
                "external-label",
                "transmission-mode-min",
                "transmission-mode-max",
                "xpic-is-on",
                "power-is-on",
                "transmitter-is-on",
                "interface-status",
                "type-of-equipment",
            ],
            "minRows": 1,
        }
    ],
}

PROVIDE_AIR_INTERFACE_TRANSMISSION_MODE = {
    "method": "POST",
    "endpoint": "/v1/provide-air-interface-transmission-mode-lists-of-devices",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_air_interface_transmission_mode_validator,
    "tableChecks": [
        {
            "table": "air_interface_transmission_modes",
            "matchApiResponse": True,
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "transmission-mode-name",
                "symbol-rate-reduction-factor",
                "modulation-scheme-at-lct",
                "modulation-scheme",
                "code-rate",
                "channel-bandwidth",
                "xpic-is-avail",
                "capa-factor",
            ],
            "compareColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "transmission-mode-name",
                "symbol-rate-reduction-factor",
                "modulation-scheme-at-lct",
                "modulation-scheme",
                "code-rate",
                "channel-bandwidth",
                "xpic-is-avail",
                "capa-factor",
            ],
            "minRows": 1,
        }
    ],
}

PROVIDE_ETHERNET_CONTAINER_GENERAL_INFO = {
    "method": "POST",
    "endpoint": "/v1/provide-ethernet-container-general-information-of-devices",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_ethernet_container_general_info_validator,
    "tableChecks": [
        {
            "table": "ethernet_container_general_infos",
            "matchApiResponse": True,
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "operational-state",
                "administrative-state",
                "original-ltp-name",
                "interface-name",
                "bundling-is-on",
                "interface-status",
            ],
            "compareColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "operational-state",
                "administrative-state",
                "original-ltp-name",
                "interface-name",
                "bundling-is-on",
                "interface-status",
            ],
            "minRows": 1,
        }
    ],
}

PROVIDE_WIRE_INTERFACE_GENERAL_INFO = {
    "method": "POST",
    "endpoint": "/v1/provide-wire-interface-general-information-of-devices",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_wire_interface_general_info_validator,
    "tableChecks": [
        {
            "table": "wire_interface_general_infos",
            "matchApiResponse": True,
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "operational-state",
                "administrative-state",
                "original-ltp-name",
                "interface-name",
                "fixed-pmd-kind",
                "interface-status",
                "pmd-kind-cur",
                "pmd-name",
                "duplex",
                "speed",
            ],
            "compareColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "operational-state",
                "administrative-state",
                "original-ltp-name",
                "interface-name",
                "fixed-pmd-kind",
                "interface-status",
                "pmd-kind-cur",
                "pmd-name",
                "duplex",
                "speed",
            ],
            "minRows": 1,
        }
    ],
}

PROVIDE_LTP_EQUIPMENT_MAPPINGS = {
    "method": "POST",
    "endpoint": "/v1/provide-ltp-equipment-mappings",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_ltp_equipment_mappings_validator,
    "tableChecks": [
        {
            "table": "ltp_equipment_mappings",
            "matchApiResponse": True,
            "minRows": 1,
            "expectedColumns": [
                "mount-name",
                "uuid",
                "timestamp",
                "connector",
                "equipment",
            ],
            "compareColumns": [
                "mount-name",
                "uuid",
                "timestamp",
                "connector",
                "equipment",
            ],
        }
    ],
}

PROVIDE_INTERFACES_PER_DEVICE = {
    "method": "POST",
    "endpoint": "/v1/provide-list-of-interfaces-per-device-in-nep",
    "requestBody": {},
    "minResponseDataCount": 1,
    "validateResponse": provide_interfaces_per_device_validator,
    "apiDbMatchChecks": [
        {
            "name": "interfaces_per_device_union",
            "matchApiResponse": True,
            "compareColumns": [
                "mount-name",
                "timestamp",
                "uuid",
                "local-id",
                "original-ltp-name",
                "interface-type",
                "interface-status",
            ],
            "dbQuery": """
                SELECT "mount-name", "timestamp", "uuid", "local-id", "original-ltp-name", "air-interface" as "interface-type", "interface-status" FROM "air_interface_general_infos"
                UNION ALL
                SELECT "mount-name", "timestamp", "uuid", "local-id", "original-ltp-name", "wire-interface" as "interface-type", "interface-status" FROM "wire_interface_general_infos"
                UNION ALL
                SELECT "mount-name", "timestamp", "uuid", "local-id", "original-ltp-name", "ethernet-container" as "interface-type", "interface-status" FROM "ethernet_container_general_infos"
            """,
        }
    ],
    "tableChecks": [
        {
            "table": "air_interface_general_infos",
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "original-ltp-name",
                "interface-status",
            ],
            "minRows": 1,
        },
        {
            "table": "wire_interface_general_infos",
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "original-ltp-name",
                "interface-status",
            ],
            "minRows": 1,
        },
        {
            "table": "ethernet_container_general_infos",
            "expectedColumns": [
                "mount-name",
                "uuid",
                "local-id",
                "timestamp",
                "original-ltp-name",
                "interface-status",
            ],
            "minRows": 1,
        },
    ],
}

# Export all test cases
TEST_CASES = {
    "provideListOfDevicesInNep": PROVIDE_LIST_OF_DEVICES_IN_NEP,
    "provideGeneralInformationOfDevices": PROVIDE_GENERAL_INFORMATION_OF_DEVICES,
    "provideActualEquipmentInformationOfDevices": PROVIDE_ACTUAL_EQUIPMENT_INFORMATION_OF_DEVICES,
    "provideAirInterfaceGeneralInformationOfDevices": PROVIDE_AIR_INTERFACE_GENERAL_INFORMATION_OF_DEVICES,
    "provideAirInterfaceTransmissionMode": PROVIDE_AIR_INTERFACE_TRANSMISSION_MODE,
    "provideEthernetContainerGeneralInfo": PROVIDE_ETHERNET_CONTAINER_GENERAL_INFO,
    "provideWireInterfaceGeneralInfo": PROVIDE_WIRE_INTERFACE_GENERAL_INFO,
    "provideLtpEquipmentMappings": PROVIDE_LTP_EQUIPMENT_MAPPINGS,
    "provideInterfacesPerDevice": PROVIDE_INTERFACES_PER_DEVICE,
}

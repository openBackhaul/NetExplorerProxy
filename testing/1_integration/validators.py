"""Validator functions for NEP API tests."""

import re
from datetime import datetime
from typing import Dict, List, Any


# Shared validation functions
def has_valid_timestamp(value: Any) -> bool:
    """Check if value is a valid timestamp."""
    if not value:
        return False

    try:
        # Try to parse as ISO timestamp
        datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return True
    except (ValueError, TypeError):
        # Check if it matches timestamp pattern
        timestamp_pattern = r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}"
        return bool(re.match(timestamp_pattern, str(value)))


def ensure_non_empty_string(value: Any) -> bool:
    """Check if value is a non-empty string."""
    return isinstance(value, str) and bool(value.strip())


def assert_error_contract(response: Dict[str, Any]) -> None:
    """Assert error response contract."""
    assert isinstance(response.get("body"), dict), (
        "Error response body should be an object"
    )
    assert isinstance(response["body"].get("code"), (int, float)), (
        "Error code should be a number"
    )
    assert isinstance(response["body"].get("message"), str), (
        "Error message should be a string"
    )


# Validator functions
async def provide_list_of_devices_in_nep_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-list-of-devices-in-nep.

    OpenAPI spec: This endpoint returns JSON with mount-name-list array.
    Each item must have: mount-name, last-data-update-timestamp
    """
    mount_list = response.get("body", {}).get("mount-name-list", [])
    assert isinstance(mount_list, list), "mount-name-list should be an array"
    assert len(mount_list) > 0, "mount-name-list should not be empty"

    for item in mount_list:
        assert isinstance(item, dict), "mount-name-list item should be an object"
        assert ensure_non_empty_string(item.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert item.get("last-data-update-timestamp"), (
            "last-data-update-timestamp should exist"
        )
        assert has_valid_timestamp(item.get("last-data-update-timestamp")), (
            "last-data-update-timestamp should be valid timestamp"
        )


async def provide_general_information_of_devices_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-general-information-of-devices."""
    assert response_rows and len(response_rows) > 0, (
        "general-information should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )


async def provide_actual_equipment_information_of_devices_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-actual-equipment-information-of-devices."""
    assert response_rows and len(response_rows) > 0, (
        "actual-equipment should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert ensure_non_empty_string(row.get("uuid")), (
            "uuid should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )


async def provide_air_interface_general_information_of_devices_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-air-interface-general-information-of-devices."""
    assert response_rows and len(response_rows) > 0, (
        "air-interface-general should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert ensure_non_empty_string(row.get("uuid")), (
            "uuid should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )
        assert ensure_non_empty_string(row.get("operational-state")), (
            "operational-state should be non-empty string"
        )

        assert ensure_non_empty_string(row.get("interface-status")), (
            "interface-status should be non-empty string"
        )


async def provide_air_interface_transmission_mode_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-air-interface-transmission-mode-lists-of-devices."""
    assert response_rows and len(response_rows) > 0, (
        "air-interface-transmission-mode should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert ensure_non_empty_string(row.get("uuid")), (
            "uuid should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )
        assert ensure_non_empty_string(row.get("transmission-mode-name")), (
            "transmission-mode-name should be non-empty string"
        )


async def provide_ethernet_container_general_info_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-ethernet-container-general-information-of-devices."""
    assert response_rows and len(response_rows) > 0, (
        "ethernet-container should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert ensure_non_empty_string(row.get("uuid")), (
            "uuid should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )


async def provide_wire_interface_general_info_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-wire-interface-general-information-of-devices."""
    assert response_rows and len(response_rows) > 0, (
        "wire-interface should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert ensure_non_empty_string(row.get("uuid")), (
            "uuid should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )


async def provide_ltp_equipment_mappings_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-ltp-equipment-mappings."""
    if response_data_count == 0:
        return
    assert response_rows and len(response_rows) > 0, (
        "ltp-equipment-mappings should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert ensure_non_empty_string(row.get("uuid")), (
            "uuid should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )
        assert "connector" in row, "connector should exist"
        assert "equipment" in row, "equipment should exist"


async def provide_interfaces_per_device_validator(
    response: Dict[str, Any],
    response_rows: List[Dict[str, Any]],
    response_data_count: int,
    test_file: str,
    test_name: str,
) -> None:
    """Validator for /v1/provide-list-of-interfaces-per-device-in-nep."""
    assert response_rows and len(response_rows) > 0, (
        "interfaces-per-device should return data rows"
    )
    for row in response_rows:
        assert ensure_non_empty_string(row.get("mount-name")), (
            "mount-name should be non-empty string"
        )
        assert row.get("timestamp"), "timestamp should exist"
        assert has_valid_timestamp(row.get("timestamp")), (
            "timestamp should be valid timestamp"
        )
        assert row.get("interface-status"), (
            "interface-status should be non-empty string"
        )

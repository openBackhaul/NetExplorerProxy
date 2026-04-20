"""Test 6: API: /v1/provide-ethernet-container-general-information-of-devices."""

import pytest
import asyncio
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from test_helpers import (
    run_api_db_case,
    run_invalid_json_case,
    run_invalid_field_type_case,
)
from test_cases import TEST_CASES
from validators import assert_error_contract


class TestProvideEthernetContainerGeneralInformationOfDevices:
    """Test class for /v1/provide-ethernet-container-general-information-of-devices API."""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_returns_response_and_ethernet_container_general_info_columns_exist(
        self,
    ):
        """Test that returns response and ethernet_container_general_info columns exist."""
        test_file = __file__
        test_name = (
            "test_returns_response_and_ethernet_container_general_info_columns_exist"
        )

        test_case = TEST_CASES["provideEthernetContainerGeneralInfo"]
        await run_api_db_case(test_case, test_file, test_name)

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_returns_400_with_structured_error_body_when_request_body_is_invalid_json(
        self,
    ):
        """Test that returns 400 with structured error body when request body is invalid JSON."""
        test_case = TEST_CASES["provideEthernetContainerGeneralInfo"]
        response = await run_invalid_json_case(test_case)

        # Check error contract
        assert_error_contract(response)

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_returns_400_when_mount_name_list_contains_non_string_items(self):
        """Test that returns 400 when mount-name-list contains non-string items."""
        test_case = TEST_CASES["provideEthernetContainerGeneralInfo"]

        await run_invalid_field_type_case(test_case, {"mount-name-list": [12345]})

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_returns_400_with_structured_error_body_when_known_field_has_wrong_type(
        self,
    ):
        """Test that returns 400 with structured error body when known field has wrong type."""
        test_case = TEST_CASES["provideEthernetContainerGeneralInfo"]
        response = await run_invalid_field_type_case(
            test_case, {"data-age": "not-a-number"}
        )

        # Check error contract
        assert_error_contract(response)

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_returns_400_when_mount_name_list_is_not_an_array(self):
        """Test that returns 400 when mount-name-list is not an array."""
        test_case = TEST_CASES["provideEthernetContainerGeneralInfo"]

        await run_invalid_field_type_case(
            test_case, {"mount-name-list": "not-an-array"}
        )

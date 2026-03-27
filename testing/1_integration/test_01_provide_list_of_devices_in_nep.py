"""Test 1: API: /v1/provide-list-of-devices-in-nep."""

import pytest
import asyncio
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from test_helpers import run_api_db_case, run_invalid_json_case
from test_cases import TEST_CASES
from validators import assert_error_contract


class TestProvideListOfDevicesInNep:
    """Test class for /v1/provide-list-of-devices-in-nep API."""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_returns_response_and_devices_general_info_columns_exist(self):
        """Test that returns response and devices_general_info columns exist."""
        test_file = __file__
        test_name = "test_returns_response_and_devices_general_info_columns_exist"

        test_case = TEST_CASES["provideListOfDevicesInNep"]
        await run_api_db_case(test_case, test_file, test_name)

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_returns_400_when_request_body_is_invalid_json(self):
        """Test that returns 400 when request body is invalid JSON."""
        test_case = TEST_CASES["provideListOfDevicesInNep"]
        response = await run_invalid_json_case(test_case)

        # Check error contract
        assert_error_contract(response)

"""Test 0: Pre-run embed-yourself."""

import pytest
import asyncio
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from test_helpers import ensure_data_loaded


class TestPrerunEmbedYourself:
    """Test class for pre-run embed-yourself functionality."""

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.slow
    async def test_ensures_nep_has_loaded_data_before_other_api_tests(self):
        """Test that ensures NEP has loaded data before other API tests."""
        test_file = __file__
        test_name = "test_ensures_nep_has_loaded_data_before_other_api_tests"

        await ensure_data_loaded(
            allow_embed=True, test_file=test_file, test_name=test_name
        )

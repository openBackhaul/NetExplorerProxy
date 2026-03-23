import os
import sys
import pytest
import logging
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Pytest configuration
def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")


# Fixtures
@pytest.fixture
def base_url():
    """Get base URL from environment or use default."""
    return os.environ.get("NEP_BASE_URL", "http://127.0.0.1:4018")


@pytest.fixture
def operation_key():
    """Get operation key from environment."""
    return os.environ.get("NEP_OPERATION_KEY", "Operation key not yet provided.")


@pytest.fixture
def authorization():
    """Get authorization from environment."""
    return os.environ.get("NEP_AUTHORIZATION")


@pytest.fixture
def db_file_path():
    """Get database file path."""
    return os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "server",
        "database",
        "neb_db.db",
    )


@pytest.fixture
def logs_dir():
    """Get logs directory path."""
    logs_path = os.path.join(os.path.dirname(__file__), "logs")
    os.makedirs(logs_path, exist_ok=True)
    return logs_path


@pytest.fixture
def default_headers(operation_key, authorization):
    """Get default headers for HTTP requests."""
    headers = {
        "Content-Type": "application/json",
        "operation-key": operation_key,
        "user": os.environ.get("NEP_USER", "Katharina Mohr"),
        "originator": os.environ.get("NEP_ORIGINATOR", "NEP_LIVE_SCENARIO_TEST"),
        "x-correlator": os.environ.get(
            "NEP_X_CORRELATOR", "550e8400-e29b-41d4-a716-446655440000"
        ),
        "trace-indicator": os.environ.get("NEP_TRACE_INDICATOR", "1"),
        "customer-journey": os.environ.get("NEP_CUSTOMER_JOURNEY", "live-test"),
    }

    if authorization:
        headers["Authorization"] = authorization

    return headers

import os
import sys
import subprocess
import socket
import time
import base64
import pytest
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def wait_for_port(port, timeout=60):
    """Wait for port to be available."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(("localhost", port))
            sock.close()
            if result == 0:
                return True
        except Exception:
            pass
        time.sleep(1)
    return False


def check_http_200(port, path="/", timeout=60):
    """Check if HTTP endpoint returns 200."""
    import requests

    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = requests.get(f"http://localhost:{port}{path}", timeout=5)
            if resp.status_code == 200:
                return True
            return True
        except Exception:
            pass
        time.sleep(1)
    return False


def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")


def parse_launch_json():
    """Parse .vscode/launch.json and return config dict."""
    import json
    import re

    launch_path = Path(__file__).parent.parent.parent / ".vscode" / "launch.json"
    config = {}
    if launch_path.exists():
        with open(launch_path, encoding="utf-8") as f:
            content = f.read()
            content = re.sub(r"//.*", "", content)
            content = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
            data = json.loads(content)
            for cfg in data.get("configurations", []):
                if cfg.get("name") == "Launch Program":
                    config = cfg.get("env", {})
                    break
    return config


@pytest.fixture(scope="session")
def nep_server():
    """Start NEP server before tests, stop after session."""
    launch_env = parse_launch_json()

    password = launch_env.get("PASSWORD", "mypassword")
    try:
        password = base64.b64decode(password).decode("utf-8")
    except Exception:
        password = launch_env.get("PASSWORD", "mypassword")

    for key, value in launch_env.items():
        if key == "PASSWORD":
            os.environ[key] = password
        else:
            os.environ[key] = value

    env = os.environ.copy()
    env["PASSWORD"] = password

    server_path = Path(__file__).parent.parent.parent

    logger.info("Starting NEP server...")
    logger.info(
        f"Environment: DB={env.get('DB')}, HOST={env.get('HOST')}, USER={env.get('USER')}, DB_NAME={env.get('DB_NAME')}"
    )

    proc = subprocess.Popen(
        ["node", "server/index.js"],
        cwd=str(server_path),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    if not wait_for_port(4018, timeout=60):
        stdout, _ = proc.communicate(timeout=5)
        logger.error(
            f"NEP server failed to start. Output: {stdout.decode('utf-8', errors='replace')}"
        )
        proc.kill()
        raise RuntimeError("NEP server did not start in time")

    logger.info("NEP server is ready on port 4018")

    stdout_lines = []
    import threading

    def read_output():
        for line in iter(proc.stdout.readline, b""):
            if line:
                stdout_lines.append(line.decode("utf-8", errors="replace"))

    t = threading.Thread(target=read_output, daemon=True)
    t.start()

    if not check_http_200(4015, timeout=30):
        proc.kill()
        raise RuntimeError("Registry Office (port 4015) not available")

    logger.info("Registry Office (port 4015) is available")

    yield proc

    if stdout_lines:
        logger.info("NEP server output:")
        for line in stdout_lines[:50]:
            logger.info(f"  {line.rstrip()}")

    logger.info("Stopping NEP server...")
    proc.terminate()
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()


@pytest.fixture(scope="session", autouse=True)
def setup_services(nep_server):
    """Auto-use fixture to ensure NEP server is started before any test runs."""
    pass


@pytest.fixture
def db_config():
    """Get DB config from launch.json."""
    return parse_launch_json()


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

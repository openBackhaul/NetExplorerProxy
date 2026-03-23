import os
import json
import sqlite3
import asyncio
import aiohttp
import logging
import hashlib
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

logger = logging.getLogger(__name__)

# Environment variables
BASE_URL = os.environ.get("NEP_BASE_URL", "http://127.0.0.1:4018")
OPERATION_KEY = os.environ.get("NEP_OPERATION_KEY", "Operation key not yet provided.")
AUTHORIZATION = os.environ.get("NEP_AUTHORIZATION")

# Paths
DB_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "server",
    "database",
    "neb_db.db",
)
LOGS_DIR_PATH = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOGS_DIR_PATH, exist_ok=True)

# Headers
HEADERS = {
    "Content-Type": "application/json",
    "operation-key": OPERATION_KEY,
    "user": os.environ.get("NEP_USER", "Katharina Mohr"),
    "originator": os.environ.get("NEP_ORIGINATOR", "NEP_LIVE_SCENARIO_TEST"),
    "x-correlator": os.environ.get(
        "NEP_X_CORRELATOR", "550e8400-e29b-41d4-a716-446655440000"
    ),
    "trace-indicator": os.environ.get("NEP_TRACE_INDICATOR", "1"),
    "customer-journey": os.environ.get("NEP_CUSTOMER_JOURNEY", "live-test"),
}

if AUTHORIZATION:
    HEADERS["Authorization"] = AUTHORIZATION


# Helper functions
def sanitize_file_name(value: str) -> str:
    """Sanitize string for use in file names."""
    if not value:
        return "unknown"
    sanitized = re.sub(r"[^a-z0-9]+", "-", value.lower())
    sanitized = re.sub(r"^-+|-+$", "", sanitized)
    return sanitized or "unknown"


def short_hash(value: str) -> str:
    """Generate short hash of a string."""
    return hashlib.sha1(value.encode() if value else b"").hexdigest()[:10]


def to_file_token(value: str, max_len: int = 48) -> str:
    """Convert value to file token."""
    if not value:
        value = "unknown"
    base = sanitize_file_name(value)[:max_len]
    return f"{base}-{short_hash(value)}"


def get_log_file_path(test_file: str, test_name: str) -> str:
    """Get log file path for a test."""
    test_file_name = to_file_token(Path(test_file).stem, 36)
    test_name_token = to_file_token(test_name, 60)
    return os.path.join(LOGS_DIR_PATH, f"{test_file_name}__{test_name_token}.log")


def log_line(
    message: str, test_file: Optional[str] = None, test_name: Optional[str] = None
):
    """Log message to console and file."""
    timestamp = datetime.now().isoformat()
    log_message = f"[{timestamp}] {message}"

    # Log to console
    logger.info(message)

    # Log to file if test context is provided
    if test_file and test_name:
        log_file_path = get_log_file_path(test_file, test_name)
        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(f"{log_message}\n")


def format_response_body(response: Dict[str, Any]) -> str:
    """Format response body for logging."""
    if not response:
        return ""

    body = response.get("body")
    raw = response.get("raw", "")

    if isinstance(body, str):
        return body

    if body is None:
        return str(raw)

    try:
        return json.dumps(body, indent=2)
    except (TypeError, ValueError):
        return str(body)


def log_api_response(
    label: str,
    response: Dict[str, Any],
    test_file: Optional[str] = None,
    test_name: Optional[str] = None,
):
    """Log API response."""
    status = response.get("status", "unknown")
    log_line(f"{label}: status={status}", test_file, test_name)

    if test_file and test_name:
        log_file_path = get_log_file_path(test_file, test_name)
        formatted_body = format_response_body(response)

        # Add line numbers to response body
        lines = formatted_body.split("\n")
        numbered_lines = []
        for i, line in enumerate(lines, 1):
            if line.strip() == "":
                numbered_lines.append(line)
            else:
                numbered_lines.append(f"{i:4} | {line}")

        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(f"\n[{datetime.now().isoformat()}] {label}: body\n")
            f.write("\n".join(numbered_lines))
            f.write("\n")


async def http_request(
    method: str,
    endpoint: str,
    body: Any = None,
    headers: Optional[Dict[str, str]] = None,
    raw_body: Optional[str] = None,
) -> Dict[str, Any]:
    """Make HTTP request."""
    url = f"{BASE_URL}{endpoint}"
    request_headers = HEADERS.copy()
    if headers:
        request_headers.update(headers)

    async with aiohttp.ClientSession() as session:
        if raw_body is not None:
            data = raw_body
        elif body is None:
            data = None
        elif isinstance(body, str):
            data = body
        else:
            data = json.dumps(body)
            request_headers["Content-Length"] = str(len(data.encode("utf-8")))

        try:
            async with session.request(
                method=method,
                url=url,
                headers=request_headers,
                data=data,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                raw = await response.text()
                try:
                    parsed = json.loads(raw) if raw else None
                except json.JSONDecodeError:
                    parsed = raw

                return {
                    "status": response.status,
                    "body": parsed,
                    "raw": raw,
                    "headers": dict(response.headers),
                }
        except Exception as e:
            logger.error(f"HTTP request failed: {e}")
            raise


def open_sqlite(file_path: str) -> sqlite3.Connection:
    """Open SQLite database connection."""
    return sqlite3.connect(file_path)


def get_table_rows_by_columns(
    db: sqlite3.Connection, table_name: str, columns: List[str]
) -> List[Dict[str, Any]]:
    """Get rows from table with specific columns."""
    quoted_columns = [f'"{col}"' for col in columns]
    query = f'SELECT {", ".join(quoted_columns)} FROM "{table_name}";'

    cursor = db.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()

    result = []
    for row in rows:
        row_dict = {}
        for i, col in enumerate(columns):
            row_dict[col] = row[i]
        result.append(row_dict)

    return result


def get_by_path(obj: Any, path: str) -> Any:
    """Get value from object by dot notation path."""
    if not path:
        return obj

    current = obj
    for key in path.split("."):
        if isinstance(current, dict):
            current = current.get(key)
        elif isinstance(current, list) and key.isdigit():
            index = int(key)
            if 0 <= index < len(current):
                current = current[index]
            else:
                return None
        else:
            return None
        if current is None:
            return None

    return current


def is_timestamp_column(column_name: str) -> bool:
    """Check if column is a timestamp column."""
    name = (column_name or "").lower()
    return name == "timestamp" or name.endswith("-timestamp")


def is_boolean_like_column(column_name: str) -> bool:
    """Check if column is a boolean-like column."""
    name = (column_name or "").lower()
    return (
        "-is-" in name
        or name.startswith("is-")
        or name.endswith("-is-on")
        or name.endswith("-is-avail")
    )


def normalize_timestamp(value: Any) -> str:
    """Normalize timestamp value."""
    if value is None:
        return ""

    raw = str(value).strip()
    if not raw:
        return ""

    # Try to parse and format as ISO
    try:
        # Handle various timestamp formats
        # First try to handle the format with timezone offset
        if " +00:00" in raw:
            # Format: "2026-03-20 14:19:25.017 +00:00"
            dt_str = raw.replace(" +00:00", "")
            try:
                dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S.%f")
                return dt.isoformat() + "Z"
            except ValueError:
                try:
                    dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                    return dt.isoformat() + "Z"
                except ValueError:
                    pass

        # Handle ISO format with Z
        if raw.endswith("Z"):
            dt_str = raw.replace("Z", "")
            try:
                dt = datetime.fromisoformat(dt_str)
                return dt.isoformat() + "Z"
            except ValueError:
                pass

        # Handle other formats
        for fmt in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"]:
            try:
                dt = datetime.strptime(raw, fmt)
                return dt.isoformat() + "Z"
            except ValueError:
                continue

        # If no format matches, return original
        return raw
    except Exception:
        return raw


def normalize_boolean_like(value: Any) -> str:
    """Normalize boolean-like value."""
    raw = str(value).strip().lower()
    if raw in ["1", "true"]:
        return "true"
    if raw in ["0", "false"]:
        return "false"
    return raw


def normalize_value_for_compare(value: Any, column_name: str) -> str:
    """Normalize value for comparison."""
    if value is None:
        return ""

    string_value = str(value).strip()
    if not string_value:
        return ""

    # Handle boolean strings
    if string_value.lower() in ["true", "false"]:
        return string_value.lower()

    # Handle timestamps
    if is_timestamp_column(column_name):
        return normalize_timestamp(string_value)

    # Handle boolean-like columns
    if is_boolean_like_column(column_name):
        return normalize_boolean_like(string_value)

    # Handle numbers
    try:
        # Check if it's a number
        float_val = float(string_value)
        if string_value.replace(".", "", 1).isdigit():
            return str(float_val)
    except ValueError:
        pass

    return string_value


def build_comparable_rows(rows: List[Dict[str, Any]], columns: List[str]) -> List[str]:
    """Build comparable string representations of rows."""
    comparable = []
    for row in rows:
        row_dict = {}
        for column in columns:
            row_dict[column] = normalize_value_for_compare(row.get(column), column)
        comparable.append(json.dumps(row_dict, sort_keys=True))

    comparable.sort()
    return comparable


def get_response_rows_for_table_check(
    response: Dict[str, Any], table_check: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Get response rows for table check."""
    if table_check and table_check.get("responseSource") == "json":
        body = response.get("body")
        source_rows = get_by_path(body, table_check.get("responsePath", ""))

        if not isinstance(source_rows, list):
            return []

        response_column_map = table_check.get("responseColumnMap", {})
        compare_columns = table_check.get(
            "compareColumns", table_check.get("expectedColumns", [])
        )

        result = []
        for source_row in source_rows:
            if not isinstance(source_row, dict):
                continue

            mapped = {}
            for column in compare_columns:
                source_field = response_column_map.get(column, column)
                mapped[column] = source_row.get(source_field)
            result.append(mapped)

        return result

    return get_response_rows_for_validation(response)


async def get_db_rows_for_table_check(
    db: sqlite3.Connection, table_check: Dict[str, Any], compare_columns: List[str]
) -> List[Dict[str, Any]]:
    """Get database rows for table check."""
    if table_check and table_check.get("dbQuery"):
        cursor = db.cursor()
        cursor.execute(table_check["dbQuery"])
        rows = cursor.fetchall()

        # Convert to list of dicts
        result = []
        for row in rows:
            row_dict = {}
            for i, col in enumerate(compare_columns):
                row_dict[col] = row[i]
            result.append(row_dict)

        return result

    return get_table_rows_by_columns(db, table_check["table"], compare_columns)


async def assert_response_matches_table(
    db: sqlite3.Connection,
    response_rows: List[Dict[str, Any]],
    table_name: str,
    table_check: Dict[str, Any],
    compare_columns: List[str],
    endpoint: str,
    test_file: str,
    test_name: str,
):
    """Assert that API response matches database table."""
    if not isinstance(response_rows, list) or len(response_rows) == 0:
        raise AssertionError(
            f"Cannot compare API response with table {table_name}: "
            f"parsed response rows are empty for {endpoint}."
        )

    db_rows = await get_db_rows_for_table_check(db, table_check, compare_columns)

    comparable_response_rows = build_comparable_rows(response_rows, compare_columns)
    comparable_db_rows = build_comparable_rows(db_rows, compare_columns)

    log_line(
        f"Cross-check {table_name}: API rows={len(comparable_response_rows)}, "
        f"DB rows={len(comparable_db_rows)}, columns=[{', '.join(compare_columns)}]",
        test_file,
        test_name,
    )

    assert len(comparable_db_rows) == len(comparable_response_rows), (
        f"Row count mismatch for {table_name}: DB has {len(comparable_db_rows)}, API has {len(comparable_response_rows)}"
    )

    for i, (db_row, api_row) in enumerate(
        zip(comparable_db_rows, comparable_response_rows)
    ):
        assert db_row == api_row, (
            f"Row {i} mismatch for {table_name}: DB={db_row}, API={api_row}"
        )


async def get_table_columns(db: sqlite3.Connection, table_name: str) -> List[str]:
    """Get column names for a table."""
    cursor = db.cursor()
    cursor.execute(f'PRAGMA table_info("{table_name}");')
    rows = cursor.fetchall()
    return [row[1] for row in rows]


async def get_table_row_count(db: sqlite3.Connection, table_name: str) -> int:
    """Get row count for a table."""
    cursor = db.cursor()
    cursor.execute(f'SELECT COUNT(*) as cnt FROM "{table_name}";')
    row = cursor.fetchone()
    return row[0] if row else 0


def get_csv_data_count(text: str) -> int:
    """Get data count from CSV text."""
    normalized = (text or "").replace("\r\n", "\n").strip()
    if not normalized:
        return 0

    lines = [line.strip() for line in normalized.split("\n") if line.strip()]
    if len(lines) <= 1:
        # Try to count timestamps
        date_hits = re.findall(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", normalized)
        return len(date_hits) if date_hits else 0

    return max(len(lines) - 1, 0)


def parse_csv_rows(text: str) -> List[Dict[str, str]]:
    """Parse CSV rows from text."""
    normalized = (text or "").replace("\r\n", "\n").strip()
    if not normalized:
        return []

    lines = [line.strip() for line in normalized.split("\n") if line.strip()]
    if len(lines) <= 1:
        return []

    headers = [header.strip() for header in lines[0].split(";")]
    result = []

    for line in lines[1:]:
        values = line.split(";")
        row = {}
        for i, header in enumerate(headers):
            row[header] = values[i] if i < len(values) else ""
        result.append(row)

    return result


def get_response_rows_for_validation(response: Dict[str, Any]) -> List[Dict[str, str]]:
    """Get response rows for validation."""
    if not response:
        return []

    body = response.get("body")
    raw = response.get("raw", "")

    if isinstance(body, str):
        return parse_csv_rows(body)

    if body is None and isinstance(raw, str):
        return parse_csv_rows(raw)

    return []


def get_response_data_count(body: Any, raw: Optional[str] = None) -> int:
    """Get data count from response."""
    if body is None:
        return get_csv_data_count(raw) if raw else 0

    if isinstance(body, list):
        return len(body)

    if isinstance(body, str):
        return get_csv_data_count(body)

    if not isinstance(body, dict):
        return 1

    # Check for mount-name-list
    mount_name_list = body.get("mount-name-list")
    if isinstance(mount_name_list, list):
        return len(mount_name_list)

    # Count arrays in object values
    count = 0
    for value in body.values():
        if isinstance(value, list):
            count += len(value)
        elif isinstance(value, dict):
            count += get_response_data_count(value)

    if count > 0:
        return count

    # Object exists but has no list-like payload
    return len(body) if body else 0


async def ensure_data_loaded(
    allow_embed: bool = False,
    test_file: Optional[str] = None,
    test_name: Optional[str] = None,
) -> None:
    """Ensure data is loaded in NEP."""
    log_line(
        "Calling POST /v1/provide-list-of-devices-in-nep (preflight)",
        test_file,
        test_name,
    )

    try:
        list_response = await http_request("POST", "/v1/provide-list-of-devices-in-nep")
        log_api_response(
            "Preflight /v1/provide-list-of-devices-in-nep",
            list_response,
            test_file,
            test_name,
        )

        if list_response["status"] == 401:
            raise AssertionError(
                "NEP returned 401 Unauthorized on preflight. "
                "Check NEP_OPERATION_KEY / NEP_AUTHORIZATION."
            )

        if list_response["status"] != 200:
            raise AssertionError(
                f"Preflight device list failed with status {list_response['status']}"
            )

        mount_list = list_response.get("body", {}).get("mount-name-list", [])
        count = len(mount_list) if isinstance(mount_list, list) else 0

        if count > 0:
            log_line(
                f"Preflight: device list already populated ({count}).",
                test_file,
                test_name,
            )
            return

        if not allow_embed:
            raise AssertionError(
                "Device list is empty. Run test 0 (embed-yourself pre-run) first."
            )

        log_line(
            "Preflight: no devices found, calling /v1/embed-yourself to trigger ingestion.",
            test_file,
            test_name,
        )

        # Get registry office configuration from environment
        registry_office_host = os.environ.get(
            "NEP_REGISTRY_OFFICE_HOST",
            os.environ.get("RO_HOST", os.environ.get("MWDI_HOST", "127.0.0.1")),
        )
        registry_office_port = int(
            os.environ.get(
                "NEP_REGISTRY_OFFICE_PORT",
                os.environ.get("RO_PORT", os.environ.get("MWDI_PORT", "4015")),
            )
        )
        registry_office_application = os.environ.get(
            "NEP_REGISTRY_OFFICE_APPLICATION",
            os.environ.get("RO_APPLICATION", "RegistrationApplication"),
        )
        registry_office_release = os.environ.get(
            "NEP_REGISTRY_OFFICE_RELEASE", os.environ.get("RO_RELEASE", "43.2.5")
        )

        embed_body = {
            "registry-office-application": registry_office_application,
            "registry-office-application-release-number": registry_office_release,
            "relay-server-replacement-operation": os.environ.get(
                "NEP_RELAY_SERVER_REPLACEMENT_OPERATION", "/v1/relay-server-replacement"
            ),
            "relay-operation-update-operation": os.environ.get(
                "NEP_RELAY_OPERATION_UPDATE_OPERATION", "/v1/relay-operation-update"
            ),
            "deregistration-operation": os.environ.get(
                "NEP_DEREGISTRATION_OPERATION", "/v1/deregister-application"
            ),
            "registry-office-protocol": os.environ.get(
                "NEP_REGISTRY_OFFICE_PROTOCOL", "HTTP"
            ),
            "registry-office-address": {
                "ip-address": {"ipv-4-address": registry_office_host}
            },
            "registry-office-port": registry_office_port,
        }

        log_line(
            f"Calling POST /v1/embed-yourself with body={json.dumps(embed_body)}",
            test_file,
            test_name,
        )
        embed_response = await http_request("POST", "/v1/embed-yourself", embed_body)
        log_api_response(
            "Preflight /v1/embed-yourself", embed_response, test_file, test_name
        )

        if embed_response["status"] == 401:
            raise AssertionError(
                "NEP returned 401 Unauthorized on /v1/embed-yourself. "
                "Check NEP_OPERATION_KEY / NEP_AUTHORIZATION."
            )

        if embed_response["status"] not in [200, 202, 204]:
            raise AssertionError(
                f"Embed call failed with status {embed_response['status']}. "
                f"registry-office-address={registry_office_host}:{registry_office_port}. "
                f"Response={str(embed_response.get('raw', ''))[:300]}"
            )

        # Poll for data
        for i in range(18):
            await asyncio.sleep(5)
            log_line(
                f"Calling POST /v1/provide-list-of-devices-in-nep (poll #{i + 1})",
                test_file,
                test_name,
            )

            poll_response = await http_request(
                "POST", "/v1/provide-list-of-devices-in-nep"
            )
            log_api_response(
                f"Preflight poll #{i + 1} /v1/provide-list-of-devices-in-nep",
                poll_response,
                test_file,
                test_name,
            )

            mount_names = poll_response.get("body", {}).get("mount-name-list", [])
            poll_count = len(mount_names) if isinstance(mount_names, list) else 0

            log_line(
                f"Preflight poll #{i + 1}: device count={poll_count}, status={poll_response['status']}",
                test_file,
                test_name,
            )

            if poll_response["status"] == 200 and poll_count > 0:
                return

        raise AssertionError(
            "Data ingestion did not populate device list in expected time window. "
            "Check MWDI/RegistryOffice connectivity and embed-yourself target settings "
            "(NEP_REGISTRY_OFFICE_HOST/PORT)."
        )

    except Exception as e:
        log_line(f"Error in ensure_data_loaded: {e}", test_file, test_name)
        raise


async def run_api_db_case(
    test_case: Dict[str, Any], test_file: str, test_name: str
) -> None:
    """Run API database test case."""
    try:
        await ensure_data_loaded(
            allow_embed=False, test_file=test_file, test_name=test_name
        )

        request_body = test_case.get("requestBody", {})
        log_line(
            f"Calling {test_case.get('method', 'POST')} {test_case.get('endpoint')} "
            f"with body={json.dumps(request_body)}",
            test_file,
            test_name,
        )

        method = test_case.get("method", "POST")
        endpoint = test_case.get("endpoint", "")
        response = await http_request(method, endpoint, request_body)
        log_api_response(
            f"Response {test_case.get('endpoint')}", response, test_file, test_name
        )

        if response["status"] == 401:
            raise AssertionError(
                f"401 Unauthorized for {test_case.get('endpoint')}. "
                "Check operation-key/authorization headers."
            )

        assert response["status"] == 200, (
            f"Expected status 200, got {response['status']}"
        )

        response_data_count = get_response_data_count(
            response.get("body"), response.get("raw")
        )
        min_response_count = test_case.get("minResponseDataCount", 1)

        log_line(
            f"Response {test_case.get('endpoint')}: extracted data count={response_data_count}, "
            f"expected >= {min_response_count}",
            test_file,
            test_name,
        )

        assert response_data_count >= min_response_count, (
            f"Expected at least {min_response_count} data items, got {response_data_count}"
        )

        # Run custom validator if provided
        validate_response = test_case.get("validateResponse")
        if callable(validate_response):
            response_rows = get_response_rows_for_validation(response)
            log_line(
                f"Response {test_case.get('endpoint')}: running custom validator "
                f"with {len(response_rows)} parsed CSV rows",
                test_file,
                test_name,
            )
            await validate_response(
                response=response,
                response_rows=response_rows,
                response_data_count=response_data_count,
                test_file=test_file,
                test_name=test_name,
            )

        # Database checks
        skip_db_check = (
            test_case.get("skipDbCheck", False)
            or os.environ.get("NEP_SKIP_DB_CHECK", "").lower() == "true"
        )
        db_optional = (
            test_case.get("dbOptional", False)
            or os.environ.get("NEP_DB_OPTIONAL", "").lower() == "true"
        )

        table_checks = test_case.get("tableChecks", [])
        api_db_match_checks = test_case.get("apiDbMatchChecks", [])

        if not skip_db_check and (table_checks or api_db_match_checks):
            if not os.path.exists(DB_FILE_PATH):
                if db_optional:
                    log_line(
                        f"SQLite DB file not found: {DB_FILE_PATH} — "
                        "skipping DB checks (dbOptional=true).",
                        test_file,
                        test_name,
                    )
                else:
                    raise FileNotFoundError(f"SQLite DB file not found: {DB_FILE_PATH}")
            else:
                db = open_sqlite(DB_FILE_PATH)
                try:
                    # Table checks
                    for table_check in table_checks:
                        columns = await get_table_columns(db, table_check["table"])
                        log_line(
                            f"Table {table_check['table']} columns: {', '.join(columns)}",
                            test_file,
                            test_name,
                        )

                        expected_columns = table_check.get("expectedColumns", [])
                        for expected_column in expected_columns:
                            assert expected_column in columns, (
                                f"Expected column {expected_column} not found in table {table_check['table']}"
                            )

                        row_count = await get_table_row_count(db, table_check["table"])
                        min_rows = table_check.get("minRows", 1)
                        log_line(
                            f"Table {table_check['table']} row count={row_count}, expected >= {min_rows}",
                            test_file,
                            test_name,
                        )

                        assert row_count >= min_rows, (
                            f"Expected at least {min_rows} rows in table {table_check['table']}, got {row_count}"
                        )

                        if table_check.get("matchApiResponse", False):
                            compare_columns = table_check.get(
                                "compareColumns", table_check.get("expectedColumns", [])
                            )
                            response_rows_for_check = get_response_rows_for_table_check(
                                response, table_check
                            )

                            await assert_response_matches_table(
                                db=db,
                                response_rows=response_rows_for_check,
                                table_name=table_check["table"],
                                table_check=table_check,
                                compare_columns=compare_columns,
                                endpoint=test_case.get("endpoint", ""),
                                test_file=test_file,
                                test_name=test_name,
                            )

                    # API-DB match checks
                    for match_check in api_db_match_checks:
                        compare_columns = match_check.get("compareColumns", [])
                        response_rows_for_check = get_response_rows_for_table_check(
                            response, match_check
                        )

                        await assert_response_matches_table(
                            db=db,
                            response_rows=response_rows_for_check,
                            table_name=match_check.get("name", "custom-match"),
                            table_check=match_check,
                            compare_columns=compare_columns,
                            endpoint=test_case.get("endpoint", ""),
                            test_file=test_file,
                            test_name=test_name,
                        )
                finally:
                    db.close()

    except Exception as e:
        log_line(f"Error in run_api_db_case: {e}", test_file, test_name)
        raise


async def run_invalid_json_case(test_case: Dict[str, Any]) -> Dict[str, Any]:
    """Run test case with invalid JSON."""
    method = test_case.get("method", "POST")
    endpoint = test_case.get("endpoint", "")
    response = await http_request(method, endpoint, raw_body='{"bad":')

    assert response["status"] == 400, (
        f"Expected status 400 for invalid JSON, got {response['status']}"
    )
    return response


async def run_invalid_field_type_case(
    test_case: Dict[str, Any], invalid_body: Dict[str, Any], expected_status: int = 400
) -> Dict[str, Any]:
    """Run test case with invalid field type."""
    method = test_case.get("method", "POST")
    endpoint = test_case.get("endpoint", "")
    response = await http_request(method, endpoint, invalid_body)

    assert response["status"] == expected_status, (
        f"Expected status {expected_status}, got {response['status']}"
    )
    return response

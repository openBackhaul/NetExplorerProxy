# NEP Integration Tests

## Prerequisites

Before running the tests, the following services must be started:

1. **Elasticsearch**
2. **MWDI**
3. **NEP**

## Running Tests

```bash
cd testing/1_integration
pytest -v
```

## Test Coverage

The test suite validates 9 API endpoints against the database (Only SQLite Parts are Impelemented so far):
- HTTP response status codes
- API response data count
- Database table structure and row counts
- API response data matches database data (row-by-row comparison)

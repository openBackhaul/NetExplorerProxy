# NEP Integration Tests

## Database Configuration

Tests use `launch.json` for database settings (in `.vscode/` folder):

- **MariaDB mode**: Set `DB=true` in launch.json
- **SQLite mode**: Set `DB=false` in launch.json
  - DB_SQLITE_PATH: `server/database/nep_db.db`

When using MariaDB, the following settings are used:
- HOST=localhost, PORT=3306
- USER=user, PASSWORD=mypassword (base64 encoded)
- DB_NAME=nep_database

## MariaDB Setup (Docker)

Before running tests with MariaDB mode, start the container:

```powershell
cd testing/1_integration
docker-compose up -d
```

Verify it's running:
```powershell
docker ps | findstr nep_mariadb
Test-NetConnection localhost -Port 3306
```

Stop when done:
```powershell
docker-compose down
```

## Running Tests

```bash
cd testing/1_integration
pytest -v
```

if pytest is not recognize in your cli, try to use 
```bash
python -m pytest -v
```

## Test Coverage

Tests validate 9 API endpoints:
- HTTP response status codes
- API response data count
- Database table structure and row counts
- API response data matches database data

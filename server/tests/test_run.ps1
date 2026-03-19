#####################################################################
# NetExplorerProxy Test Runner Script
#####################################################################

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "scenario")]
    [string]$Type = "all",

    [Parameter(Mandatory=$false)]
    [string]$OperationKey = "Operation key not yet provided.",

    [Parameter(Mandatory=$false)]
    [string]$Authorization = "",

    [Parameter(Mandatory=$false)]
    [string]$NepBaseUrl = "http://127.0.0.1:4018",

    [Parameter(Mandatory=$false)]
    [switch]$Coverage,

    [Parameter(Mandatory=$false)]
    [switch]$Watch,

    [Parameter(Mandatory=$false)]
    [switch]$VerboseOutput,

    [Parameter(Mandatory=$false)]
    [switch]$Setup,

    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$testRoot = $PSScriptRoot
$jestConfigPath = Join-Path $PSScriptRoot "jest.config.js"
$dbHandlerPath = Join-Path $repoRoot "server/service/db/dbHandler.js"

function Write-Section {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Get-EnvOrDefault {
    param(
        [string]$Name,
        [string]$DefaultValue
    )
    $value = [System.Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $DefaultValue
    }
    return $value
}

function Show-Help {
    Write-Section "NetExplorerProxy Test Runner - Help"
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\server\tests\test_run.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -OperationKey      Optional NEP operation-key header value"
    Write-Host "  -Authorization     Optional Authorization header (e.g. Basic xxxxx)"
    Write-Host "  -NepBaseUrl        NEP base URL (default: http://127.0.0.1:4018)"
    Write-Host "  -Type              all|scenario (both run live scenario suite)"
    Write-Host "  -Coverage          Run tests with coverage"
    Write-Host "  -Watch             Run tests in watch mode"
    Write-Host "  -VerboseOutput     Run tests with verbose output"
    Write-Host "  -Setup             Install dependencies"
    Write-Host "  -Help              Show this help"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\server\tests\test_run.ps1 -OperationKey 'REAL_KEY'"
    Write-Host "  .\server\tests\test_run.ps1 -OperationKey 'REAL_KEY' -Authorization 'Basic BASE64_USER_PASS'"
}

function Invoke-Setup {
    Write-Section "Setting Up Test Environment"

    Write-Host "[INFO] Checking Node.js installation..." -ForegroundColor Blue
    node --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Node.js is not installed." -ForegroundColor Red
        exit 1
    }

    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Blue
    Push-Location $testRoot
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] npm install failed." -ForegroundColor Red
            exit 1
        }
    } finally {
        Pop-Location
    }

    Write-Host "[OK] Setup complete." -ForegroundColor Green
}

function Ensure-DbHandlerSqliteStorage {
    $requiredStorageLine = "        storage: './server/database/neb_db.db', //':memory:', // or ''"

    if (-not (Test-Path $dbHandlerPath)) {
        Write-Host "[ERROR] dbHandler.js not found: $dbHandlerPath" -ForegroundColor Red
        exit 1
    }

    $content = Get-Content -Path $dbHandlerPath -Raw
    if ($content.Contains($requiredStorageLine)) {
        Write-Host "[INFO] DB sqlite storage already set in dbHandler.js" -ForegroundColor Blue
        return
    }

    $storageLinePattern = '(?m)^\s*storage:\s*[''\"][^''\"]*[''\"]\s*,\s*(?://.*)?$'
    $updatedContent = [System.Text.RegularExpressions.Regex]::Replace($content, $storageLinePattern, $requiredStorageLine, 1)

    if ($updatedContent -eq $content) {
        Write-Host "[ERROR] Unable to find sqlite storage line in dbHandler.js" -ForegroundColor Red
        exit 1
    }

    Set-Content -Path $dbHandlerPath -Value $updatedContent -Encoding UTF8
    Write-Host "[OK] Updated dbHandler.js sqlite storage path" -ForegroundColor Green
}

function Test-NepAuth {
    param(
        [string]$BaseUrl,
        [string]$OpKey,
        [string]$AuthHeader
    )

    $headers = @{
        'operation-key' = $OpKey
        'user' = (Get-EnvOrDefault -Name 'NEP_USER' -DefaultValue 'Katharina Mohr')
        'originator' = (Get-EnvOrDefault -Name 'NEP_ORIGINATOR' -DefaultValue 'NEP_LIVE_SCENARIO_TEST')
        'x-correlator' = (Get-EnvOrDefault -Name 'NEP_X_CORRELATOR' -DefaultValue '550e8400-e29b-41d4-a716-446655440000')
        'trace-indicator' = (Get-EnvOrDefault -Name 'NEP_TRACE_INDICATOR' -DefaultValue '1')
        'customer-journey' = (Get-EnvOrDefault -Name 'NEP_CUSTOMER_JOURNEY' -DefaultValue 'live-test')
    }

    if (-not [string]::IsNullOrWhiteSpace($AuthHeader)) {
        $headers['Authorization'] = $AuthHeader
    }

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Method POST -Uri "$BaseUrl/v1/provide-list-of-devices-in-nep" -Headers $headers -TimeoutSec 10
        return [int]$response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            return [int]$_.Exception.Response.StatusCode
        }
        throw
    }
}

if ($Help) {
    Show-Help
    exit 0
}

if ($Setup) {
    Invoke-Setup
    exit 0
}

Write-Section "Preparing Test Prerequisites"
Ensure-DbHandlerSqliteStorage

if (-not (Test-Path $jestConfigPath)) {
    Write-Host "[ERROR] Jest config not found: $jestConfigPath" -ForegroundColor Red
    exit 1
}

$effectiveOperationKey = $OperationKey
if ([string]::IsNullOrWhiteSpace($effectiveOperationKey) -or $effectiveOperationKey -eq "Operation key not yet provided.") {
    $effectiveOperationKey = [System.Environment]::GetEnvironmentVariable("NEP_OPERATION_KEY")
}

$hasOperationKey = -not [string]::IsNullOrWhiteSpace($effectiveOperationKey)
if ($hasOperationKey) {
    $env:NEP_OPERATION_KEY = $effectiveOperationKey
}
$env:NEP_BASE_URL = $NepBaseUrl
if (-not [string]::IsNullOrWhiteSpace($Authorization)) {
    $env:NEP_AUTHORIZATION = $Authorization
}

Write-Host "[INFO] NEP_BASE_URL: $env:NEP_BASE_URL" -ForegroundColor Blue
if ($hasOperationKey) {
    Write-Host "[INFO] NEP_OPERATION_KEY is set" -ForegroundColor Blue
} else {
    Write-Host "[WARN] NEP_OPERATION_KEY is not set; running without explicit operation-key." -ForegroundColor Yellow
}
if ($env:NEP_AUTHORIZATION) {
    Write-Host "[INFO] NEP_AUTHORIZATION is set" -ForegroundColor Blue
}

if ($hasOperationKey) {
    Write-Host "[INFO] Running auth precheck..." -ForegroundColor Blue
    $statusCode = Test-NepAuth -BaseUrl $env:NEP_BASE_URL -OpKey $env:NEP_OPERATION_KEY -AuthHeader $env:NEP_AUTHORIZATION
    if ($statusCode -eq 401) {
        Write-Host "[WARN] Precheck returned 401 Unauthorized; continuing to run tests." -ForegroundColor Yellow
        Write-Host "[INFO] If tests fail with 401, provide Authorization too." -ForegroundColor Blue
        Write-Host "[INFO] Example: .\server\tests\test_run.ps1 -Authorization 'Basic BASE64_USER_PASS'" -ForegroundColor Blue
    }
    if ($statusCode -ge 400) {
        Write-Host "[WARN] Precheck returned HTTP $statusCode." -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Precheck returned HTTP $statusCode." -ForegroundColor Green
    }
} else {
    Write-Host "[INFO] Skipping auth precheck because operation-key is not set." -ForegroundColor Blue
}

Write-Section "Running Live Scenario Tests"
$testArgs = @("test", "--")
if ($Coverage) { $testArgs += "--coverage" }
if ($Watch) { $testArgs += "--watch" }
if ($VerboseOutput) { $testArgs += "--verbose" }

Write-Host "[INFO] Executing: npm $($testArgs -join ' ')" -ForegroundColor Blue
Push-Location $testRoot
try {
    npm @testArgs
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

if ($exitCode -eq 0) {
    Write-Host "[OK] All tests passed." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Tests failed. Exit code: $exitCode" -ForegroundColor Red
}

exit $exitCode

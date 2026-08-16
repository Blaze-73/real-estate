# dev-server.ps1 - bring up backend (artisan serve) and/or frontend (vite) for a dev/verify session.
#
# Purpose:
#   Reusable, idempotent server bootstrap so you never hand-start/kill servers ad-hoc.
#   It kills ONLY processes listening on the target ports, starts fresh ones with the
#   correct env (sqlite temp DB, log mailer, sync queue), polls health, and prints a
#   clear PASS/FAIL summary.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools\dev-server.ps1 -Backend -Frontend
#   powershell -ExecutionPolicy Bypass -File tools\dev-server.ps1 -Backend -BackendDb C:\...\mydb.sqlite
#   powershell -ExecutionPolicy Bypass -File tools\dev-server.ps1 -Frontend
#   powershell -ExecutionPolicy Bypass -File tools\dev-server.ps1 -Down          # kill both ports
#
# Notes:
#   - Default backend DB is %TEMP%\opencode\dev.sqlite (fresh each run unless -BackendDb given).
#   - PHP binary is the project's pinned one (see AGENTS.md). Override with -PhpPath.
#   - Stale processes are matched by LISTENING PORT, never killed blindly.

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Down,
    [string]$BackendDb = "$env:TEMP\opencode\dev.sqlite",
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173,
    [string]$BackendHealth = '/api/v1/public/settings',
    [string]$PhpPath = 'C:\Users\user\Downloads\php-8.5.1\php.exe',
    [string]$ProjectRoot = (Get-Location).Path
)

$logDir = Join-Path $env:TEMP 'opencode'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$backendOut = Join-Path $logDir 'dev-server_backend_out.log'
$backendErr = Join-Path $logDir 'dev-server_backend_err.log'
$frontendOut = Join-Path $logDir 'dev-server_frontend_out.log'
$frontendErr = Join-Path $logDir 'dev-server_frontend_err.log'

function Write-Step([string]$msg) { Write-Output "[dev-server] $msg" }

function Get-ListeningPid([int]$port) {
    $conn = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) { return $conn.OwningProcess | Select-Object -First 1 }
    return $null
}

function Wait-Health([int]$port, [string]$path, [int]$timeoutSec, [string]$logFile) {
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 500
        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$port$path" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -lt 500) { return $true }
        } catch {
            $tail = Get-Content $logFile -Tail 8 -ErrorAction SilentlyContinue
            if ($tail -match 'Failed|Exception|ERROR') {
                Write-Step "log tail (may be fatal):"
                $tail | ForEach-Object { Write-Output "    $_" }
            }
        }
    }
    return $false
}

if ($Down) {
    foreach ($port in @($BackendPort, $FrontendPort)) {
        $pid_ = Get-ListeningPid $port
        if ($pid_) { Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue; Write-Step "stopped process $pid_ on :$port" }
        else { Write-Step "nothing listening on :$port" }
    }
    exit 0
}

if ($Frontend) {
    $pid_ = Get-ListeningPid $FrontendPort
    if ($pid_) {
        Write-Step "port :$FrontendPort already serving (pid $pid_) - reusing. Kill with -Down if stale."
    } else {
        Write-Step "starting vite on :$FrontendPort..."
        $npm = 'C:\Program Files\nodejs\npm.cmd'
        Start-Process -FilePath $npm -ArgumentList @('run', 'dev', '--', '--port', "$FrontendPort", '--strictPort', '--host', '127.0.0.1') `
            -WorkingDirectory (Join-Path $ProjectRoot 'frontend') -WindowStyle Hidden `
            -RedirectStandardOutput $frontendOut -RedirectStandardError $frontendErr
        if (Wait-Health $FrontendPort '/' 60 $frontendOut) { Write-Step "frontend UP on :$FrontendPort" }
        else {
            Write-Step "FRONTEND FAILED TO START. Log tail:"
            Get-Content $frontendOut -Tail 15 -ErrorAction SilentlyContinue | ForEach-Object { Write-Output "    $_" }
            Get-Content $frontendErr -Tail 15 -ErrorAction SilentlyContinue | ForEach-Object { Write-Output "    $_" }
            exit 1
        }
    }
}

if ($Backend) {
    $pid_ = Get-ListeningPid $BackendPort
    if ($pid_) {
        Write-Step "port :$BackendPort already serving (pid $pid_) - reusing. Kill with -Down if stale."
    } else {
        Write-Step "preparing sqlite db at $BackendDb (fresh)..."
        Remove-Item $BackendDb -ErrorAction SilentlyContinue
        $env:DB_CONNECTION = 'sqlite'
        $env:DB_DATABASE = $BackendDb
        $env:MAIL_MAILER = 'log'
        $env:QUEUE_CONNECTION = 'sync'
        $env:FRONTEND_URL = "http://localhost:$FrontendPort"

        Write-Step "migrating + seeding..."
        & $PhpPath artisan migrate:fresh --seed --force 2>&1 | Select-Object -Last 3

        Write-Step "starting artisan serve on :$BackendPort..."
        Start-Process -FilePath $PhpPath -ArgumentList @('artisan', 'serve', "--port=$BackendPort") `
            -WorkingDirectory $ProjectRoot -WindowStyle Hidden `
            -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr

        if (Wait-Health $BackendPort $BackendHealth 30 $backendErr) { Write-Step "backend UP on :$BackendPort" }
        else {
            Write-Step "BACKEND FAILED TO START. Log tail:"
            Get-Content $backendErr -Tail 20 -ErrorAction SilentlyContinue | ForEach-Object { Write-Output "    $_" }
            Get-Content $backendOut -Tail 5 -ErrorAction SilentlyContinue | ForEach-Object { Write-Output "    $_" }
            exit 1
        }
    }
}

Write-Step "done. backend=:$BackendPort frontend=:$FrontendPort (db=$BackendDb)"
# dev-check.ps1 — run a check against `php artisan serve` without blocking or leaking processes.
#
# Usage:
#   powershell -File tools/dev-check.ps1 -Port 8899 -HealthPath /robots.txt -TestScript 'curl.exe -s http://127.0.0.1:8899/sitemap.xml'
#
# Behavior:
#   1. Kills any leftover `php artisan serve` processes (prevents orphan windows / port conflicts).
#   2. Starts the server in the background with output redirected to %TEMP%\opencode.
#   3. Polls $HealthPath until the server responds (hard deadline $TimeoutSeconds) or exits.
#   4. Runs $TestScript (Invoke-Expression).
#   5. ALWAYS kills the server (finally block) and returns the server exit code / script success.

param(
    [int]$Port = 8899,
    [string]$HealthPath = '/robots.txt',
    [int]$TimeoutSeconds = 30,
    [string]$TestScript = '',
    [string]$WorkDir = (Get-Location).Path
)

$logDir = Join-Path $env:TEMP 'opencode'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$outLog = Join-Path $logDir 'dev-check_out.log'
$errLog = Join-Path $logDir 'dev-check_err.log'

function Write-Step([string]$msg) { Write-Output "[dev-check] $msg" }

Write-Step "killing leftover php servers on :$Port..."
Get-CimInstance Win32_Process -Filter "Name='php.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match "127\.0\.0\.1:$Port" -or $_.CommandLine -match 'artisan serve' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Write-Step "starting server on :$Port (workdir: $WorkDir)..."
$proc = Start-Process -FilePath 'php' -ArgumentList @('artisan', 'serve', "--port=$Port") `
    -WorkingDirectory $WorkDir -PassThru `
    -RedirectStandardOutput $outLog -RedirectStandardError $errLog

try {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $up = $false

    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 500

        if ($proc.HasExited) {
            $tail = Get-Content $errLog -Tail 15 -ErrorAction SilentlyContinue
            throw "server exited early.`n$($tail -join "`n")"
        }

        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$Port$HealthPath" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -lt 500) { $up = $true; break }
        } catch {
            # not ready yet — keep polling
        }
    }

    if (-not $up) { throw "server did not become ready within ${TimeoutSeconds}s (health: $HealthPath)" }
    Write-Step "server is up. Running test script..."

    if ($TestScript) {
        & ([scriptblock]::Create($TestScript))
        if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
            throw "test script failed with exit code $LASTEXITCODE"
        }
    }
    Write-Step "done."
}
finally {
    if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Get-CimInstance Win32_Process -Filter "Name='php.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match "127\.0\.0\.1:$Port" } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Write-Step "server stopped."
}

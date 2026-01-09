<#
Usage: Run this from PowerShell in the repo root (D:\studio-master).
This script will:
  - Set env vars required for seeding
  - Start `npm run dev` in a new process
  - Wait until port 9002 responds
  - POST to `/api/admin/seed`
  - Run a few psql checks (requires `psql` on PATH)
  - Save outputs to `logs/seed-run-<timestamp>.log`

Notes:
  - This script cannot run in the background from this service — you must run it locally.
  - If your DB credentials differ, pass them as parameters.
#>
param(
  [string]$DbName = "azmera_db",
  [string]$DbUser = "postgres",
  [string]$DbHost = "localhost",
  [int]$Port = 9002,
  [int]$WaitTimeoutSeconds = 120
)

$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$logDir = Join-Path -Path $PSScriptRoot -ChildPath "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile = Join-Path -Path $logDir -ChildPath "seed-run-$timestamp.log"

function Log($line) {
  $time = (Get-Date).ToString('s')
  $out = "[$time] $line"
  $out | Tee-Object -FilePath $logFile -Append
}

try {
  Log "Starting seed run script"

  # Set env vars for the spawned process
  $env:ENABLE_DB_SEED = 'true'
  $env:NODE_ENV = 'development'
  Log "Set ENABLE_DB_SEED and NODE_ENV=development"

  # Start Next dev in new shell so we can stop it later
  Log "Starting dev server with 'npm run dev'"
  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = $env:ComSpec
  $startInfo.Arguments = "/c npm run dev"
  $startInfo.WorkingDirectory = $PSScriptRoot
  $startInfo.UseShellExecute = $true

  $proc = [System.Diagnostics.Process]::Start($startInfo)
  Start-Sleep -Seconds 1
  Log "Dev server process started (PID: $($proc.Id))"

  # Wait for server to accept connections
  $deadline = (Get-Date).AddSeconds($WaitTimeoutSeconds)
  do {
    try {
      $tcp = Test-NetConnection -ComputerName 'localhost' -Port $Port -WarningAction SilentlyContinue
      if ($tcp.TcpTestSucceeded) { break }
    } catch {}
    Start-Sleep -Seconds 1
  } while ((Get-Date) -lt $deadline)

  if (-not $tcp.TcpTestSucceeded) {
    Log "Timed out waiting for server on port $Port"
    throw "Server did not start within $WaitTimeoutSeconds seconds"
  }

  Log "Server is listening on port $Port"

  # Call seed endpoint
  $seedUrl = "http://localhost:$Port/api/admin/seed"
  Log "Calling seed endpoint: $seedUrl"
  try {
    $response = Invoke-WebRequest -Uri $seedUrl -Method POST -ContentType 'application/json' -Body '{}' -UseBasicParsing -TimeoutSec 120
    Log "Seed HTTP status: $($response.StatusCode)"
    Log "Seed response:`n$($response.Content)"
  } catch {
    Log "Seed request failed: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
      try {
        $rstream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($rstream)
        $body = $reader.ReadToEnd()
        Log "Seed error body:`n$body"
      } catch {}
    }
  }

  # DB checks (requires psql)
  function RunPsql($sql) {
    Log "Running psql with SQL: $sql"
    try {
      $out = & psql -U $DbUser -d $DbName -c $sql 2>&1
      Log "psql output:`n$out"
    } catch {
      Log "psql failed: $($_.Exception.Message)"
    }
  }

  RunPsql "SELECT COUNT(*) FROM products;"
  RunPsql "SELECT COUNT(*) FROM users;"
  RunPsql "SELECT id, name, seller_id FROM products ORDER BY id DESC LIMIT 5;"

} finally {
  # Attempt to stop the dev server we started
  try {
    if ($proc -and -not $proc.HasExited) {
      Log "Stopping dev server (PID: $($proc.Id))"
      $proc.Kill()
      $proc.WaitForExit(5000)
      Log "Dev server stopped"
    }
  } catch {
    Log "Failed to stop dev server: $($_.Exception.Message)"
  }
  Log "Seed run script finished. Logs: $logFile"
}

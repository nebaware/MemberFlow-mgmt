./docker-restart-and-check.ps1 and run in an elevated PowerShell:
# powershell # Save this as ./docker-restart-and-check.ps1 and run in an elevated PowerShell:
# powershell -ExecutionPolicy Bypass -File .\docker-restart-and-check.ps1

Write-Host "Shutting down WSL..."
wsl --shutdown

Write-Host "Updating WSL kernel and components..."
wsl --update

Write-Host "Starting Docker Desktop..."
$dockerPath = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
if (Test-Path $dockerPath) {
    Start-Process -FilePath $dockerPath
} else {
    Write-Host "Docker Desktop executable not found at $dockerPath. Please start Docker Desktop manually."
}

# Wait up to 90 seconds for the docker daemon to become available
$tries = 0
$max = 18
while ($tries -lt $max) {
    Start-Sleep -Seconds 5
    try {
        docker version | Out-Null
        Write-Host "Docker daemon is reachable."
        break
    } catch {
        Write-Host ("Waiting for docker daemon... ({0}/{1})" -f ($tries+1), $max)
    }
    $tries++
}

Write-Host "`n=== Docker diagnostics ==="
try { docker version } catch { Write-Host "docker version failed: $($_.Exception.Message)" }
Write-Host "`nContainers:"
try { docker ps -a } catch { Write-Host "docker ps -a failed: $($_.Exception.Message)" }

Write-Host "`n=== WSL distros ==="
wsl -l -v

Write-Host "Shutting down WSL..."
wsl --shutdown

Write-Host "Updating WSL kernel and components..."
wsl --update

Write-Host "Starting Docker Desktop..."
$dockerPath = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
if (Test-Path $dockerPath) {
    Start-Process -FilePath $dockerPath
} else {
    Write-Host "Docker Desktop executable not found at $dockerPath. Please start Docker Desktop manually."
}

# Wait up to 90 seconds for the docker daemon to become available
$tries = 0
$max = 18
while ($tries -lt $max) {
    Start-Sleep -Seconds 5
    try {
        docker version | Out-Null
        Write-Host "Docker daemon is reachable."
        break
    } catch {
        Write-Host ("Waiting for docker daemon... ({0}/{1})" -f ($tries+1), $max)
    }
    $tries++
}

Write-Host "`n=== Docker diagnostics ==="
try { docker version } catch { Write-Host "docker version failed: $($_.Exception.Message)" }
Write-Host "`nContainers:"
try { docker ps -a } catch { Write-Host "docker ps -a failed: $($_.Exception.Message)" }

Write-Host "`n=== WSL distros ==="
wsl -l -v
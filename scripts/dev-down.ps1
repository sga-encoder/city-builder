$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pidsFile = Join-Path $root ".dev-pids.json"

if (-not (Test-Path $pidsFile)) {
  Write-Warning "No existe .dev-pids.json. No hay servicios registrados para detener."
  exit 0
}

$pids = Get-Content $pidsFile -Raw | ConvertFrom-Json

foreach ($name in @("frontendPid", "flaskPid")) {
  $pidValue = $pids.$name
  if (-not $pidValue) { continue }

  $proc = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
  if ($proc) {
    Stop-Process -Id $pidValue -Force
    Write-Host "Detenido $name (PID $pidValue)" -ForegroundColor Yellow
  }
}

Remove-Item $pidsFile -Force
Write-Host "Servicios detenidos." -ForegroundColor Green

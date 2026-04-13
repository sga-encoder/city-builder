$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pythonExe = Join-Path $root ".venv\Scripts\python.exe"
$pidsFile = Join-Path $root ".dev-pids.json"

if (-not (Test-Path $pythonExe)) {
  Write-Error "No se encontro Python del entorno virtual en: $pythonExe"
}

if (Test-Path $pidsFile) {
  Write-Warning "Ya existe .dev-pids.json. Ejecuta scripts/dev-down.ps1 antes de volver a levantar."
  exit 1
}

$frontendCmd = "Set-Location '$root'; & '$pythonExe' -m http.server 5500"
$flaskCmd = "Set-Location '$root'; & '$pythonExe' './domain/utilis/dijsktra/ms_smart_city-main/main.py'"

$frontendProc = Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-Command", $frontendCmd) -PassThru
$flaskProc = Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-Command", $flaskCmd) -PassThru

$pids = [ordered]@{
  frontendPid = $frontendProc.Id
  flaskPid = $flaskProc.Id
  startedAt = (Get-Date).ToString("o")
}

$pids | ConvertTo-Json | Set-Content -Encoding UTF8 $pidsFile

Write-Host "Servicios iniciados:" -ForegroundColor Green
Write-Host "- Frontend: http://127.0.0.1:5500 (PID $($frontendProc.Id))"
Write-Host "- Flask Dijkstra: http://127.0.0.1:5000 (PID $($flaskProc.Id))"
Write-Host ""
Write-Host "Para detener: .\scripts\dev-down.ps1"

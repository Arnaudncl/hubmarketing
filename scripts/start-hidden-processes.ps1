$ErrorActionPreference = "Stop"

$rootPath = Split-Path -Parent $PSScriptRoot
$serverDir = Join-Path $rootPath "hubmarketing-ui\server"
$uiDir = Join-Path $rootPath "hubmarketing-ui"

if (-not (Test-Path $serverDir)) {
  throw "Dossier serveur introuvable: $serverDir"
}
if (-not (Test-Path $uiDir)) {
  throw "Dossier UI introuvable: $uiDir"
}

Start-Process -WindowStyle Hidden -FilePath "node.exe" -ArgumentList "supervisor.js" -WorkingDirectory $serverDir
Start-Sleep -Seconds 2
Start-Process -WindowStyle Hidden -FilePath "npm.cmd" -ArgumentList "run","dev" -WorkingDirectory $uiDir

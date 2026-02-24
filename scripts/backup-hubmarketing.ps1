$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $projectRoot "backups"

if (-not (Test-Path $backupDir)) {
  New-Item -Path $backupDir -ItemType Directory | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$archivePath = Join-Path $backupDir ("HubMarketing_" + $timestamp + ".zip")

$tempDir = Join-Path $env:TEMP ("HubMarketing_backup_" + [guid]::NewGuid().ToString("N"))
New-Item -Path $tempDir -ItemType Directory | Out-Null

try {
  $robocopySource = $projectRoot
  $robocopyDest = Join-Path $tempDir "HubMarketing"

  $null = robocopy $robocopySource $robocopyDest /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS /XD `
    ".git" "node_modules" "dist" "backups" ".vite" ".cache"

  if (-not (Test-Path $robocopyDest)) {
    throw "Copie de sauvegarde échouée."
  }

  Compress-Archive -Path (Join-Path $robocopyDest "*") -DestinationPath $archivePath -CompressionLevel Optimal -Force

  $maxBackups = 20
  $oldBackups = Get-ChildItem -Path $backupDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip $maxBackups
  foreach ($file in $oldBackups) {
    Remove-Item -Path $file.FullName -Force
  }

  Write-Host "[HubMarketing] Sauvegarde OK: $archivePath"
}
finally {
  if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
  }
}

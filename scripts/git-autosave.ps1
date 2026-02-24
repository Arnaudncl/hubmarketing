param(
  [switch]$Push,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

try {
  $null = & git --version
} catch {
  throw "Git n'est pas disponible dans le PATH."
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$branch = (& git branch --show-current | Out-String).Trim()
if (-not $branch) { $branch = "master" }
$shouldPush = if ($PSBoundParameters.ContainsKey("Push")) { $Push.IsPresent } else { $true }

if ($DryRun) {
  Write-Host "[GitAutoSave] DRY RUN sur branche $branch"
  & git status --short
  exit 0
}

& git add -A

$hasStaged = $LASTEXITCODE -eq 0
if (-not $hasStaged) {
  throw "git add a échoué."
}

$diffCheck = & git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "[GitAutoSave] Aucun changement à commit."
  exit 0
}

$commitMsg = "Auto-save $timestamp"
& git commit -m $commitMsg | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "git commit a échoué."
}

Write-Host "[GitAutoSave] Commit créé: $commitMsg"

if ($shouldPush) {
  $remote = (& git remote | Select-Object -First 1)
  if ($remote) {
    & git push $remote $branch | Out-Null
    if ($LASTEXITCODE -eq 0) {
      Write-Host "[GitAutoSave] Push OK vers $remote/$branch"
    } else {
      Write-Host "[GitAutoSave] Push échoué (commit local conservé)."
    }
  } else {
    Write-Host "[GitAutoSave] Aucun remote configuré (commit local uniquement)."
  }
}

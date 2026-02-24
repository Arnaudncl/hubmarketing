@echo off
setlocal

set "ROOT=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\backup-hubmarketing.ps1"

if errorlevel 1 (
  echo [HubMarketing] Echec sauvegarde.
) else (
  echo [HubMarketing] Sauvegarde terminee.
)

endlocal

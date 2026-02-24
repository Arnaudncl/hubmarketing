@echo off
setlocal

set "ROOT=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\git-autosave.ps1" -Push

if errorlevel 1 (
  echo [GitAutoSave] Erreur execution.
) else (
  echo [GitAutoSave] Termine.
)

endlocal

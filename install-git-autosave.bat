@echo off
setlocal

set "ROOT=%~dp0"
set "SCRIPT=%ROOT%scripts\git-autosave.ps1"
set "TASK=HubMarketing GitAutoSave"
set "OLDTASK=HubMarketing AutoBackup"

schtasks /Delete /TN "%OLDTASK%" /F >nul 2>&1

schtasks /Create /TN "%TASK%" /SC MINUTE /MO 30 /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"%SCRIPT%\" -Push" /F >nul

if errorlevel 1 (
  echo [GitAutoSave] Impossible de creer la tache planifiee.
  echo Lance ce fichier en tant qu'administrateur si necessaire.
  exit /b 1
)

echo [GitAutoSave] Tache active: "%TASK%" toutes les 30 minutes.
echo [GitAutoSave] Mode: git add -A + commit auto + push origin.

endlocal

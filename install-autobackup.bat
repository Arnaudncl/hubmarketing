@echo off
setlocal

set "ROOT=%~dp0"
set "SCRIPT=%ROOT%scripts\backup-hubmarketing.ps1"
set "TASK=HubMarketing AutoBackup"

schtasks /Create /TN "%TASK%" /SC HOURLY /MO 2 /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"%SCRIPT%\"" /F >nul

if errorlevel 1 (
  echo [HubMarketing] Impossible de creer la tache planifiee.
  echo Lance ce fichier en tant qu'administrateur si necessaire.
  exit /b 1
)

echo [HubMarketing] Tache active: "%TASK%" toutes les 2 heures.
echo [HubMarketing] Dossier sauvegardes: "%ROOT%backups"
echo [HubMarketing] Suppression auto des anciennes sauvegardes: conserve les 20 dernieres.

endlocal

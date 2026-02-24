@echo off
setlocal

set "ROOT=%~dp0"

echo [HubMarketing] Demarrage du superviseur...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\start-hidden-processes.ps1"

timeout /t 2 /nobreak >nul

echo [HubMarketing] Demarrage du backend via superviseur...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $null = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:4010/api/supervisor/start' -TimeoutSec 8 } catch { }"

timeout /t 2 /nobreak >nul

echo.
echo [HubMarketing] URLs:
echo - UI: http://localhost:5174
echo - API: http://127.0.0.1:4000
echo - Supervisor: http://127.0.0.1:4010/api/supervisor/status
echo.
echo [HubMarketing] Ouverture du navigateur...
start "" "http://localhost:5174"

endlocal

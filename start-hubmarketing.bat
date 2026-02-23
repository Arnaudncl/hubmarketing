@echo off
setlocal

set "ROOT=%~dp0"

echo [HubMarketing] Demarrage du superviseur...
start "HubMarketing Supervisor" cmd /k "cd /d ""%ROOT%hubmarketing-ui\server"" && npm run supervisor"

timeout /t 2 /nobreak >nul

echo [HubMarketing] Demarrage du front...
start "HubMarketing UI" cmd /k "cd /d ""%ROOT%hubmarketing-ui"" && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo [HubMarketing] URLs:
echo - UI: http://127.0.0.1:5174
echo - API: http://127.0.0.1:4000
echo - Supervisor: http://127.0.0.1:4010/api/supervisor/status
echo.
echo [HubMarketing] Ouverture du navigateur...
start "" "http://127.0.0.1:5174"

endlocal

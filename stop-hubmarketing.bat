@echo off
setlocal

call :kill_port 4010
call :kill_port 4000
call :kill_port 5174
call :kill_port 5173

echo [HubMarketing] Services arretes (ports 4010, 4000, 5174, 5173).
endlocal
exit /b 0

:kill_port
set "PORT=%~1"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)
exit /b 0

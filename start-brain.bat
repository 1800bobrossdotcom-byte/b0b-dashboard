@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM B0B BRAIN - 24/7 Startup Script for Windows
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo ══════════════════════════════════════════════════════════════════════
echo                    🧠 B0B BRAIN - 24/7 AUTONOMOUS MODE
echo ══════════════════════════════════════════════════════════════════════
echo.

REM Check if PM2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo PM2 not found. Installing...
    npm install -g pm2
    npm install -g pm2-windows-startup
)

REM Navigate to workspace
cd /d %~dp0

REM Start the brain ecosystem
echo Starting B0B Brain ecosystem...
pm2 start ecosystem.config.js

REM Enable startup on Windows boot
echo.
echo Enabling startup on Windows boot...
pm2 save
pm2-startup install

echo.
echo ══════════════════════════════════════════════════════════════════════
echo ✅ B0B Brain is now running 24/7!
echo.
echo Commands:
echo   pm2 status          - Check all processes
echo   pm2 logs b0b-brain  - View brain logs
echo   pm2 monit           - Full monitoring dashboard
echo   pm2 stop all        - Stop everything
echo.
echo To stop the brain gracefully:
echo   node brain/brain.js stop
echo ══════════════════════════════════════════════════════════════════════

pause

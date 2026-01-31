@echo off
:: B0B Services Startup Script
:: Runs local-bridge.js for Railway agent communication
:: 
:: To auto-start on Windows boot:
:: 1. Press Win+R, type: shell:startup
:: 2. Create shortcut to this file in that folder
::
:: Or run manually: start-b0b-services.bat

cd /d "%~dp0"

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  🤖 B0B LOCAL SERVICES                                    ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║  Starting local-bridge.js for Railway agent access...     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:: Check if node is available
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js not found in PATH
    pause
    exit /b 1
)

:: Start local-bridge in background
start "B0B Local Bridge" /min cmd /c "node local-bridge.js"

echo ✅ Local bridge started on port 3847
echo.
echo Press any key to close this window (services continue running)
pause >nul

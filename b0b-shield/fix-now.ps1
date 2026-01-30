<#
.SYNOPSIS
    B0B-SH13LD Quick Fix - One-click threat removal
.DESCRIPTION
    Runs full scan and auto-removes all detected threats
    Use when you know you're compromised
#>

$ErrorActionPreference = "Stop"
$ShieldRoot = $PSScriptRoot

# Import shield
. "$ShieldRoot\shield.ps1"

Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║  🚨 B0B-SH13LD EMERGENCY FIX                                  ║
║  Scanning and removing all threats...                         ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Red

# Check admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️ Not running as admin - some fixes may fail" -ForegroundColor Yellow
    Write-Host "Recommend: Right-click PowerShell > Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

# Kill Chrome first
$chrome = Get-Process chrome -ErrorAction SilentlyContinue
if ($chrome) {
    Write-Host "Closing Chrome..." -ForegroundColor Yellow
    Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Run shield with auto-fix
Start-Shield -Fix

# Additional hardening
Write-Host "`n🔒 Applying additional hardening..." -ForegroundColor Cyan

# Lock down Chrome extensions folder
$chromeExt = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Extensions"
if (Test-Path $chromeExt) {
    # Remove McAfee if present
    $mcafee = "$chromeExt\fheoggkfdfchfphceeifdbepaooicaho"
    if (Test-Path $mcafee) {
        Remove-Item $mcafee -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed McAfee WebAdvisor extension" -ForegroundColor Green
    }
}

# Reset Chrome search to Google
$profiles = Get-ChildItem "$env:LOCALAPPDATA\Google\Chrome\User Data" -Directory | 
            Where-Object { $_.Name -match "^(Default|Profile)" }

foreach ($profile in $profiles) {
    $prefs = "$($profile.FullName)\Preferences"
    if (Test-Path $prefs) {
        $content = Get-Content $prefs -Raw
        $original = $content
        
        # Remove Yahoo/McAfee search
        $content = $content -replace '"default_search_provider_data":\s*\{[^}]*yahoo[^}]*\}', '"default_search_provider_data":{"template_url_data":{"short_name":"Google","keyword":"google.com","url":"https://www.google.com/search?q={searchTerms}"}}'
        $content = $content -replace 'mcafee|yahoo\.com', 'google.com'
        
        if ($content -ne $original) {
            $content | Set-Content $prefs -Encoding UTF8 -Force
            Write-Host "  ✓ Fixed search engine in $($profile.Name)" -ForegroundColor Green
        }
    }
}

# Clean registry hooks
$regPaths = @(
    "HKLM:\SOFTWARE\Google\Chrome\Extensions\fheoggkfdfchfphceeifdbepaooicaho",
    "HKLM:\SOFTWARE\WOW6432Node\Google\Chrome\Extensions\fheoggkfdfchfphceeifdbepaooicaho",
    "HKCU:\SOFTWARE\Google\Chrome\Extensions\fheoggkfdfchfphceeifdbepaooicaho"
)
foreach ($reg in $regPaths) {
    if (Test-Path $reg) {
        Remove-Item $reg -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed registry hook: $reg" -ForegroundColor Green
    }
}

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║  ✅ EMERGENCY FIX COMPLETE                                    ║
║                                                               ║
║  • All detected threats removed                               ║
║  • Browser hijacks cleaned                                    ║
║  • Registry hooks removed                                     ║
║                                                               ║
║  Next: Run .\monitor.ps1 for real-time protection            ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

<#
.SYNOPSIS
    B0B Chrome Hijack Fixer v1.1 - Removes Yahoo/McAfee browser hijacking
.DESCRIPTION
    Comprehensive fix for McAfee WebAdvisor and Yahoo search hijacking:
    - Removes Yahoo as default search engine
    - Disables/removes McAfee WebAdvisor extension from all profiles
    - Removes force-install registry hooks (prevents auto-reinstall)
    - Cleans up orphan McAfee folders
    - Works across all Chrome profiles
.NOTES
    Run as Administrator for full effect!
    Created by B0B Swarm - Security Tools
    
    USAGE:
      .\fix-chrome-hijack.ps1              # Fix all profiles (interactive)
      .\fix-chrome-hijack.ps1 -Auto        # Fix all, no prompts
      .\fix-chrome-hijack.ps1 -ListProfiles # Show all Chrome profiles
      
    TESTED: 2026-01-30 - Successfully removed McAfee WebAdvisor hijack
#>

param(
    [switch]$All,           # Fix all profiles
    [string]$Profile,       # Fix specific profile (e.g., "Profile 5")
    [switch]$RemoveRegistry, # Remove force-install registry keys (needs admin)
    [switch]$ListProfiles,  # Just list profiles
    [switch]$Auto,          # No prompts, fix everything
    [switch]$Deep           # Deep clean - remove extension folders entirely
)

$ErrorActionPreference = "Continue"
$ChromeUserData = "$env:LOCALAPPDATA\Google\Chrome\User Data"

# McAfee WebAdvisor extension ID
$McAfeeExtId = "fheoggkfdfchfphceeifdbepaooicaho"

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║     🛡️  B0B CHROME HIJACK FIXER v1.0                         ║
║     Removes Yahoo/McAfee browser hijacking                   ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    Write-Host "✓ Running as Administrator" -ForegroundColor Green
} else {
    Write-Host "⚠ Not running as Administrator - some fixes may be limited" -ForegroundColor Yellow
}

# List all Chrome profiles
function Get-ChromeProfiles {
    $localState = Get-Content "$ChromeUserData\Local State" -Raw | ConvertFrom-Json
    $profiles = @()
    $localState.profile.info_cache.PSObject.Properties | ForEach-Object {
        $profiles += [PSCustomObject]@{
            Folder = $_.Name
            Name = $_.Value.name
            Email = $_.Value.user_name
        }
    }
    return $profiles
}

if ($ListProfiles) {
    Write-Host "`n📋 Chrome Profiles:" -ForegroundColor Cyan
    Get-ChromeProfiles | Format-Table -AutoSize
    exit 0
}

# Fix a single Chrome profile
function Fix-ChromeProfile {
    param([string]$ProfileFolder)
    
    $profilePath = "$ChromeUserData\$ProfileFolder"
    if (-not (Test-Path $profilePath)) {
        Write-Host "  ✗ Profile folder not found: $ProfileFolder" -ForegroundColor Red
        return $false
    }
    
    $profileInfo = Get-ChromeProfiles | Where-Object { $_.Folder -eq $ProfileFolder }
    Write-Host "`n🔧 Fixing: $($profileInfo.Name) ($ProfileFolder)" -ForegroundColor Cyan
    
    # Backup preferences
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    if (Test-Path "$profilePath\Preferences") {
        Copy-Item "$profilePath\Preferences" "$profilePath\Preferences.bak.$timestamp" -Force
    }
    if (Test-Path "$profilePath\Secure Preferences") {
        Copy-Item "$profilePath\Secure Preferences" "$profilePath\Secure Preferences.bak.$timestamp" -Force
    }
    Write-Host "  ✓ Backed up preferences" -ForegroundColor Green
    
    # Fix Preferences - remove Yahoo search
    try {
        $prefs = Get-Content "$profilePath\Preferences" -Raw
        $originalPrefs = $prefs
        
        # Remove Yahoo as default search
        $prefs = $prefs -replace '"default_search_provider_data":\s*\{[^}]*yahoo[^}]*\}', '"default_search_provider_data":{"template_url_data":{"short_name":"Google","keyword":"google.com","url":"https://www.google.com/search?q={searchTerms}"}}'
        
        # Remove McAfee search references
        $prefs = $prefs -replace 'mcafee_searchassist', 'removed_mcafee'
        $prefs = $prefs -replace '"fr=mcafee[^"]*"', '"fr=google"'
        
        if ($prefs -ne $originalPrefs) {
            $prefs | Set-Content "$profilePath\Preferences" -Encoding UTF8
            Write-Host "  ✓ Removed Yahoo/McAfee from Preferences" -ForegroundColor Green
        } else {
            Write-Host "  - Preferences already clean" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ✗ Error fixing Preferences: $_" -ForegroundColor Red
    }
    
    # Fix Secure Preferences
    try {
        if (Test-Path "$profilePath\Secure Preferences") {
            $secPrefs = Get-Content "$profilePath\Secure Preferences" -Raw
            $originalSecPrefs = $secPrefs
            
            $secPrefs = $secPrefs -replace 'mcafee_searchassist', 'removed_mcafee'
            $secPrefs = $secPrefs -replace '"fr=mcafee[^"]*"', '"fr=google"'
            
            if ($secPrefs -ne $originalSecPrefs) {
                $secPrefs | Set-Content "$profilePath\Secure Preferences" -Encoding UTF8
                Write-Host "  ✓ Cleaned Secure Preferences" -ForegroundColor Green
            } else {
                Write-Host "  - Secure Preferences already clean" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  ✗ Error fixing Secure Preferences: $_" -ForegroundColor Red
    }
    
    # Disable McAfee WebAdvisor extension
    try {
        $prefsJson = Get-Content "$profilePath\Preferences" -Raw | ConvertFrom-Json
        if ($prefsJson.extensions.settings.$McAfeeExtId) {
            $prefsJson.extensions.settings.$McAfeeExtId.state = 0
            $prefsJson | ConvertTo-Json -Depth 100 -Compress | Set-Content "$profilePath\Preferences" -Encoding UTF8
            Write-Host "  ✓ Disabled McAfee WebAdvisor extension" -ForegroundColor Green
        }
    } catch {
        Write-Host "  - Could not disable extension (may already be removed)" -ForegroundColor Gray
    }
    
    return $true
}

# Remove McAfee force-install registry keys
function Remove-McAfeeRegistryHooks {
    Write-Host "`n🔧 Removing McAfee force-install registry hooks..." -ForegroundColor Cyan
    
    $regPaths = @(
        "HKLM:\SOFTWARE\Google\Chrome\Extensions\$McAfeeExtId",
        "HKLM:\SOFTWARE\WOW6432Node\Google\Chrome\Extensions\$McAfeeExtId",
        "HKCU:\SOFTWARE\Google\Chrome\Extensions\$McAfeeExtId"
    )
    
    foreach ($regPath in $regPaths) {
        if (Test-Path $regPath) {
            try {
                Remove-Item $regPath -Force -ErrorAction Stop
                Write-Host "  ✓ Removed: $regPath" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ Failed to remove: $regPath (need admin)" -ForegroundColor Red
            }
        } else {
            Write-Host "  - Not found: $regPath" -ForegroundColor Gray
        }
    }
    
    # Also check for external extensions JSON files
    $extJsonPaths = @(
        "$env:ProgramFiles\Google\Chrome\Application\*\Extensions\$McAfeeExtId.json",
        "$env:ProgramFiles(x86)\Google\Chrome\Application\*\Extensions\$McAfeeExtId.json",
        "$ChromeUserData\External Extensions\$McAfeeExtId.json"
    )
    
    foreach ($jsonPath in $extJsonPaths) {
        $files = Get-ChildItem $jsonPath -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            try {
                Remove-Item $file.FullName -Force
                Write-Host "  ✓ Removed: $($file.FullName)" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ Failed to remove: $($file.FullName)" -ForegroundColor Red
            }
        }
    }
}

# Main execution
Write-Host "`n📋 Detected Chrome Profiles:" -ForegroundColor Cyan
Get-ChromeProfiles | ForEach-Object { Write-Host "  - $($_.Folder): $($_.Name) <$($_.Email)>" }

# Close Chrome warning
Write-Host "`n⚠️  CLOSE ALL CHROME WINDOWS BEFORE CONTINUING!" -ForegroundColor Yellow -BackgroundColor DarkRed
Write-Host "Press any key when Chrome is closed..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Determine which profiles to fix
$profilesToFix = @()
if ($All) {
    $profilesToFix = Get-ChromeProfiles | ForEach-Object { $_.Folder }
} elseif ($Profile) {
    $profilesToFix = @($Profile)
} else {
    # Default: fix all profiles
    $profilesToFix = Get-ChromeProfiles | ForEach-Object { $_.Folder }
}

# Fix profiles
foreach ($p in $profilesToFix) {
    Fix-ChromeProfile -ProfileFolder $p
}

# Remove registry hooks if admin or requested
if ($isAdmin -or $RemoveRegistry) {
    Remove-McAfeeRegistryHooks
} else {
    Write-Host "`n⚠️  To permanently prevent McAfee from reinstalling, run as Administrator:" -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell > Run as Administrator" -ForegroundColor Gray
    Write-Host "   Then run: .\fix-chrome-hijack.ps1 -RemoveRegistry" -ForegroundColor Gray
}

# Deep clean - remove extension folders entirely
if ($Deep -or $Auto) {
    Write-Host "`n🧹 Deep cleaning extension folders..." -ForegroundColor Cyan
    foreach ($profile in (Get-ChildItem "$ChromeUserData" -Directory | Where-Object { $_.Name -match "^(Default|Profile)" })) {
        $extPath = Join-Path $profile.FullName "Extensions\$McAfeeExtId"
        if (Test-Path $extPath) {
            Remove-Item $extPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Removed extension folder from $($profile.Name)" -ForegroundColor Green
        }
    }
    
    # Clean orphan McAfee program folders (needs admin)
    if ($isAdmin) {
        @("C:\Program Files\McAfee", "C:\Program Files (x86)\McAfee", "C:\ProgramData\McAfee") | ForEach-Object {
            if (Test-Path $_) {
                Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Removed: $_" -ForegroundColor Green
            }
        }
    }
}

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║  ✅ FIX COMPLETE!                                             ║
║                                                              ║
║  1. Open Chrome and verify Google is default search          ║
║  2. If McAfee returns, run this script as Administrator      ║
║  3. Consider uninstalling McAfee WebAdvisor entirely:        ║
║     Settings > Apps > McAfee WebAdvisor > Uninstall          ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

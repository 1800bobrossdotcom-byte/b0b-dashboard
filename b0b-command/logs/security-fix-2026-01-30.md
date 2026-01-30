# Security Fix Log: Chrome Yahoo/McAfee Hijack Removal

**Date:** 2026-01-30  
**Operator:** c0m (with b0b swarm assist)  
**Status:** ✅ RESOLVED  
**Severity:** Medium - Browser hijacking affecting business Gmail profile

---

## Issue Description

McAfee WebAdvisor extension was hijacking Chrome search to Yahoo across multiple profiles, specifically affecting the **1800BOBROSSDOTCOM** work profile (Profile 5) linked to `1800bobrossdotcom@gmail.com`.

### Symptoms
- Default search engine changed to Yahoo without consent
- Extension reinstalled itself after manual removal
- Registry hooks forcing extension installation on Chrome launch

---

## Root Cause Analysis

1. **McAfee WebAdvisor** (Extension ID: `fheoggkfdfchfphceeifdbepaooicaho`) was installed via bundled software
2. Extension registered **force-install registry hooks** at:
   - `HKLM:\SOFTWARE\Google\Chrome\Extensions\fheoggkfdfchfphceeifdbepaooicaho`
   - `HKLM:\SOFTWARE\WOW6432Node\Google\Chrome\Extensions\fheoggkfdfchfphceeifdbepaooicaho`
3. These registry keys caused Chrome to reinstall the extension on every launch
4. Extension modified `default_search_provider_data` to use Yahoo with McAfee tracking (`fr=mcafee`)

---

## Remediation Steps Performed

### 1. Identified Affected Profiles
```powershell
# Found profiles via Local State
Default: Your Chrome
Profile 1: Love  
Profile 2: GYRA
Profile 3: The
Profile 5: Work (1800 BOBROSSDOTCOM) ← PRIMARY TARGET
```

### 2. Fixed Chrome Preferences
- Backed up `Preferences` and `Secure Preferences` files
- Removed Yahoo search configuration
- Disabled McAfee extension state in JSON

### 3. Removed Registry Force-Install Hooks (Admin Required)
```powershell
Remove-Item "HKLM:\SOFTWARE\Google\Chrome\Extensions\fheoggkfdfchfphceeifdbepaooicaho" -Force
Remove-Item "HKLM:\SOFTWARE\WOW6432Node\Google\Chrome\Extensions\fheoggkfdfchfphceeifdbepaooicaho" -Force
```

### 4. Deep Cleaned Extension Folders
Removed extension from 4 profiles:
- Default
- Profile 1
- Profile 2  
- Profile 3

### 5. Cleaned Orphan McAfee Folders
- `C:\Program Files\McAfee\wps\*` (deleted remnants)
- `C:\ProgramData\McAfee\*`

### 6. Windows Smart App Control
Windows Security blocked McAfee's attempt to reinstall via MSI:
- `e119838.msi` - BLOCKED
- `dded52e.msi` - BLOCKED

---

## Verification

✅ Chrome opens with Google as default search  
✅ Registry hooks removed - no auto-reinstall  
✅ Extension folders deleted from all profiles  
✅ Windows Smart App Control blocking future attempts  

---

## Prevention Tool Created

**Location:** `b0b-command/fix-chrome-hijack.ps1`

### Usage
```powershell
# Interactive mode (prompts to close Chrome)
.\fix-chrome-hijack.ps1

# Automatic mode (no prompts, full clean)
.\fix-chrome-hijack.ps1 -Auto

# Deep clean with admin (removes everything)
powershell -ExecutionPolicy Bypass -File fix-chrome-hijack.ps1 -Auto -Deep

# Just list profiles
.\fix-chrome-hijack.ps1 -ListProfiles
```

### Quick One-Liner (Admin PowerShell)
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; & "C:\workspace\b0b-platform\b0b-command\fix-chrome-hijack.ps1" -Auto -Deep
```

---

## Recommendations

1. **Uninstall McAfee WebAdvisor** completely if still present:
   - Settings → Apps → McAfee WebAdvisor → Uninstall

2. **Keep Windows Smart App Control enabled** - it blocked reinstall attempts

3. **Be cautious of bundled software** - McAfee often comes with:
   - Adobe products
   - Lenovo/Dell/HP preinstalls
   - Free software installers

4. **Share this tool** with team members who may have same issue

---

## Technical Details

### McAfee Extension Manifest
- **Name:** McAfee WebAdvisor
- **ID:** `fheoggkfdfchfphceeifdbepaooicaho`
- **Version:** 8.1.0.8572
- **Permissions:** activeTab, alarms, declarativeNetRequest, downloads, nativeMessaging, scripting, storage, tabs, webRequest
- **Search redirect:** `https://search.yahoo.com/search?fr=mcafee&type=E210US1484G91984&p={searchTerms}`

### Files Modified
- `%LOCALAPPDATA%\Google\Chrome\User Data\Profile 5\Preferences`
- `%LOCALAPPDATA%\Google\Chrome\User Data\Profile 5\Secure Preferences`
- Registry: HKLM\SOFTWARE\Google\Chrome\Extensions\*
- Registry: HKLM\SOFTWARE\WOW6432Node\Google\Chrome\Extensions\*

---

**Log created by B0B Swarm Security Tools**  
*w3 ar3 L0RE*

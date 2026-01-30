# B0B-SH13LD 🛡️

**Simple. Powerful. Transparent.**

*"They don't want us to succeed. We succeed anyway."*

---

## What Is This?

Lightweight, open-source security toolkit for Windows. Built by operators, for operators.

No bloat. No telemetry. No corporate BS. Just protection.

## Why?

- Commercial AV is bloated and becomes the problem (McAfee hijacking browsers, anyone?)
- We've been targeted: wallet hacks, browser hijacks, persistence attempts
- We needed something we could trust because we built it ourselves

## Features

### 🔍 Scanner (`shield.ps1`)
- Browser hijack detection (Chrome extensions, search engine tampering)
- Crypto wallet security (permissions, clipboard monitoring)
- Suspicious process detection
- Network connection analysis
- Startup item auditing

### 👁️ Real-Time Monitor (`monitor.ps1`)
- **Clipboard Guardian**: Detects crypto address swapping (clipboard hijacking)
- **Registry Watcher**: Alerts on new startup entries, extension installs
- **Process Monitor**: Catches suspicious new processes

### 🚨 Emergency Fix (`fix-now.ps1`)
- One-click threat removal
- Auto-fixes all detected issues
- Chrome browser restoration

## Quick Start

```powershell
# Full scan
.\shield.ps1

# Scan and auto-fix
.\shield.ps1 -Fix

# Quick scan only
.\shield.ps1 -Quick

# Real-time monitoring
.\monitor.ps1

# Emergency fix (when compromised)
.\fix-now.ps1
```

## Threat Signatures

Currently detects:
- McAfee WebAdvisor (browser hijacker)
- Yahoo/Bing search hijacking
- Known malware process names
- Unsigned executables in temp folders
- Suspicious network ports (RAT defaults)
- Clipboard crypto-swapping

## For Developers

### Adding New Threats

Edit `shield.ps1` and add to the `$Threats` hashtable:

```powershell
$Script:Threats = @{
    MyNewThreat = @{
        Signatures = @("pattern1", "pattern2")
        Paths = @("C:\suspicious\path")
    }
}
```

### Adding New Scanners

Create a function following the pattern:

```powershell
function Scan-MyThreat {
    Write-Shield "Scanning for my threat..." "INFO"
    $found = @()
    
    # Detection logic here
    
    if ($found.Count -gt 0) {
        Write-Shield "⚠️ FOUND THREATS!" "ALERT"
    } else {
        Write-Shield "Clean" "OK"
    }
    return $found
}
```

## Roadmap

- [ ] Tray icon with status
- [ ] Web dashboard integration
- [ ] Community threat signatures
- [ ] Network traffic analysis
- [ ] Memory scanning
- [ ] Integration with b0b-brain for AI-assisted threat analysis

## License

MIT - Use it, fork it, improve it.

## Credits

B0B Swarm Security Division

---

*Born from necessity. Hardened by attacks. Open for all.*

# B0B-SH13LD - Claude Instructions

## Priority: HIGH 🔴
**Owner: c0m team**
**Status: Active Development**

## What This Is

Lightweight Windows security toolkit. Born from real attacks on our team (wallet hacks, browser hijacks). Simple, powerful, transparent.

## Core Principle

**KEEP IT SIMPLE.**

No bloat. No corporate BS. If it gets complicated, we're doing it wrong.

## Current State

- `shield.ps1` - Scanner (working)
- `monitor.ps1` - Real-time watcher (working)
- `fix-now.ps1` - Emergency fix (working)
- Detected real Yahoo hijack on first run ✓

## c0m Team Responsibilities

1. **Test in sandbox** - Use isolated VM or test machine, NOT production
2. **Add threat signatures** - When we encounter new attacks, add them
3. **Keep it lean** - Resist feature creep
4. **Document findings** - Log what attacks we see

## Development Rules

1. PowerShell only (no dependencies)
2. Must run without admin (but better with)
3. No external calls without explicit user consent
4. All actions logged
5. Quarantine before delete

## Testing Protocol

```powershell
# Always test in sandbox first
.\shield.ps1 -Quick      # Quick scan
.\shield.ps1             # Full scan  
.\shield.ps1 -Fix        # Scan + fix (TEST CAREFULLY)
.\monitor.ps1            # Real-time (run in background)
```

## Adding New Threats

Edit `shield.ps1` → `$Script:Threats` hashtable:

```powershell
NewThreatCategory = @{
    Signatures = @("pattern1", "pattern2")
    Paths = @("C:\path\to\check")
}
```

Then add a `Scan-NewThreat` function following existing patterns.

## DO NOT

- Add telemetry
- Phone home
- Auto-update without consent
- Delete without quarantine
- Run unsigned code
- Trust external threat feeds blindly

## Future (Keep Simple)

- [ ] Tray icon status
- [ ] Integration with b0b-brain for analysis
- [ ] Community signatures (vetted)

## Why This Matters

We've been targeted. Wallet hacked. Browser hijacked. People don't want us to succeed.

We succeed anyway.

---

*"Simple. Powerful. Transparent."*

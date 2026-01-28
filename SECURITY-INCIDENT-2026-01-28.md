# 🚨 SECURITY INCIDENT REPORT — 2026-01-28

## Summary
Trading wallet was drained. Bankr API key was exposed in git-tracked JSON files.

## Timeline
- **Incident discovered**: 2026-01-28
- **Attack vector**: Exposed Bankr API key in committed discussion files
- **Compromised wallet**: `0xd06Aa956CEDA935060D9431D8B8183575c41072d`
- **Compromised key**: `bk_UQTZFYQEYDVVFDUXRJJG2TQGNTG5QVB6` (REVOKED)

## Root Cause
API key was hardcoded in multiple files and committed to git:
1. `b0b-finance/wallet-config.json` (was in .gitignore but key leaked elsewhere)
2. `brain/data/discussions/2026-01-28-bankr-api-discovery.json` ← TRACKED
3. `brain/data/discussions/2026-01-28-bankr-debug.json` ← TRACKED  
4. `brain/data/discussions/2026-01-28-site-audit.json` ← TRACKED

## Remediation Steps Completed
1. ✅ Redacted API key from all tracked files
2. ✅ Cleared wallet-config.json of all sensitive data
3. ✅ Updated .gitignore with comprehensive patterns
4. ✅ Created .env.template for proper secret management
5. ✅ Created new trading-strategy.json with security-first approach
6. ⏳ User to generate NEW Bankr API key
7. ⏳ User to set up NEW wallet

## New Security Policy

### NEVER commit:
- API keys (even in JSON discussion files!)
- Wallet addresses associated with keys
- Private keys
- Session tokens
- Any string matching pattern: `bk_*`, `sk-*`, `0x[64 hex chars]`

### Always use:
- Environment variables for ALL secrets
- `.env` files (which are gitignored)
- `process.env.VARIABLE_NAME` in code

### Before committing:
1. Run `node brain/security/secrets-scanner.js`
2. Check for any hardcoded strings that look like keys
3. Review discussion/log files for accidentally logged secrets

## Files Modified
- `brain/data/discussions/2026-01-28-bankr-api-discovery.json` - Key redacted
- `brain/data/discussions/2026-01-28-bankr-debug.json` - Key redacted
- `brain/data/discussions/2026-01-28-site-audit.json` - Key and wallet redacted
- `b0b-finance/wallet-config.json` - Cleared, now uses env vars
- `.gitignore` - Expanded security patterns
- `.env.template` - Created for proper setup

## New Trading Strategy (Post-Incident)
Focus on **TOP 100 BASE COINS ONLY**:
- Bankr ecosystem tokens
- Clanker-launched tokens
- Clawd/AI tokens (vetted only)
- Blue-chip memes with established liquidity

See: `brain/config/trading-strategy.json`

## Lessons Learned
1. **Discussion files are documentation** - they get committed. Never paste real keys.
2. **Secrets scanners exist** - USE THEM before every commit
3. **Git history is forever** - if it was ever committed, assume it's compromised
4. **Bankr API key = wallet access** - treat it like a private key

---

*"We don't make mistakes, just happy accidents. But this one taught us to be more careful."*

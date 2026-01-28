# B0B Quality Scripts

## Quick Build Test (run before committing dashboard changes)
```powershell
cd dashboard; npm run build; cd ..
```

## Setup Git Hooks (one-time)
```powershell
git config core.hooksPath .githooks
```

## Manual Quality Check
```powershell
# TypeScript check
cd dashboard; npx tsc --noEmit

# Build check  
npm run build

# Return
cd ..
```

## Why We Have This

After the JSX syntax error incident (Jan 27, 2026), we learned:
- Always test build locally before pushing
- Railway builds from repo, not local
- Syntax errors slip through without local verification

The pre-push hook catches these before they waste Railway build credits.

## Team Protocol

1. Make changes
2. Run `npm run build` in dashboard/
3. If it passes, commit and push
4. If it fails, fix before committing

**b0b asks → team acts → quality ships**

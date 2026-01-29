# B0B Quality Scripts

## 🚨 MANDATORY: Run Before ANY Deployment

**NEVER push code without running the quality check first.**

```powershell
# B0B QUALITY CHECK - Run this in the project folder before deploying
function B0B-QualityCheck {
    param([string]$ProjectPath = ".")
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  B0B QUALITY CHECK" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Push-Location $ProjectPath
    
    # Step 1: TypeScript Check
    Write-Host "[1/2] TypeScript Check..." -ForegroundColor Yellow
    npx tsc --noEmit 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ TypeScript OK" -ForegroundColor Green
    } else {
        Write-Host "  ✗ TypeScript FAILED" -ForegroundColor Red
        Pop-Location
        return $false
    }
    
    # Step 2: Build Check
    Write-Host "[2/2] Build Check..." -ForegroundColor Yellow
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Build OK" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Build FAILED" -ForegroundColor Red
        Pop-Location
        return $false
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ QUALITY CHECK PASSED - READY TO DEPLOY" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    Pop-Location
    return $true
}

# Usage for each project:
# cd 0type; B0B-QualityCheck
# cd dashboard; B0B-QualityCheck
# cd d0t/web; B0B-QualityCheck
```

## Quick Commands Per Project

```powershell
# 0type
cd c:\workspace\b0b-platform\0type
npx tsc --noEmit && npm run build

# Dashboard  
cd c:\workspace\b0b-platform\dashboard
npx tsc --noEmit && npm run build

# D0T Web
cd c:\workspace\b0b-platform\d0t\web
npx tsc --noEmit && npm run build
```

## Setup Git Hooks (one-time)
```powershell
git config core.hooksPath .githooks
```

## Why We Have This

After the JSX syntax error incident (Jan 27, 2026) and the Suspense boundary bug (Jan 29, 2026), we learned:
- Always test build locally before pushing
- Railway builds from repo, not local
- Syntax errors and SSG issues slip through without local verification
- The quality check catches bugs BEFORE they waste Railway credits

## Team Protocol (MANDATORY FOR ALL AGENTS)

1. Make changes
2. **RUN `npm run build` in the project folder**
3. If it passes → commit and push
4. If it fails → FIX BEFORE committing
5. After push → trigger `railway redeploy --yes`

**b0b asks → team acts → quality ships**

## Autonomous Agent Checklist

When building autonomously, ALWAYS:
- [ ] Run `npx tsc --noEmit` before committing
- [ ] Run `npm run build` before committing  
- [ ] Only push if both pass
- [ ] After push, run `railway redeploy --yes`
- [ ] Verify deployment with `curl -s <url> | Select-String "title"`

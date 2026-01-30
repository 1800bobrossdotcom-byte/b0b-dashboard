# ==============================================================================
# SWARM CONTROL DASHBOARD - n0w that is l0re
# ==============================================================================
# Mini terminal for the swarm - b0b, c0m, d0t, r0ss
# ==============================================================================

$BRAIN_URL = "https://b0b-brain-production.up.railway.app"

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ===============================================================" -ForegroundColor Cyan
    Write-Host "   SWARM CONTROL DASHBOARD" -ForegroundColor Cyan
    Write-Host "   b0b | c0m | d0t | r0ss" -ForegroundColor DarkCyan
    Write-Host "  ===============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    Write-Host "  [1] Brain Status        [6] Fix Chrome Hijack" -ForegroundColor White
    Write-Host "  [2] Swarm Pulse         [7] Deploy Dashboard" -ForegroundColor White
    Write-Host "  [3] Treasury Balance    [8] Git Status" -ForegroundColor White
    Write-Host "  [4] Live Trader         [9] Railway Logs" -ForegroundColor White
    Write-Host "  [5] D0T Signals         [0] Exit" -ForegroundColor White
    Write-Host ""
    Write-Host "  [cmd] Run any command" -ForegroundColor DarkGray
    Write-Host ""
}

function Get-BrainStatus {
    Write-Host "  Checking brain..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BRAIN_URL/health" -TimeoutSec 5
        Write-Host "  [OK] Brain is ONLINE" -ForegroundColor Green
        Write-Host "       Mode: $($response.mode)" -ForegroundColor Gray
    } catch {
        Write-Host "  [!] Brain OFFLINE or unreachable" -ForegroundColor Red
    }
}

function Get-SwarmPulse {
    Write-Host "  Fetching swarm pulse..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BRAIN_URL/swarm/live" -TimeoutSec 10
        Write-Host "  [OK] Swarm Live Data:" -ForegroundColor Green
        if ($response.trader) {
            Write-Host "       Trader: $($response.trader.status)" -ForegroundColor Gray
        }
        if ($response.treasury) {
            Write-Host "       Treasury: $($response.treasury.total)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [!] Could not fetch swarm data" -ForegroundColor Red
    }
}

function Get-Treasury {
    Write-Host "  Fetching treasury..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BRAIN_URL/treasury" -TimeoutSec 10
        Write-Host "  [OK] Treasury Status:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 2 | Write-Host -ForegroundColor Gray
    } catch {
        Write-Host "  [!] Could not fetch treasury" -ForegroundColor Red
    }
}

function Get-LiveTrader {
    Write-Host "  Fetching live trader status..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BRAIN_URL/trader/status" -TimeoutSec 10
        Write-Host "  [OK] Live Trader:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    } catch {
        Write-Host "  [!] Could not fetch trader status" -ForegroundColor Red
    }
}

function Get-D0TSignals {
    Write-Host "  Fetching D0T signals..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BRAIN_URL/d0t/signals" -TimeoutSec 10
        Write-Host "  [OK] D0T Signals:" -ForegroundColor Green
        if ($response.predictions) {
            foreach ($pred in $response.predictions | Select-Object -First 3) {
                Write-Host "       - $($pred.title): $($pred.probability)%" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  [!] Could not fetch D0T signals" -ForegroundColor Red
    }
}

function Run-ChromeFix {
    Write-Host "  Running Chrome hijack fix..." -ForegroundColor Yellow
    $scriptPath = Join-Path $PSScriptRoot "fix-chrome-hijack.ps1"
    if (Test-Path $scriptPath) {
        & $scriptPath
    } else {
        Write-Host "  [!] fix-chrome-hijack.ps1 not found" -ForegroundColor Red
    }
}

function Deploy-Dashboard {
    Write-Host "  Deploying dashboard to Railway..." -ForegroundColor Yellow
    Push-Location "c:\workspace\b0b-platform\dashboard"
    railway up --detach
    Pop-Location
    Write-Host "  [OK] Deploy initiated" -ForegroundColor Green
}

function Show-GitStatus {
    Write-Host "  Git status..." -ForegroundColor Yellow
    Push-Location "c:\workspace\b0b-platform"
    git status --short
    Pop-Location
}

function Show-RailwayLogs {
    Write-Host "  Railway logs (last 20)..." -ForegroundColor Yellow
    Push-Location "c:\workspace\b0b-platform\dashboard"
    railway logs -n 20
    Pop-Location
}

# ==============================================================================
# MAIN LOOP
# ==============================================================================

Show-Banner
Show-Menu

while ($true) {
    Write-Host ""
    $input = Read-Host "  swarm>"
    
    switch ($input) {
        "1" { Get-BrainStatus }
        "2" { Get-SwarmPulse }
        "3" { Get-Treasury }
        "4" { Get-LiveTrader }
        "5" { Get-D0TSignals }
        "6" { Run-ChromeFix }
        "7" { Deploy-Dashboard }
        "8" { Show-GitStatus }
        "9" { Show-RailwayLogs }
        "0" { 
            Write-Host "  The swarm persists." -ForegroundColor Cyan
            break 
        }
        "menu" { Show-Banner; Show-Menu }
        "clear" { Show-Banner; Show-Menu }
        "help" { Show-Menu }
        default {
            if ($input -and $input.Length -gt 0) {
                try {
                    Invoke-Expression $input
                } catch {
                    Write-Host "  [!] Error: $_" -ForegroundColor Red
                }
            }
        }
    }
    
    if ($input -eq "0") { break }
}

# B0B-SH13LD Security Module
# Quick-access commands for the b0b ecosystem

$ShieldPath = $PSScriptRoot

function b0b-scan {
    & "$ShieldPath\shield.ps1" @args
}

function b0b-fix {
    & "$ShieldPath\shield.ps1" -Fix
}

function b0b-monitor {
    & "$ShieldPath\monitor.ps1"
}

function b0b-emergency {
    & "$ShieldPath\fix-now.ps1"
}

# Export
Export-ModuleMember -Function b0b-scan, b0b-fix, b0b-monitor, b0b-emergency

Write-Host "🛡️ B0B-SH13LD loaded. Commands: b0b-scan, b0b-fix, b0b-monitor, b0b-emergency" -ForegroundColor Cyan

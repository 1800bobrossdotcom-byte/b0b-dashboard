<#
.SYNOPSIS
    B0B-SH13LD Real-Time Monitor
.DESCRIPTION
    Watches for threats in real-time:
    - Registry changes
    - New processes
    - Clipboard hijacking (crypto addresses)
    - File system changes to protected paths
#>

param(
    [switch]$Daemon  # Run as background service
)

$Script:ShieldRoot = $PSScriptRoot
$Script:LogPath = "$ShieldRoot\logs"

# Import main shield
. "$ShieldRoot\shield.ps1"

#region [CLIPBOARD MONITOR]
# Detect clipboard hijacking (swapping crypto addresses)
$Script:LastClipboard = ""
$Script:ClipboardPatterns = @{
    ETH = "^0x[a-fA-F0-9]{40}$"
    BTC = "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
    SOL = "^[A-HJ-NP-Za-km-z1-9]{32,44}$"
}

function Watch-Clipboard {
    Add-Type -AssemblyName System.Windows.Forms
    
    while ($true) {
        try {
            $clip = [System.Windows.Forms.Clipboard]::GetText()
            
            if ($clip -ne $Script:LastClipboard -and $clip.Length -gt 0) {
                # Check if it's a crypto address
                foreach ($type in $ClipboardPatterns.Keys) {
                    if ($clip -match $ClipboardPatterns[$type]) {
                        Write-Shield "Clipboard contains $type address: $($clip.Substring(0,10))..." "INFO"
                        
                        # Alert if address changes unexpectedly (potential hijack)
                        if ($Script:LastClipboard -match $ClipboardPatterns[$type] -and 
                            $Script:LastClipboard -ne $clip) {
                            Write-Shield "⚠️ CLIPBOARD HIJACK DETECTED! Address was swapped!" "ALERT"
                            
                            # Sound alarm
                            [Console]::Beep(1000, 500)
                            [Console]::Beep(1000, 500)
                            [Console]::Beep(1000, 500)
                            
                            # Log the swap
                            @{
                                Time = Get-Date -Format "o"
                                Event = "ClipboardHijack"
                                Original = $Script:LastClipboard
                                Replaced = $clip
                            } | ConvertTo-Json | Add-Content "$LogPath\alerts.json"
                        }
                        break
                    }
                }
                $Script:LastClipboard = $clip
            }
        } catch {}
        
        Start-Sleep -Milliseconds 500
    }
}
#endregion

#region [REGISTRY MONITOR]
function Watch-Registry {
    $paths = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
        "HKLM:\SOFTWARE\Google\Chrome\Extensions",
        "HKCU:\SOFTWARE\Google\Chrome\Extensions"
    )
    
    # Get baseline
    $baseline = @{}
    foreach ($path in $paths) {
        if (Test-Path $path) {
            $baseline[$path] = Get-ItemProperty $path -ErrorAction SilentlyContinue
        }
    }
    
    while ($true) {
        foreach ($path in $paths) {
            if (Test-Path $path) {
                $current = Get-ItemProperty $path -ErrorAction SilentlyContinue
                $base = $baseline[$path]
                
                # Compare
                $currentProps = $current.PSObject.Properties | Where-Object { $_.Name -notmatch "^PS" }
                $baseProps = $base.PSObject.Properties | Where-Object { $_.Name -notmatch "^PS" }
                
                # New entries
                $new = $currentProps | Where-Object { $_.Name -notin $baseProps.Name }
                foreach ($entry in $new) {
                    Write-Shield "⚠️ NEW REGISTRY ENTRY: $path\$($entry.Name)" "ALERT"
                    [Console]::Beep(800, 300)
                    
                    @{
                        Time = Get-Date -Format "o"
                        Event = "RegistryChange"
                        Path = $path
                        Name = $entry.Name
                        Value = $entry.Value
                    } | ConvertTo-Json | Add-Content "$LogPath\alerts.json"
                }
                
                $baseline[$path] = $current
            }
        }
        
        Start-Sleep -Seconds 5
    }
}
#endregion

#region [PROCESS MONITOR]
function Watch-Processes {
    $knownPIDs = Get-Process | Select-Object -ExpandProperty Id
    
    while ($true) {
        $currentPIDs = Get-Process | Select-Object Id, Name, Path
        
        foreach ($proc in $currentPIDs) {
            if ($proc.Id -notin $knownPIDs) {
                # New process
                $suspicious = $false
                $reason = ""
                
                # Check against known bad
                foreach ($bad in $Threats.SuspiciousProcs) {
                    if ($proc.Name -match $bad) {
                        $suspicious = $true
                        $reason = "Known malicious process"
                        break
                    }
                }
                
                # Check if from temp folder
                if ($proc.Path -match "\\Temp\\|\\tmp\\") {
                    $suspicious = $true
                    $reason = "Process running from temp folder"
                }
                
                # Check signature
                if ($proc.Path -and (Test-Path $proc.Path)) {
                    $sig = Get-AuthenticodeSignature $proc.Path -ErrorAction SilentlyContinue
                    if ($sig.Status -ne "Valid" -and $proc.Path -notmatch "\\Windows\\") {
                        $suspicious = $true
                        $reason = "Unsigned executable"
                    }
                }
                
                if ($suspicious) {
                    Write-Shield "⚠️ SUSPICIOUS PROCESS: $($proc.Name) (PID: $($proc.Id)) - $reason" "ALERT"
                    [Console]::Beep(600, 200)
                    
                    @{
                        Time = Get-Date -Format "o"
                        Event = "SuspiciousProcess"
                        Name = $proc.Name
                        PID = $proc.Id
                        Path = $proc.Path
                        Reason = $reason
                    } | ConvertTo-Json | Add-Content "$LogPath\alerts.json"
                }
            }
        }
        
        $knownPIDs = $currentPIDs.Id
        Start-Sleep -Seconds 2
    }
}
#endregion

#region [MAIN MONITOR]
function Start-Monitor {
    Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║  B0B-SH13LD REAL-TIME MONITOR                                 ║
║  Watching: Clipboard | Registry | Processes                   ║
║  Press Ctrl+C to stop                                         ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
    
    Write-Shield "Real-time monitoring started" "OK"
    
    # Run monitors in parallel
    $clipJob = Start-Job -ScriptBlock {
        param($root)
        . "$root\monitor.ps1"
        Watch-Clipboard
    } -ArgumentList $ShieldRoot
    
    $regJob = Start-Job -ScriptBlock {
        param($root)
        . "$root\monitor.ps1"  
        Watch-Registry
    } -ArgumentList $ShieldRoot
    
    $procJob = Start-Job -ScriptBlock {
        param($root)
        . "$root\monitor.ps1"
        Watch-Processes
    } -ArgumentList $ShieldRoot
    
    Write-Shield "Monitors active: Clipboard, Registry, Process" "OK"
    
    # Keep alive and show status
    try {
        while ($true) {
            $alerts = Get-Content "$LogPath\alerts.json" -ErrorAction SilentlyContinue | 
                      ConvertFrom-Json -ErrorAction SilentlyContinue |
                      Where-Object { (Get-Date $_.Time) -gt (Get-Date).AddHours(-1) }
            
            $status = "🛡️ Shield Active | Alerts (1hr): $($alerts.Count)"
            Write-Host "`r$status" -NoNewline -ForegroundColor Green
            
            Start-Sleep -Seconds 10
        }
    } finally {
        Stop-Job $clipJob, $regJob, $procJob -ErrorAction SilentlyContinue
        Remove-Job $clipJob, $regJob, $procJob -ErrorAction SilentlyContinue
        Write-Shield "Monitor stopped" "WARN"
    }
}

Start-Monitor
#endregion

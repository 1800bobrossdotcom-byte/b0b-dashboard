<#
.SYNOPSIS
    B0B-SH13LD v1.0 - Lightweight Security Monitor
.DESCRIPTION
    Real-time protection for operators under active threat
    Simple. Powerful. Transparent.
.NOTES
    B0B Swarm Security Division
    "They don't want us to succeed. We succeed anyway."
#>

#requires -Version 5.1
$ErrorActionPreference = "Stop"
$Script:Version = "1.0.0"
$Script:ShieldRoot = $PSScriptRoot
$Script:LogPath = "$ShieldRoot\logs"
$Script:QuarantinePath = "$ShieldRoot\quarantine"
$Script:ConfigPath = "$ShieldRoot\config.json"

#region [INIT]
if (-not (Test-Path $LogPath)) { New-Item -Path $LogPath -ItemType Directory -Force | Out-Null }
if (-not (Test-Path $QuarantinePath)) { New-Item -Path $QuarantinePath -ItemType Directory -Force | Out-Null }

function Write-Shield {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ALERT" { "Red" }
        "WARN"  { "Yellow" }
        "OK"    { "Green" }
        default { "Gray" }
    }
    Write-Host "[$ts] [$Level] $Message" -ForegroundColor $color
    "$ts|$Level|$Message" | Add-Content "$LogPath\shield-$(Get-Date -Format 'yyyyMMdd').log"
}
#endregion

#region [THREAT SIGNATURES]
$Script:Threats = @{
    # Browser Hijackers
    BrowserHijack = @{
        # Actually malicious/unwanted extensions
        Extensions = @(
            "fheoggkfdfchfphceeifdbepaooicaho"   # McAfee WebAdvisor - HIJACKER
        )
        # Potentially unwanted (bundled bloatware) - warn only
        PUPExtensions = @(
            "efaidnbmnnnibpcajpcglclefindmkaj"   # Adobe Acrobat - often force-installed
        )
        # Whitelist - legitimate extensions
        Whitelist = @(
            "ghbmnnjooekpmoecnnnilnnbdlolhkhi"   # Google Docs Offline - legitimate
        )
        RegistryPaths = @(
            "HKLM:\SOFTWARE\Google\Chrome\Extensions",
            "HKLM:\SOFTWARE\WOW6432Node\Google\Chrome\Extensions",
            "HKCU:\SOFTWARE\Google\Chrome\Extensions"
        )
        SearchHijack = @("yahoo", "bing", "ask.com", "myway", "searchassist", "mcafee")
    }
    
    # Crypto Wallet Threats
    WalletThreats = @{
        ClipboardPatterns = @(
            "^0x[a-fA-F0-9]{40}$",      # ETH address
            "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$",  # BTC
            "^[A-HJ-NP-Za-km-z1-9]{32,44}$"       # Solana
        )
        SuspiciousProcesses = @(
            "clipbanker", "cryptostealer", "keylogger"
        )
        WalletPaths = @(
            "$env:APPDATA\Exodus",
            "$env:APPDATA\atomic",
            "$env:APPDATA\Electrum",
            "$env:LOCALAPPDATA\Coinbase",
            "$env:APPDATA\Phantom"
        )
    }
    
    # Suspicious Processes
    SuspiciousProcs = @(
        "mimikatz", "lazagne", "procdump", "pwdump",
        "keylogger", "ratool", "darkcomet", "njrat"
    )
    
    # Suspicious Network
    BadIPs = @()  # Populated from threat feed
    BadDomains = @("malware.com", "evil.com")  # Examples
}
#endregion

#region [SCANNER MODULES]
function Scan-BrowserHijacks {
    Write-Shield "Scanning for browser hijacks..." "INFO"
    $found = @()
    
    # Check Chrome extensions
    $chromeData = "$env:LOCALAPPDATA\Google\Chrome\User Data"
    if (Test-Path $chromeData) {
        foreach ($extId in $Threats.BrowserHijack.Extensions) {
            # Registry force-install
            foreach ($regPath in $Threats.BrowserHijack.RegistryPaths) {
                if (Test-Path "$regPath\$extId") {
                    $found += [PSCustomObject]@{
                        Type = "BrowserHijack"
                        Location = "$regPath\$extId"
                        Threat = "Force-installed extension"
                        ExtId = $extId
                    }
                }
            }
            
            # Installed extensions
            Get-ChildItem "$chromeData\*\Extensions\$extId" -ErrorAction SilentlyContinue | ForEach-Object {
                $found += [PSCustomObject]@{
                    Type = "BrowserHijack"
                    Location = $_.FullName
                    Threat = "Installed hijacker extension"
                    ExtId = $extId
                }
            }
        }
        
        # Search engine hijack
        Get-ChildItem "$chromeData\*\Preferences" -ErrorAction SilentlyContinue | ForEach-Object {
            $prefs = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            foreach ($term in $Threats.BrowserHijack.SearchHijack) {
                if ($prefs -match "default_search.*$term") {
                    $found += [PSCustomObject]@{
                        Type = "SearchHijack"
                        Location = $_.FullName
                        Threat = "Search engine hijacked to $term"
                        ExtId = $null
                    }
                }
            }
        }
    }
    
    if ($found.Count -gt 0) {
        Write-Shield "⚠️ FOUND $($found.Count) BROWSER THREATS!" "ALERT"
    } else {
        Write-Shield "Browser clean" "OK"
    }
    return $found
}

function Scan-WalletSecurity {
    Write-Shield "Scanning wallet security..." "INFO"
    $alerts = @()
    
    # Check wallet folder permissions
    foreach ($path in $Threats.WalletThreats.WalletPaths) {
        if (Test-Path $path) {
            $acl = Get-Acl $path -ErrorAction SilentlyContinue
            $acl.Access | Where-Object { 
                $_.IdentityReference -notmatch "SYSTEM|Administrators|$env:USERNAME" -and
                $_.FileSystemRights -match "Read|Write"
            } | ForEach-Object {
                $alerts += [PSCustomObject]@{
                    Type = "WalletPermission"
                    Location = $path
                    Threat = "Suspicious access: $($_.IdentityReference)"
                }
            }
        }
    }
    
    # Check for crypto-stealing processes
    $procs = Get-Process | Select-Object Name, Path
    foreach ($proc in $procs) {
        foreach ($sus in $Threats.WalletThreats.SuspiciousProcesses) {
            if ($proc.Name -match $sus -or $proc.Path -match $sus) {
                $alerts += [PSCustomObject]@{
                    Type = "WalletThreat"
                    Location = $proc.Path
                    Threat = "Suspicious process: $($proc.Name)"
                }
            }
        }
    }
    
    if ($alerts.Count -gt 0) {
        Write-Shield "⚠️ FOUND $($alerts.Count) WALLET SECURITY ISSUES!" "ALERT"
    } else {
        Write-Shield "Wallet security OK" "OK"
    }
    return $alerts
}

function Scan-SuspiciousProcesses {
    Write-Shield "Scanning processes..." "INFO"
    $threats = @()
    
    $procs = Get-Process | Select-Object Name, Id, Path, Company
    foreach ($proc in $procs) {
        # Known bad process names
        foreach ($bad in $Threats.SuspiciousProcs) {
            if ($proc.Name -match $bad) {
                $threats += [PSCustomObject]@{
                    Type = "MaliciousProcess"
                    ProcessName = $proc.Name
                    PID = $proc.Id
                    Path = $proc.Path
                }
            }
        }
        
        # Unsigned executables in temp folders
        if ($proc.Path -match "\\Temp\\|\\tmp\\" -and $proc.Path) {
            try {
                $sig = Get-AuthenticodeSignature $proc.Path -ErrorAction SilentlyContinue
                if ($sig.Status -ne "Valid") {
                    $threats += [PSCustomObject]@{
                        Type = "UnsignedTempProcess"
                        ProcessName = $proc.Name
                        PID = $proc.Id
                        Path = $proc.Path
                    }
                }
            } catch {}
        }
    }
    
    if ($threats.Count -gt 0) {
        Write-Shield "⚠️ FOUND $($threats.Count) SUSPICIOUS PROCESSES!" "ALERT"
    } else {
        Write-Shield "Processes OK" "OK"
    }
    return $threats
}

function Scan-NetworkConnections {
    Write-Shield "Scanning network connections..." "INFO"
    $suspicious = @()
    
    $connections = Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        # Check for connections to suspicious ports
        if ($conn.RemotePort -in @(4444, 5555, 6666, 31337, 12345)) {
            $suspicious += [PSCustomObject]@{
                Type = "SuspiciousPort"
                LocalPort = $conn.LocalPort
                RemoteAddress = $conn.RemoteAddress
                RemotePort = $conn.RemotePort
                ProcessId = $conn.OwningProcess
            }
        }
        
        # Check against bad IPs
        if ($conn.RemoteAddress -in $Threats.BadIPs) {
            $suspicious += [PSCustomObject]@{
                Type = "BadIP"
                RemoteAddress = $conn.RemoteAddress
                ProcessId = $conn.OwningProcess
            }
        }
    }
    
    if ($suspicious.Count -gt 0) {
        Write-Shield "⚠️ FOUND $($suspicious.Count) SUSPICIOUS CONNECTIONS!" "ALERT"
    } else {
        Write-Shield "Network OK" "OK"
    }
    return $suspicious
}

function Scan-StartupItems {
    Write-Shield "Scanning startup items..." "INFO"
    $suspicious = @()
    
    $startupPaths = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce",
        "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
    )
    
    foreach ($path in $startupPaths) {
        if ($path -match "^HK") {
            # Registry
            if (Test-Path $path) {
                Get-ItemProperty $path -ErrorAction SilentlyContinue | 
                    Get-Member -MemberType NoteProperty | 
                    Where-Object { $_.Name -notmatch "PS" } |
                    ForEach-Object {
                        $value = (Get-ItemProperty $path).$($_.Name)
                        # Check for suspicious patterns
                        if ($value -match "powershell.*-enc|cmd.*/c.*http|mshta|wscript.*http") {
                            $suspicious += [PSCustomObject]@{
                                Type = "SuspiciousStartup"
                                Location = $path
                                Name = $_.Name
                                Command = $value
                            }
                        }
                    }
            }
        } else {
            # Folder
            if (Test-Path $path) {
                Get-ChildItem $path -ErrorAction SilentlyContinue | ForEach-Object {
                    $sig = Get-AuthenticodeSignature $_.FullName -ErrorAction SilentlyContinue
                    if ($sig.Status -ne "Valid") {
                        $suspicious += [PSCustomObject]@{
                            Type = "UnsignedStartup"
                            Location = $_.FullName
                            Name = $_.Name
                        }
                    }
                }
            }
        }
    }
    
    if ($suspicious.Count -gt 0) {
        Write-Shield "⚠️ FOUND $($suspicious.Count) SUSPICIOUS STARTUP ITEMS!" "ALERT"
    } else {
        Write-Shield "Startup OK" "OK"
    }
    return $suspicious
}
#endregion

#region [REMEDIATION]
function Remove-Threat {
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Threat,
        [switch]$Force
    )
    
    Write-Shield "Removing threat: $($Threat.Type) at $($Threat.Location)" "WARN"
    
    switch ($Threat.Type) {
        "BrowserHijack" {
            if ($Threat.Location -match "^HK") {
                Remove-Item $Threat.Location -Force -ErrorAction SilentlyContinue
            } else {
                # Quarantine first
                $qPath = "$QuarantinePath\$(Get-Date -Format 'yyyyMMdd-HHmmss')-$($Threat.ExtId)"
                Move-Item $Threat.Location $qPath -Force -ErrorAction SilentlyContinue
            }
        }
        "MaliciousProcess" {
            Stop-Process -Id $Threat.PID -Force -ErrorAction SilentlyContinue
            if ($Threat.Path -and (Test-Path $Threat.Path)) {
                $qPath = "$QuarantinePath\$(Get-Date -Format 'yyyyMMdd-HHmmss')-$($Threat.ProcessName).exe"
                Move-Item $Threat.Path $qPath -Force -ErrorAction SilentlyContinue
            }
        }
        "SuspiciousStartup" {
            if ($Threat.Location -match "^HK") {
                Remove-ItemProperty -Path $Threat.Location -Name $Threat.Name -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    Write-Shield "Threat removed" "OK"
}
#endregion

#region [MAIN]
function Start-Shield {
    param(
        [switch]$Fix,      # Auto-fix threats
        [switch]$Monitor,  # Real-time monitoring
        [switch]$Quick     # Quick scan only
    )
    
    Clear-Host
    Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗  ██████╗ ██████╗       ███████╗██╗  ██╗██╗██████╗  ║
║   ██╔══██╗██╔═████╗██╔══██╗      ██╔════╝██║  ██║██║██╔══██╗ ║
║   ██████╔╝██║██╔██║██████╔╝█████╗███████╗███████║██║██║  ██║ ║
║   ██╔══██╗████╔╝██║██╔══██╗╚════╝╚════██║██╔══██║██║██║  ██║ ║
║   ██████╔╝╚██████╔╝██████╔╝      ███████║██║  ██║██║██████╔╝ ║
║   ╚═════╝  ╚═════╝ ╚═════╝       ╚══════╝╚═╝  ╚═╝╚═╝╚═════╝  ║
║                                                               ║
║   v$Version | Simple. Powerful. Transparent.                  ║
║   "They don't want us to succeed. We succeed anyway."         ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
    
    Write-Shield "Shield activated" "OK"
    Write-Host ""
    
    $allThreats = @()
    
    # Run scans
    $allThreats += Scan-BrowserHijacks
    $allThreats += Scan-WalletSecurity
    if (-not $Quick) {
        $allThreats += Scan-SuspiciousProcesses
        $allThreats += Scan-NetworkConnections
        $allThreats += Scan-StartupItems
    }
    
    Write-Host ""
    if ($allThreats.Count -eq 0) {
        Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║  ✅ SYSTEM CLEAN - No threats detected                        ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
    } else {
        Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║  ⚠️  $($allThreats.Count) THREAT(S) DETECTED                                      ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Red
        
        $allThreats | Format-Table -AutoSize
        
        if ($Fix) {
            Write-Shield "Auto-fix enabled - removing threats..." "WARN"
            foreach ($threat in $allThreats) {
                Remove-Threat -Threat $threat
            }
        } else {
            Write-Host "Run with -Fix to automatically remove threats" -ForegroundColor Yellow
        }
    }
    
    return $allThreats
}

# Export for module use (only when loaded as module)
if ($MyInvocation.MyCommand.ScriptBlock.Module) {
    Export-ModuleMember -Function Start-Shield, Scan-*, Remove-Threat -Variable Threats
}
#endregion

# Direct execution
if ($MyInvocation.InvocationName -ne '.' -and -not $MyInvocation.MyCommand.ScriptBlock.Module) {
    Start-Shield @args
}

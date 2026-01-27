# b0b-command screenshot utility
# Takes a screenshot and saves it to specified path

param(
    [string]$OutputPath = "screenshot.png"
)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen(0, 0, 0, 0, $bitmap.Size)
$bitmap.Save($OutputPath)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Screenshot saved to: $OutputPath"
Write-Host "Dimensions: $($screen.Width) x $($screen.Height)"

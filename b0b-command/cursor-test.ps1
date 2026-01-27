# Simplest possible cursor - just a red square
Add-Type -AssemblyName System.Windows.Forms

$form = New-Object System.Windows.Forms.Form
$form.Text = "b0b"
$form.Size = New-Object System.Drawing.Size(40, 40)
$form.FormBorderStyle = "None"
$form.BackColor = "Orange"
$form.TopMost = $true
$form.ShowInTaskbar = $false
$form.Opacity = 0.7

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 20
$timer.Add_Tick({
    $pos = [System.Windows.Forms.Cursor]::Position
    $form.Location = New-Object System.Drawing.Point(($pos.X + 15), ($pos.Y + 15))
})
$timer.Start()

$form.ShowDialog()


Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.FormBorderStyle = 'None'
$form.BackColor = [System.Drawing.Color]::Magenta
$form.TransparencyKey = [System.Drawing.Color]::Magenta
$form.TopMost = $true
$form.ShowInTaskbar = $false
$form.Size = New-Object System.Drawing.Size(50, 50)
$form.StartPosition = 'Manual'
$form.Text = 'b0b-cursor'

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 16
$script:pulse = 0

$timer.Add_Tick({
    $pos = [System.Windows.Forms.Cursor]::Position
    $form.Location = New-Object System.Drawing.Point(($pos.X - 25), ($pos.Y - 25))
    $script:pulse = ($script:pulse + 0.1) % 6.28
    $form.Invalidate()
})

$form.Add_Paint({
    param($s, $e)
    $g = $e.Graphics
    $g.SmoothingMode = 'AntiAlias'
    
    $glow = [int](150 + 50 * [Math]::Sin($script:pulse))
    
    # Outer glow
    $brush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 255, 140, 0))
    $g.FillEllipse($brush1, 0, 0, 50, 50)
    
    # Middle ring
    $pen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($glow, 255, 100, 0), 4)
    $g.DrawEllipse($pen1, 8, 8, 34, 34)
    
    # Inner ring
    $pen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 69, 0), 2)
    $g.DrawEllipse($pen2, 15, 15, 20, 20)
    
    # Center dot
    $brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 50, 0))
    $g.FillEllipse($brush2, 21, 21, 8, 8)
})

$timer.Start()
$form.ShowDialog()

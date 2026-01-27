# b0b Cursor - Simple version
# Just a colored ring that follows the mouse

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create the cursor image once (static)
$size = 50
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

# Draw b0b cursor - amber/orange rings
$outerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 245, 158, 11))
$g.FillEllipse($outerBrush, 0, 0, 50, 50)

$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 249, 115, 22), 3)
$g.DrawEllipse($ringPen, 8, 8, 34, 34)

$innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 245, 158, 11), 2)
$g.DrawEllipse($innerPen, 15, 15, 20, 20)

$centerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 140, 0))
$g.FillEllipse($centerBrush, 20, 20, 10, 10)

$g.Dispose()

# Create form with the pre-rendered image
$form = New-Object System.Windows.Forms.Form
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
$form.TopMost = $true
$form.ShowInTaskbar = $false
$form.Size = New-Object System.Drawing.Size($size, $size)
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
$form.BackgroundImage = $bmp
$form.BackColor = [System.Drawing.Color]::Magenta
$form.TransparencyKey = [System.Drawing.Color]::Magenta

# Timer to follow mouse
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 16

$timer.Add_Tick({
    $pos = [System.Windows.Forms.Cursor]::Position
    $form.Location = New-Object System.Drawing.Point(($pos.X - 25), ($pos.Y - 25))
})

$timer.Start()
[System.Windows.Forms.Application]::Run($form)

Add-Type -AssemblyName System.Windows.Forms
      Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Mouse {
    [DllImport("user32.dll")]
    public static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, int dwExtraInfo);
}
"@
      [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(480, 320)
      Start-Sleep -Milliseconds 50
      [Mouse]::mouse_event(0x0002, 0, 0, 0, 0)
      Start-Sleep -Milliseconds 30
      [Mouse]::mouse_event(0x0004, 0, 0, 0, 0)
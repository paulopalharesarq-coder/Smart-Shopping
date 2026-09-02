Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\dommi\.gemini\antigravity-ide\brain\68731153-c45a-4afd-9a7a-6c7d4075a9ba\.user_uploaded\media_1788360055687.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)
Write-Output "Width=$($img.Width) Height=$($img.Height)"
$img.Dispose()

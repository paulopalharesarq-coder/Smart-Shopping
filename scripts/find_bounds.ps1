Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\dommi\.gemini\antigravity-ide\brain\68731153-c45a-4afd-9a7a-6c7d4075a9ba\.user_uploaded\media_1788360055687.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y += 4) {
    for ($x = 0; $x -lt $bmp.Width; $x += 4) {
        $p = $bmp.GetPixel($x, $y)
        # Check if pixel is orange (cart body / wheels)
        # Cart orange has high R (e.g. > 200), medium G (100-180), low B (< 100)
        # whereas background has R~245, G~225, B~205 (low saturation)
        $diff = [Math]::Abs($p.R - $p.B) + [Math]::Abs($p.G - $p.B)
        if ($diff -gt 90 -and $p.R -gt 200 -and $p.B -lt 140) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Cart Bounding Box: Left=$minX Top=$minY Right=$maxX Bottom=$maxY"
Write-Output "Width=$($maxX - $minX) Height=$($maxY - $minY)"
Write-Output "Left margin=$minX, Right margin=$($bmp.Width - $maxX), Top margin=$minY, Bottom margin=$($bmp.Height - $maxY)"

$bmp.Dispose()

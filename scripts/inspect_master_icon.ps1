Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\dommi\.gemini\antigravity-ide\brain\68731153-c45a-4afd-9a7a-6c7d4075a9ba\.user_uploaded\media_1788360055687.jpg"
$destDir = "c:\Users\dommi\Desktop\stitch_smart_monthly_shopping_manager\icons"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output "Source Dimensions: $($bmp.Width)x$($bmp.Height)"

# Sample corner color for background matching
$cTL = $bmp.GetPixel(10, 10)
$cTR = $bmp.GetPixel($bmp.Width - 10, 10)
$cBL = $bmp.GetPixel(10, $bmp.Height - 10)
$cBR = $bmp.GetPixel($bmp.Width - 10, $bmp.Height - 10)

Write-Output "Corner TL: R=$($cTL.R) G=$($cTL.G) B=$($cTL.B)"
Write-Output "Corner TR: R=$($cTR.R) G=$($cTR.G) B=$($cTR.B)"
Write-Output "Corner BL: R=$($cBL.R) G=$($cBL.G) B=$($cBL.B)"
Write-Output "Corner BR: R=$($cBR.R) G=$($cBR.G) B=$($cBR.B)"

$bmp.Dispose()

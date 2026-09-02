Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\dommi\.gemini\antigravity-ide\brain\68731153-c45a-4afd-9a7a-6c7d4075a9ba\.user_uploaded\media_1788360055687.jpg"
$destDir = "c:\Users\dommi\Desktop\stitch_smart_monthly_shopping_manager\icons"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Function to resize bitmap cleanly with HighQualityBicubic
function Resize-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height
    )
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $destImage = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $destImage.SetResolution($Image.HorizontalResolution, $Image.VerticalResolution)

    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $wrapMode = New-Object System.Drawing.Imaging.ImageAttributes
    $wrapMode.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $graphics.DrawImage($Image, $destRect, 0, 0, $Image.Width, $Image.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrapMode)
    $graphics.Dispose()
    $wrapMode.Dispose()

    return $destImage
}

# Function to generate maskable icon with safe zone
function Create-Maskable-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$Size,
        [double]$ScaleFactor = 0.84
    )
    $destImage = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background gradient matching the master icon corners
    $topColor = [System.Drawing.Color]::FromArgb(255, 250, 230, 212)
    $bottomColor = [System.Drawing.Color]::FromArgb(255, 240, 214, 190)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point(0, $Size)),
        $topColor,
        $bottomColor
    )
    $graphics.FillRectangle($bgBrush, 0, 0, $Size, $Size)
    $bgBrush.Dispose()

    # Draw centered scaled image
    $scaledW = [int]($Size * $ScaleFactor)
    $scaledH = [int]($Size * $ScaleFactor)
    $posX = [int](($Size - $scaledW) / 2)
    $posY = [int](($Size - $scaledH) / 2)

    $destRect = New-Object System.Drawing.Rectangle($posX, $posY, $scaledW, $scaledH)
    $wrapMode = New-Object System.Drawing.Imaging.ImageAttributes
    $wrapMode.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $graphics.DrawImage($Image, $destRect, 0, 0, $Image.Width, $Image.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrapMode)

    $graphics.Dispose()
    $wrapMode.Dispose()

    return $destImage
}

# 1. Save master copy as PNG
$srcBmp.Save((Join-Path $destDir "source_icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved source_icon.png (1024x1024)"

# 2. icon-512.png
$img512 = Resize-Image -Image $srcBmp -Width 512 -Height 512
$img512.Save((Join-Path $destDir "icon-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$img512.Dispose()
Write-Output "Saved icon-512.png (512x512)"

# 3. icon-192.png
$img192 = Resize-Image -Image $srcBmp -Width 192 -Height 192
$img192.Save((Join-Path $destDir "icon-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$img192.Dispose()
Write-Output "Saved icon-192.png (192x192)"

# 4. apple-touch-icon.png (180x180)
$img180 = Resize-Image -Image $srcBmp -Width 180 -Height 180
$img180.Save((Join-Path $destDir "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$img180.Dispose()
Write-Output "Saved apple-touch-icon.png (180x180)"

# 5. favicon-32.png (32x32)
$img32 = Resize-Image -Image $srcBmp -Width 32 -Height 32
$img32.Save((Join-Path $destDir "favicon-32.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$img32.Dispose()
Write-Output "Saved favicon-32.png (32x32)"

# 6. icon-maskable-512.png
$maskable512 = Create-Maskable-Image -Image $srcBmp -Size 512 -ScaleFactor 0.84
$maskable512.Save((Join-Path $destDir "icon-maskable-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$maskable512.Dispose()
Write-Output "Saved icon-maskable-512.png (512x512)"

# 7. icon-maskable-192.png
$maskable192 = Create-Maskable-Image -Image $srcBmp -Size 192 -ScaleFactor 0.84
$maskable192.Save((Join-Path $destDir "icon-maskable-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$maskable192.Dispose()
Write-Output "Saved icon-maskable-192.png (192x192)"

$srcBmp.Dispose()
Write-Output "All icons successfully generated from user master image!"

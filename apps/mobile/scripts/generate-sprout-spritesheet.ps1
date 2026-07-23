Add-Type -AssemblyName System.Drawing

$frame = 512
$bitmap = [System.Drawing.Bitmap]::new($frame * 4, $frame * 3)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

function Brush([string]$hex, [int]$alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($alpha, $color))
}

function Pen([string]$hex, [float]$width, [int]$alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb($alpha, $color), $width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function Fill-RotatedEllipse($g, $brush, [float]$x, [float]$y, [float]$w, [float]$h, [float]$angle) {
  $state = $g.Save()
  $g.TranslateTransform($x + $w / 2, $y + $h / 2)
  $g.RotateTransform($angle)
  $g.FillEllipse($brush, -$w / 2, -$h / 2, $w, $h)
  $g.Restore($state)
}

function Draw-Prop($g, [string]$pose) {
  $ink = Brush '#2F3A33'
  $white = Brush '#FFFDF8'
  $yellow = Brush '#F2B84B'
  $coral = Brush '#E9826E'
  $lavender = Brush '#A89AC7'
  $blue = Brush '#6AAFC8'
  $outline = Pen '#2F3A33' 7

  switch ($pose) {
    'focus' {
      $g.FillRectangle($white, 172, 340, 168, 74)
      $g.DrawRectangle($outline, 172, 340, 168, 74)
      $g.DrawLine($outline, 256, 344, 256, 410)
      $g.DrawLine((Pen '#7A9B73' 5), 194, 361, 238, 361)
      $g.DrawLine((Pen '#7A9B73' 5), 274, 361, 318, 361)
    }
    'proud' {
      $g.FillEllipse($yellow, 334, 315, 58, 58)
      $g.DrawEllipse($outline, 334, 315, 58, 58)
      $g.DrawString('1', [System.Drawing.Font]::new('Arial', 24, [System.Drawing.FontStyle]::Bold), $ink, 356, 327)
    }
    'watering' {
      $g.FillRectangle($yellow, 330, 315, 92, 68)
      $g.FillEllipse($yellow, 315, 305, 64, 84)
      $g.DrawArc($outline, 390, 320, 70, 56, 190, 145)
      $g.DrawLine((Pen '#F2B84B' 17), 414, 332, 458, 306)
      $g.FillEllipse($blue, 446, 290, 13, 19)
      $g.FillEllipse($blue, 467, 309, 10, 16)
      $g.FillRectangle((Brush '#916B49'), 438, 380, 48, 36)
      $g.FillEllipse((Brush '#6D8B6A'), 443, 360, 38, 26)
    }
    'celebrating' {
      $confetti = @(
        @(118, 128, 150, 98, '#E9826E'), @(360, 115, 390, 148, '#F2B84B'),
        @(94, 242, 132, 252, '#6AAFC8'), @(382, 238, 418, 216, '#A89AC7')
      )
      foreach ($item in $confetti) {
        $g.DrawLine((Pen $item[4] 10), $item[0], $item[1], $item[2], $item[3])
      }
      $g.FillEllipse($yellow, 236, 338, 42, 42)
    }
    'working' {
      $g.FillRectangle((Brush '#DDE7E0'), 155, 328, 202, 105)
      $g.DrawRectangle($outline, 155, 328, 202, 105)
      $g.FillEllipse((Brush '#7A9B73'), 244, 365, 24, 24)
      $g.FillRectangle((Brush '#9A7556'), 122, 428, 268, 16)
    }
    'relaxed' {
      $g.FillRectangle($white, 348, 337, 70, 58)
      $g.DrawRectangle($outline, 348, 337, 70, 58)
      $g.DrawArc($outline, 407, 348, 35, 32, 270, 180)
      $g.DrawLine((Pen '#6AAFC8' 5), 364, 329, 373, 309)
      $g.DrawLine((Pen '#6AAFC8' 5), 387, 329, 396, 307)
    }
    'sleepy' {
      $g.DrawString('Z', [System.Drawing.Font]::new('Arial', 32, [System.Drawing.FontStyle]::Bold), $lavender, 344, 172)
      $g.DrawString('z', [System.Drawing.Font]::new('Arial', 24, [System.Drawing.FontStyle]::Bold), $lavender, 390, 132)
    }
    'money' {
      $g.FillRectangle($yellow, 162, 340, 188, 84)
      $g.DrawRectangle($outline, 162, 340, 188, 84)
      $g.FillEllipse((Brush '#FFF4CA'), 276, 355, 48, 48)
      $g.DrawString('Rs', [System.Drawing.Font]::new('Arial', 15, [System.Drawing.FontStyle]::Bold), $ink, 285, 369)
    }
    'calendar' {
      $g.FillRectangle($white, 166, 324, 180, 116)
      $g.DrawRectangle($outline, 166, 324, 180, 116)
      $g.FillRectangle((Brush '#E9826E'), 169, 327, 174, 28)
      $g.DrawString('7', [System.Drawing.Font]::new('Arial', 42, [System.Drawing.FontStyle]::Bold), $ink, 242, 367)
    }
    'reflection' {
      $g.FillRectangle((Brush '#EEE8F5'), 166, 330, 180, 106)
      $g.DrawRectangle($outline, 166, 330, 180, 106)
      $heart = [System.Drawing.Drawing2D.GraphicsPath]::new()
      $heart.AddBezier(256, 405, 208, 370, 214, 340, 256, 366)
      $heart.AddBezier(256, 366, 298, 340, 304, 370, 256, 405)
      $g.FillPath($coral, $heart)
      $heart.Dispose()
    }
  }

  foreach ($item in @($ink, $white, $yellow, $coral, $lavender, $blue, $outline)) { $item.Dispose() }
}

function Draw-Sprout($g, [int]$column, [int]$row, [string]$pose) {
  $state = $g.Save()
  $g.TranslateTransform($column * 512, $row * 512)

  $body = Brush '#A7CE83'
  $bodyShade = Brush '#8DB56E'
  $leaf = Brush '#72A85F'
  $leafLight = Brush '#8EC476'
  $ink = Brush '#26352A'
  $cheek = Brush '#93BE77' 150
  $shadow = Brush '#2F3A33' 25
  $outline = Pen '#26352A' 8
  $limb = Pen '#8DB56E' 24

  $g.FillEllipse($shadow, 130, 430, 252, 34)
  $g.DrawLine((Pen '#72A85F' 20), 257, 155, 256, 107)
  Fill-RotatedEllipse $g $leaf 189 68 92 50 -28
  Fill-RotatedEllipse $g $leafLight 252 64 94 52 25

  $shape = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $shape.AddBezier(169, 196, 186, 154, 220, 148, 256, 148)
  $shape.AddBezier(256, 148, 305, 147, 337, 165, 350, 206)
  $shape.AddBezier(350, 206, 379, 274, 400, 334, 374, 401)
  $shape.AddBezier(374, 401, 354, 452, 296, 458, 256, 458)
  $shape.AddBezier(256, 458, 207, 459, 150, 447, 133, 399)
  $shape.AddBezier(133, 399, 111, 337, 142, 267, 169, 196)
  $g.FillPath($body, $shape)
  $shape.Dispose()

  if ($pose -in @('excited', 'celebrating')) {
    $g.DrawLine($limb, 160, 285, 100, 225)
    $g.DrawLine($limb, 351, 284, 413, 222)
  } elseif ($pose -eq 'proud') {
    $g.DrawLine($limb, 158, 302, 117, 347)
    $g.DrawLine($limb, 354, 302, 395, 347)
  } elseif ($pose -notin @('focus', 'working', 'calendar', 'reflection')) {
    $g.DrawLine($limb, 155, 300, 115, 324)
    $g.DrawLine($limb, 356, 300, 397, 324)
  }

  $g.FillEllipse($bodyShade, 155, 420, 86, 54)
  $g.FillEllipse($bodyShade, 278, 420, 86, 54)

  if ($pose -in @('sleepy', 'relaxed', 'reflection')) {
    $g.DrawArc($outline, 201, 263, 34, 18, 0, 180)
    $g.DrawArc($outline, 281, 263, 34, 18, 0, 180)
  } else {
    $g.FillEllipse($ink, 207, 256, 19, 27)
    $g.FillEllipse($ink, 289, 256, 19, 27)
  }
  $g.FillEllipse($cheek, 178, 291, 42, 26)
  $g.FillEllipse($cheek, 296, 291, 42, 26)
  if ($pose -eq 'excited') {
    $g.FillEllipse($ink, 245, 301, 27, 30)
  } else {
    $g.DrawArc($outline, 232, 289, 54, 39, 12, 155)
  }

  Draw-Prop $g $pose
  $g.Restore($state)
  foreach ($item in @($body, $bodyShade, $leaf, $leafLight, $ink, $cheek, $shadow, $outline, $limb)) { $item.Dispose() }
}

$poses = @(
  @('calm', 'excited', 'focus', 'proud'),
  @('watering', 'celebrating', 'working', 'relaxed'),
  @('sleepy', 'money', 'calendar', 'reflection')
)

for ($row = 0; $row -lt 3; $row++) {
  for ($column = 0; $column -lt 4; $column++) {
    Draw-Sprout $graphics $column $row $poses[$row][$column]
  }
}

$graphics.Dispose()
$output = Join-Path $PSScriptRoot '..\assets\sprout-spritesheet.png'
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
Write-Output $output

$path = "src\lib\i18n.js"
$lines = Get-Content $path
# Baris 197 (index) = awal blok ja:, baris 358 (index) = akhir blok de: "  },"
# Pertahankan index 0..196 dan 359..akhir
$new = $lines[0..196] + $lines[359..($lines.Length - 1)]
Set-Content -Path $path -Value $new -Encoding UTF8
Write-Output "OK, baris sekarang: $($new.Length)"

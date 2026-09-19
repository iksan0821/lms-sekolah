@echo off
REM ============================================================
REM Import struktur database LMS ke MySQL XAMPP
REM Jalankan file ini sekali saja (double-click) untuk membuat DB.
REM ============================================================
echo Mengimpor database lms_sekolah ke MySQL XAMPP...
"C:\xampp\mysql\bin\mysql.exe" -u root < "%~dp0lms_sekolah.sql"
if %ERRORLEVEL%==0 (
  echo.
  echo [OK] Database 'lms_sekolah' berhasil dibuat.
) else (
  echo.
  echo [GAGAL] Pastikan MySQL XAMPP sudah berjalan (Start MySQL di XAMPP Control Panel).
)
pause

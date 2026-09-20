@echo off
REM ============================================================
REM Import struktur database LMS ke MySQL Laragon
REM Jalankan file ini sekali saja (double-click) untuk membuat DB.
REM ============================================================
echo Mengimpor database lms_sekolah ke MySQL Laragon...
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root < "%~dp0lms_sekolah.sql"
if %ERRORLEVEL%==0 (
  echo.
  echo [OK] Database 'lms_sekolah' berhasil dibuat.
) else (
  echo.
  echo [GAGAL] Pastikan MySQL Laragon sudah berjalan.
)
pause
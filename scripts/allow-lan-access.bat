@echo off
REM ============================================================
REM  Buka akses LMS SMK Citra Negara dari handphone / device lain
REM  Jalankan file ini KLIK KAN > Run as administrator
REM ============================================================
echo.
echo Membuka port 3000 untuk jaringan lokal...
echo.

netsh advfirewall firewall add rule name="LMS SMK Citra Negara Dev 3000" dir=in action=allow protocol=TCP localport=3000 profile=any

netsh advfirewall firewall add rule name="LMS SMK Citra Negara MySQL 3306" dir=in action=allow protocol=TCP localport=3306 profile=any

echo.
echo Mengubah kategori jaringan Wi-Fi menjadi Private...
powershell -NoProfile -Command "Set-NetConnectionProfile -InterfaceAlias 'Wi-Fi' -NetworkCategory Private"

echo.
echo Selesai. Tutup jendela ini lalu jalankan: npm run dev
echo.
pause

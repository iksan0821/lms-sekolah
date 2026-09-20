# LMS Sekolah - Next.js + MySQL (Laragon)

Sistem Learning Management System (LMS) sekolah dengan multi-role:
**Admin, Kepala Sekolah, Kurikulum, Guru, dan Siswa**.

## Teknologi

- **Next.js 16** (App Router, Turbopack) + React 19 + Tailwind CSS 4
- **MySQL 8.x** dari Laragon
- **mysql2** (connection pool), **bcryptjs** (hash password), **jose** (JWT session)

## Struktur Database

File SQL: `database/lms_sekolah.sql`

Tabel: `roles`, `tahun_ajaran`, `jurusan`, `users`, `kelas`, `mata_pelajaran`,
`siswa`, `guru_mapel`, `pengumuman`, `log_aktivitas`, `materi`, `tugas`,
`jadwal_pelajaran`, `ujian_online`, `nilai`.

### Import Database

1. Jalankan **MySQL** dari Laragon (Start All).
2. Double-click `database/import.bat`, **atau** jalankan perintah:

```powershell
Get-Content database/lms_sekolah.sql -Raw | & "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root
```

## Menjalankan Aplikasi

```powershell
npm install
npm run dev
```

Buka http://localhost:3000

### Akun Demo (password di-hash bcrypt)

| Role      | Username  | Password     | Redirect   |
|-----------|-----------|--------------|------------|
| Admin     | admin     | admin123     | /admin     |
| Kepsek    | kepsek    | kepsek123    | /kepsek    |
| Kurikulum | kurikulum | kurikulum123 | /kurikulum |
| Guru      | guru      | guru123      | /guru      |
| Siswa     | siswa     | siswa123     | /siswa     |

## Konfigurasi `.env.local`

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=lms_sekolah
JWT_SECRET=ubah-menjadi-random-string
```

## Fitur

### Role Admin (CRUD penuh)
- Login JWT session cookie (httpOnly) + validasi role & status akun
- Dashboard statistik + log aktivitas
- Manajemen User (CRUD), Data Siswa, Data Guru, Kelas, Mata Pelajaran
- Pantau Akun (mode lihat saja untuk kepsek & kurikulum)
- Pengumuman & Pengaturan

### Role Kepala Sekolah & Kurikulum (pantau, tanpa CRUD)
- Login -> Dashboard
- Kinerja Guru
- Tugas & Materi
- Pantau Ujian Online
- Pantau Jadwal Pelajaran
- **Download Nilai** (khusus Kurikulum): pilih mapel + kelas, unduh CSV per mapel.

## Rencana Selanjutnya

- Modul **Guru**: kelas, materi, tugas, penilaian (CRUD)
- Modul **Siswa**: akses materi & pengumpulan tugas
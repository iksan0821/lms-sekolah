# LMS Sekolah — Next.js + MySQL (XAMPP)

Sistem Learning Management System (LMS) sekolah dengan multi-role:
**Admin, Kepala Sekolah, Kurikulum, Guru, dan Siswa**.
Tahap saat ini: **fokus role Admin** (login + dashboard + manajemen user).

## Teknologi

- **Next.js 16** (App Router, Turbopack) + React 19 + Tailwind CSS 4
- **MySQL / MariaDB** dari XAMPP
- **mysql2** (connection pool), **bcryptjs** (hash password), **jose** (JWT session)

## Struktur Database

File SQL: `database/lms_sekolah.sql`

Tabel: `roles`, `tahun_ajaran`, `jurusan`, `users`, `kelas`, `mata_pelajaran`,
`siswa`, `guru_mapel`, `pengumuman`,log_aktivitas`.

### Import Database

1. Jalankan **MySQL** dari XAMPP Control Panel.
2. Double-click `database/import.bat`, **atau** jalankan perintah:

```powershell
Get-Content database/lms_sekolah.sql -Raw | & "C:\xampp\mysql\bin\mysql.exe" -u root
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

## Fitur yang Sudah Jadi (Role Admin)

- Login dengan JWT session cookie (httpOnly), validasi role & status akun
- Dashboard statistik: total pengguna, kelas, mapel, distribusi per role, log aktivitas
- Manajemen User (CRUD): tambah/edit/hapus, filter per role, pencarian
- Halaman data: Siswa, Guru, Kelas, Mata Pelajaran, Pengumuman, Pengaturan
- Middleware proteksi route + redirect otomatis sesuai role
- Log aktivitas & waktu login terakhir

## Rencana Selanjutnya

- Modul **Kepsek**: laporan & statistik sekolah
- Modul **Kurikulum**: kelola mapel, jadwal, tahun ajaran
- Modul **Guru**: kelas, materi, tugas, penilaian
- Modul **Siswa**: akses materi & pengumpulan tugas

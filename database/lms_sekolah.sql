-- =============================================================
-- DATABASE LMS SEKOLAH
-- Dibuat untuk Laragon (MySQL 8.x)
-- Struktur mencakup role: admin, kepsek, kurikulum, guru, siswa
-- =============================================================

CREATE DATABASE IF NOT EXISTS `lms_sekolah`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `lms_sekolah`;

-- -------------------------------------------------------------
-- Tabel roles (master role)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `deskripsi` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `nama`, `slug`, `deskripsi`) VALUES
(1, 'Administrator', 'admin', 'Pengelola sistem secara keseluruhan'),
(2, 'Kepala Sekolah', 'kepsek', 'Melihat laporan dan statistik sekolah'),
(3, 'Kurikulum', 'kurikulum', 'Mengelola kurikulum, jadwal, dan mata pelajaran'),
(4, 'Guru', 'guru', 'Mengelola kelas, materi, dan penilaian'),
(5, 'Siswa', 'siswa', 'Mengakses materi dan tugas pembelajaran');

-- -------------------------------------------------------------
-- Tabel tahun ajaran
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `tahun_ajaran`;
CREATE TABLE `tahun_ajaran` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(50) NOT NULL,
  `tanggal_mulai` DATE DEFAULT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `aktif` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tahun_ajaran` (`id`, `nama`, `tanggal_mulai`, `tanggal_selesai`, `aktif`) VALUES
(1, '2024/2025', '2024-07-15', '2025-06-30', 1);

-- -------------------------------------------------------------
-- Tabel jurusan
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `jurusan`;
CREATE TABLE `jurusan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode` VARCHAR(20) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_jurusan_kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `jurusan` (`id`, `kode`, `nama`) VALUES
(1, 'BDR', 'Bisnis Digital dan Retail'),
(2, 'DKV', 'Desain Komunikasi Visual'),
(3, 'MPLB', 'Manajemen Perkantoran dan Layanan Bisnis'),
(4, 'PH', 'Perhotelan'),
(5, 'PPLG', 'Pengembangan Perangkat Lunak dan Gim'),
(6, 'TJKT', 'Teknik Jaringan Komputer dan Telekomunikasi');

-- -------------------------------------------------------------
-- Tabel users (semua aktor: admin, kepsek, kurikulum, guru, siswa)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(150) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `nip` VARCHAR(30) DEFAULT NULL,
  `nis` VARCHAR(30) DEFAULT NULL,
  `jenis_kelamin` ENUM('L','P') DEFAULT NULL,
  `no_telepon` VARCHAR(20) DEFAULT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel kelas
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `kelas`;
CREATE TABLE `kelas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(50) NOT NULL,
  `tingkat` VARCHAR(10) NOT NULL,
  `jurusan_id` INT UNSIGNED DEFAULT NULL,
  `wali_kelas_id` INT UNSIGNED DEFAULT NULL,
  `tahun_ajaran_id` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_kelas_jurusan` (`jurusan_id`),
  KEY `fk_kelas_wali` (`wali_kelas_id`),
  KEY `fk_kelas_tahun` (`tahun_ajaran_id`),
  CONSTRAINT `fk_kelas_jurusan` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_kelas_wali` FOREIGN KEY (`wali_kelas_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_kelas_tahun` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel mata pelajaran
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `mata_pelajaran`;
CREATE TABLE `mata_pelajaran` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode` VARCHAR(20) NOT NULL,
  `nama` VARCHAR(120) NOT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mapel_kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel siswa (relasi user -> kelas)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `siswa`;
CREATE TABLE `siswa` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `nis` VARCHAR(30) DEFAULT NULL,
  `nama_wali` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_siswa_user` (`user_id`),
  KEY `fk_siswa_kelas` (`kelas_id`),
  CONSTRAINT `fk_siswa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_siswa_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel guru_mapel (penugasan guru mengajar mapel)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `guru_mapel`;
CREATE TABLE `guru_mapel` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` INT UNSIGNED NOT NULL,
  `mapel_id` INT UNSIGNED NOT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_gm_guru` (`guru_id`),
  KEY `fk_gm_mapel` (`mapel_id`),
  KEY `fk_gm_kelas` (`kelas_id`),
  CONSTRAINT `fk_gm_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gm_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gm_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel pengumuman
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `pengumuman`;
CREATE TABLE `pengumuman` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(200) NOT NULL,
  `isi` TEXT NOT NULL,
  `target_role` VARCHAR(50) DEFAULT 'semua',
  `created_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pengumuman_user` (`created_by`),
  CONSTRAINT `fk_pengumuman_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel log aktivitas
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `log_aktivitas`;
CREATE TABLE `log_aktivitas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `aktivitas` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_log_user` (`user_id`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SEED DATA
-- Password semua akun demo: (lihat di bawah, hash bcrypt cost 10)
--   admin     -> admin123
--   kepsek    -> kepsek123
--   kurikulum -> kurikulum123
--   guru      -> guru123
--   siswa     -> siswa123
-- =============================================================

INSERT INTO `users` (`id`, `nama`, `username`, `email`, `password`, `role_id`, `nip`, `jenis_kelamin`, `no_telepon`, `status`) VALUES
(1, 'Administrator Sistem', 'admin', 'admin@lmssekolah.sch.id', '$2b$10$yRYZBkGLxiZefZULPt31deKP1p9awZM5/i55UKp10GEpPfL8ljShG', 1, 'ADM001', 'L', '081200000001', 'aktif'),
(2, 'Drs. Budi Santoso, M.Pd', 'kepsek', 'kepsek@lmssekolah.sch.id', '$2b$10$wx18oM3o468e5vKKi8DJEuwmHerMPNvEqwDWE98d8J4iRkik.DN6a', 2, 'KS001', 'L', '081200000002', 'aktif'),
(3, 'Siti Aminah, S.Pd', 'kurikulum', 'kurikulum@lmssekolah.sch.id', '$2b$10$7zaApK19djjKsBLyRRfJR.OZkSgbL0LWIH/SRp52AHd94tCHwcL5G', 3, 'KR001', 'P', '081200000003', 'aktif'),
(4, 'Ahmad Fauzi, S.Pd', 'guru', 'guru@lmssekolah.sch.id', '$2b$10$WZ.86YQkCckwjYs.t2PyHuppB28TGZvKZcynpQNLfR0SByKveMVCy', 4, 'GR001', 'L', '081200000004', 'aktif'),
(5, 'Rina Marlina', 'siswa', 'siswa@lmssekolah.sch.id', '$2b$10$r00QcfKoWLxD.KHn.wJN.uek5N60hTvWevOG5XLdXOifgrvbi/DVy', 5, NULL, 'P', '081200000005', 'aktif');

INSERT INTO `kelas` (`id`, `nama`, `tingkat`, `jurusan_id`, `wali_kelas_id`, `tahun_ajaran_id`) VALUES
(1, 'X BDR', '10', 1, 4, 1),
(2, 'XI DKV', '11', 2, 4, 1),
(3, 'X MPLB', '10', 3, 4, 1),
(4, 'XI PH', '11', 4, 4, 1),
(5, 'X PPLG', '10', 5, 4, 1),
(6, 'XI TJKT', '11', 6, 4, 1);

INSERT INTO `mata_pelajaran` (`id`, `kode`, `nama`, `deskripsi`) VALUES
(1, 'MTK', 'Matematika', 'Mata pelajaran matematika'),
(2, 'BIN', 'Bahasa Indonesia', 'Mata pelajaran bahasa Indonesia'),
(3, 'FIS', 'Fisika', 'Mata pelajaran fisika');

INSERT INTO `siswa` (`user_id`, `kelas_id`, `nis`, `nama_wali`) VALUES
(5, 1, '2024001', 'Bapak Marlina');

INSERT INTO `guru_mapel` (`guru_id`, `mapel_id`, `kelas_id`) VALUES
(4, 1, 1),
(4, 3, 2);

INSERT INTO `pengumuman` (`judul`, `isi`, `target_role`, `created_by`) VALUES
('Selamat Datang di LMS Sekolah', 'Sistem Learning Management System resmi sekolah telah aktif. Silakan gunakan sesuai peran Anda.', 'semua', 1);

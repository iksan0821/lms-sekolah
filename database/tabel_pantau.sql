-- =============================================================
-- TABEL TAMBAHAN untuk fitur pantau (kepsek & kurikulum)
-- Materi, Tugas, Jadwal Pelajaran, Ujian Online, Nilai
-- =============================================================

USE `lms_sekolah`;

-- -------------------------------------------------------------
-- Materi pembelajaran
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `materi`;
CREATE TABLE `materi` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(200) NOT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `file_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_materi_mapel` (`mapel_id`),
  KEY `fk_materi_kelas` (`kelas_id`),
  KEY `fk_materi_guru` (`guru_id`),
  CONSTRAINT `fk_materi_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materi_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materi_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tugas
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `tugas`;
CREATE TABLE `tugas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(200) NOT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `deadline` DATETIME DEFAULT NULL,
  `jumlah_terkumpul` INT UNSIGNED NOT NULL DEFAULT 0,
  `jumlah_siswa` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tugas_mapel` (`mapel_id`),
  KEY `fk_tugas_kelas` (`kelas_id`),
  KEY `fk_tugas_guru` (`guru_id`),
  CONSTRAINT `fk_tugas_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tugas_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tugas_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Jadwal pelajaran
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `jadwal_pelajaran`;
CREATE TABLE `jadwal_pelajaran` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `hari` ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `jam_mulai` TIME NOT NULL,
  `jam_selesai` TIME NOT NULL,
  `ruang` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_jadwal_kelas` (`kelas_id`),
  KEY `fk_jadwal_mapel` (`mapel_id`),
  KEY `fk_jadwal_guru` (`guru_id`),
  CONSTRAINT `fk_jadwal_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jadwal_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jadwal_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Ujian online
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `ujian_online`;
CREATE TABLE `ujian_online` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(200) NOT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `tanggal_mulai` DATETIME DEFAULT NULL,
  `durasi_menit` INT UNSIGNED DEFAULT NULL,
  `jumlah_soal` INT UNSIGNED NOT NULL DEFAULT 0,
  `jumlah_peserta` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('draft','berlangsung','selesai') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ujian_mapel` (`mapel_id`),
  KEY `fk_ujian_kelas` (`kelas_id`),
  KEY `fk_ujian_guru` (`guru_id`),
  CONSTRAINT `fk_ujian_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ujian_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ujian_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Nilai
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `nilai`;
CREATE TABLE `nilai` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` INT UNSIGNED NOT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `jenis` ENUM('tugas','ujian','harian') NOT NULL DEFAULT 'tugas',
  `nilai` DECIMAL(5,2) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_nilai_siswa` (`siswa_id`),
  KEY `fk_nilai_mapel` (`mapel_id`),
  KEY `fk_nilai_kelas` (`kelas_id`),
  CONSTRAINT `fk_nilai_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nilai_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_nilai_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- DATA CONTOH
-- =============================================================

-- Materi (kelas id=8, mapel id=1,2,8, guru id=12)
INSERT INTO `materi` (`judul`, `deskripsi`, `mapel_id`, `kelas_id`, `guru_id`) VALUES
('Pengantar Aljabar', 'Materi dasar aljabar untuk kelas XII', 1, 8, 12),
('Struktur Teks Deskripsi', 'Materi bahasa Indonesia tentang teks deskripsi', 2, 8, 12),
('English Grammar Basics', 'Materi dasar grammar bahasa Inggris', 8, 8, 12);

-- Tugas
INSERT INTO `tugas` (`judul`, `deskripsi`, `mapel_id`, `kelas_id`, `guru_id`, `deadline`, `jumlah_terkumpul`, `jumlah_siswa`) VALUES
('Latihan Aljabar Bab 1', 'Kerjakan soal latihan halaman 20-25', 1, 8, 12, '2025-02-10 23:59:00', 12, 20),
('Menulis Teks Deskripsi', 'Tulis teks deskripsi tentang lingkungan sekolah', 2, 8, 12, '2025-02-15 23:59:00', 8, 20),
('English Vocabulary', 'Hafalkan 50 kosakata baru', 8, 8, 12, '2025-02-20 23:59:00', 15, 18);

-- Jadwal pelajaran
INSERT INTO `jadwal_pelajaran` (`kelas_id`, `mapel_id`, `guru_id`, `hari`, `jam_mulai`, `jam_selesai`, `ruang`) VALUES
(8, 1, 12, 'Senin', '07:00:00', '08:30:00', 'R-101'),
(8, 2, 12, 'Senin', '08:30:00', '10:00:00', 'R-101'),
(8, 8, 12, 'Selasa', '07:00:00', '08:30:00', 'R-102'),
(8, 1, 12, 'Rabu', '07:00:00', '08:30:00', 'R-101'),
(8, 2, 12, 'Kamis', '07:00:00', '08:30:00', 'R-101'),
(8, 8, 12, 'Jumat', '07:00:00', '08:30:00', 'R-102');

-- Ujian online
INSERT INTO `ujian_online` (`judul`, `mapel_id`, `kelas_id`, `guru_id`, `tanggal_mulai`, `durasi_menit`, `jumlah_soal`, `jumlah_peserta`, `status`) VALUES
('Ulangan Harian Aljabar', 1, 8, 12, '2025-02-12 08:00:00', 60, 25, 20, 'selesai'),
('Ujian Tengah Semester B.Indonesia', 2, 8, 12, '2025-03-05 08:00:00', 90, 40, 20, 'berlangsung'),
('Kuis English Grammar', 8, 8, 12, '2025-02-18 09:00:00', 45, 20, 18, 'selesai'),
('Ujian Praktik Matematika', 1, 8, 12, '2025-03-20 08:00:00', 60, 30, 0, 'draft');

-- Nilai (siswa id=13, Iksan - kelas 8)
INSERT INTO `nilai` (`siswa_id`, `mapel_id`, `kelas_id`, `jenis`, `nilai`) VALUES
(13, 1, 8, 'harian', 85.00),
(13, 1, 8, 'tugas', 90.00),
(13, 1, 8, 'ujian', 88.00),
(13, 2, 8, 'harian', 80.00),
(13, 2, 8, 'tugas', 82.00),
(13, 2, 8, 'ujian', 78.00),
(13, 8, 8, 'harian', 86.00),
(13, 8, 8, 'ujian', 84.00);

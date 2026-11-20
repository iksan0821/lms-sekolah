-- =============================================================
-- FIX: tabel yang hilang di database/lms_sekolah.sql
-- (materi, tugas, jadwal_pelajaran, ujian_online, nilai)
-- Dipakai bersama lms_sekolah.sql agar aplikasi jalan penuh.
-- =============================================================
USE `lms_sekolah`;

-- -------------------------------------------------------------
-- Materi pembelajaran
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `materi` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `deskripsi` TEXT,
  `tipe` ENUM('teks','file','video','link') NOT NULL DEFAULT 'teks',
  `file_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_materi_guru` (`guru_id`),
  KEY `fk_materi_mapel` (`mapel_id`),
  KEY `fk_materi_kelas` (`kelas_id`),
  CONSTRAINT `fk_materi_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materi_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materi_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tugas / proyek
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tugas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `deskripsi` TEXT,
  `tipe` ENUM('tugas','ulangan','latihan') NOT NULL DEFAULT 'tugas',
  `deadline` DATE DEFAULT NULL,
  `jumlah_soal` INT UNSIGNED NOT NULL DEFAULT 0,
  `jumlah_terkumpul` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tugas_guru` (`guru_id`),
  KEY `fk_tugas_mapel` (`mapel_id`),
  KEY `fk_tugas_kelas` (`kelas_id`),
  CONSTRAINT `fk_tugas_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tugas_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tugas_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Jadwal pelajaran
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jadwal_pelajaran` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `hari` ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `jam_mulai` TIME NOT NULL,
  `jam_selesai` TIME NOT NULL,
  `ruang` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_jadwal_guru` (`guru_id`),
  KEY `fk_jadwal_mapel` (`mapel_id`),
  KEY `fk_jadwal_kelas` (`kelas_id`),
  CONSTRAINT `fk_jadwal_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jadwal_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jadwal_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Ujian online
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ujian_online` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `tanggal_mulai` DATETIME DEFAULT NULL,
  `durasi_menit` INT UNSIGNED NOT NULL DEFAULT 60,
  `jumlah_soal` INT UNSIGNED NOT NULL DEFAULT 0,
  `jumlah_peserta` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('draft','terjadwal','berlangsung','selesai') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ujian_guru` (`guru_id`),
  KEY `fk_ujian_mapel` (`mapel_id`),
  KEY `fk_ujian_kelas` (`kelas_id`),
  CONSTRAINT `fk_ujian_guru` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ujian_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ujian_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Nilai
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `nilai` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` INT UNSIGNED NOT NULL,
  `mapel_id` INT UNSIGNED DEFAULT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `jenis` ENUM('tugas','harian','ujian') NOT NULL DEFAULT 'harian',
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

-- -------------------------------------------------------------
-- Tabel pendukung yang direferensikan aplikasi
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengaturan` (
  `kunci` VARCHAR(50) NOT NULL,
  `nilai` TEXT,
  PRIMARY KEY (`kunci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permasalahan_siswa` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` INT UNSIGNED NOT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `guru_id` INT UNSIGNED DEFAULT NULL,
  `kategori` VARCHAR(100) DEFAULT NULL,
  `deskripsi` TEXT,
  `status` ENUM('baru','ditangani','selesai') NOT NULL DEFAULT 'baru',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ps_siswa` (`siswa_id`),
  CONSTRAINT `fk_ps_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kolom yang ditambah migrasi tapi mungkin belum ada
ALTER TABLE `soal`
  ADD COLUMN `tugas_id` INT UNSIGNED DEFAULT NULL AFTER `id`;

CREATE TABLE IF NOT EXISTS `hasil_ujian` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ujian_id` INT UNSIGNED NOT NULL,
  `siswa_id` INT UNSIGNED NOT NULL,
  `jumlah_benar` INT UNSIGNED NOT NULL DEFAULT 0,
  `jumlah_soal` INT UNSIGNED NOT NULL DEFAULT 0,
  `nilai` DECIMAL(5,2) DEFAULT NULL,
  `selesai` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_hasil_ujian` (`ujian_id`),
  KEY `fk_hasil_siswa` (`siswa_id`),
  CONSTRAINT `fk_hasil_ujian` FOREIGN KEY (`ujian_id`) REFERENCES `ujian_online` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hasil_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jawaban_siswa` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ujian_id` INT UNSIGNED DEFAULT NULL,
  `tugas_id` INT UNSIGNED DEFAULT NULL,
  `soal_id` INT UNSIGNED NOT NULL,
  `siswa_id` INT UNSIGNED NOT NULL,
  `jawaban` ENUM('A','B','C','D') DEFAULT NULL,
  `benar` TINYINT(1) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_jawaban` (`soal_id`, `siswa_id`),
  KEY `fk_jawaban_ujian` (`ujian_id`),
  KEY `fk_jawaban_tugas` (`tugas_id`),
  KEY `fk_jawaban_soal` (`soal_id`),
  KEY `fk_jawaban_siswa` (`siswa_id`),
  CONSTRAINT `fk_jawaban_ujian` FOREIGN KEY (`ujian_id`) REFERENCES `ujian_online` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jawaban_tugas` FOREIGN KEY (`tugas_id`) REFERENCES `tugas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jawaban_soal` FOREIGN KEY (`soal_id`) REFERENCES `soal` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jawaban_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pengumpulan_tugas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tugas_id` INT UNSIGNED NOT NULL,
  `siswa_id` INT UNSIGNED NOT NULL,
  `jawaban_teks` TEXT DEFAULT NULL,
  `file_url` VARCHAR(255) DEFAULT NULL,
  `tipe_pengumpulan` ENUM('link','file') NOT NULL DEFAULT 'link',
  `nilai` DECIMAL(5,2) DEFAULT NULL,
  `catatan_guru` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('dikumpul','dinilai') NOT NULL DEFAULT 'dikumpul',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pengumpulan` (`tugas_id`, `siswa_id`),
  KEY `fk_pt_tugas` (`tugas_id`),
  KEY `fk_pt_siswa` (`siswa_id`),
  CONSTRAINT `fk_pt_tugas` FOREIGN KEY (`tugas_id`) REFERENCES `tugas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data contoh: 1 ujian + 2 soal untuk kelas X BDR
INSERT INTO `ujian_online` (`guru_id`, `mapel_id`, `kelas_id`, `judul`, `tanggal_mulai`, `durasi_menit`, `jumlah_soal`, `status`)
SELECT 4, 1, 1, 'Ujian Harian Matematika', NOW(), 45, 2, 'terjadwal'
WHERE NOT EXISTS (SELECT 1 FROM `ujian_online`);

INSERT INTO `soal` (`ujian_id`, `pertanyaan`, `pilihan_a`, `pilihan_b`, `pilihan_c`, `pilihan_d`, `jawaban_benar`)
SELECT (SELECT id FROM `ujian_online` LIMIT 1), 'Hasil dari 2x + 3 = 11, nilai x adalah...', '4', '5', '6', '7', 'A'
WHERE (SELECT COUNT(*) FROM `soal`) = 0;

INSERT INTO `soal` (`ujian_id`, `pertanyaan`, `pilihan_a`, `pilihan_b`, `pilihan_c`, `pilihan_d`, `jawaban_benar`)
SELECT (SELECT id FROM `ujian_online` LIMIT 1), 'Bentuk sederhana dari (a+b)^2 adalah...', 'a^2+b^2', 'a^2+2ab+b^2', 'a^2-2ab+b^2', '2ab', 'B'
WHERE (SELECT COUNT(*) FROM `soal`) = 1;

UPDATE `ujian_online` SET `jumlah_soal` = (SELECT COUNT(*) FROM `soal` WHERE `ujian_id` = `ujian_online`.`id`);

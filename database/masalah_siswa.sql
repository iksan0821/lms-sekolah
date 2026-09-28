-- =============================================================
-- TABEL PERMASALAHAN SISWA
-- Dipakai role kepsek, kurikulum, dan guru untuk mencatat serta
-- menindaklanjuti masalah yang terjadi pada siswa.
-- =============================================================

USE `lms_sekolah`;

DROP TABLE IF EXISTS `permasalahan_siswa`;
CREATE TABLE `permasalahan_siswa` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` INT UNSIGNED NOT NULL,
  `kelas_id` INT UNSIGNED DEFAULT NULL,
  `jenis` ENUM('kehadiran','nilai','tugas','perilaku','kesehatan','lainnya') NOT NULL DEFAULT 'lainnya',
  `prioritas` ENUM('tinggi','sedang','rendah') NOT NULL DEFAULT 'sedang',
  `deskripsi` TEXT NOT NULL,
  `tindak_lanjut` TEXT DEFAULT NULL,
  `status` ENUM('baru','diproses','selesai') NOT NULL DEFAULT 'baru',
  `dit_assign_ke` INT UNSIGNED DEFAULT NULL,
  `tanggal` DATE NOT NULL,
  `created_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_masalah_siswa` (`siswa_id`),
  KEY `fk_masalah_kelas` (`kelas_id`),
  KEY `fk_masalah_assignee` (`dit_assign_ke`),
  KEY `fk_masalah_creator` (`created_by`),
  KEY `idx_masalah_status` (`status`),
  CONSTRAINT `fk_masalah_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_masalah_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_masalah_assignee` FOREIGN KEY (`dit_assign_ke`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_masalah_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- CONTOH DATA PERMASALAHAN SISWA
-- Pakai subquery supaya otomatis memakai siswa & guru yang tersedia,
-- tidak bergantung pada nomor id tertentu.
-- -------------------------------------------------------------
INSERT INTO `permasalahan_siswa`
  (`siswa_id`, `kelas_id`, `jenis`, `prioritas`, `deskripsi`, `tindak_lanjut`, `status`, `dit_assign_ke`, `tanggal`, `created_by`)
SELECT s.sid, s.kls, 'kehadiran', 'tinggi',
       'Siswa sering tidak hadir tanpa keterangan, sudah 4 kali alpa bulan ini.',
       'Dihubungi wali kelas dan orang tua, dibuatkan surat pernyataan kehadiran.',
       'diproses', g.gid, CURDATE() - INTERVAL 3 DAY, ks.ksid
FROM (
  SELECT u.id AS sid, (SELECT k.id FROM kelas k ORDER BY k.id LIMIT 1) AS kls
  FROM users u JOIN roles r ON r.id = u.role_id
  WHERE r.slug = 'siswa' LIMIT 1
) s
CROSS JOIN (SELECT u.id AS gid FROM users u JOIN roles r ON r.id = u.role_id WHERE r.slug='guru' ORDER BY u.id LIMIT 1) g
CROSS JOIN (SELECT u.id AS ksid FROM users u JOIN roles r ON r.id = u.role_id WHERE r.slug='kepsek' ORDER BY u.id LIMIT 1) ks;

INSERT INTO `permasalahan_siswa`
  (`siswa_id`, `kelas_id`, `jenis`, `prioritas`, `deskripsi`, `tindak_lanjut`, `status`, `dit_assign_ke`, `tanggal`, `created_by`)
SELECT s.sid, s.kls, 'nilai', 'sedang',
       'Nilai rata-rata tugas dan ujian berada di bawah batas kelulusan.',
       'Diberi remedial dan pendampingan belajar mingguan.',
       'baru', NULL, CURDATE() - INTERVAL 1 DAY, ks.ksid
FROM (
  SELECT u.id AS sid, (SELECT k.id FROM kelas k ORDER BY k.id LIMIT 1) AS kls
  FROM users u JOIN roles r ON r.id = u.role_id
  WHERE r.slug = 'siswa' LIMIT 1
) s
CROSS JOIN (SELECT u.id AS ksid FROM users u JOIN roles r ON r.id = u.role_id WHERE r.slug='kurikulum' ORDER BY u.id LIMIT 1) ks;

INSERT INTO `permasalahan_siswa`
  (`siswa_id`, `kelas_id`, `jenis`, `prioritas`, `deskripsi`, `tindak_lanjut`, `status`, `dit_assign_ke`, `tanggal`, `created_by`)
SELECT s.sid, s.kls, 'tugas', 'rendah',
       'Tugas Bahasa Indonesia belum dikumpulkan selama dua pertemuan berturut-turut.',
       'Guru memancing siswa mengumpulkan tugas melalui pendampingan.',
       'baru', NULL, CURDATE(), g.gid
FROM (
  SELECT u.id AS sid, (SELECT k.id FROM kelas k ORDER BY k.id LIMIT 1) AS kls
  FROM users u JOIN roles r ON r.id = u.role_id
  WHERE r.slug = 'siswa' LIMIT 1
) s
CROSS JOIN (SELECT u.id AS gid FROM users u JOIN roles r ON r.id = u.role_id WHERE r.slug='guru' ORDER BY u.id LIMIT 1) g;

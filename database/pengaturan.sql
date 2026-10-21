-- Tabel pengaturan sistem (key-value)
CREATE TABLE IF NOT EXISTS `pengaturan` (
  `kunci` VARCHAR(50) NOT NULL,
  `nilai` VARCHAR(255) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`kunci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `pengaturan` (`kunci`, `nilai`) VALUES
('nama_sekolah', 'SMK Citra Negara'),
('alamat', 'Indonesia'),
('tahun_ajaran_aktif', '2024/2025'),
('semester_aktif', 'Ganjil'),
('logo', NULL);

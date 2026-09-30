-- =============================================================
-- MIGRASI: Tugas bisa punya soal pilihan ganda (lebih dari 1 soal)
--
-- 1. Tabel `soal` dipakai ulang untuk tugas lewat kolom `tugas_id`.
--    `ujian_id` sudah nullable, jadi satu tabel cukup untuk dua keperluan.
-- 2. `jawaban_siswa` dilebarkan supaya bisa menjawab soal milik tugas
--    (`ujian_id` jadi nullable) dan uniqueness digeser ke per-soal.
-- 3. `tugas` dapat kolom jumlah_soal supaya guru melihat rekapnya.
-- =============================================================

USE `lms_sekolah`;

-- -------------------------------------------------------------
-- 1. Soal untuk tugas
-- -------------------------------------------------------------
ALTER TABLE `soal`
  ADD COLUMN `tugas_id` INT UNSIGNED DEFAULT NULL AFTER `id`;

ALTER TABLE `soal`
  ADD KEY `fk_soal_tugas` (`tugas_id`);

ALTER TABLE `soal`
  ADD CONSTRAINT `fk_soal_tugas` FOREIGN KEY (`tugas_id`)
    REFERENCES `tugas` (`id`) ON DELETE CASCADE;

-- Backfill: sinkronkan jumlah soal untuk tugas yang sudah punya soal.
UPDATE `tugas` t
SET t.jumlah_soal = (
  SELECT COUNT(*) FROM soal s WHERE s.tugas_id = t.id
);

-- -------------------------------------------------------------
-- 2. Jawaban siswa untuk soal milik tugas
-- -------------------------------------------------------------
-- `ujian_id` dibuat nullable agar baris yang sama bisa menunjuk
-- soal ujian maupun soal tugas.
ALTER TABLE `jawaban_siswa`
  MODIFY COLUMN `ujian_id` INT UNSIGNED DEFAULT NULL;

ALTER TABLE `jawaban_siswa`
  ADD COLUMN `tugas_id` INT UNSIGNED DEFAULT NULL AFTER `ujian_id`;

-- Uniqueness lama (ujian_id, soal_id, siswa_id) tidak bisa dipakai lagi
-- karena NULL tidak dianggap duplikat oleh MySQL. Kunci digeser ke
-- (soal_id, siswa_id): satu soal hanya boleh dijawab satu siswa sekali,
-- dan otomatis berlaku untuk ujian maupun tugas.
ALTER TABLE `jawaban_siswa`
  DROP INDEX `uq_jawaban`;

ALTER TABLE `jawaban_siswa`
  ADD UNIQUE KEY `uq_jawaban` (`soal_id`, `siswa_id`);

ALTER TABLE `jawaban_siswa`
  ADD KEY `fk_jawaban_tugas` (`tugas_id`);

ALTER TABLE `jawaban_siswa`
  ADD CONSTRAINT `fk_jawaban_tugas` FOREIGN KEY (`tugas_id`)
    REFERENCES `tugas` (`id`) ON DELETE CASCADE;

-- Backfill:isi tugas_id untuk jawaban yang berasal dari soal tugas.
UPDATE jawaban_siswa js
JOIN soal s ON s.id = js.soal_id
SET js.tugas_id = s.tugas_id
WHERE s.tugas_id IS NOT NULL;

-- -------------------------------------------------------------
-- 3. Rekap jumlah soal per tugas
-- -------------------------------------------------------------
ALTER TABLE `tugas`
  ADD COLUMN `jumlah_soal` INT UNSIGNED NOT NULL DEFAULT 0
    AFTER `jumlah_terkumpul`;

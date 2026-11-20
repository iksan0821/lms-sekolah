
import mysql from "mysql2/promise";
const c = await mysql.createConnection({ host: "127.0.0.1", user: "root", password: "", database: "lms_sekolah" });

// pengumpulan_tugas
await c.query(`CREATE TABLE IF NOT EXISTS pengumpulan_tugas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tugas_id INT UNSIGNED NOT NULL,
  siswa_id INT UNSIGNED NOT NULL,
  tipe_pengumpulan ENUM('teks','file','link') NOT NULL DEFAULT 'teks',
  jawaban_teks TEXT,
  file_url VARCHAR(255) DEFAULT NULL,
  status ENUM('dikumpulkan','dinilai') NOT NULL DEFAULT 'dikumpulkan',
  nilai DECIMAL(5,2) DEFAULT NULL,
  catatan_guru TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_tugas_siswa (tugas_id, siswa_id),
  KEY fk_pt_siswa (siswa_id),
  CONSTRAINT fk_pt_tugas FOREIGN KEY (tugas_id) REFERENCES tugas (id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_siswa FOREIGN KEY (siswa_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

// jawaban_siswa
await c.query(`CREATE TABLE IF NOT EXISTS jawaban_siswa (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ujian_id INT UNSIGNED DEFAULT NULL,
  tugas_id INT UNSIGNED DEFAULT NULL,
  soal_id INT UNSIGNED NOT NULL,
  siswa_id INT UNSIGNED NOT NULL,
  jawaban VARCHAR(1) DEFAULT NULL,
  benar TINYINT(1) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_soal_siswa (soal_id, siswa_id, tugas_id, ujian_id),
  KEY fk_js_siswa (siswa_id),
  KEY fk_js_soal (soal_id),
  CONSTRAINT fk_js_ujian FOREIGN KEY (ujian_id) REFERENCES ujian_online (id) ON DELETE CASCADE,
  CONSTRAINT fk_js_soal FOREIGN KEY (soal_id) REFERENCES soal (id) ON DELETE CASCADE,
  CONSTRAINT fk_js_siswa FOREIGN KEY (siswa_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

// hasil_ujian
await c.query(`CREATE TABLE IF NOT EXISTS hasil_ujian (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ujian_id INT UNSIGNED NOT NULL,
  siswa_id INT UNSIGNED NOT NULL,
  jumlah_benar INT UNSIGNED NOT NULL DEFAULT 0,
  jumlah_soal INT UNSIGNED NOT NULL DEFAULT 0,
  nilai DECIMAL(5,2) NOT NULL DEFAULT 0,
  selesai TINYINT(1) NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_ujian_siswa (ujian_id, siswa_id),
  KEY fk_hu_siswa (siswa_id),
  CONSTRAINT fk_hu_ujian FOREIGN KEY (ujian_id) REFERENCES ujian_online (id) ON DELETE CASCADE,
  CONSTRAINT fk_hu_siswa FOREIGN KEY (siswa_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

const [t] = await c.query("SHOW TABLES");
console.log("OK. Tabel sekarang:", t.map((r) => Object.values(r)[0]).join(", "));
await c.end();

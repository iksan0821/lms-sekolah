import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// API GURU - semua endpoint read (GET) mengembalikan data untuk guru yang login.
// Operasi tulis (POST/PUT/DELETE) ada di file terpisah per resource.
async function requireGuru() {
  const session = await getSession();
  if (!session || session.role !== "guru") return null;
  return session;
}

export async function GET(request) {
  const session = await requireGuru();
  if (!session) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const bagian = searchParams.get("bagian") || "dashboard";
  const guruId = session.id;

  // --- DASHBOARD ---
  if (bagian === "dashboard") {
    const jumlahKelas = await query(
      "SELECT COUNT(DISTINCT kelas_id) AS n FROM guru_mapel WHERE guru_id = ?",
      [guruId]
    );
    const jumlahMateri = await query("SELECT COUNT(*) AS n FROM materi WHERE guru_id = ?", [guruId]);
    const jumlahTugas = await query("SELECT COUNT(*) AS n FROM tugas WHERE guru_id = ?", [guruId]);
    const jumlahUjian = await query("SELECT COUNT(*) AS n FROM ujian_online WHERE guru_id = ?", [guruId]);
    const jumlahSiswa = await query(
      `SELECT COUNT(*) AS n FROM siswa s
       JOIN guru_mapel gm ON gm.kelas_id = s.kelas_id
       WHERE gm.guru_id = ?`,
      [guruId]
    );
    const absensiHariIni = await query(
      `SELECT status, COUNT(*) AS n FROM absensi
       WHERE guru_id = ? GROUP BY status`,
      [guruId]
    );
    return NextResponse.json({
      success: true,
      data: {
        jumlahKelas: jumlahKelas[0].n,
        jumlahMateri: jumlahMateri[0].n,
        jumlahTugas: jumlahTugas[0].n,
        jumlahUjian: jumlahUjian[0].n,
        jumlahSiswa: jumlahSiswa[0].n,
        absensi: absensiHariIni,
      },
    });
  }

  // --- SISWA DI KELAS SAYA + absensi ---
  if (bagian === "siswa") {
    const kelasId = searchParams.get("kelas_id");
    // Daftar kelas yang diajar guru
    const kelas = await query(
      `SELECT DISTINCT k.id, k.nama, k.tingkat
       FROM guru_mapel gm JOIN kelas k ON k.id = gm.kelas_id
       WHERE gm.guru_id = ? ORDER BY k.nama`,
      [guruId]
    );
    // Mapel yang diajar guru
    const mapel = await query(
      `SELECT DISTINCT mp.id, mp.nama
       FROM guru_mapel gm JOIN mata_pelajaran mp ON mp.id = gm.mapel_id
       WHERE gm.guru_id = ? ORDER BY mp.nama`,
      [guruId]
    );
    // Siswa pada kelas terpilih
    let siswa = [];
    if (kelasId) {
      siswa = await query(
        `SELECT u.id, u.nama, u.nis, u.jenis_kelamin, s.nama_wali
         FROM siswa s JOIN users u ON u.id = s.user_id
         WHERE s.kelas_id = ? ORDER BY u.nama`,
        [kelasId]
      );
    }
    return NextResponse.json({ success: true, data: { kelas, mapel, siswa } });
  }

  // --- ABSENSI (riwayat) ---
  if (bagian === "absensi") {
    const kelasId = searchParams.get("kelas_id");
    const tanggal = searchParams.get("tanggal");
    let sql = `SELECT a.id, a.tanggal, a.status, a.keterangan,
                      u.nama AS siswa, u.nis, k.nama AS kelas, mp.nama AS mapel
               FROM absensi a
               LEFT JOIN users u ON u.id = a.siswa_id
               LEFT JOIN kelas k ON k.id = a.kelas_id
               LEFT JOIN mata_pelajaran mp ON mp.id = a.mapel_id
               WHERE a.guru_id = ?`;
    const params = [guruId];
    if (kelasId) { sql += " AND a.kelas_id = ?"; params.push(kelasId); }
    if (tanggal) { sql += " AND a.tanggal = ?"; params.push(tanggal); }
    sql += " ORDER BY a.tanggal DESC, u.nama";
    const rows = await query(sql, params);
    // Rekap per status
    const rekap = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    rows.forEach((r) => { rekap[r.status] = (rekap[r.status] || 0) + 1; });
    return NextResponse.json({ success: true, data: rows, rekap });
  }

  // --- BAHAN ASESMEN (tugas + ujian digabung) ---
  if (bagian === "asesmen") {
    const tugas = await query(
      `SELECT t.id, t.judul, t.tipe, t.deadline, t.jumlah_terkumpul, t.jumlah_siswa,
              mp.nama AS mapel, k.nama AS kelas
       FROM tugas t
       LEFT JOIN mata_pelajaran mp ON mp.id = t.mapel_id
       LEFT JOIN kelas k ON k.id = t.kelas_id
       WHERE t.guru_id = ? ORDER BY t.deadline DESC`,
      [guruId]
    );
    const ujian = await query(
      `SELECT o.id, o.judul, o.tanggal_mulai AS deadline, o.jumlah_soal, o.jumlah_peserta,
              o.status, mp.nama AS mapel, k.nama AS kelas, 'ujian' AS tipe
       FROM ujian_online o
       LEFT JOIN mata_pelajaran mp ON mp.id = o.mapel_id
       LEFT JOIN kelas k ON k.id = o.kelas_id
       WHERE o.guru_id = ? ORDER BY o.tanggal_mulai DESC`,
      [guruId]
    );
    return NextResponse.json({ success: true, data: { tugas, ujian } });
  }

  // --- MATERI ---
  if (bagian === "materi") {
    const rows = await query(
      `SELECT m.id, m.judul, m.deskripsi, m.tipe, m.file_url, m.created_at,
              mp.nama AS mapel, k.nama AS kelas
       FROM materi m
       LEFT JOIN mata_pelajaran mp ON mp.id = m.mapel_id
       LEFT JOIN kelas k ON k.id = m.kelas_id
       WHERE m.guru_id = ? ORDER BY m.created_at DESC`,
      [guruId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  // --- TUGAS (milik guru) ---
  if (bagian === "tugas") {
    const rows = await query(
      `SELECT t.id, t.judul, t.deskripsi, t.tipe, t.deadline, t.jumlah_terkumpul, t.jumlah_siswa,
              t.mapel_id, t.kelas_id, mp.nama AS mapel, k.nama AS kelas
       FROM tugas t
       LEFT JOIN mata_pelajaran mp ON mp.id = t.mapel_id
       LEFT JOIN kelas k ON k.id = t.kelas_id
       WHERE t.guru_id = ? ORDER BY t.created_at DESC`,
      [guruId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  // --- UJIAN / LATIHAN SOAL (milik guru) ---
  if (bagian === "ujian") {
    const rows = await query(
      `SELECT o.id, o.judul, o.tanggal_mulai, o.durasi_menit, o.jumlah_soal,
              o.jumlah_peserta, o.status, o.mapel_id, o.kelas_id,
              mp.nama AS mapel, k.nama AS kelas
       FROM ujian_online o
       LEFT JOIN mata_pelajaran mp ON mp.id = o.mapel_id
       LEFT JOIN kelas k ON k.id = o.kelas_id
       WHERE o.guru_id = ? ORDER BY o.created_at DESC`,
      [guruId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  // --- SOAL milik satu ujian ---
  if (bagian === "soal") {
    const ujianId = searchParams.get("ujian_id");
    if (!ujianId) return NextResponse.json({ success: true, data: [] });
    const rows = await query(
      `SELECT s.* FROM soal s JOIN ujian_online o ON o.id = s.ujian_id
       WHERE s.ujian_id = ? AND o.guru_id = ? ORDER BY s.id`,
      [ujianId, guruId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  // --- OPSI (kelas & mapel untuk form) ---
  if (bagian === "opsi") {
    const kelas = await query(
      `SELECT DISTINCT k.id, k.nama FROM guru_mapel gm
       JOIN kelas k ON k.id = gm.kelas_id WHERE gm.guru_id = ? ORDER BY k.nama`,
      [guruId]
    );
    const mapel = await query(
      `SELECT DISTINCT mp.id, mp.nama FROM guru_mapel gm
       JOIN mata_pelajaran mp ON mp.id = gm.mapel_id WHERE gm.guru_id = ? ORDER BY mp.nama`,
      [guruId]
    );
    return NextResponse.json({ success: true, data: { kelas, mapel } });
  }

  // --- DOWNLOAD NILAI (sama seperti kurikulum) ---
  if (bagian === "nilai") {
    const kelas = await query("SELECT id, nama FROM kelas ORDER BY nama");
    const mapel = await query("SELECT id, nama FROM mata_pelajaran ORDER BY nama");
    return NextResponse.json({ success: true, data: { kelas, mapel } });
  }

  if (bagian === "nilai-detail") {
    const mapelId = searchParams.get("mapel_id");
    const kelasId = searchParams.get("kelas_id");
    if (!mapelId) {
      return NextResponse.json({ success: false, message: "Pilih mapel." }, { status: 400 });
    }
    let sql = `SELECT u.nama AS siswa, u.nis, k.nama AS kelas,
                      MAX(CASE WHEN nv.jenis='tugas' THEN nv.nilai END) AS tugas,
                      MAX(CASE WHEN nv.jenis='harian' THEN nv.nilai END) AS harian,
                      MAX(CASE WHEN nv.jenis='ujian' THEN nv.nilai END) AS ujian,
                      ROUND(AVG(nv.nilai),1) AS rata
               FROM nilai nv
               JOIN users u ON u.id = nv.siswa_id
               LEFT JOIN kelas k ON k.id = nv.kelas_id
               WHERE nv.mapel_id = ?`;
    const params = [mapelId];
    if (kelasId) { sql += " AND nv.kelas_id = ?"; params.push(kelasId); }
    sql += " GROUP BY nv.siswa_id, u.nama, u.nis, k.nama ORDER BY k.nama, u.nama";
    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  }

  return NextResponse.json({ success: false, message: "Bagian tidak dikenal." }, { status: 400 });
}

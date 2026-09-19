import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// API PANTAU (READ-ONLY) untuk role kepsek & kurikulum.
// Hanya menyediakan GET - tidak ada POST/PUT/DELETE.
const ALLOWED = ["kepsek", "kurikulum"];

async function requireMonitor() {
  const session = await getSession();
  if (!session || !ALLOWED.includes(session.role)) return null;
  return session;
}

export async function GET(request) {
  const session = await requireMonitor();
  if (!session) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const bagian = searchParams.get("bagian") || "ringkasan";

  if (bagian === "kinerja-guru") {
    // Kinerja guru: jumlah materi, tugas, ujian, dan jadwal mengajar
    const data = await query(
      `SELECT u.id, u.nama, u.nip,
              (SELECT COUNT(*) FROM materi m WHERE m.guru_id = u.id) AS jumlah_materi,
              (SELECT COUNT(*) FROM tugas t WHERE t.guru_id = u.id) AS jumlah_tugas,
              (SELECT COUNT(*) FROM ujian_online o WHERE o.guru_id = u.id) AS jumlah_ujian,
              (SELECT COUNT(*) FROM jadwal_pelajaran j WHERE j.guru_id = u.id) AS jumlah_jadwal,
              (SELECT ROUND(AVG(n.nilai),1) FROM nilai n
                 JOIN tugas t2 ON t2.mapel_id = n.mapel_id
                 WHERE t2.guru_id = u.id) AS rata_nilai
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE r.slug = 'guru'
       ORDER BY u.nama`
    );
    return NextResponse.json({ success: true, data });
  }

  if (bagian === "tugas-materi") {
    const materi = await query(
      `SELECT m.id, m.judul, m.deskripsi, m.created_at,
              mp.nama AS mapel, k.nama AS kelas, u.nama AS guru
       FROM materi m
       LEFT JOIN mata_pelajaran mp ON mp.id = m.mapel_id
       LEFT JOIN kelas k ON k.id = m.kelas_id
       LEFT JOIN users u ON u.id = m.guru_id
       ORDER BY m.created_at DESC`
    );
    const tugas = await query(
      `SELECT t.id, t.judul, t.deskripsi, t.deadline, t.jumlah_terkumpul, t.jumlah_siswa,
              mp.nama AS mapel, k.nama AS kelas, u.nama AS guru
       FROM tugas t
       LEFT JOIN mata_pelajaran mp ON mp.id = t.mapel_id
       LEFT JOIN kelas k ON k.id = t.kelas_id
       LEFT JOIN users u ON u.id = t.guru_id
       ORDER BY t.deadline DESC`
    );
    return NextResponse.json({ success: true, data: { materi, tugas } });
  }

  if (bagian === "ujian") {
    const data = await query(
      `SELECT o.id, o.judul, o.tanggal_mulai, o.durasi_menit, o.jumlah_soal,
              o.jumlah_peserta, o.status,
              mp.nama AS mapel, k.nama AS kelas, u.nama AS guru
       FROM ujian_online o
       LEFT JOIN mata_pelajaran mp ON mp.id = o.mapel_id
       LEFT JOIN kelas k ON k.id = o.kelas_id
       LEFT JOIN users u ON u.id = o.guru_id
       ORDER BY o.tanggal_mulai DESC`
    );
    return NextResponse.json({ success: true, data });
  }

  if (bagian === "jadwal") {
    const data = await query(
      `SELECT j.id, j.hari, j.jam_mulai, j.jam_selesai, j.ruang,
              mp.nama AS mapel, k.nama AS kelas, u.nama AS guru
       FROM jadwal_pelajaran j
       LEFT JOIN mata_pelajaran mp ON mp.id = j.mapel_id
       LEFT JOIN kelas k ON k.id = j.kelas_id
       LEFT JOIN users u ON u.id = j.guru_id
       ORDER BY FIELD(j.hari,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), j.jam_mulai`
    );
    return NextResponse.json({ success: true, data });
  }

  if (bagian === "nilai") {
    // Daftar mapel untuk filter download (khusus kurikulum)
    const kelas = await query("SELECT id, nama FROM kelas ORDER BY nama");
    const mapel = await query("SELECT id, nama FROM mata_pelajaran ORDER BY nama");
    return NextResponse.json({ success: true, data: { kelas, mapel } });
  }

  if (bagian === "nilai-detail") {
    // Khusus kurikulum: rincian nilai per mapel
    if (session.role !== "kurikulum") {
      return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
    }
    const mapelId = searchParams.get("mapel_id");
    if (!mapelId) {
      return NextResponse.json({ success: false, message: "Pilih mapel." }, { status: 400 });
    }
    const rows = await query(
      `SELECT u.nama AS siswa, u.nis,
              k.nama AS kelas,
              MAX(CASE WHEN nv.jenis='tugas' THEN nv.nilai END) AS tugas,
              MAX(CASE WHEN nv.jenis='harian' THEN nv.nilai END) AS harian,
              MAX(CASE WHEN nv.jenis='ujian' THEN nv.nilai END) AS ujian,
              ROUND(AVG(nv.nilai),1) AS rata
       FROM nilai nv
       JOIN users u ON u.id = nv.siswa_id
       LEFT JOIN kelas k ON k.id = nv.kelas_id
       JOIN mata_pelajaran mp ON mp.id = nv.mapel_id
       WHERE nv.mapel_id = ?
       GROUP BY nv.siswa_id
       ORDER BY u.nama`,
      [mapelId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  // Ringkasan dashboard
  const totalGuru = await query(
    "SELECT COUNT(*) AS n FROM users u JOIN roles r ON r.id=u.role_id WHERE r.slug='guru'"
  );
  const totalSiswa = await query(
    "SELECT COUNT(*) AS n FROM users u JOIN roles r ON r.id=u.role_id WHERE r.slug='siswa'"
  );
  const totalKelas = await query("SELECT COUNT(*) AS n FROM kelas");
  const totalTugas = await query("SELECT COUNT(*) AS n FROM tugas");
  const totalMateri = await query("SELECT COUNT(*) AS n FROM materi");
  const totalUjian = await query("SELECT COUNT(*) AS n FROM ujian_online");
  const ujianAktif = await query("SELECT COUNT(*) AS n FROM ujian_online WHERE status='berlangsung'");
  const rataNilai = await query("SELECT ROUND(AVG(nilai),1) AS n FROM nilai");
  const aktivitas = await query(
    `SELECT l.aktivitas, l.created_at
     FROM log_aktivitas l ORDER BY l.created_at DESC LIMIT 6`
  );

  return NextResponse.json({
    success: true,
    data: {
      totalGuru: totalGuru[0].n,
      totalSiswa: totalSiswa[0].n,
      totalKelas: totalKelas[0].n,
      totalTugas: totalTugas[0].n,
      totalMateri: totalMateri[0].n,
      totalUjian: totalUjian[0].n,
      ujianAktif: ujianAktif[0].n,
      rataNilai: rataNilai[0].n,
      aktivitas,
    },
  });
}

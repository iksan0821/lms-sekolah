import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireSiswa() {
  const session = await getSession();
  if (!session || session.role !== "siswa") return null;
  return session;
}

async function kelasSiswa(siswaId) {
  const r = await query("SELECT kelas_id, nis, nama_wali FROM siswa WHERE user_id=?", [siswaId]);
  return r.length ? r[0] : null;
}

export async function GET(request) {
  const session = await requireSiswa();
  if (!session) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const bagian = searchParams.get("bagian") || "dashboard";
  const siswaId = session.id;
  const info = await kelasSiswa(siswaId);
  const kelasId = info?.kelas_id || null;

  if (bagian === "dashboard") {
    const kelas = kelasId ? await query("SELECT k.nama, k.tingkat FROM kelas k WHERE k.id=?", [kelasId]) : [];
    const jumlahTugas = kelasId ? await query("SELECT COUNT(*) AS n FROM tugas WHERE kelas_id=?", [kelasId]) : [{ n: 0 }];
    const jumlahUjian = kelasId ? await query("SELECT COUNT(*) AS n FROM ujian_online WHERE kelas_id=? AND status<>'draft'", [kelasId]) : [{ n: 0 }];
    const tugasDikumpul = await query("SELECT COUNT(*) AS n FROM pengumpulan_tugas WHERE siswa_id=?", [siswaId]);
    const rataNilai = await query("SELECT ROUND(AVG(nilai),1) AS n FROM nilai WHERE siswa_id=?", [siswaId]);
    const absensi = await query("SELECT status, COUNT(*) AS n FROM absensi WHERE siswa_id=? GROUP BY status", [siswaId]);
    return NextResponse.json({
      success: true,
      data: {
        kelas: kelas.length ? kelas[0].nama : "-",
        tingkat: kelas.length ? kelas[0].tingkat : "-",
        jumlahTugas: jumlahTugas[0].n,
        jumlahUjian: jumlahUjian[0].n,
        tugasDikumpul: tugasDikumpul[0].n,
        rataNilai: rataNilai[0].n,
        absensi,
      },
    });
  }

  if (bagian === "mapel") {
    if (!kelasId) return NextResponse.json({ success: true, data: { mapel: [], materi: [] } });
    const mapel = await query(
      "SELECT DISTINCT mp.id, mp.nama, mp.kode, u.nama AS guru FROM guru_mapel gm JOIN mata_pelajaran mp ON mp.id = gm.mapel_id LEFT JOIN users u ON u.id = gm.guru_id WHERE gm.kelas_id = ? ORDER BY mp.nama",
      [kelasId]
    );
    const materi = await query(
      "SELECT m.id, m.judul, m.deskripsi, m.tipe, m.file_url, m.created_at, mp.nama AS mapel, u.nama AS guru FROM materi m LEFT JOIN mata_pelajaran mp ON mp.id = m.mapel_id LEFT JOIN users u ON u.id = m.guru_id WHERE m.kelas_id = ? ORDER BY m.created_at DESC",
      [kelasId]
    );
    return NextResponse.json({ success: true, data: { mapel, materi } });
  }

  if (bagian === "asesmen") {
    if (!kelasId) return NextResponse.json({ success: true, data: [] });
    const rows = await query(
      "SELECT o.id, o.judul, o.tanggal_mulai, o.durasi_menit, o.jumlah_soal, o.status, mp.nama AS mapel, u.nama AS guru, h.nilai, h.selesai FROM ujian_online o LEFT JOIN mata_pelajaran mp ON mp.id = o.mapel_id LEFT JOIN users u ON u.id = o.guru_id LEFT JOIN hasil_ujian h ON h.ujian_id = o.id AND h.siswa_id = ? WHERE o.kelas_id = ? AND o.status <> 'draft' ORDER BY o.tanggal_mulai DESC",
      [siswaId, kelasId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  if (bagian === "ujian-detail") {
    const ujianId = searchParams.get("ujian_id");
    if (!ujianId) return NextResponse.json({ success: false, message: "Ujian tidak ada." }, { status: 400 });
    const cek = await query("SELECT id, judul, durasi_menit, status FROM ujian_online WHERE id=? AND kelas_id=? AND status<>'draft'", [ujianId, kelasId]);
    if (!cek.length) return NextResponse.json({ success: false, message: "Ujian tidak tersedia." }, { status: 404 });
    const soal = await query("SELECT id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d FROM soal WHERE ujian_id=? ORDER BY id", [ujianId]);
    const jawaban = await query("SELECT soal_id, jawaban FROM jawaban_siswa WHERE ujian_id=? AND siswa_id=?", [ujianId, siswaId]);
    const hasil = await query("SELECT jumlah_benar, jumlah_soal, nilai, selesai FROM hasil_ujian WHERE ujian_id=? AND siswa_id=?", [ujianId, siswaId]);
    return NextResponse.json({ success: true, data: { ujian: cek[0], soal, jawaban, hasil: hasil.length ? hasil[0] : null } });
  }

  if (bagian === "tugas") {
    if (!kelasId) return NextResponse.json({ success: true, data: [] });
    const rows = await query(
      "SELECT t.id, t.judul, t.deskripsi, t.tipe, t.deadline, mp.nama AS mapel, u.nama AS guru, pt.id AS pengumpulan_id, pt.status AS status_kumpul, pt.nilai, pt.tipe_pengumpulan, pt.file_url, pt.jawaban_teks, pt.catatan_guru FROM tugas t LEFT JOIN mata_pelajaran mp ON mp.id = t.mapel_id LEFT JOIN users u ON u.id = t.guru_id LEFT JOIN pengumpulan_tugas pt ON pt.tugas_id = t.id AND pt.siswa_id = ? WHERE t.kelas_id = ? ORDER BY t.deadline DESC",
      [siswaId, kelasId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  if (bagian === "nilai") {
    const rows = await query(
      "SELECT mp.nama AS mapel, MAX(CASE WHEN nv.jenis='tugas' THEN nv.nilai END) AS tugas, MAX(CASE WHEN nv.jenis='harian' THEN nv.nilai END) AS harian, MAX(CASE WHEN nv.jenis='ujian' THEN nv.nilai END) AS ujian, ROUND(AVG(nv.nilai),1) AS rata FROM nilai nv LEFT JOIN mata_pelajaran mp ON mp.id = nv.mapel_id WHERE nv.siswa_id = ? GROUP BY nv.mapel_id, mp.nama ORDER BY mp.nama",
      [siswaId]
    );
    return NextResponse.json({ success: true, data: rows });
  }

  return NextResponse.json({ success: false, message: "Bagian tidak dikenal." }, { status: 400 });
}

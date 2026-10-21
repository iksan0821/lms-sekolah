import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return null;
  return session;
}

// GET: detail pembelajaran satu kelas (materi, tugas, ujian, nilai terakhir)
export async function GET(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;

    const materi = await query(
      `SELECT m.id, m.judul, m.tipe, mp.nama AS mapel, u.nama AS guru, m.created_at
       FROM materi m
       LEFT JOIN mata_pelajaran mp ON mp.id = m.mapel_id
       LEFT JOIN users u ON u.id = m.guru_id
       WHERE m.kelas_id = ? ORDER BY m.created_at DESC LIMIT 50`,
      [id]
    );
    const tugas = await query(
      `SELECT t.id, t.judul, t.tipe, t.deadline, t.jumlah_terkumpul, t.jumlah_siswa,
              mp.nama AS mapel, u.nama AS guru
       FROM tugas t
       LEFT JOIN mata_pelajaran mp ON mp.id = t.mapel_id
       LEFT JOIN users u ON u.id = t.guru_id
       WHERE t.kelas_id = ? ORDER BY t.created_at DESC LIMIT 50`,
      [id]
    );
    const ujian = await query(
      `SELECT uo.id, uo.judul, uo.tanggal_mulai, uo.durasi_menit, uo.jumlah_soal,
              uo.jumlah_peserta, uo.status, mp.nama AS mapel, u.nama AS guru
       FROM ujian_online uo
       LEFT JOIN mata_pelajaran mp ON mp.id = uo.mapel_id
       LEFT JOIN users u ON u.id = uo.guru_id
       WHERE uo.kelas_id = ? ORDER BY uo.created_at DESC LIMIT 50`,
      [id]
    );
    const nilai = await query(
      `SELECT n.id, us.nama AS siswa, mp.nama AS mapel, n.jenis, n.nilai, n.created_at
       FROM nilai n
       LEFT JOIN users us ON us.id = n.siswa_id
       LEFT JOIN mata_pelajaran mp ON mp.id = n.mapel_id
       WHERE n.kelas_id = ? ORDER BY n.created_at DESC LIMIT 100`,
      [id]
    );

    return NextResponse.json({ success: true, data: { materi, tugas, ujian, nilai } });
  } catch (err) {
    console.error("Monitor detail error:", err);
    return NextResponse.json({ success: false, message: "Gagal memuat detail." }, { status: 500 });
  }
}

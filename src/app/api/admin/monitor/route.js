import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return null;
  return session;
}

// GET: ringkasan pembelajaran per kelas (materi, tugas, ujian, nilai)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const kelas = await query(
      `SELECT k.id, k.nama, k.tingkat, j.nama AS jurusan,
              (SELECT COUNT(*) FROM materi m WHERE m.kelas_id = k.id) AS jumlah_materi,
              (SELECT COUNT(*) FROM tugas t WHERE t.kelas_id = k.id) AS jumlah_tugas,
              (SELECT COUNT(*) FROM ujian_online u WHERE u.kelas_id = k.id) AS jumlah_ujian,
              (SELECT COUNT(*) FROM nilai n WHERE n.kelas_id = k.id) AS jumlah_nilai,
              (SELECT ROUND(AVG(n.nilai), 1) FROM nilai n WHERE n.kelas_id = k.id) AS rata_nilai
       FROM kelas k
       LEFT JOIN jurusan j ON j.id = k.jurusan_id
       ORDER BY k.tingkat, k.nama`
    );
    return NextResponse.json({ success: true, data: kelas });
  } catch (err) {
    console.error("Monitor pembelajaran error:", err);
    return NextResponse.json({ success: false, message: "Gagal memuat data." }, { status: 500 });
  }
}

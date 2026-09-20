import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireGuru() {
  const session = await getSession();
  if (!session || session.role !== "guru") return null;
  return session;
}

// Catat / ubah absensi satu siswa.
// Upsert berdasarkan (siswa_id, kelas_id, mapel_id, tanggal).
export async function POST(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });

  try {
    const body = await request.json();
    const { siswa_id, kelas_id, mapel_id, tanggal, status, keterangan } = body;

    if (!siswa_id || !tanggal || !status) {
      return NextResponse.json({ success: false, message: "Siswa, tanggal, dan status wajib diisi." }, { status: 400 });
    }

    const ada = await query(
      "SELECT id FROM absensi WHERE siswa_id=? AND tanggal=? AND guru_id=? LIMIT 1",
      [siswa_id, tanggal, session.id]
    );

    if (ada.length) {
      await query(
        "UPDATE absensi SET status=?, keterangan=?, kelas_id=?, mapel_id=? WHERE id=?",
        [status, keterangan || null, kelas_id || null, mapel_id || null, ada[0].id]
      );
      return NextResponse.json({ success: true, message: "Absensi diperbarui." });
    }

    await query(
      "INSERT INTO absensi (siswa_id, kelas_id, mapel_id, guru_id, tanggal, status, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [siswa_id, kelas_id || null, mapel_id || null, session.id, tanggal, status, keterangan || null]
    );
    return NextResponse.json({ success: true, message: "Absensi dicatat." });
  } catch (err) {
    console.error("Absensi error:", err);
    return NextResponse.json({ success: false, message: "Gagal menyimpan absensi." }, { status: 500 });
  }
}

// Hapus satu catatan absensi
export async function DELETE(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID tidak ada." }, { status: 400 });
    await query("DELETE FROM absensi WHERE id=? AND guru_id=?", [id, session.id]);
    return NextResponse.json({ success: true, message: "Absensi dihapus." });
  } catch (err) {
    console.error("Delete absensi error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus." }, { status: 500 });
  }
}

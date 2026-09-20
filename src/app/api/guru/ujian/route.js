import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireGuru() {
  const session = await getSession();
  if (!session || session.role !== "guru") return null;
  return session;
}

// CREATE ujian / latihan soal
export async function POST(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    if (!b.judul || !b.judul.trim()) return NextResponse.json({ success: false, message: "Judul ujian wajib diisi." }, { status: 400 });
    if (!b.kelas_id) return NextResponse.json({ success: false, message: "Pilih kelas tujuan." }, { status: 400 });

    let jumlahSiswa = 0;
    const s = await query("SELECT COUNT(*) AS n FROM siswa WHERE kelas_id=?", [b.kelas_id]);
    jumlahSiswa = s[0].n;

    const r = await query(
      "INSERT INTO ujian_online (judul, mapel_id, kelas_id, guru_id, tanggal_mulai, durasi_menit, jumlah_soal, jumlah_peserta, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [b.judul, b.mapel_id || null, b.kelas_id, session.id, b.tanggal_mulai || null,
       b.durasi_menit || null, 0, jumlahSiswa, b.status || "draft"]
    );
    return NextResponse.json({ success: true, message: "Ujian dibuat. Silakan tambahkan soal.", id: r.insertId });
  } catch (e) {
    console.error("Create ujian error:", e);
    return NextResponse.json({ success: false, message: "Gagal membuat ujian." }, { status: 500 });
  }
}

// UPDATE ujian
export async function PUT(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    if (!b.id || !b.judul) return NextResponse.json({ success: false, message: "Data tidak lengkap." }, { status: 400 });
    await query(
      "UPDATE ujian_online SET judul=?, mapel_id=?, kelas_id=?, tanggal_mulai=?, durasi_menit=?, status=? WHERE id=? AND guru_id=?",
      [b.judul, b.mapel_id || null, b.kelas_id || null, b.tanggal_mulai || null,
       b.durasi_menit || null, b.status || "draft", b.id, session.id]
    );
    return NextResponse.json({ success: true, message: "Ujian diperbarui." });
  } catch (e) {
    console.error("Update ujian error:", e);
    return NextResponse.json({ success: false, message: "Gagal memperbarui ujian." }, { status: 500 });
  }
}

// DELETE ujian (soal ikut terhapus via ON DELETE CASCADE)
export async function DELETE(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await query("DELETE FROM ujian_online WHERE id=? AND guru_id=?", [id, session.id]);
    return NextResponse.json({ success: true, message: "Ujian dihapus." });
  } catch (e) {
    console.error("Delete ujian error:", e);
    return NextResponse.json({ success: false, message: "Gagal menghapus ujian." }, { status: 500 });
  }
}

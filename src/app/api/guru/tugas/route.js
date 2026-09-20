import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireGuru() {
  const session = await getSession();
  if (!session || session.role !== "guru") return null;
  return session;
}

// CREATE tugas / ulangan / latihan
export async function POST(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    if (!b.judul || !b.judul.trim()) return NextResponse.json({ success: false, message: "Judul wajib diisi." }, { status: 400 });
    if (!b.kelas_id) return NextResponse.json({ success: false, message: "Pilih kelas tujuan." }, { status: 400 });

    let jumlahSiswa = 0;
    const s = await query("SELECT COUNT(*) AS n FROM siswa WHERE kelas_id=?", [b.kelas_id]);
    jumlahSiswa = s[0].n;

    const r = await query(
      "INSERT INTO tugas (judul, deskripsi, tipe, mapel_id, kelas_id, guru_id, deadline, jumlah_terkumpul, jumlah_siswa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [b.judul, b.deskripsi || null, b.tipe || "tugas", b.mapel_id || null, b.kelas_id, session.id, b.deadline || null, 0, jumlahSiswa]
    );
    return NextResponse.json({ success: true, message: "Tugas dibuat. Siswa pada kelas ini akan melihatnya.", id: r.insertId });
  } catch (e) {
    console.error("Create tugas error:", e);
    return NextResponse.json({ success: false, message: "Gagal membuat tugas." }, { status: 500 });
  }
}

// UPDATE tugas
export async function PUT(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    if (!b.id || !b.judul) return NextResponse.json({ success: false, message: "Data tidak lengkap." }, { status: 400 });
    await query(
      "UPDATE tugas SET judul=?, deskripsi=?, tipe=?, mapel_id=?, kelas_id=?, deadline=? WHERE id=? AND guru_id=?",
      [b.judul, b.deskripsi || null, b.tipe || "tugas", b.mapel_id || null, b.kelas_id || null, b.deadline || null, b.id, session.id]
    );
    return NextResponse.json({ success: true, message: "Tugas diperbarui." });
  } catch (e) {
    console.error("Update tugas error:", e);
    return NextResponse.json({ success: false, message: "Gagal memperbarui tugas." }, { status: 500 });
  }
}

// DELETE tugas
export async function DELETE(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await query("DELETE FROM tugas WHERE id=? AND guru_id=?", [id, session.id]);
    return NextResponse.json({ success: true, message: "Tugas dihapus." });
  } catch (e) {
    console.error("Delete tugas error:", e);
    return NextResponse.json({ success: false, message: "Gagal menghapus tugas." }, { status: 500 });
  }
}

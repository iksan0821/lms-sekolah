import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireGuru() {
  const session = await getSession();
  if (!session || session.role !== "guru") return null;
  return session;
}

// CREATE materi
export async function POST(request) {
  const session = await requireGuru();
  try {
    const b = await request.json();
    if (!b.judul) return NextResponse.json({ success: false, message: "Judul wajib diisi." }, { status: 400 });
    const r = await query(
      "INSERT INTO materi (judul, deskripsi, tipe, mapel_id, kelas_id, guru_id, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [b.judul, b.deskripsi || null, b.tipe || "teks", b.mapel_id || null, b.kelas_id || null, session.id, b.file_url || null]
    );
    return NextResponse.json({ success: true, message: "Materi ditambahkan.", id: r.insertId });
  } catch (err) {
    console.error("Create materi error:", err);
    return NextResponse.json({ success: false, message: "Gagal menambah materi." }, { status: 500 });
  }
}

// UPDATE materi
export async function PUT(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    if (!b.id || !b.judul) return NextResponse.json({ success: false, message: "Data tidak lengkap." }, { status: 400 });
    await query(
      "UPDATE materi SET judul=?, deskripsi=?, tipe=?, mapel_id=?, kelas_id=?, file_url=? WHERE id=? AND guru_id=?",
      [b.judul, b.deskripsi || null, b.tipe || "teks", b.mapel_id || null, b.kelas_id || null, b.file_url || null, b.id, session.id]
    );
    return NextResponse.json({ success: true, message: "Materi diperbarui." });
  } catch (err) {
    console.error("Update materi error:", err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui materi." }, { status: 500 });
  }
}

// DELETE materi
export async function DELETE(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await query("DELETE FROM materi WHERE id=? AND guru_id=?", [id, session.id]);
    return NextResponse.json({ success: true, message: "Materi dihapus." });
  } catch (err) {
    console.error("Delete materi error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus materi." }, { status: 500 });
  }
}

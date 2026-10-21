import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return null;
  return session;
}

// PUT: update jurusan
export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { kode, nama } = await request.json();
    if (!kode || !nama) {
      return NextResponse.json(
        { success: false, message: "Kode dan nama jurusan wajib diisi." },
        { status: 400 }
      );
    }
    const dup = await query("SELECT id FROM jurusan WHERE kode = ? AND id <> ? LIMIT 1", [kode, id]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Kode jurusan sudah dipakai." }, { status: 409 });
    }
    await query("UPDATE jurusan SET kode = ?, nama = ? WHERE id = ?", [kode, nama, id]);
    return NextResponse.json({ success: true, message: "Jurusan berhasil diperbarui." });
  } catch (err) {
    console.error("Update jurusan error:", err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui jurusan." }, { status: 500 });
  }
}

// DELETE: hapus jurusan (kelas terkait tidak ikut terhapus, jurusan_id jadi NULL)
export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    await query("DELETE FROM jurusan WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Jurusan berhasil dihapus." });
  } catch (err) {
    console.error("Delete jurusan error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus jurusan." }, { status: 500 });
  }
}

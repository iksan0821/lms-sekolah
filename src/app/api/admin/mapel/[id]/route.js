import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// PUT: update mapel
export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { kode, nama, deskripsi } = body;

    if (!kode || !nama) {
      return NextResponse.json(
        { success: false, message: "Kode dan nama mapel wajib diisi." },
        { status: 400 }
      );
    }

    const dup = await query("SELECT id FROM mata_pelajaran WHERE kode = ? AND id <> ? LIMIT 1", [kode, id]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Kode mapel sudah dipakai." }, { status: 409 });
    }

    await query(
      "UPDATE mata_pelajaran SET kode=?, nama=?, deskripsi=? WHERE id=?",
      [kode, nama, deskripsi || null, id]
    );
    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil diperbarui." });
  } catch (err) {
    console.error("Update mapel error:", err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui mata pelajaran." }, { status: 500 });
  }
}

// DELETE: hapus mapel
export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    await query("DELETE FROM mata_pelajaran WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil dihapus." });
  } catch (err) {
    console.error("Delete mapel error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus mata pelajaran." }, { status: 500 });
  }
}

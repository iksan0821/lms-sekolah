import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// Cari tahun_ajaran berdasarkan nama; buat bila belum ada. Mengembalikan id atau null.
async function resolveTahunAjaran(nama) {
  const teks = (nama || "").trim();
  if (!teks) return null;
  const found = await query("SELECT id FROM tahun_ajaran WHERE nama = ? LIMIT 1", [teks]);
  if (found.length) return found[0].id;
  const ins = await query("INSERT INTO tahun_ajaran (nama) VALUES (?)", [teks]);
  return ins.insertId;
}

// PUT: update kelas
export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, tingkat, jurusan_id, wali_kelas_id, tahun_ajaran } = body;

    if (!nama || !tingkat) {
      return NextResponse.json(
        { success: false, message: "Nama kelas dan tingkat wajib diisi." },
        { status: 400 }
      );
    }

    const tahunId = await resolveTahunAjaran(tahun_ajaran);
    await query(
      "UPDATE kelas SET nama=?, tingkat=?, jurusan_id=?, wali_kelas_id=?, tahun_ajaran_id=? WHERE id=?",
      [nama, tingkat, jurusan_id || null, wali_kelas_id || null, tahunId, id]
    );
    return NextResponse.json({ success: true, message: "Kelas berhasil diperbarui." });
  } catch (err) {
    console.error("Update kelas error:", err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui kelas." }, { status: 500 });
  }
}

// DELETE: hapus kelas (setelah lepas referensi siswa)
export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    await query("UPDATE siswa SET kelas_id = NULL WHERE kelas_id = ?", [id]);
    await query("DELETE FROM kelas WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Kelas berhasil dihapus." });
  } catch (err) {
    console.error("Delete kelas error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus kelas." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// PUT: update siswa
export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, username, email, password, nis, jenis_kelamin, no_telepon, status, kelas_id, nama_wali } = body;

    const dup = await query("SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1", [username, id]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Username sudah dipakai." }, { status: 409 });
    }

    let sql = `UPDATE users SET nama=?, username=?, email=?, nis=?, jenis_kelamin=?, no_telepon=?, status=?`;
    const vals = [nama, username, email || null, nis || null, jenis_kelamin || null, no_telepon || null, status || "aktif"];
    if (password) {
      sql += ", password=?";
      vals.push(await bcrypt.hash(password, 10));
    }
    sql += " WHERE id=?";
    vals.push(id);
    await query(sql, vals);

    // Upsert baris tabel siswa
    const s = await query("SELECT id FROM siswa WHERE user_id = ? LIMIT 1", [id]);
    if (s.length) {
      await query(
        "UPDATE siswa SET kelas_id=?, nis=?, nama_wali=? WHERE user_id=?",
        [kelas_id || null, nis || null, nama_wali || null, id]
      );
    } else {
      await query(
        "INSERT INTO siswa (user_id, kelas_id, nis, nama_wali) VALUES (?, ?, ?)",
        [id, kelas_id || null, nis || null, nama_wali || null]
      );
    }

    return NextResponse.json({ success: true, message: "Data siswa berhasil diperbarui." });
  } catch (err) {
    console.error("Update siswa error:", err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui siswa." }, { status: 500 });
  }
}

// DELETE: hapus siswa
export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    await query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Siswa berhasil dihapus." });
  } catch (err) {
    console.error("Delete siswa error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus siswa." }, { status: 500 });
  }
}

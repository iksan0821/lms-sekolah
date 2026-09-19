import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// PUT: update user
export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, username, email, password, role, nip, nis, jenis_kelamin, no_telepon, status } = body;

    const roleRow = await query("SELECT id FROM roles WHERE slug = ? LIMIT 1", [role]);
    if (roleRow.length === 0) {
      return NextResponse.json({ success: false, message: "Role tidak valid." }, { status: 400 });
    }

    const dup = await query("SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1", [username, id]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Username sudah dipakai." }, { status: 409 });
    }

    let sql = `UPDATE users SET nama=?, username=?, email=?, role_id=?, nip=?, nis=?,
               jenis_kelamin=?, no_telepon=?, status=?`;
    const vals = [nama, username, email || null, roleRow[0].id, nip || null, nis || null,
                  jenis_kelamin || null, no_telepon || null, status || "aktif"];

    if (password) {
      sql += ", password=?";
      vals.push(await bcrypt.hash(password, 10));
    }
    sql += " WHERE id=?";
    vals.push(id);

    await query(sql, vals);
    return NextResponse.json({ success: true, message: "User berhasil diperbarui." });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui user." }, { status: 500 });
  }
}

// DELETE: hapus user
export async function DELETE(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    if (Number(id) === Number(session.id)) {
      return NextResponse.json({ success: false, message: "Anda tidak dapat menghapus akun sendiri." }, { status: 400 });
    }
    await query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "User berhasil dihapus." });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus user." }, { status: 500 });
  }
}

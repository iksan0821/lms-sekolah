import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !["admin", "super_admin"].includes(session.role)) return null;
  return session;
}

// PUT: update guru
export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, username, email, password, nip, jenis_kelamin, no_telepon, status } = body;

    const dup = await query("SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1", [username, id]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Username sudah dipakai." }, { status: 409 });
    }

    // Cek duplikasi email terhadap akun lain (email UNIQUE di DB)
    if (email) {
      const dupEmail = await query(
        "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
        [email, id]
      );
      if (dupEmail.length) {
        return NextResponse.json({ success: false, message: "Email sudah dipakai akun lain." }, { status: 409 });
      }
    }

    let sql = `UPDATE users SET nama=?, username=?, email=?, nip=?, jenis_kelamin=?, no_telepon=?, status=?`;
    const vals = [nama, username, email || null, nip || null, jenis_kelamin || null, no_telepon || null, status || "aktif"];

    if (password) {
      sql += ", password=?";
      vals.push(await bcrypt.hash(password, 10));
    }
    sql += " WHERE id=?";
    vals.push(id);

    await query(sql, vals);
    return NextResponse.json({ success: true, message: "Data guru berhasil diperbarui." });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      const pesan = String(err.sqlMessage || "").includes("email")
        ? "Email sudah dipakai akun lain."
        : "Username sudah dipakai akun lain.";
      return NextResponse.json({ success: false, message: pesan }, { status: 409 });
    }
    console.error("Update guru error:", err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui guru." }, { status: 500 });
  }
}

// DELETE: hapus guru
export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    await query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Guru berhasil dihapus." });
  } catch (err) {
    console.error("Delete guru error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus guru." }, { status: 500 });
  }
}

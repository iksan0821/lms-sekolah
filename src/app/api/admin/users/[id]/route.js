import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !["admin", "super_admin"].includes(session.role)) return null;
  return session;
}

/**
 * Cek apakah session boleh mengelola user dengan role `targetRole`.
 * Super admin boleh mengatur semuanya (termasuk menghapus admin),
 * sedangkan admin biasa TIDAK boleh menyentuh akun super admin.
 */
function canManage(session, targetRole) {
  if (session.role === "super_admin") return true;
  return targetRole !== "super_admin";
}

async function getTargetUserRole(id) {
  const rows = await query(
    "SELECT r.slug AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1",
    [id]
  );
  return rows[0]?.role || null;
}

// PUT: update user
export async function PUT(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    // Admin biasa tidak boleh mengubah akun super admin
    const targetRole = await getTargetUserRole(id);
    if (targetRole && !canManage(session, targetRole)) {
      return NextResponse.json(
        { success: false, message: "Hanya Super Admin yang dapat mengubah akun Super Admin." },
        { status: 403 }
      );
    }
    // Hanya super admin boleh menjadikan/mengubah akun menjadi super admin
    if (body.role === "super_admin" && session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Hanya Super Admin yang dapat mengatur role Super Admin." },
        { status: 403 }
      );
    }
    if (targetRole === "super_admin" && body.role && body.role !== "super_admin" && session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Hanya Super Admin yang dapat mengatur role Super Admin." },
        { status: 403 }
      );
    }

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

    // Hanya super admin yang boleh menghapus admin; admin biasa tidak boleh menyentuh super admin
    const targetRole = await getTargetUserRole(id);
    if (targetRole && !canManage(session, targetRole)) {
      return NextResponse.json(
        { success: false, message: "Hanya Super Admin yang dapat menghapus akun ini." },
        { status: 403 }
      );
    }
    if (targetRole === "admin" && session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Hanya Super Admin yang dapat menghapus akun admin." },
        { status: 403 }
      );
    }

    await query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "User berhasil dihapus." });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus user." }, { status: 500 });
  }
}

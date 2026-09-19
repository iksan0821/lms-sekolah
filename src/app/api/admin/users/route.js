import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// GET: daftar semua user + nama role
export async function GET(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const q = searchParams.get("q");

  let sql = `SELECT u.id, u.nama, u.username, u.email, u.nip, u.nis,
                    u.jenis_kelamin, u.no_telepon, u.status, u.last_login,
                    u.created_at, r.slug AS role, r.nama AS role_nama
             FROM users u JOIN roles r ON r.id = u.role_id`;
  const params = [];
  const where = [];
  if (role) {
    where.push("r.slug = ?");
    params.push(role);
  }
  if (q) {
    where.push("(u.nama LIKE ? OR u.username LIKE ? OR u.email LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY u.id ASC";

  const rows = await query(sql, params);
  return NextResponse.json({ success: true, data: rows });
}

// POST: tambah user baru
export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { nama, username, email, password, role, nip, nis, jenis_kelamin, no_telepon, status } = body;

    if (!nama || !username || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Nama, username, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    const roleRow = await query("SELECT id FROM roles WHERE slug = ? LIMIT 1", [role]);
    if (roleRow.length === 0) {
      return NextResponse.json({ success: false, message: "Role tidak valid." }, { status: 400 });
    }

    const dup = await query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Username sudah dipakai." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (nama, username, email, password, role_id, nip, nis, jenis_kelamin, no_telepon, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama, username, email || null, hash, roleRow[0].id,
        nip || null, nis || null, jenis_kelamin || null, no_telepon || null, status || "aktif",
      ]
    );

    return NextResponse.json({ success: true, message: "User berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json({ success: false, message: "Gagal menambah user." }, { status: 500 });
  }
}

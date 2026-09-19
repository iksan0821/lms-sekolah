import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// GET: daftar siswa (join tabel siswa & kelas)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  const rows = await query(
    `SELECT u.id, u.nama, u.username, u.email, u.nis, u.jenis_kelamin,
            u.no_telepon, u.status, s.kelas_id, s.nama_wali, k.nama AS kelas
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN siswa s ON s.user_id = u.id
     LEFT JOIN kelas k ON k.id = s.kelas_id
     WHERE r.slug = 'siswa'
     ORDER BY u.nama`
  );
  return NextResponse.json({ success: true, data: rows });
}

// POST: tambah siswa (buat user role siswa + baris di tabel siswa)
export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { nama, username, email, password, nis, jenis_kelamin, no_telepon, status, kelas_id, nama_wali } = body;

    if (!nama || !username || !password) {
      return NextResponse.json(
        { success: false, message: "Nama, username, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const dup = await query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Username sudah dipakai." }, { status: 409 });
    }

    const roleRow = await query("SELECT id FROM roles WHERE slug = 'siswa' LIMIT 1");
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (nama, username, email, password, role_id, nis, jenis_kelamin, no_telepon, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama, username, email || null, hash, roleRow[0].id,
        nis || null, jenis_kelamin || null, no_telepon || null, status || "aktif",
      ]
    );

    await query(
      "INSERT INTO siswa (user_id, kelas_id, nis, nama_wali) VALUES (?, ?, ?, ?)",
      [result.insertId, kelas_id || null, nis || null, nama_wali || null]
    );

    return NextResponse.json({ success: true, message: "Siswa berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    console.error("Create siswa error:", err);
    return NextResponse.json({ success: false, message: "Gagal menambah siswa." }, { status: 500 });
  }
}

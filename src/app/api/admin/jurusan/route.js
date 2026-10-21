import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return null;
  return session;
}

// GET: daftar jurusan + jumlah kelas & siswa
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  const rows = await query(
    `SELECT j.id, j.kode, j.nama,
            (SELECT COUNT(*) FROM kelas k WHERE k.jurusan_id = j.id) AS jumlah_kelas
     FROM jurusan j
     ORDER BY j.nama`
  );
  return NextResponse.json({ success: true, data: rows });
}

// POST: tambah jurusan
export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { kode, nama } = await request.json();
    if (!kode || !nama) {
      return NextResponse.json(
        { success: false, message: "Kode dan nama jurusan wajib diisi." },
        { status: 400 }
      );
    }
    const dup = await query("SELECT id FROM jurusan WHERE kode = ? LIMIT 1", [kode]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Kode jurusan sudah dipakai." }, { status: 409 });
    }
    const result = await query("INSERT INTO jurusan (kode, nama) VALUES (?, ?)", [kode, nama]);
    return NextResponse.json({ success: true, message: "Jurusan berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    console.error("Create jurusan error:", err);
    return NextResponse.json({ success: false, message: "Gagal menambah jurusan." }, { status: 500 });
  }
}

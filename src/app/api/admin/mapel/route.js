import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// GET: daftar mapel
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  const rows = await query("SELECT id, kode, nama, deskripsi FROM mata_pelajaran ORDER BY nama");
  return NextResponse.json({ success: true, data: rows });
}

// POST: tambah mapel
export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { kode, nama, deskripsi } = body;

    if (!kode || !nama) {
      return NextResponse.json(
        { success: false, message: "Kode dan nama mapel wajib diisi." },
        { status: 400 }
      );
    }

    const dup = await query("SELECT id FROM mata_pelajaran WHERE kode = ? LIMIT 1", [kode]);
    if (dup.length) {
      return NextResponse.json({ success: false, message: "Kode mapel sudah dipakai." }, { status: 409 });
    }

    const result = await query(
      "INSERT INTO mata_pelajaran (kode, nama, deskripsi) VALUES (?, ?, ?)",
      [kode, nama, deskripsi || null]
    );
    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    console.error("Create mapel error:", err);
    return NextResponse.json({ success: false, message: "Gagal menambah mata pelajaran." }, { status: 500 });
  }
}

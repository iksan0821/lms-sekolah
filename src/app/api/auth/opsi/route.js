import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET: opsi publik untuk form login siswa (tingkat kelas & jurusan).
export async function GET() {
  try {
    const jurusan = await query("SELECT id, kode, nama FROM jurusan ORDER BY id");
    const tingkat = await query(
      "SELECT DISTINCT tingkat FROM kelas WHERE tingkat IS NOT NULL AND tingkat <> '' ORDER BY tingkat"
    );
    return NextResponse.json({
      success: true,
      data: {
        jurusan,
        tingkat: tingkat.map((t) => t.tingkat),
      },
    });
  } catch (err) {
    console.error("Opsi login error:", err);
    return NextResponse.json(
      { success: false, message: "Gagal memuat opsi." },
      { status: 500 }
    );
  }
}

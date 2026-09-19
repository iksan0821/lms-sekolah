import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

// GET: daftar kelas + opsi jurusan/wali/tahun
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  const rows = await query(
    `SELECT k.id, k.nama, k.tingkat, k.jurusan_id, k.wali_kelas_id, k.tahun_ajaran_id,
            j.nama AS jurusan, w.nama AS wali, ta.nama AS tahun
     FROM kelas k
     LEFT JOIN jurusan j ON j.id = k.jurusan_id
     LEFT JOIN users w ON w.id = k.wali_kelas_id
     LEFT JOIN tahun_ajaran ta ON ta.id = k.tahun_ajaran_id
     ORDER BY k.tingkat, k.nama`
  );
  const jurusan = await query("SELECT id, nama FROM jurusan ORDER BY nama");
  const guru = await query(
    `SELECT u.id, u.nama FROM users u JOIN roles r ON r.id = u.role_id
     WHERE r.slug = 'guru' ORDER BY u.nama`
  );
  return NextResponse.json({ success: true, data: rows, opsi: { jurusan, guru } });
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

// POST: tambah kelas
export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { nama, tingkat, jurusan_id, wali_kelas_id, tahun_ajaran } = body;

    if (!nama || !tingkat) {
      return NextResponse.json(
        { success: false, message: "Nama kelas dan tingkat wajib diisi." },
        { status: 400 }
      );
    }
    const tahunId = await resolveTahunAjaran(tahun_ajaran);
    const result = await query(
      "INSERT INTO kelas (nama, tingkat, jurusan_id, wali_kelas_id, tahun_ajaran_id) VALUES (?, ?, ?, ?, ?)",
      [nama, tingkat, jurusan_id || null, wali_kelas_id || null, tahunId]
    );
    return NextResponse.json({ success: true, message: "Kelas berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    console.error("Create kelas error:", err);
    return NextResponse.json({ success: false, message: "Gagal menambah kelas." }, { status: 500 });
  }
}

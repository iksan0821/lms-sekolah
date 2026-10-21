import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

// Kunci yang boleh diubah lewat API (white-list untuk keamanan)
const KUNCI_BOLEH = ["nama_sekolah", "alamat", "tahun_ajaran_aktif", "semester_aktif", "logo"];

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") return null;
  return session;
}

// GET: semua pengaturan (boleh dilihat admin & super admin)
export async function GET() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  const rows = await query("SELECT kunci, nilai, updated_at FROM pengaturan ORDER BY kunci");
  return NextResponse.json({ success: true, data: rows });
}

// PUT: simpan pengaturan (hanya super admin)
export async function PUT(request) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Hanya Super Admin yang dapat mengubah pengaturan sistem." },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const entri = Object.entries(body).filter(([k]) => KUNCI_BOLEH.includes(k));
    if (entri.length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada pengaturan yang valid." }, { status: 400 });
    }

    for (const [kunci, nilai] of entri) {
      await query(
        `INSERT INTO pengaturan (kunci, nilai) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)`,
        [kunci, nilai || null]
      );
    }

    // Catat ke log aktivitas
    await query("INSERT INTO log_aktivitas (user_id, aktivitas, ip_address) VALUES (?, ?, ?)", [
      session.id,
      `${session.nama} mengubah pengaturan sistem (${entri.map(([k]) => k).join(", ")})`,
      request.headers.get("x-forwarded-for") || "127.0.0.1",
    ]);

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan." });
  } catch (err) {
    console.error("Update pengaturan error:", err);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return null;
  return session;
}

// GET: riwayat aktivitas sistem.
// ?role=guru|siswa|kepsek|kurikulum  -> filter per role
// ?nama=...                          -> cari berdasarkan nama pengguna
// ?hal=n                             -> paginasi
export async function GET(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "";
    const nama = searchParams.get("nama") || "";
    const hal = Math.max(1, Number(searchParams.get("hal")) || 1);
    const perHal = 25;
    const offset = (hal - 1) * perHal;

    const where = [];
    const params = [];
    if (role) {
      where.push("r.slug = ?");
      params.push(role);
    }
    if (nama) {
      where.push("u.nama LIKE ?");
      params.push(`%${nama}%`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await query(
      `SELECT l.id, u.nama AS pengguna, r.nama AS role, l.aktivitas, l.ip_address, l.created_at
       FROM log_aktivitas l
       LEFT JOIN users u ON u.id = l.user_id
       LEFT JOIN roles r ON r.id = u.role_id
       ${whereSql}
       ORDER BY l.created_at DESC
       LIMIT ${perHal} OFFSET ${offset}`,
      params
    );
    const [{ n: total }] = await query(
      `SELECT COUNT(*) AS n FROM log_aktivitas l
       LEFT JOIN users u ON u.id = l.user_id
       LEFT JOIN roles r ON r.id = u.role_id
       ${whereSql}`,
      params
    );

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      hal,
      perHal,
      totalHal: Math.ceil(total / perHal),
    });
  } catch (err) {
    console.error("Riwayat aktivitas error:", err);
    return NextResponse.json({ success: false, message: "Gagal memuat riwayat." }, { status: 500 });
  }
}

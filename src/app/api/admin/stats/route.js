import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }

  const totalUsers = await query("SELECT COUNT(*) AS n FROM users");
  const perRole = await query(
    `SELECT r.slug, r.nama, COUNT(u.id) AS jumlah
     FROM roles r LEFT JOIN users u ON u.role_id = r.id
     GROUP BY r.id ORDER BY r.id`
  );
  const totalKelas = await query("SELECT COUNT(*) AS n FROM kelas");
  const totalMapel = await query("SELECT COUNT(*) AS n FROM mata_pelajaran");
  const aktivitas = await query(
    `SELECT l.aktivitas, l.created_at, u.nama
     FROM log_aktivitas l LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC LIMIT 6`
  );

  return NextResponse.json({
    success: true,
    data: {
      totalUsers: totalUsers[0].n,
      perRole,
      totalKelas: totalKelas[0].n,
      totalMapel: totalMapel[0].n,
      aktivitas,
    },
  });
}

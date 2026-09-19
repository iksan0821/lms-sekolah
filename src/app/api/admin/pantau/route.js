import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// API PANTAU AKUN (READ-ONLY)
// Hanya admin yang boleh akses. Hanya menyediakan GET (baca) -
// tidak ada POST/PUT/DELETE, jadi akun kepsek & kurikulum tidak bisa diubah dari sini.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }

  const rows = await query(
    `SELECT u.id, u.nama, u.username, u.email, u.nip, u.jenis_kelamin,
            u.no_telepon, u.status, u.last_login, u.created_at,
            r.slug AS role, r.nama AS role_nama
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.slug IN ('kepsek', 'kurikulum')
     ORDER BY r.id, u.nama`
  );

  // Ringkasan aktivitas masing-masing akun (murni baca)
  const aktivitas = await query(
    `SELECT l.user_id, l.aktivitas, l.ip_address, l.created_at
     FROM log_aktivitas l
     JOIN users u ON u.id = l.user_id
     JOIN roles r ON r.id = u.role_id
     WHERE r.slug IN ('kepsek', 'kurikulum')
     ORDER BY l.created_at DESC
     LIMIT 20`
  );

  return NextResponse.json({ success: true, data: rows, aktivitas });
}

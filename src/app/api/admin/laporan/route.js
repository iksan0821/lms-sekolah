import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession, isAdminRole } from "@/lib/auth";

// Laporan yang tersedia. Setiap jenis punya daftar kolom berlabel Indonesia
// agar hasil ekspor Excel/PDF sudah rapi.
const LAPORAN = {
  siswa: {
    judul: "Laporan Siswa",
    sql: `SELECT u.nama AS 'Nama Siswa', u.username AS 'Username', u.nis AS 'NIS',
                 k.nama AS 'Kelas', u.jenis_kelamin AS 'Jenis Kelamin',
                 u.no_telepon AS 'No. Telepon', u.status AS 'Status', u.last_login AS 'Login Terakhir'
          FROM users u
          JOIN roles r ON r.id = u.role_id
          LEFT JOIN siswa s ON s.user_id = u.id
          LEFT JOIN kelas k ON k.id = s.kelas_id
          WHERE r.slug = 'siswa'
          ORDER BY k.nama, u.nama`,
  },
  guru: {
    judul: "Laporan Guru",
    sql: `SELECT u.nama AS 'Nama Guru', u.username AS 'Username', u.email AS 'Email', u.nip AS 'NIP',
                 u.jenis_kelamin AS 'Jenis Kelamin', u.no_telepon AS 'No. Telepon',
                 u.status AS 'Status', u.last_login AS 'Login Terakhir'
          FROM users u JOIN roles r ON r.id = u.role_id
          WHERE r.slug = 'guru' ORDER BY u.nama`,
  },
  nilai: {
    judul: "Laporan Nilai",
    sql: `SELECT us.nama AS 'Nama Siswa', k.nama AS 'Kelas', mp.nama AS 'Mata Pelajaran',
                 n.jenis AS 'Jenis Nilai', n.nilai AS 'Nilai', n.created_at AS 'Tanggal'
          FROM nilai n
          LEFT JOIN users us ON us.id = n.siswa_id
          LEFT JOIN kelas k ON k.id = n.kelas_id
          LEFT JOIN mata_pelajaran mp ON mp.id = n.mapel_id
          ORDER BY k.nama, us.nama, n.created_at DESC`,
  },
  aktivitas: {
    judul: "Laporan Aktivitas",
    sql: `SELECT u.nama AS 'Pengguna', r.nama AS 'Role', l.aktivitas AS 'Aktivitas',
                 l.ip_address AS 'Alamat IP', l.created_at AS 'Waktu'
          FROM log_aktivitas l
          LEFT JOIN users u ON u.id = l.user_id
          LEFT JOIN roles r ON r.id = u.role_id
          ORDER BY l.created_at DESC LIMIT 1000`,
  },
};

export async function GET(request) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const jenis = searchParams.get("jenis") || "siswa";
  const download = searchParams.get("download") === "1";

  const laporan = LAPORAN[jenis];
  if (!laporan) {
    return NextResponse.json({ success: false, message: "Jenis laporan tidak dikenal." }, { status: 400 });
  }

  const rows = await query(laporan.sql);

  if (!download) {
    return NextResponse.json({ success: true, judul: laporan.judul, data: rows });
  }

  // Ekspor CSV (Excel/PDF diekspor di sisi klien dari data JSON)
  const headers = rows.length ? Object.keys(rows[0]) : ["tidak ada data"];
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv =
    "\uFEFF" +
    [headers.join(";")]
      .concat(rows.map((r) => headers.map((h) => escape(r[h])).join(";")))
      .join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan_${jenis}.csv"`,
    },
  });
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Role yang boleh melihat & menindaklanjuti masalah siswa.
const ALLOWED = ["kepsek", "kurikulum", "guru"];

const JENIS = ["kehadiran", "nilai", "tugas", "perilaku", "kesehatan", "lainnya"];
const PRIORITAS = ["tinggi", "sedang", "rendah"];
const STATUS = ["baru", "diproses", "selesai"];

async function requireAkses() {
  const session = await getSession();
  if (!session || !ALLOWED.includes(session.role)) return null;
  return session;
}

// Daftar kelas yang boleh diakses guru yang sedang login.
// Kalau bukan guru, null berarti semua kelas.
async function kelasGuru(guruId) {
  const rows = await query(
    `SELECT DISTINCT k.id
     FROM kelas k
     LEFT JOIN jadwal_pelajaran jp ON jp.kelas_id = k.id
     WHERE k.wali_kelas_id = ? OR jp.guru_id = ?`,
    [guruId, guruId]
  );
  return rows.map((r) => Number(r.id));
}

export async function GET(request) {
  const session = await requireAkses();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const opsi = searchParams.get("opsi");

  // Opsi form: daftar siswa + kelas + guru untuk penugasan tindak lanjut.
  if (opsi === "form") {
    let kelasOpsi = await query("SELECT id, nama FROM kelas ORDER BY nama");
    let siswaOpsi = await query(
      `SELECT u.id, u.nama, u.nis, s.kelas_id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN siswa s ON s.user_id = u.id
       WHERE r.slug = 'siswa'
       ORDER BY u.nama`
    );

    if (session.role === "guru") {
      const ids = await kelasGuru(session.id);
      if (!ids.length) {
        kelasOpsi = [];
        siswaOpsi = [];
      } else {
        const ph = ids.map(() => "?").join(",");
        kelasOpsi = await query(`SELECT id, nama FROM kelas WHERE id IN (${ph}) ORDER BY nama`, ids);
        siswaOpsi = await query(
          `SELECT u.id, u.nama, u.nis, s.kelas_id
           FROM users u
           JOIN roles r ON r.id = u.role_id
           LEFT JOIN siswa s ON s.user_id = u.id
           WHERE r.slug = 'siswa' AND s.kelas_id IN (${ph})
           ORDER BY u.nama`,
          ids
        );
      }
    }

    const guruOpsi = await query(
      `SELECT u.id, u.nama FROM users u JOIN roles r ON r.id = u.role_id
       WHERE r.slug IN ('guru','kepsek','kurikulum') ORDER BY u.nama`
    );

    return NextResponse.json({
      success: true,
      data: { kelas: kelasOpsi, siswa: siswaOpsi, guru: guruOpsi },
    });
  }

  const status = searchParams.get("status");
  const prioritas = searchParams.get("prioritas");

  let sql = `SELECT p.id, p.jenis, p.prioritas, p.deskripsi, p.tindak_lanjut, p.status,
                    p.tanggal, p.created_at, p.updated_at,
                    p.siswa_id, p.kelas_id, p.dit_assign_ke, p.created_by,
                    u.nama AS siswa, u.nis,
                    k.nama AS kelas,
                    a.nama AS assignee,
                    c.nama AS dibuat_oleh
             FROM permasalahan_siswa p
             LEFT JOIN users u ON u.id = p.siswa_id
             LEFT JOIN kelas k ON k.id = p.kelas_id
             LEFT JOIN users a ON a.id = p.dit_assign_ke
             LEFT JOIN users c ON c.id = p.created_by
             WHERE 1=1`;
  const params = [];

  if (status && status !== "semua") {
    sql += " AND p.status = ?";
    params.push(status);
  }
  if (prioritas && prioritas !== "semua") {
    sql += " AND p.prioritas = ?";
    params.push(prioritas);
  }

  // Rekap memakai klausa sisipan yang sama agar konsisten dengan daftar.
  let ringkasSql = `SELECT p.status, COUNT(*) AS n FROM permasalahan_siswa p WHERE 1=1`;
  const ringkasParams = [];

  if (session.role === "guru") {
    const ids = await kelasGuru(session.id);
    if (!ids.length) {
      return NextResponse.json({ success: true, data: [], rekap: { baru: 0, diproses: 0, selesai: 0 } });
    }
    const ph = ids.map(() => "?").join(",");
    const batas = ` AND p.siswa_id IN (SELECT user_id FROM siswa WHERE kelas_id IN (${ph}))`;
    sql += batas;
    ringkasSql += batas;
    params.push(...ids);
    ringkasParams.push(...ids);
  }

  sql += " ORDER BY FIELD(p.prioritas,'tinggi','sedang','rendah'), p.tanggal DESC";
  const data = await query(sql, params);

  const ringkas = await query(ringkasSql + " GROUP BY p.status", ringkasParams);
  const rekap = { baru: 0, diproses: 0, selesai: 0 };
  ringkas.forEach((r) => {
    rekap[r.status] = Number(r.n);
  });

  return NextResponse.json({ success: true, data, rekap });
}

// Catat masalah baru.
export async function POST(request) {
  const session = await requireAkses();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });

  try {
    const body = await request.json();
    const { siswa_id, kelas_id, jenis, prioritas, deskripsi, tindak_lanjut, dit_assign_ke, tanggal } = body;

    if (!siswa_id || !jenis || !deskripsi || !tanggal) {
      return NextResponse.json(
        { success: false, message: "Siswa, jenis masalah, keterangan, dan tanggal wajib diisi." },
        { status: 400 }
      );
    }
    if (!JENIS.includes(jenis)) {
      return NextResponse.json({ success: false, message: "Jenis masalah tidak valid." }, { status: 400 });
    }

    let kelasId = kelas_id || null;

    // Guru hanya boleh mencatat untuk siswa di kelas yang diajar.
    if (session.role === "guru") {
      const ids = await kelasGuru(session.id);
      const siswaRows = await query("SELECT kelas_id FROM siswa WHERE user_id = ?", [siswa_id]);
      const siswaKelas = Number(siswaRows[0]?.kelas_id);
      if (!ids.includes(siswaKelas)) {
        return NextResponse.json(
          { success: false, message: "Siswa ini bukan dari kelas yang Anda ajar." },
          { status: 403 }
        );
      }
      kelasId = siswaKelas;
    } else {
      const siswaRows = await query("SELECT kelas_id FROM siswa WHERE user_id = ?", [siswa_id]);
      if (!kelasId && siswaRows[0]?.kelas_id) kelasId = siswaRows[0].kelas_id;
    }

    const result = await query(
      `INSERT INTO permasalahan_siswa
         (siswa_id, kelas_id, jenis, prioritas, deskripsi, tindak_lanjut, status, dit_assign_ke, tanggal, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'baru', ?, ?, ?)`,
      [
        siswa_id,
        kelasId,
        jenis,
        PRIORITAS.includes(prioritas) ? prioritas : "sedang",
        deskripsi,
        tindak_lanjut || null,
        dit_assign_ke || null,
        tanggal,
        session.id,
      ]
    );

    await query("INSERT INTO log_aktivitas (user_id, aktivitas, ip_address) VALUES (?, ?, ?)", [
      session.id,
      `${session.nama} mencatat masalah siswa (${jenis})`,
      request.headers.get("x-forwarded-for") || "127.0.0.1",
    ]);

    return NextResponse.json({
      success: true,
      message: "Permasalahan siswa berhasil dicatat.",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Catat masalah siswa error:", err);
    return NextResponse.json({ success: false, message: "Gagal menyimpan masalah siswa." }, { status: 500 });
  }
}

// Update tindak lanjut / status masalah.
export async function PATCH(request) {
  const session = await requireAkses();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });

  try {
    const body = await request.json();
    const { id, status, tindak_lanjut, dit_assign_ke } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID masalah wajib diisi." }, { status: 400 });
    }
    if (status && !STATUS.includes(status)) {
      return NextResponse.json({ success: false, message: "Status tidak valid." }, { status: 400 });
    }

    // Guru hanya boleh mengubah masalah di kelasnya.
    if (session.role === "guru") {
      const ids = await kelasGuru(session.id);
      const cek = await query("SELECT siswa_id FROM permasalahan_siswa WHERE id = ?", [id]);
      if (!cek.length) {
        return NextResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 });
      }
      const siswaRows = await query("SELECT kelas_id FROM siswa WHERE user_id = ?", [cek[0].siswa_id]);
      if (!ids.includes(Number(siswaRows[0]?.kelas_id))) {
        return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
      }
    } else {
      const cek = await query("SELECT id FROM permasalahan_siswa WHERE id = ?", [id]);
      if (!cek.length) {
        return NextResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 });
      }
    }

    const fields = [];
    const params = [];
    if (status) {
      fields.push("status = ?");
      params.push(status);
    }
    if (tindak_lanjut !== undefined) {
      fields.push("tindak_lanjut = ?");
      params.push(tindak_lanjut || null);
    }
    if (dit_assign_ke !== undefined) {
      fields.push("dit_assign_ke = ?");
      params.push(dit_assign_ke || null);
    }
    if (!fields.length) {
      return NextResponse.json({ success: false, message: "Tidak ada perubahan." }, { status: 400 });
    }

    params.push(id);
    await query(`UPDATE permasalahan_siswa SET ${fields.join(", ")} WHERE id = ?`, params);

    return NextResponse.json({ success: true, message: "Tindak lanjut disimpan." });
  } catch (err) {
    console.error("Update masalah siswa error:", err);
    return NextResponse.json({ success: false, message: "Gagal menyimpan tindak lanjut." }, { status: 500 });
  }
}

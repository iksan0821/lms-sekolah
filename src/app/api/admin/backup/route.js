import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const run = promisify(execFile);

/**
 * Backup database ke file .sql (mysqldump). Hanya Super Admin.
 * GET /api/admin/backup?download=1  -> unduh file .sql
 * GET /api/admin/backup             -> daftar file backup yang ada
 */
export async function GET(request) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "Hanya Super Admin yang dapat mengelola backup." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download") === "1";

  const envBaca = (kunci, fallback) => {
    try {
      const isi = fs.readFileSync(".env.local", "utf8");
      const baris = isi.split(/\r?\n/).find((l) => l.startsWith(kunci + "="));
      return baris ? baris.slice(kunci.length + 1).trim() : fallback;
    } catch {
      return fallback;
    }
  };

  const dbHost = envBaca("DB_HOST", "127.0.0.1");
  const dbUser = envBaca("DB_USER", "root");
  const dbPass = envBaca("DB_PASSWORD", "");
  const dbName = envBaca("DB_NAME", "lms_sekolah");
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  // Cari lokasi mysqldump (Laragon / PATH)
  const kandidat = [
    "C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe",
    "mysqldump",
  ];
  const mysqldump = fs.existsSync(kandidat[0]) ? kandidat[0] : kandidat[1];

  if (download) {
    try {
      const namaFile = `backup_${dbName}_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
      const tujuan = path.join(backupDir, namaFile);

      const args = [
        `-h${dbHost}`,
        `-u${dbUser}`,
        ...(dbPass ? [`-p${dbPass}`] : []),
        "--routines",
        "--single-transaction",
        dbName,
        `-r${tujuan}`,
      ];
      await run(mysqldump, args);

      // Catat ke log aktivitas
      const { query } = await import("@/lib/db");
      await query(
        "INSERT INTO log_aktivitas (user_id, aktivitas, ip_address) VALUES (?, ?, ?)",
        [session.id, `${session.nama} membuat backup database (${namaFile})`, request.headers.get("x-forwarded-for") || "127.0.0.1"]
      );

      const isi = fs.readFileSync(tujuan);
      return new Response(isi, {
        headers: {
          "Content-Type": "application/sql",
          "Content-Disposition": `attachment; filename="${namaFile}"`,
        },
      });
    } catch (err) {
      console.error("Backup error:", err);
      return NextResponse.json(
        { success: false, message: "Gagal membuat backup. Pastikan MySQL berjalan." },
        { status: 500 }
      );
    }
  }

  // Daftar file backup
  try {
    const files = fs
      .readdirSync(backupDir)
      .filter((f) => f.endsWith(".sql"))
      .map((f) => {
        const st = fs.statSync(path.join(backupDir, f));
        return { nama: f, ukuran: st.size, dibuat: st.mtime };
      })
      .sort((a, b) => b.dibuat - a.dibuat);
    return NextResponse.json({ success: true, data: files });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

// DELETE: hapus file backup (hanya super admin). ?file=nama.sql
export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "Hanya Super Admin yang dapat mengelola backup." },
      { status: 403 }
    );
  }
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file") || "";
  // Cegah path traversal: hanya nama file sederhana
  if (!/^[\w.-]+\.sql$/.test(file)) {
    return NextResponse.json({ success: false, message: "Nama file tidak valid." }, { status: 400 });
  }
  const tujuan = path.join(process.cwd(), "backups", file);
  if (fs.existsSync(tujuan)) fs.unlinkSync(tujuan);
  return NextResponse.json({ success: true, message: "Backup dihapus." });
}

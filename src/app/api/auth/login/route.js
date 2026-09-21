import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signSession, COOKIE_NAME, ROLE_HOME } from "@/lib/auth";

export async function POST(request) {
  try {
    const { username, password, tingkat, jurusan_id } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const rows = await query(
      `SELECT u.id, u.nama, u.username, u.email, u.password, u.status,
              u.foto, r.slug AS role, r.nama AS role_nama
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.username = ? OR u.email = ?
       LIMIT 1`,
      [username, username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah." },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (user.status !== "aktif") {
      return NextResponse.json(
        { success: false, message: "Akun Anda tidak aktif. Hubungi admin." },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah." },
 { status: 401 }
      );
    }

    // Siswa wajib memilih tingkat kelas & jurusan, lalu divalidasi
    // terhadap data kelas yang terdaftar di sistem.
    let kelasInfo = null;
    if (user.role === "siswa") {
      if (!tingkat || !jurusan_id) {
        return NextResponse.json(
          { success: false, message: "Kelas (tingkat) dan jurusan wajib dipilih." },
          { status: 400 }
        );
      }

      const kelasRows = await query(
        `SELECT k.id, k.nama, k.tingkat, k.jurusan_id, j.nama AS jurusan
         FROM kelas k
         LEFT JOIN jurusan j ON j.id = k.jurusan_id
         WHERE k.tingkat = ? AND k.jurusan_id = ?
         ORDER BY k.nama
         LIMIT 1`,
        [String(tingkat), jurusan_id]
      );

      if (kelasRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kombinasi kelas dan jurusan tidak ditemukan." },
          { status: 400 }
        );
      }
      kelasInfo = kelasRows[0];
    }

    // Catat waktu login & log aktivitas
    await query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
    await query(
      "INSERT INTO log_aktivitas (user_id, aktivitas, ip_address) VALUES (?, ?, ?)",
      [
        user.id,
        `${user.nama} login sebagai ${user.role_nama}`,
        request.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    const token = await signSession({
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      role_nama: user.role_nama,
      ...(kelasInfo
        ? { kelas_id: kelasInfo.id, kelas: kelasInfo.nama, jurusan_id: kelasInfo.jurusan_id, jurusan: kelasInfo.jurusan }
        : {}),
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        role_nama: user.role_nama,
        ...(kelasInfo
          ? { kelas_id: kelasInfo.id, kelas: kelasInfo.nama, jurusan_id: kelasInfo.jurusan_id, jurusan: kelasInfo.jurusan }
          : {}),
      },
      redirect: ROLE_HOME[user.role] || "/",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 jam
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    const kode = err && err.code ? ` (${err.code})` : "";
    return NextResponse.json(
      { success: false, message: `Terjadi kesalahan pada server${kode}.` },
      { status: 500 }
    );
  }
}

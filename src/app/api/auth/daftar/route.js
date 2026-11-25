import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signSession, COOKIE_NAME, ROLE_HOME } from "@/lib/auth";

// POST: pendaftaran akun siswa baru (self-register).
// Siswa memilih tingkat & jurusan; sistem memilihkan kelas otomatis
// (kelas dengan siswa paling sedikit pada kombinasi tsb).
export async function POST(request) {
  try {
    const {
      nama,
      username,
      email,
      password,
      kelas_id,
      jenis_kelamin,
    } = await request.json();

    if (!nama || !username || !password || !kelas_id) {
      return NextResponse.json(
        { success: false, message: "Semua field bertanda * wajib diisi." },
        { status: 400 },
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter." },
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(String(username))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username 3-50 karakter, hanya huruf, angka, titik, garis bawah, atau tanda hubung.",
        },
        { status: 400 },
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid." },
        { status: 400 },
      );
    }

    // Validasi kelas yang dipilih harus ada di sistem
    const kelasRows = await query(
      `SELECT k.id, k.nama, k.tingkat, k.jurusan_id, j.nama AS jurusan
       FROM kelas k
       LEFT JOIN jurusan j ON j.id = k.jurusan_id
       WHERE k.id = ?
       LIMIT 1`,
      [kelas_id],
    );

    if (kelasRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kelas belum tersedia. Hubungi admin.",
        },
        { status: 400 },
      );
    }

    // Username / email tidak boleh sudah dipakai
    const existing = await query(
      "SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?) LIMIT 1",
      [username, email || username],
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username atau email sudah terdaftar." },
        { status: 409 },
      );
    }

    // Kelas sudah dipilih spesifik oleh siswa, tidak perlu auto-assign lagi
    const kelasInfo = kelasRows[0];

    const roleIdRows = await query(
      "SELECT id FROM roles WHERE slug = 'siswa' LIMIT 1",
    );
    if (roleIdRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Role siswa tidak ditemukan." },
        { status: 500 },
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const insertUser = await query(
      `INSERT INTO users (nama, username, email, password, role_id, jenis_kelamin, status)
       VALUES (?, ?, ?, ?, ?, ?, 'aktif')`,
      [
        nama,
        username,
        email || null,
        hash,
        roleIdRows[0].id,
        jenis_kelamin || null,
      ],
    );

    const userId = insertUser.insertId;

    // Buat baris siswa + relasi kelas
    await query("INSERT INTO siswa (user_id, kelas_id) VALUES (?, ?)", [
      userId,
      kelasInfo.id,
    ]);

    await query(
      "INSERT INTO log_aktivitas (user_id, aktivitas, ip_address) VALUES (?, ?, ?)",
      [
        userId,
        `${nama} mendaftarkan akun siswa baru (${kelasInfo.nama})`,
        request.headers.get("x-forwarded-for") || "127.0.0.1",
      ],
    );

    // Langsung login otomatis setelah daftar
    const token = await signSession({
      id: userId,
      nama,
      username,
      role: "siswa",
      role_nama: "Siswa",
      kelas_id: kelasInfo.id,
      kelas: kelasInfo.nama,
      jurusan_id: kelasInfo.jurusan_id,
      jurusan: kelasInfo.jurusan,
    });

    const response = NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil.",
      kelas: kelasInfo.nama,
      redirect: ROLE_HOME.siswa || "/siswa",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (err) {
    console.error("Daftar error:", err);
    const kode = err && err.code ? ` (${err.code})` : "";
    if (err && err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Username atau email sudah terdaftar." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: `Terjadi kesalahan pada server${kode}.` },
      { status: 500 },
    );
  }
}

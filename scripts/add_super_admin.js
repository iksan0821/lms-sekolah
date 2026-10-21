// Menambahkan role 'super_admin' + akun superadmin ke database lms_sekolah.
// Jalankan: node scripts/add_super_admin.js
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const conn = await mysql.createConnection({
  host: env.DB_HOST || "127.0.0.1",
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USER || "root",
  password: env.DB_PASSWORD || "",
  database: env.DB_NAME || "lms_sekolah",
});

// 1. Role
await query(
  `INSERT INTO roles (nama, slug, deskripsi)
   VALUES ('Super Admin', 'super_admin', 'Super admin: mengatur semuanya, termasuk menghapus admin')
   ON DUPLICATE KEY UPDATE nama = VALUES(nama)`
);

// 2. User superadmin (password: superadmin123)
const [rows] = await conn.query("SELECT id FROM roles WHERE slug = 'super_admin' LIMIT 1");
const roleId = rows[0].id;

const hash = bcrypt.hashSync("superadmin123", 10);
await query(
  `INSERT INTO users (nama, username, email, password, role_id, nip, jenis_kelamin, no_telepon, status)
   VALUES ('Super Administrator', 'superadmin', 'superadmin@lmssekolah.sch.id', ?, ?, 'SA001', 'L', '081200000006', 'aktif')
   ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), status = 'aktif'`,
  [hash, roleId]
);

async function query(sql, params) {
  const [r] = await conn.query(sql, params);
  return r;
}

console.log("OK: role super_admin & user 'superadmin' (password: superadmin123) siap.");
await conn.end();

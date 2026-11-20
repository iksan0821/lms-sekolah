// Uji end-to-end CRUD password via API (jalankan saat dev server aktif)
const BASE = process.env.BASE_URL || "http://localhost:3000";

async function main() {
  // 1. Login sebagai admin (sesuaikan kredensial admin Anda bila berbeda)
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "admin",
      password: "admin123",
      role: "admin",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0] || "";
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error("Login gagal:", loginData.message);
    process.exit(1);
  }
  console.log("Login OK sebagai:", loginData.data?.nama || loginData.nama);

  const H = { "Content-Type": "application/json", Cookie: cookie };
  const uname = "uji_" + Date.now();

  // 2. Tambah user via /api/admin/users (bug lama: error 500 karena `session` undefined)
  const buat = await fetch(`${BASE}/api/admin/users`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      nama: "Uji Password",
      username: uname,
      password: "sandiuji123",
      role: "siswa",
      status: "aktif",
    }),
  });
  const buatData = await buat.json();
  console.log(
    "Tambah user:",
    buat.status,
    buatData.message,
    "id:",
    buatData.id,
  );
  if (!buatData.success) process.exit(1);

  // 3. Edit user + ganti password
  const edit = await fetch(`${BASE}/api/admin/users/${buatData.id}`, {
    method: "PUT",
    headers: H,
    body: JSON.stringify({
      nama: "Uji Password 2",
      username: uname,
      password: "sandiBARU456",
      role: "siswa",
      status: "aktif",
    }),
  });
  const editData = await edit.json();
  console.log("Edit user:", edit.status, editData.message);

  // 4. Coba login dengan password BARU — bukti password tersimpan
  const loginBaru = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: uname,
      password: "sandiBARU456",
      role: "siswa",
      tingkat: "10",
      jurusan_id: 1,
      role: "siswa",
    }),
  });
  const loginBaruData = await loginBaru.json();
  console.log(
    "Login dengan password baru:",
    loginBaru.status,
    loginBaruData.success ? "SUKSES" : loginBaruData.message,
  );

  // 5. Bersihkan: hapus user uji
  const hapus = await fetch(`${BASE}/api/admin/users/${buatData.id}`, {
    method: "DELETE",
    headers: H,
  });
  console.log("Hapus user:", hapus.status, (await hapus.json()).message);
}

main();

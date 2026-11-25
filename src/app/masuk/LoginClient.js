"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ROLE_TABS = [
  { value: "admin", label: "Admin", deskripsi: "Kelola data sekolah, user, kelas, dan pengaturan sistem." },
  { value: "kepsek", label: "Kepsek", deskripsi: "Pantau jadwal, tugas materi, ujian, dan kinerja guru." },
  { value: "kurikulum", label: "Kurikulum", deskripsi: "Atur kurikulum, jadwal pelajaran, dan penilaian siswa." },
  { value: "guru", label: "Guru", deskripsi: "Kelola materi, tugas, soal, asesmen, dan nilai siswa." },
  { value: "siswa", label: "Siswa", deskripsi: "Akses materi, kerjakan tugas, ujian, dan lihat nilai." },
];

export default function LoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("admin");
  const [tingkat, setTingkat] = useState("");
  const [jurusanId, setJurusanId] = useState("");
  const [opsi, setOpsi] = useState({ jurusan: [], tingkat: [], kelas: [] });
  const [mode, setMode] = useState("masuk"); // "masuk" | "daftar"
  const [kelasDipilih, setKelasDipilih] = useState("");
  const [program, setProgram] = useState(""); // "Reguler" | "Plus"
  const [daftar, setDaftar] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
    konfirmasi: "",
    jenis_kelamin: "",
  });

  // Muat opsi kelas (tingkat) & jurusan untuk form login siswa.
  useEffect(() => {
    fetch("/api/auth/opsi")
      .then((r) => r.json())
      .then((d) => d.success && setOpsi(d.data))
      .catch(() => {});
  }, []);

  const isSiswa = role === "siswa" || mode === "daftar";
  // Pilihan tingkat kelas 1-10 (untuk mode daftar); mode login pakai opsi dari DB.
  const tingkatAngka = Array.from({ length: 10 }, (_, i) => String(i + 1));
  const tingkatOpsi = mode === "daftar" ? tingkatAngka : opsi.tingkat.length ? opsi.tingkat : ["10", "11", "12"];
  // Kelas spesifik (mis. "12 PPLG 2") tersedia hanya saat mode daftar.
  const kelasOpsi = (opsi.kelas || []).filter(
    (k) =>
      (!tingkat || String(k.tingkat) === String(tingkat)) &&
      (!jurusanId || String(k.jurusan_id) === String(jurusanId)) &&
      (!program || k.nama.toLowerCase().includes(program.toLowerCase()))
  );
  // Fallback bila endpoint opsi belum/tidak memuat data, agar jurusan tetap bisa dipilih.
  const jurusanOpsi = opsi.jurusan.length
    ? opsi.jurusan
    : [
        { id: 1, kode: "BDR", nama: "Bisnis Digital dan Retail" },
        { id: 2, kode: "DKV", nama: "Desain Komunikasi Visual" },
        { id: 3, kode: "MPLB", nama: "Manajemen Perkantoran dan Layanan Bisnis" },
        { id: 4, kode: "PH", nama: "Perhotelan" },
        { id: 5, kode: "PPLG", nama: "Pengembangan Perangkat Lunak dan Gim" },
        { id: 6, kode: "TJKT", nama: "Teknik Jaringan Komputer dan Telekomunikasi" },
      ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (isSiswa && (!tingkat || !jurusanId)) {
      setError("Kelas (tingkat) dan jurusan wajib dipilih.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role,
          ...(isSiswa ? { tingkat, jurusan_id: jurusanId } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login gagal.");
        setLoading(false);
        return;
      }
      router.push(data.redirect || "/");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setLoading(false);
    }
  }

  async function handleDaftar(e) {
    e.preventDefault();
    setError("");
    const { nama, username, password, konfirmasi } = daftar;
    if (!nama || !username || !password) {
      setError("Nama, username, dan password wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== konfirmasi) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    if (!tingkat || !jurusanId || !kelasDipilih || !program) {
      setError("Tingkat, jurusan, program, dan kelas wajib dipilih.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          username,
          email: daftar.email,
          password,
          kelas_id: kelasDipilih,
          jenis_kelamin: daftar.jenis_kelamin || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Pendaftaran gagal.");
        setLoading(false);
        return;
      }
      router.push(data.redirect || "/siswa");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient text-xl font-bold text-white shadow-lg shadow-black/30">
          SCN
        </div>
        <h1 className="text-2xl font-bold text-white">SMK Citra Negara</h1>
        <p className="mt-1 text-sm text-brand-100/80">
          Sistem Pembelajaran Terpadu Sekolah
        </p>
      </div>

      <form
        onSubmit={mode === "daftar" ? handleDaftar : handleSubmit}
        className="rounded-2xl bg-white p-6 shadow-xl"
      >
        {error && (
          <div className="mb-4 rounded-lg border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tab pilih peran login. Siswa punya tambahan field kelas & jurusan. */}
        <div className={`mb-2 ${mode === "daftar" ? "hidden" : ""}`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Masuk Sebagai
          </p>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
            {ROLE_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setRole(t.value);
                  setError("");
                  if (t.value !== "siswa") {
                    setTingkat("");
                    setJurusanId("");
                  }
                }}
                className={`rounded-md px-2 py-2 text-xs font-semibold transition sm:text-sm ${
                  role === t.value
                    ? "bg-white text-brand-dark shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">{ROLE_TABS.find((t) => t.value === role)?.deskripsi}</p>
        </div>

        {mode === "daftar" ? (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={daftar.nama}
                onChange={(e) => setDaftar({ ...daftar, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Username *
              </label>
              <input
                type="text"
                value={daftar.username}
                onChange={(e) => setDaftar({ ...daftar, username: e.target.value })}
                placeholder="Pilih username"
                required
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email (opsional)
              </label>
              <input
                type="email"
                value={daftar.email}
                onChange={(e) => setDaftar({ ...daftar, email: e.target.value })}
                placeholder="email@contoh.com"
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Jenis Kelamin
              </label>
              <select
                value={daftar.jenis_kelamin}
                onChange={(e) => setDaftar({ ...daftar, jenis_kelamin: e.target.value })}
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Pilih (opsional) --</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password *
                </label>
                <input
                  type="password"
                  value={daftar.password}
                  onChange={(e) => setDaftar({ ...daftar, password: e.target.value })}
                  placeholder="Min. 6 karakter"
                  required
                  className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  value={daftar.konfirmasi}
                  onChange={(e) => setDaftar({ ...daftar, konfirmasi: e.target.value })}
                  placeholder="Ulangi password"
                  required
                  className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                required
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border-slate-300 px-4 py-2.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-brand"
                >
                  {showPassword ? "Sembunyi" : "Lihat"}
                </button>
              </div>
            </div>
          </>
        )}

        {isSiswa && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {mode === "daftar" ? "Tingkat" : "Kelas (Tingkat)"}
              </label>
              <select
                value={tingkat}
                onChange={(e) => {
                  setTingkat(e.target.value);
                  setKelasDipilih("");
                }}
                required
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Pilih Tingkat --</option>
                {tingkatOpsi.map((t) => (
                  <option key={t} value={t}>
                    {mode === "daftar" ? t : `Kelas ${t}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Jurusan
              </label>
              <select
                value={jurusanId}
                onChange={(e) => {
                  setJurusanId(e.target.value);
                  setKelasDipilih("");
                }}
                required
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Pilih Jurusan --</option>
                {jurusanOpsi.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.kode} - {j.nama}
                  </option>
                ))}
              </select>
            </div>
            {mode === "daftar" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Program
                </label>
                <select
                  value={program}
                  onChange={(e) => {
                    setProgram(e.target.value);
                    setKelasDipilih("");
                  }}
                  required
                  className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">-- Pilih Program --</option>
                  <option value="Reguler">Reguler</option>
                  <option value="Plus">Plus</option>
                </select>
              </div>
            )}
            {mode === "daftar" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Kelas
                </label>
                <select
                  value={kelasDipilih}
                  onChange={(e) => setKelasDipilih(e.target.value)}
                  required
                  className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">
                    {tingkat && jurusanId && program
                      ? "-- Pilih Kelas --"
                      : "-- Pilih tingkat, jurusan & program dulu --"}
                  </option>
                  {kelasOpsi.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {mode === "daftar" && (
          <div className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-dark">
            Pilih tingkat (angka), jurusan, program (Reguler/Plus), lalu kelas —
            contoh &quot;12 PPLG 2&quot;.
            Anda akan langsung terdaftar di kelas tersebut.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Memproses..." : mode === "daftar" ? "Daftar" : "Masuk"}
        </button>
      </form>

      <div className="mt-6 text-center">
        {mode === "masuk" ? (
          <p className="text-sm text-brand-100/80">
            Belum punya akun siswa?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("daftar");
                setRole("siswa");
                setTingkat("");
                setJurusanId("");
                setKelasDipilih("");
                setProgram("");
                setError("");
              }}
              className="font-semibold text-white underline underline-offset-2 hover:text-brand-100"
            >
              Daftar di sini
            </button>
          </p>
        ) : (
          <p className="text-sm text-brand-100/80">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("masuk");
                setKelasDipilih("");
                setError("");
              }}
              className="font-semibold text-white underline underline-offset-2 hover:text-brand-100"
            >
              Masuk di sini
            </button>
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} SMK Citra Negara - Next.js + MySQL (Laragon)
        <br />
        Dikembangkan oleh <span className="font-semibold text-white">Iksan</span>
      </p>
    </div>
  );
}

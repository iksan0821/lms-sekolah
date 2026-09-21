"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [jurusanId, setJurusanId] = useState("");
  const [opsi, setOpsi] = useState({ jurusan: [], tingkat: [] });

  // Muat opsi kelas (tingkat) & jurusan untuk form login siswa.
  useEffect(() => {
    fetch("/api/auth/opsi")
      .then((r) => r.json())
      .then((d) => d.success && setOpsi(d.data))
      .catch(() => {});
  }, []);

  const isSiswa = role === "siswa";
  const tingkatOpsi = opsi.tingkat.length ? opsi.tingkat : ["10", "11", "12"];
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

  const demo = [
    { role: "Admin", u: "admin", p: "admin123", r: "" },
    { role: "Kepsek", u: "kepsek", p: "kepsek123", r: "" },
    { role: "Kurikulum", u: "kurikulum", p: "kurikulum123", r: "" },
    { role: "Guru", u: "guru", p: "guru123", r: "" },
    { role: "Siswa", u: "siswa", p: "siswa123", r: "siswa" },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient text-2xl font-bold text-white shadow-lg shadow-brand-500/30">
          LMS
        </div>
        <h1 className="text-2xl font-bold text-slate-800">LMS Sekolah</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sistem Pembelajaran Terpadu Sekolah
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50"
      >
        {error && (
          <div className="mb-4 rounded-lg border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tab pilih peran login: Siswa punya field kelas & jurusan. */}
        <div className="mb-5 flex gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setRole(""); setError(""); }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${!isSiswa ? "bg-white text-brand-dark shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Lainnya
          </button>
          <button
            type="button"
            onClick={() => { setRole("siswa"); setError(""); }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${isSiswa ? "bg-white text-brand-dark shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Siswa
          </button>
        </div>

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

        {isSiswa && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Kelas (Tingkat)
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                required
                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Pilih Tingkat --</option>
                {tingkatOpsi.map((t) => (
                  <option key={t} value={t}>Kelas {t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Jurusan
              </label>
              <select
                value={jurusanId}
                onChange={(e) => setJurusanId(e.target.value)}
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
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border-slate-200 bg-white/70 p-4 backdrop-blur">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          Akun Demo (klik untuk isi otomatis)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {demo.map((d) => (
            <button
              key={d.u}
              type="button"
              onClick={() => {
                setUsername(d.u);
                setPassword(d.p);
                setRole(d.r);
                if (d.r !== "siswa") {
                  setTingkat("");
                  setJurusanId("");
                }
                setError("");
              }}
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-light hover:bg-brand-50 hover:text-brand-dark"
            >
              {d.role}: {d.u}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        (c) {new Date().getFullYear()} LMS Sekolah - Next.js + MySQL (Laragon)
      </p>
    </div>
  );
}

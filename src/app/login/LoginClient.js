"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
    { role: "Admin", u: "admin", p: "admin123" },
    { role: "Kepsek", u: "kepsek", p: "kepsek123" },
    { role: "Kurikulum", u: "kurikulum", p: "kurikulum123" },
    { role: "Guru", u: "guru", p: "guru123" },
    { role: "Siswa", u: "siswa", p: "siswa123" },
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

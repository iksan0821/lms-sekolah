"use client";

import { useEffect, useState } from "react";
import { Field, PageHeader } from "@/components/crud-ui";

const DAFTAR = [
  { kunci: "nama_sekolah", label: "Nama Sekolah" },
  { kunci: "alamat", label: "Alamat" },
  { kunci: "tahun_ajaran_aktif", label: "Tahun Ajaran Aktif" },
  { kunci: "semester_aktif", label: "Semester Aktif" },
];

export default function PengaturanClient({ isSuperAdmin }) {
  const [nilai, setNilai] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [info, setInfo] = useState(null);

  async function load() {
    const res = await fetch("/api/admin/pengaturan");
    const data = await res.json();
    if (data.success) {
      const map = {};
      for (const r of data.data) map[r.kunci] = r.nilai || "";
      setNilai(map);
      setInfo(data.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    let batal = false;
    (async () => {
      const res = await fetch("/api/admin/pengaturan");
      const data = await res.json();
      if (!batal && data.success) {
        const map = {};
        for (const r of data.data) map[r.kunci] = r.nilai || "";
        setNilai(map);
        setInfo(data.data);
      }
      if (!batal) setLoading(false);
    })();
    return () => {
      batal = true;
    };
  }, []);

  async function simpan(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/pengaturan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nilai),
    });
    const data = await res.json();
    setSaving(false);
    setMsg({ type: data.success ? "success" : "error", text: data.message });
    if (data.success) setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Pengaturan Sistem"
        subtitle={
          isSuperAdmin
            ? "Atur identitas sekolah, tahun ajaran, dan semester."
            : "Identitas sekolah, tahun ajaran, dan semester aktif."
        }
      />

      {msg && (
        <div
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
            msg.type === "success" ? "bg-brand-50 text-brand-dark" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Memuat pengaturan...</p>
        ) : (
          <form onSubmit={simpan}>
            <div className="grid grid-cols-1 gap-4">
              {DAFTAR.map((d) => (
                <Field key={d.kunci} label={d.label}>
                  {d.kunci === "semester_aktif" ? (
                    <select
                      value={nilai[d.kunci] || ""}
                      onChange={(e) => setNilai({ ...nilai, [d.kunci]: e.target.value })}
                      disabled={!isSuperAdmin}
                      style={{
                        width: "100%",
                        borderRadius: "0.5rem",
                        border: "1px solid #cbd5e1",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  ) : (
                    <input
                      value={nilai[d.kunci] || ""}
                      onChange={(e) => setNilai({ ...nilai, [d.kunci]: e.target.value })}
                      disabled={!isSuperAdmin}
                      style={{
                        width: "100%",
                        borderRadius: "0.5rem",
                        border: "1px solid #cbd5e1",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  )}
                </Field>
              ))}
            </div>

            {isSuperAdmin && (
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Informasi teknis (read-only) */}
      <div className="mt-6 rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Informasi Aplikasi
        </h2>
        <dl className="divide-y divide-slate-100 text-sm">
          {[
            ["Framework", "Next.js (App Router)"],
            ["Database", "MySQL / MariaDB (Laragon)"],
            ["Autentikasi", "JWT Session Cookie"],
            ["Role tersedia", "Super Admin, Admin, Kepsek, Kurikulum, Guru, Siswa"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-3">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

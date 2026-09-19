"use client";

import { useEffect, useState } from "react";

// Halaman pantau fokus ke warna utama (teal) + aksen (amber)
const ROLE_STYLE = {
  kepsek: { bg: "bg-brand-50", text: "text-brand-dark", initial: "KS", label: "Kepala Sekolah" },
  kurikulum: { bg: "bg-amber-50", text: "text-amber-700", initial: "KR", label: "Kurikulum" },
};

export default function PantauClient() {
  const [rows, setRows] = useState([]);
  const [aktivitas, setAktivitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/pantau");
      const data = await res.json();
      setRows(data.data || []);
      setAktivitas(data.aktivitas || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-800">Pantau Akun</h1>
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-dark">
            Hanya Lihat
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Memantau akun Kepala Sekolah dan Kurikulum. Mode baca saja - akun tidak
          dapat diubah maupun dihapus dari halaman ini.
        </p>
      </div>

      {/* Kartu ringkas per akun */}
      {loading ? (
        <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
          Memuat data...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
          Belum ada akun kepsek/kurikulum.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map((u) => {
            const st = ROLE_STYLE[u.role] || ROLE_STYLE.kepsek;
            return (
              <div key={u.id} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${st.bg} ${st.text}`}>
                    {st.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-slate-800">{u.nama}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1.5 text-sm">
                      <Row label="Username" value={u.username} />
                      <Row label="Email" value={u.email || "-"} />
                      <Row label="NIP" value={u.nip || "-"} />
                      <Row label="No. Telepon" value={u.no_telepon || "-"} />
                      <Row label="Jenis Kelamin" value={u.jenis_kelamin === "P" ? "Perempuan" : u.jenis_kelamin === "L" ? "Laki-laki" : "-"} />
                      <Row
                        label="Status"
                        value={
                          <span className={`text-xs font-semibold ${u.status === "aktif" ? "text-brand" : "text-slate-400"}`}>
                        {u.status}
                          </span>
                        }
                      />
                      <Row label="Login Terakhir" value={u.last_login || "Belum pernah"} />
                      <Row label="Dibuat" value={u.created_at} />
                    </dl>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Aktivitas mereka */}
      <div className="mt-6 rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Aktivitas Terbaru (Kepsek &amp; Kurikulum)
        </h2>
        {aktivitas.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Aktivitas</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aktivitas.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-700">{a.aktivitas}</td>
                    <td className="px-4 py-3 text-slate-500">{a.ip_address || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{a.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
      - Halaman ini bersifat <b>monitoring</b>. Untuk mengubah atau menghapus akun,
        gunakan menu Manajemen User.
      </p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="truncate text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}

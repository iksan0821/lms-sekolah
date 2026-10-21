"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/crud-ui";

// Tab filter role sederhana: pilih satu, langsung tampil
const TABS = [
  { value: "", label: "Semua" },
  { value: "siswa", label: "Siswa" },
  { value: "guru", label: "Guru" },
  { value: "kepsek", label: "Kepsek" },
  { value: "kurikulum", label: "Kurikulum" },
];

export default function AktivitasClient() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("");
  const [nama, setNama] = useState(""); // isi input pencarian nama
  const [namaAktif, setNamaAktif] = useState(""); // nama yang sedang dipakai filter
  const [hal, setHal] = useState(1);
  const [totalHal, setTotalHal] = useState(1);
  const [loading, setLoading] = useState(true);

  async function muat(role, namaFilter, halaman) {
    setLoading(true);
    const params = new URLSearchParams({ hal: String(halaman) });
    if (role) params.set("role", role);
    if (namaFilter) params.set("nama", namaFilter);
    const res = await fetch(`/api/admin/aktivitas?${params.toString()}`);
    const data = await res.json();
    setRows(data.data || []);
    setTotalHal(data.totalHal || 1);
    setHal(halaman);
    setLoading(false);
  }

  // Terapkan filter nama dari input pencarian
  function cariNama() {
    const kata = nama.trim();
    setNama(kata);
    setNamaAktif(kata);
    muat(tab, kata, 1);
  }

  // Muat data riwayat aktivitas saat halaman dibuka
  useEffect(() => {
    let batal = false;
    (async () => {
      const res = await fetch("/api/admin/aktivitas");
      const data = await res.json();
      if (!batal) {
        setRows(data.data || []);
        setTotalHal(data.totalHal || 1);
        setLoading(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Riwayat Aktivitas"
        subtitle="Pilih kategori pengguna untuk melihat aktivitasnya."
      />

      {/* Tab kategori: Semua / Siswa / Guru / Kepsek / Kurikulum */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setTab(t.value);
              setNama("");
              setNamaAktif("");
              muat(t.value, "", 1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.value
                ? "brand-gradient text-white shadow-sm shadow-brand/30"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pencarian nama (praktis untuk tab Guru/Siswa) */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cariNama()}
          placeholder="Cari nama..."
          className="w-full rounded-lg border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-72"
        />
        <button
          onClick={cariNama}
          className="rounded-lg border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cari
        </button>
        {namaAktif && (
          <button
            onClick={() => {
              setNama("");
              setNamaAktif("");
              muat(tab, "", 1);
            }}
            className="rounded-lg border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            Hapus filter nama
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Aktivitas</th>
                <th className="px-4 py-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada aktivitas.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.pengguna || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                        {r.role || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.aktivitas}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginasi */}
      {totalHal > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button
            disabled={hal <= 1}
            onClick={() => muat(tab, namaAktif, hal - 1)}
            className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            &lt; Sebelumnya
          </button>
          <span className="text-slate-500">
            Halaman {hal} dari {totalHal}
          </span>
          <button
            disabled={hal >= totalHal}
            onClick={() => muat(tab, namaAktif, hal + 1)}
            className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Berikutnya &gt;
          </button>
        </div>
      )}
    </div>
  );
}

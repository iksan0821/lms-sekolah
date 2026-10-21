"use client";

import { useState } from "react";
import { PageHeader } from "@/components/crud-ui";
import { unduhLaporanExcel, unduhLaporanPDF } from "@/lib/exportLaporan";

const LAPORAN = [
  {
    jenis: "siswa",
    judul: "Laporan Siswa",
    deskripsi: "Daftar seluruh siswa beserta kelas, kontak, dan status akun.",
  },
  {
    jenis: "guru",
    judul: "Laporan Guru",
    deskripsi: "Daftar seluruh guru beserta NIP, kontak, dan status akun.",
  },
  {
    jenis: "nilai",
    judul: "Laporan Nilai",
    deskripsi: "Riwayat nilai siswa (harian, tugas, ulangan) per mapel & kelas.",
  },
  {
    jenis: "aktivitas",
    judul: "Laporan Aktivitas",
    deskripsi: "1000 aktivitas terakhir pengguna di sistem (log_aktivitas).",
  },
];

export default function LaporanClient() {
  const [preview, setPreview] = useState(null); // { jenis, judul, rows, loading }
  const [msg, setMsg] = useState(null);

  async function lihat(l) {
    setPreview({ jenis: l.jenis, judul: l.judul, rows: null, loading: true });
    const res = await fetch(`/api/admin/laporan?jenis=${l.jenis}`);
    const data = await res.json();
    setPreview({ jenis: l.jenis, judul: l.judul, rows: data.data || [], loading: false });
  }

  // Bentuk { headers, rows } dari hasil query untuk ekspor
  function susunEkspor(rows) {
    if (!rows || rows.length === 0) return null;
    const headers = Object.keys(rows[0]);
    const data = rows.map((r) => headers.map((h) => r[h]));
    return { headers, data };
  }

  function eksporExcel() {
    const e = susunEkspor(preview?.rows);
    if (!e) return;
    unduhLaporanExcel(preview.judul, e.headers, e.data);
    setMsg({ type: "success", text: "File Excel berhasil diunduh." });
    setTimeout(() => setMsg(null), 3000);
  }

  function eksporPDF() {
    const e = susunEkspor(preview?.rows);
    if (!e) return;
    unduhLaporanPDF(preview.judul, e.headers, e.data);
    setMsg({ type: "success", text: "File PDF berhasil diunduh." });
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Laporan"
        subtitle="Lihat laporan lalu ekspor ke Excel atau PDF."
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LAPORAN.map((l) => (
          <div
            key={l.jenis}
            className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-base font-semibold text-slate-800">{l.judul}</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">{l.deskripsi}</p>
            <div className="flex gap-2">
              <button
                onClick={() => lihat(l)}
                className="rounded-lg border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Lihat Data
              </button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="mt-6 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-800">
              {preview.judul}
              {preview.rows && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({preview.rows.length} baris, maks 100)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {preview.rows && preview.rows.length > 0 && (
                <>
                  <button
                    onClick={eksporExcel}
                    className="rounded-lg brand-gradient px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                  >
                    Ekspor Excel
                  </button>
                  <button
                    onClick={eksporPDF}
                    className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Ekspor PDF
                  </button>
                  <a
                    href={`/api/admin/laporan?jenis=${preview.jenis}&download=1`}
                    className="rounded-lg border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    CSV
                  </a>
                </>
              )}
              <button
                onClick={() => setPreview(null)}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                X
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            {preview.loading ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">Memuat data...</p>
            ) : preview.rows.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">Tidak ada data.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    {Object.keys(preview.rows[0]).map((h) => (
                      <th key={h} className="px-3 py-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.rows.slice(0, 100).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      {Object.values(r).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-slate-700">
                          {v == null ? "-" : String(v).slice(0, 40)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

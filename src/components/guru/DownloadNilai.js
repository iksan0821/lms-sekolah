"use client";

import { useEffect, useState } from "react";
import { PageTitle, Table, EmptyRow, Loading } from "@/components/guru-ui";

export default function DownloadNilai() {
  const [opsi, setOpsi] = useState({ kelas: [], mapel: [] });
  const [mapelId, setMapelId] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  useEffect(() => {
    fetch("/api/guru?bagian=nilai")
      .then((r) => r.json())
      .then((d) => d.success && setOpsi(d.data));
  }, []);

  async function lihat(e) {
    e.preventDefault();
    if (!mapelId) {
      setPesan({ tipe: "error", text: "Pilih mata pelajaran dulu." });
      return;
    }
    setLoading(true);
    setPesan(null);
    const url = `/api/guru?bagian=nilai-detail&mapel_id=${mapelId}` + (kelasId ? `&kelas_id=${kelasId}` : "");
    const res = await fetch(url);
    const d = await res.json();
    setLoading(false);
    if (!d.success) {
      setPesan({ tipe: "error", text: d.message });
      return;
    }
    setRows(d.data);
    if (d.data.length === 0) setPesan({ tipe: "info", text: "Belum ada nilai untuk pilihan ini." });
  }

  function downloadCSV() {
    if (rows.length === 0) {
      setPesan({ tipe: "error", text: "Tidak ada data untuk diunduh." });
      return;
    }
    const mapelNama = opsi.mapel.find((m) => String(m.id) === String(mapelId))?.nama || "mapel";
    const kelasNama = opsi.kelas.find((k) => String(k.id) === String(kelasId))?.nama || "";
    const header = ["No", "Nama Siswa", "NIS", "Kelas", "Tugas", "Harian", "Ujian", "Rata-rata"];
    const baris = rows.map((r, i) =>
      [i + 1, r.siswa, r.nis || "-", r.kelas || "-", r.tugas ?? "-", r.harian ?? "-", r.ujian ?? "-", r.rata ?? "-"]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...baris].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const bagianNama = kelasNama ? `${mapelNama}_${kelasNama}` : mapelNama;
    a.download = `nilai_${bagianNama.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setPesan({ tipe: "info", text: `Nilai ${bagianNama} berhasil diunduh (CSV).` });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        title="Download Nilai"
        subtitle="Unduh rekap nilai siswa per mata pelajaran dan per kelas."
      />

      <div className="mb-6 rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={lihat} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Pilih Mata Pelajaran</label>
            <select
              value={mapelId}
              onChange={(e) => setMapelId(e.target.value)}
              className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">-- Pilih Mapel --</option>
              {opsi.mapel.map((m) => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Pilih Kelas</label>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">-- Semua Kelas --</option>
              {opsi.kelas.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Tampilkan Nilai
          </button>
          <button
            type="button"
            onClick={downloadCSV}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-dark ring-1 ring-slate-200 transition hover:bg-brand-50"
          >
            Download CSV
          </button>
        </form>

        {pesan && (
          <div
            className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
              pesan.tipe === "error" ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-dark"
            }`}
          >
            {pesan.text}
          </div>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : rows.length > 0 ? (
        <Table columns={["No", "Nama Siswa", "NIS", "Kelas", "Tugas", "Harian", "Ujian", "Rata-rata"]}>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 text-slate-500">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{r.siswa}</td>
              <td className="px-4 py-3 text-slate-600">{r.nis || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{r.kelas || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{r.tugas ?? "-"}</td>
              <td className="px-4 py-3 text-slate-600">{r.harian ?? "-"}</td>
              <td className="px-4 py-3 text-slate-600">{r.ujian ?? "-"}</td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-dark">
                  {r.rata ?? "-"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
          Pilih mata pelajaran lalu klik "Tampilkan Nilai".
        </div>
      )}
    </div>
  );
}

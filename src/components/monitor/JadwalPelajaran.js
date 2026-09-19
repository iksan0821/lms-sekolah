"use client";

import { useState } from "react";
import { useMonitor, PageTitle, Loading } from "@/components/monitor-ui";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function JadwalPelajaran() {
  const { data, loading, error } = useMonitor("jadwal");
  const [filterHari, setFilterHari] = useState("");

  const rows = (data || []).filter((j) => !filterHari || j.hari === filterHari);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        title="Pantau Jadwal Pelajaran"
        subtitle="Pantau jadwal pelajaran per kelas, mapel, guru, dan ruang."
      />

      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mb-4 flex-wrap gap-2">
        <button
          onClick={() => setFilterHari("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !filterHari ? "bg-brand text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Semua
        </button>
        {HARI.map((h) => (
          <button
            key={h}
            onClick={() => setFilterHari(h)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filterHari === h ? "bg-brand text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada jadwal.</p>
          ) : (
            rows.map((j) => (
              <div key={j.id} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                    {j.hari}
                  </span>
                  <span className="text-xs text-slate-400">{j.ruang || "-"}</span>
                </div>
                <p className="font-semibold text-slate-800">{j.mapel || "-"}</p>
                <p className="mt-1 text-sm text-slate-500">{j.kelas || "-"}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">{j.guru || "-"}</span>
                  <span className="text-xs font-medium text-slate-700">
                    {String(j.jam_mulai).slice(0, 5)} - {String(j.jam_selesai).slice(0, 5)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

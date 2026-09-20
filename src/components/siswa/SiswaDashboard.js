"use client";

import { useEffect, useState } from "react";

export default function SiswaDashboard({ nama }) {
  const [data, setData] = useState(null);
  const sapaan = nama ? nama.split(" ")[0] : "Siswa";
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    fetch("/api/siswa?bagian=dashboard").then((r) => r.json()).then((d) => d.success && setData(d.data));
  }, []);

  const cards = data ? [
    { label: "Kelas", value: data.kelas, icon: "🏫" },
    { label: "Total Tugas", value: data.jumlahTugas, icon: "📝" },
    { label: "Ujian Tersedia", value: data.jumlahUjian, icon: "🧪" },
    { label: "Tugas Dikumpul", value: data.tugasDikumpul, icon: "📤" },
    { label: "Rata Nilai", value: data.rataNilai ?? "-", icon: "🎯" },
  ] : [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Selamat datang, {sapaan}</h1>
        <p className="mt-1 text-sm text-slate-500">{today}</p>
      </div>

      {!data ? (
        <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">Memuat data...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{c.label}</span>
                  <span className="text-lg">{c.icon}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-800">{c.value}</p>
                <div className="mt-3 h-1 w-10 rounded-full bg-brand" />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-800">Rekap Kehadiran</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {["hadir", "izin", "sakit", "alpa"].map((st) => {
                const f = (data.absensi || []).find((a) => a.status === st);
                return (
                  <div key={st} className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{f ? f.n : 0}</p>
                    <p className="mt-1 text-xs font-medium capitalize text-slate-500">{st}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

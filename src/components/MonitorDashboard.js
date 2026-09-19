"use client";

import { useMonitor, PageTitle, Card, Loading } from "@/components/monitor-ui";

export default function MonitorDashboard({ nama }) {
  const { data, loading, error } = useMonitor("ringkasan");

  const sapaan = nama ? nama.split(" ")[0] : "Pengguna";
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const stat = data
    ? [
        { label: "Guru", value: data.totalGuru },
        { label: "Siswa", value: data.totalSiswa },
        { label: "Kelas", value: data.totalKelas },
        { label: "Materi", value: data.totalMateri },
        { label: "Tugas", value: data.totalTugas },
        { label: "Ujian Online", value: data.totalUjian },
        { label: "Ujian Aktif", value: data.ujianAktif },
        { label: "Rata Nilai", value: data.rataNilai ?? "-" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title={`Selamat datang, ${sapaan}`} subtitle={today} />

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {stat.map((s) => (
              <Card key={s.label}>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{s.value}</p>
                <div className="mt-3 h-1 w-10 rounded-full bg-brand" />
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Card>
              <h2 className="mb-4 text-base font-semibold text-slate-800">Aktivitas Terbaru</h2>
              {data?.aktivitas?.length ? (
                <ul className="space-y-3">
                  {data.aktivitas.map((a, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-700">{a.aktivitas}</p>
                        <p className="text-xs text-slate-400">{a.created_at}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Belum ada aktivitas.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

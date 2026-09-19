"use client";

import { useMonitor, PageTitle, Table, EmptyRow, Loading, StatusBadge } from "@/components/monitor-ui";

export default function UjianOnline() {
  const { data, loading, error } = useMonitor("ujian");

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        title="Pantau Ujian Online"
        subtitle="Pantau seluruh ujian online: jadwal, jumlah soal, peserta, dan statusnya."
      />

      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <Loading />
      ) : (
        <Table columns={["Judul Ujian", "Mapel", "Kelas", "Guru", "Mulai", "Durasi", "Soal", "Peserta", "Status"]}>
          {data?.length ? (
            data.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">{u.judul}</td>
                <td className="px-4 py-3 text-slate-600">{u.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.guru || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.tanggal_mulai || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.durasi_menit ? u.durasi_menit + " mnt" : "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.jumlah_soal}</td>
                <td className="px-4 py-3 text-slate-600">{u.jumlah_peserta}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={9} />
          )}
        </Table>
      )}
    </div>
  );
}

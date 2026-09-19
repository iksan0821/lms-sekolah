"use client";

import { useMonitor, PageTitle, Table, EmptyRow, Loading } from "@/components/monitor-ui";

export default function KinerjaGuru() {
  const { data, loading, error } = useMonitor("kinerja-guru");

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        title="Kinerja Guru"
        subtitle="Rekap aktivitas mengajar tiap guru: materi, tugas, ujian, dan jadwal."
      />

      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <Loading />
      ) : (
        <Table columns={["Nama Guru", "NIP", "Materi", "Tugas", "Ujian", "Jadwal", "Rata Nilai"]}>
          {data?.length ? (
            data.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">{g.nama}</td>
                <td className="px-4 py-3 text-slate-600">{g.nip || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{g.jumlah_materi}</td>
                <td className="px-4 py-3 text-slate-600">{g.jumlah_tugas}</td>
                <td className="px-4 py-3 text-slate-600">{g.jumlah_ujian}</td>
                <td className="px-4 py-3 text-slate-600">{g.jumlah_jadwal}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-dark">
                    {g.rata_nilai ?? "-"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={7} />
          )}
        </Table>
      )}
    </div>
  );
}

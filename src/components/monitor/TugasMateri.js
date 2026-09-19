"use client";

import { useState } from "react";
import { useMonitor, PageTitle, Table, EmptyRow, Loading } from "@/components/monitor-ui";

export default function TugasMateri() {
  const { data, loading, error } = useMonitor("tugas-materi");
  const [tab, setTab] = useState("tugas");

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        title="Tugas & Materi"
        subtitle="Pantau materi dan tugas yang diberikan guru ke setiap kelas."
      />

      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mb-4 inline-flex rounded-lg border-slate-200 bg-white p-1 shadow-sm">
        {[
          { k: "tugas", label: "Tugas" },
          { k: "materi", label: "Materi" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.k ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : tab === "tugas" ? (
        <Table columns={["Judul Tugas", "Mapel", "Kelas", "Guru", "Deadline", "Terkumpul"]}>
          {data?.tugas?.length ? (
            data.tugas.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{t.judul}</p>
                  <p className="text-xs text-slate-400">{t.deskripsi || "-"}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{t.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.guru || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.deadline || "-"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {t.jumlah_terkumpul}/{t.jumlah_siswa}
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={6} />
          )}
        </Table>
      ) : (
        <Table columns={["Judul Materi", "Mapel", "Kelas", "Guru", "Dibuat"]}>
          {data?.materi?.length ? (
            data.materi.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{m.judul}</p>
                  <p className="text-xs text-slate-400">{m.deskripsi || "-"}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{m.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{m.guru || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{m.created_at}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={5} />
          )}
        </Table>
      )}
    </div>
  );
}

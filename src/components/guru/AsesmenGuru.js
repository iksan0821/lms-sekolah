"use client";

import { useState } from "react";
import { useGuru, PageTitle, Loading, Table, EmptyRow } from "@/components/guru-ui";

export default function AsesmenGuru() {
  const { data, loading, error } = useGuru("asesmen");
  const [tab, setTab] = useState("tugas");

  const ujianStatus = (s) => {
    const map = { draft: "bg-slate-100 text-slate-500", berlangsung: "bg-amber-100 text-amber-700", selesai: "bg-brand-50 text-brand-dark" };
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[s] || ""}`}>{s}</span>;
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Asesmen" subtitle="Rekap asesmen pembelajaran: tugas dan ujian/latihan soal." />
      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mb-4 inline-flex rounded-lg border-slate-200 bg-white p-1 shadow-sm">
        {[{ k: "tugas", label: "Tugas" }, { k: "ujian", label: "Ujian / Latihan" }].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${tab === t.k ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : tab === "tugas" ? (
        <Table columns={["Judul Tugas", "Mapel", "Kelas", "Deadline", "Terkumpul"]}>
          {data?.tugas?.length ? (
            data.tugas.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">{t.judul}</td>
                <td className="px-4 py-3 text-slate-600">{t.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.deadline || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.jumlah_terkumpul}/{t.jumlah_siswa}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={5} text="Belum ada tugas." />
          )}
        </Table>
      ) : (
        <Table columns={["Judul Ujian", "Mapel", "Kelas", "Mulai", "Soal", "Peserta", "Status"]}>
          {data?.ujian?.length ? (
            data.ujian.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">{u.judul}</td>
                <td className="px-4 py-3 text-slate-600">{u.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.deadline || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.jumlah_soal}</td>
                <td className="px-4 py-3 text-slate-600">{u.jumlah_peserta}</td>
                <td className="px-4 py-3">{ujianStatus(u.status)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={7} text="Belum ada ujian." />
          )}
        </Table>
      )}
    </div>
  );
}

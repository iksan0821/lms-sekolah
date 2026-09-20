"use client";

import { useEffect, useState } from "react";
import { PageTitle, Loading } from "@/components/siswa/ui";

export default function MapelSiswa() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("materi");

  useEffect(() => {
    fetch("/api/siswa?bagian=mapel").then((r) => r.json()).then((d) => d.success && setData(d.data));
  }, []);

  if (!data) return <div className="mx-auto max-w-6xl"><PageTitle title="Mata Pelajaran" /><Loading /></div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Mata Pelajaran" subtitle="Daftar mata pelajaran dan materi dari guru kelas Anda." />

      <div className="mb-4 inline-flex rounded-lg border-slate-200 bg-white p-1 shadow-sm">
        {[{ k: "materi", label: "Materi" }, { k: "mapel", label: "Daftar Mapel" }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={"rounded-md px-4 py-2 text-sm font-medium transition " + (tab === t.k ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50")}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mapel" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.mapel.length === 0 ? <p className="text-sm text-slate-400">Belum ada mata pelajaran.</p> :
            data.mapel.map((m) => (
              <div key={m.id} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">{m.kode}</span>
                </div>
                <p className="font-semibold text-slate-800">{m.nama}</p>
                <p className="mt-1 text-sm text-slate-500">Guru: {m.guru || "-"}</p>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.materi.length === 0 ? <p className="text-sm text-slate-400">Belum ada materi dari guru.</p> :
            data.materi.map((m) => (
              <div key={m.id} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{m.judul}</p>
                    <p className="mt-1 text-sm text-slate-500">{m.deskripsi || "-"}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium capitalize text-brand-dark">{m.tipe}</span>
                </div>
                <div className="mt-3 flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{m.mapel || "-"}</span><span>·</span><span>{m.guru || "-"}</span><span>·</span><span>{m.created_at}</span>
                  {m.file_url && <a href={m.file_url} target="_blank" rel="noreferrer" className="ml-auto rounded-md bg-brand px-3 py-1 font-semibold text-white hover:bg-brand-600">Buka Materi</a>}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

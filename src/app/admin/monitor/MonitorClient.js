"use client";

import { useEffect, useState } from "react";
import { ModalShell, PageHeader } from "@/components/crud-ui";

export default function MonitorClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null); // { kelas, data }
  const [detailLoading, setDetailLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/monitor");
    const data = await res.json();
    setRows(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    let batal = false;
    (async () => {
      const res = await fetch("/api/admin/monitor");
      const data = await res.json();
      if (!batal) {
        setRows(data.data || []);
        setLoading(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  async function bukaDetail(k) {
    setDetailLoading(true);
    setDetail({ kelas: k, data: null });
    const res = await fetch(`/api/admin/monitor/${k.id}`);
    const data = await res.json();
    setDetail({ kelas: k, data: data.data || {} });
    setDetailLoading(false);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Monitoring Pembelajaran"
        subtitle="Pantau materi, tugas, ulangan, dan nilai di seluruh kelas."
      />

      <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Materi</th>
                <th className="px-4 py-3">Tugas</th>
                <th className="px-4 py-3">Ujian</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Rata-rata</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{r.nama}</p>
                      <p className="text-xs text-slate-400">{r.jurusan || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.jumlah_materi}</td>
                    <td className="px-4 py-3 text-slate-600">{r.jumlah_tugas}</td>
                    <td className="px-4 py-3 text-slate-600">{r.jumlah_ujian}</td>
                    <td className="px-4 py-3 text-slate-600">{r.jumlah_nilai}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          r.rata_nilai != null
                            ? r.rata_nilai >= 75
                              ? "bg-brand-50 text-brand-dark"
                              : "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {r.rata_nilai != null ? r.rata_nilai : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => bukaDetail(r)}
                        className="rounded-md border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <ModalShell
          title={`Detail Pembelajaran - ${detail.kelas.nama}`}
          onClose={() => setDetail(null)}
          wide
        >
          {detailLoading || !detail.data ? (
            <p className="py-8 text-center text-sm text-slate-400">Memuat detail...</p>
          ) : (
            <div className="space-y-6">
              <Seksi title="Materi" items={detail.data.materi} render={(m) => `${m.judul} (${m.tipe}) - ${m.mapel || "-"}, ${m.guru || "-"}`} />
              <Seksi
                title="Tugas & Ulangan"
                items={detail.data.tugas}
                render={(t) =>
                  `${t.judul} [${t.tipe}] - ${t.mapel || "-"} | terkumpul ${t.jumlah_terkumpul}/${t.jumlah_siswa}${
                    t.deadline ? ` | deadline ${new Date(t.deadline).toLocaleDateString("id-ID")}` : ""
                  }`
                }
              />
              <Seksi
                title="Ujian Online"
                items={detail.data.ujian}
                render={(u) =>
                  `${u.judul} - ${u.mapel || "-"} | ${u.jumlah_peserta} peserta | ${u.status}`
                }
              />
              <Seksi
                title="Nilai Terbaru"
                items={detail.data.nilai}
                render={(n) => `${n.siswa || "-"} - ${n.mapel || "-"} [${n.jenis}]: ${n.nilai}`}
              />
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}

function Seksi({ title, items, render }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {!items || items.length === 0 ? (
        <p className="text-sm text-slate-400">Tidak ada data.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border-slate-200">
          {items.map((it) => (
            <li key={it.id} className="px-3 py-2 text-sm text-slate-700">
              {render(it)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

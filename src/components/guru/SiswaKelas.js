"use client";

import { useState } from "react";
import { useGuru, PageTitle, Card, Loading, Table, EmptyRow, STATUS_ABSEN } from "@/components/guru-ui";

export default function SiswaKelas() {
  const { data, loading, error } = useGuru("siswa");
  const [kelasId, setKelasId] = useState("");
  const [siswa, setSiswa] = useState([]);
  const [loadingSiswa, setLoadingSiswa] = useState(false);

  async function pilihKelas(id) {
    setKelasId(id);
    if (!id) { setSiswa([]); return; }
    setLoadingSiswa(true);
    const r = await fetch(`/api/guru?bagian=siswa&kelas_id=${id}`);
    const d = await r.json();
    setSiswa(d.data?.siswa || []);
    setLoadingSiswa(false);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Siswa di Kelas Saya" subtitle="Pilih kelas untuk melihat daftar siswa yang Anda ajar." />
      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-6 flex-wrap gap-3">
            {(data?.kelas || []).length === 0 ? (
              <p className="text-sm text-slate-400">Anda belum ditugaskan ke kelas mana pun.</p>
            ) : (
              data.kelas.map((k) => (
                <button
                  key={k.id}
                  onClick={() => pilihKelas(String(k.id))}
                  className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                    String(kelasId) === String(k.id)
                      ? "border-brand bg-brand text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-brand hover:bg-brand-50"
                  }`}
                >
                  {k.nama}
                  <span className="ml-2 text-xs opacity-70">Tingkat {k.tingkat}</span>
                </button>
              ))
            )}
          </div>

          {kelasId && (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-800">Daftar Siswa</h2>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                  {siswa.length} siswa
                </span>
              </div>
              {loadingSiswa ? (
                <p className="py-6 text-center text-sm text-slate-400">Memuat...</p>
              ) : (
                <Table columns={["No", "Nama Siswa", "NIS", "JK", "Nama Wali"]}>
                  {siswa.length ? (
                    siswa.map((s, i) => (
                      <tr key={s.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{s.nama}</td>
                        <td className="px-4 py-3 text-slate-600">{s.nis || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.jenis_kelamin || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.nama_wali || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <EmptyRow colSpan={5} text="Belum ada siswa di kelas ini." />
                  )}
                </Table>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

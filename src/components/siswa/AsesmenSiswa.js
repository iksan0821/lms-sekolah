"use client";

import { useEffect, useState } from "react";
import { PageTitle, Loading, Notice, Modal } from "@/components/siswa/ui";

export default function AsesmenSiswa() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aktif, setAktif] = useState(null); // { ujian, soal, jawaban, hasil }
  const [pilih, setPilih] = useState({});   // { soal_id: 'A' }
  const [msg, setMsg] = useState(null);
  const [mengirim, setMengirim] = useState(false);
  const [selesai, setSelesai] = useState(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/siswa?bagian=asesmen");
    const d = await r.json();
    setRows(d.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function kerjakan(u) {
    setMsg(null); setSelesai(null);
    const r = await fetch("/api/siswa?bagian=ujian-detail&ujian_id=" + u.id);
    const d = await r.json();
    if (!d.success) { setMsg({ type: "error", text: d.message }); return; }
    setAktif(d.data);
    const awal = {};
    (d.data.jawaban || []).forEach((j) => { if (j.jawaban) awal[j.soal_id] = j.jawaban; });
    setPilih(awal);
    if (d.data.hasil && d.data.hasil.selesai) {
      setSelesai({ nilai: d.data.hasil.nilai, benar: d.data.hasil.jumlah_benar, total: d.data.hasil.jumlah_soal });
    }
  }

  async function kirim() {
    if (Object.keys(pilih).length < (aktif.soal || []).length) {
      if (!confirm("Masih ada soal yang belum dijawab. Tetap kirim?")) return;
    }
    setMengirim(true);
    const res = await fetch("/api/siswa/ujian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ujian_id: aktif.ujian.id, jawaban: pilih }),
    });
    const d = await res.json();
    setMengirim(false);
    if (!d.success) { setMsg({ type: "error", text: d.message }); return; }
    setSelesai(d.data);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Asesmen" subtitle="Kerjakan ujian / latihan soal yang diberikan guru." />
      <Notice msg={msg} />

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Judul Ujian</th>
                  <th className="px-4 py-3">Mapel</th>
                  <th className="px-4 py-3">Guru</th>
                  <th className="px-4 py-3">Soal</th>
                  <th className="px-4 py-3">Nilai</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Belum ada ujian tersedia.</td></tr>
                ) : rows.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.judul}</td>
                    <td className="px-4 py-3 text-slate-600">{u.mapel || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{u.guru || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{u.jumlah_soal}</td>
                    <td className="px-4 py-3">
                      {u.selesai
                        ? <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-dark">{u.nilai}</span>
                        : <span className="text-xs text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => kerjakan(u)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">
                        {u.selesai ? "Lihat" : "Kerjakan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aktif && (
        <Modal title={aktif.ujian.judul} onClose={() => setAktif(null)} wide>
          <Notice msg={msg} />

          {selesai ? (
            <div className="rounded-xl bg-brand-50 p-6 text-center">
              <p className="text-sm text-brand-dark">Anda sudah mengerjakan ujian ini.</p>
              <p className="mt-2 text-4xl font-bold text-brand-dark">{selesai.nilai}</p>
              <p className="mt-1 text-sm text-slate-600">Benar {selesai.benar} dari {selesai.total} soal</p>
              <button onClick={() => setAktif(null)} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Tutup</button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">Durasi: {aktif.ujian.durasi_menit || "-"} menit · {aktif.soal.length} soal</p>
              <div className="space-y-4">
                {aktif.soal.map((s, i) => (
                  <div key={s.id} className="rounded-xl border-slate-100 bg-slate-50/50 p-4">
                    <p className="mb-3 text-sm font-medium text-slate-800">{i + 1}. {s.pertanyaan}</p>
                    <div className="space-y-2">
                      {["a", "b", "c", "d"].map((o) => {
                        const val = o.toUpperCase();
                        const aktifPilih = pilih[s.id] === val;
                        return (
                          <button key={o} type="button"
                            onClick={() => setPilih({ ...pilih, [s.id]: val })}
                            className={"flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition " + (aktifPilih ? "border-brand bg-brand-50 text-brand-dark" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>
                            <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold " + (aktifPilih ? "bg-brand text-white" : "bg-slate-100 text-slate-500")}>{val}</span>
                            {s["pilihan_" + o]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setAktif(null)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Tutup</button>
                <button onClick={kirim} disabled={mengirim} className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                  {mengirim ? "Mengirim..." : "Kumpulkan Jawaban"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

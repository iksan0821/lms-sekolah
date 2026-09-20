"use client";

import { useEffect, useState } from "react";
import { useGuru, PageTitle, Card, Loading, Table, EmptyRow, Notice, STATUS_ABSEN } from "@/components/guru-ui";

export default function AbsensiGuru() {
  const { data: opsi, loading, error } = useGuru("siswa");
  const [kelasId, setKelasId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [siswa, setSiswa] = useState([]);
  const [status, setStatus] = useState({}); // { siswa_id: 'hadir'|'izin'|'sakit'|'alpa' }
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [rekap, setRekap] = useState({ hadir: 0, izin: 0, sakit: 0, alpa: 0 });

  async function muatSiswa(kId) {
    setKelasId(kId);
    if (!kId) { setSiswa([]); return; }
    const r = await fetch(`/api/guru?bagian=siswa&kelas_id=${kId}`);
    const d = await r.json();
    const list = d.data?.siswa || [];
    setSiswa(list);
    const awal = {};
    list.forEach((s) => { awal[s.id] = "hadir"; });
    setStatus(awal);
  }

  async function muatRiwayat() {
    const q = new URLSearchParams({ bagian: "absensi" });
    if (kelasId) q.set("kelas_id", kelasId);
    const r = await fetch(`/api/guru?${q.toString()}`);
    const d = await r.json();
    if (d.success) {
      setRiwayat(d.data || []);
      setRekap(d.rekap || { hadir: 0, izin: 0, sakit: 0, alpa: 0 });
    }
  }

  useEffect(() => { if (kelasId) muatRiwayat(); }, [kelasId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function simpan() {
    if (!kelasId) { setMsg({ type: "error", text: "Pilih kelas dulu." }); return; }
    setSaving(true);
    setMsg(null);
    let berhasil = 0;
    for (const s of siswa) {
      const res = await fetch("/api/guru/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siswa_id: s.id,
          kelas_id: Number(kelasId),
          mapel_id: mapelId ? Number(mapelId) : null,
          tanggal,
          status: status[s.id] || "hadir",
        }),
      });
      const d = await res.json();
      if (d.success) berhasil++;
    }
    setSaving(false);
    setMsg({ type: "success", text: `Absensi tersimpan untuk ${berhasil} siswa.` });
    muatRiwayat();
  }

  async function hapus(id) {
    if (!confirm("Hapus catatan absensi ini?")) return;
    const res = await fetch(`/api/guru/absensi?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (!d.success) setMsg({ type: "error", text: d.message });
    else { setMsg({ type: "success", text: d.message }); muatRiwayat(); }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Absensi Kehadiran" subtitle="Catat kehadiran siswa: hadir, izin, sakit, atau alpa." />
      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <Card className="mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Kelas</label>
                <select value={kelasId} onChange={(e) => muatSiswa(e.target.value)} className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand">
                  <option value="">-- Pilih Kelas --</option>
                  {(opsi?.kelas || []).map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Mata Pelajaran (opsional)</label>
                <select value={mapelId} onChange={(e) => setMapelId(e.target.value)} className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand">
                  <option value="">-- Tanpa Mapel --</option>
                  {(opsi?.mapel || []).map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>
          </Card>

          <Notice msg={msg} onClose={() => setMsg(null)} />

          {siswa.length > 0 && (
            <Card className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-800">Isi Kehadiran</h2>
                <button onClick={simpan} disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
                  {saving ? "Menyimpan..." : "Simpan Absensi"}
                </button>
              </div>
              <div className="space-y-3">
                {siswa.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-slate-100 bg-slate-50/50 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.nama}</p>
                      <p className="text-xs text-slate-400">{s.nis || "-"}</p>
                    </div>
                    <div className="flex gap-2">
                      {["hadir", "izin", "sakit", "alpa"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus({ ...status, [s.id]: st })}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            status[s.id] === st ? STATUS_ABSEN[st].solid : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {STATUS_ABSEN[st].label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rekap */}
          <div className="mb-6 grid-cols-2 gap-4 sm:grid-cols-4">
            {["hadir", "izin", "sakit", "alpa"].map((st) => (
              <Card key={st}>
                <p className="text-sm font-medium capitalize text-slate-500">{STATUS_ABSEN[st].label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{rekap[st] || 0}</p>
                <div className={`mt-3 h-1 w-10 rounded-full ${STATUS_ABSEN[st].solid}`} />
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-800">Riwayat Absensi</h2>
            <Table columns={["Tanggal", "Nama Siswa", "Kelas", "Mapel", "Status", "Aksi"]}>
              {riwayat.length ? (
                riwayat.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-600">{a.tanggal}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{a.siswa}</td>
                    <td className="px-4 py-3 text-slate-600">{a.kelas || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{a.mapel || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_ABSEN[a.status]?.cls || ""}`}>
                        {STATUS_ABSEN[a.status]?.label || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => hapus(a.id)} className="rounded-md border-rose-100 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={6} text="Belum ada catatan absensi. Pilih kelas dan simpan absensi." />
              )}
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

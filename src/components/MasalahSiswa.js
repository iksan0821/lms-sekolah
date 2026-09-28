"use client";

import { useCallback, useEffect, useState } from "react";

// Komponen bersama untuk role kepsek, kurikulum, dan guru:
// melihat serta menindaklanjuti permasalahan siswa.

const JENIS = [
  { value: "kehadiran", label: "Kehadiran" },
  { value: "nilai", label: "Nilai" },
  { value: "tugas", label: "Tugas" },
  { value: "perilaku", label: "Perilaku" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "lainnya", label: "Lainnya" },
];

const PRIORITAS = [
  { value: "tinggi", label: "Tinggi", badge: "bg-rose-100 text-rose-700" },
  { value: "sedang", label: "Sedang", badge: "bg-amber-100 text-amber-700" },
  { value: "rendah", label: "Rendah", badge: "bg-slate-100 text-slate-600" },
];

const STATUS = [
  { value: "baru", label: "Baru", badge: "bg-rose-100 text-rose-700" },
  { value: "diproses", label: "Diproses", badge: "bg-amber-100 text-amber-700" },
  { value: "selesai", label: "Selesai", badge: "bg-brand-50 text-brand-dark" },
];

const labelOf = (list, v) => list.find((x) => x.value === v)?.label || v;

const inputClass =
  "w-full rounded-lg border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

export default function MasalahSiswa({ judul, subtitle, role }) {
  const [data, setData] = useState([]);
  const [rekap, setRekap] = useState({ baru: 0, diproses: 0, selesai: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sukses, setSukses] = useState("");

  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterPrioritas, setFilterPrioritas] = useState("semua");

  const [form, setForm] = useState(false);
  const [opsi, setOpsi] = useState({ kelas: [], siswa: [], guru: [] });
  const [menyimpan, setMenyimpan] = useState(false);
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState({
    siswa_id: "",
    jenis: "kehadiran",
    prioritas: "sedang",
    deskripsi: "",
    tindak_lanjut: "",
    dit_assign_ke: "",
    tanggal: new Date().toISOString().slice(0, 10),
  });

  const [detail, setDetail] = useState(null);
  const [simpanTindak, setSimpanTindak] = useState({ status: "", tindak_lanjut: "", dit_assign_ke: "" });

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/masalah-siswa?status=${filterStatus}&prioritas=${filterPrioritas}`;
      const res = await fetch(url);
      const d = await res.json();
      if (!d.success) {
        setError(d.message || "Gagal memuat data.");
      } else {
        setData(d.data);
        setRekap(d.rekap);
        setError(null);
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPrioritas]);

  useEffect(() => {
    muat();
  }, [muat]);

  // Muat daftar guru untuk penugasan tindak lanjut sejak awal.
  useEffect(() => {
    fetch("/api/masalah-siswa?opsi=form")
      .then((r) => r.json())
      .then((d) => d.success && setOpsi((o) => ({ ...o, guru: d.data.guru })))
      .catch(() => {});
  }, []);

  async function bukaForm() {
    setForm(true);
    setFormError("");
    try {
      const res = await fetch("/api/masalah-siswa?opsi=form");
      const d = await res.json();
      if (d.success) setOpsi(d.data);
      setFormError("");
    } catch {
      setFormError("Gagal memuat pilihan siswa.");
    }
  }

  async function simpanBaru(e) {
    e.preventDefault();
    setMenyimpan(true);
    setFormError("");
    try {
      const res = await fetch("/api/masalah-siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const d = await res.json();
      if (!d.success) {
        setFormError(d.message || "Gagal menyimpan.");
        return;
      }
      setForm(false);
      setSukses(d.message);
      setDraft({
        siswa_id: "",
        jenis: "kehadiran",
        prioritas: "sedang",
        deskripsi: "",
        tindak_lanjut: "",
        dit_assign_ke: "",
        tanggal: new Date().toISOString().slice(0, 10),
      });
      muat();
    } catch {
      setFormError("Tidak dapat terhubung ke server.");
    } finally {
      setMenyimpan(false);
    }
  }

  function bukaDetail(m) {
    setDetail(m);
    setSimpanTindak({
      status: m.status,
      tindak_lanjut: m.tindak_lanjut || "",
      dit_assign_ke: m.dit_assign_ke || "",
    });
  }

  async function simpanTindakLanjut(e) {
    e.preventDefault();
    setMenyimpan(true);
    try {
      const res = await fetch("/api/masalah-siswa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: detail.id, ...simpanTindak }),
      });
      const d = await res.json();
      if (!d.success) {
        setFormError(d.message || "Gagal menyimpan.");
        return;
      }
      setDetail(null);
      setSukses(d.message);
      muat();
    } catch {
      setFormError("Tidak dapat terhubung ke server.");
    } finally {
      setMenyimpan(false);
    }
  }

  const kartu = [
    { label: "Baru", value: rekap.baru, tone: "text-rose-600" },
    { label: "Diproses", value: rekap.diproses, tone: "text-amber-600" },
    { label: "Selesai", value: rekap.selesai, tone: "text-brand-600" },
    { label: "Total", value: rekap.baru + rekap.diproses + rekap.selesai, tone: "text-slate-800" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{judul}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button
          onClick={bukaForm}
          className="rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:brightness-110"
        >
          + Catat Permasalahan
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {sukses && (
        <div className="mb-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-dark">
          {sukses}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kartu.map((k) => (
          <div key={k.label} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{k.label}</p>
            <p className={`mt-2 text-3xl font-bold ${k.tone}`}>{k.value}</p>
            <div className="mt-3 h-1 w-10 rounded-full bg-brand" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex-wrap items-end gap-3 rounded-2xl border-slate-200 bg-white p-4 shadow-sm">
        <div className="w-40">
          <label className={labelClass}>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputClass}
          >
            <option value="semua">Semua Status</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className={labelClass}>Prioritas</label>
          <select
            value={filterPrioritas}
            onChange={(e) => setFilterPrioritas(e.target.value)}
            className={inputClass}
          >
            <option value="semua">Semua Prioritas</option>
            {PRIORITAS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <p className="ml-auto text-xs text-slate-400">
          {role === "guru" ? "Hanya siswa di kelas yang Anda ajar." : "Seluruh siswa di sekolah."}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
            Memuat data...
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
            Belum ada permasalahan siswa yang tercatat.
          </div>
        ) : (
          data.map((m) => (
            <article key={m.id} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                      {labelOf(JENIS, m.jenis)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITAS.find((p) => p.value === m.prioritas)?.badge}`}>
                      {labelOf(PRIORITAS, m.prioritas)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS.find((s) => s.value === m.status)?.badge}`}>
                      {labelOf(STATUS, m.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-bold text-slate-800">
                    {m.siswa || "-"}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {m.nis ? `NIS ${m.nis}` : ""} {m.kelas ? `• ${m.kelas}` : ""}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{m.deskripsi}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{m.tanggal}</p>
                  {m.dibuat_oleh && <p className="mt-1">Dicatat oleh {m.dibuat_oleh}</p>}
                </div>
              </div>

              {(m.tindak_lanjut || m.assignee) && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  {m.assignee && (
                    <p className="text-xs font-semibold text-slate-500">Ditanggung: {m.assignee}</p>
                  )}
                  {m.tindak_lanjut && (
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">Tindak lanjut: </span>
                      {m.tindak_lanjut}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => bukaDetail(m)}
                  className="rounded-lg border-brand-500 px-4 py-2 text-xs font-semibold text-brand-dark transition hover:bg-brand-50"
                >
                  Tindak Lanjuti
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal catat masalah baru */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800">Catat Permasalahan Siswa</h2>
            <form onSubmit={simpanBaru} className="mt-4 space-y-3">
              {formError && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
              )}
              <div>
                <label className={labelClass}>Siswa</label>
                <select
                  value={draft.siswa_id}
                  onChange={(e) => setDraft({ ...draft, siswa_id: e.target.value })}
                  required
                  className={inputClass}
                >
                  <option value="">-- Pilih Siswa --</option>
                  {opsi.siswa.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nis || "tanpa NIS"})</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Jenis Masalah</label>
                  <select
                    value={draft.jenis}
                    onChange={(e) => setDraft({ ...draft, jenis: e.target.value })}
                    className={inputClass}
                  >
                    {JENIS.map((j) => (
                      <option key={j.value} value={j.value}>{j.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Prioritas</label>
                  <select
                    value={draft.prioritas}
                    onChange={(e) => setDraft({ ...draft, prioritas: e.target.value })}
                    className={inputClass}
                  >
                    {PRIORITAS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Tanggal</label>
                <input
                  type="date"
                  value={draft.tanggal}
                  onChange={(e) => setDraft({ ...draft, tanggal: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Keterangan Permasalahan</label>
                <textarea
                  value={draft.deskripsi}
                  onChange={(e) => setDraft({ ...draft, deskripsi: e.target.value })}
                  required
                  rows={3}
                  placeholder="Contoh: Siswa sering tidak hadir tanpa keterangan."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tindak Lanjut Awal (opsional)</label>
                <textarea
                  value={draft.tindak_lanjut}
                  onChange={(e) => setDraft({ ...draft, tindak_lanjut: e.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ditanggung Kepada (opsional)</label>
                <select
                  value={draft.dit_assign_ke}
                  onChange={(e) => setDraft({ ...draft, dit_assign_ke: e.target.value })}
                  className={inputClass}
                >
                  <option value="">-- Belum Ditugaskan --</option>
                  {opsi.guru.map((g) => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForm(false)}
                  className="rounded-lg border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={menyimpan}
                  className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {menyimpan ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal tindak lanjut */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800">Tindak Lanjuti</h2>
            <p className="mt-1 text-sm text-slate-500">
              {detail.siswa} • {detail.kelas || "Tanpa kelas"} • {labelOf(JENIS, detail.jenis)}
            </p>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{detail.deskripsi}</p>

            <form onSubmit={simpanTindakLanjut} className="mt-4 space-y-3">
              {formError && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={simpanTindak.status}
                    onChange={(e) => setSimpanTindak({ ...simpanTindak, status: e.target.value })}
                    className={inputClass}
                  >
                    {STATUS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Ditanggung Kepada</label>
                  <select
                    value={simpanTindak.dit_assign_ke}
                    onChange={(e) => setSimpanTindak({ ...simpanTindak, dit_assign_ke: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {opsi.guru.map((g) => (
                      <option key={g.id} value={g.id}>{g.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Catatan Tindak Lanjut</label>
                <textarea
                  value={simpanTindak.tindak_lanjut}
                  onChange={(e) => setSimpanTindak({ ...simpanTindak, tindak_lanjut: e.target.value })}
                  rows={4}
                  placeholder="Contoh: Sudah dihubungi orang tua, dijadwalkan Intensive."
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  className="rounded-lg border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={menyimpan}
                  className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {menyimpan ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

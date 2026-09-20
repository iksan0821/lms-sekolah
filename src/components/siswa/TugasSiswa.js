"use client";

import { useEffect, useRef, useState } from "react";
import { PageTitle, Loading, Notice, Modal, Field, inputCls } from "@/components/siswa/ui";

const empty = { tugas_id: null, judul: "", tipe_pengumpulan: "link", file_url: "", jawaban_teks: "" };

export default function TugasSiswa() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/siswa?bagian=tugas");
    const d = await r.json();
    setRows(d.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function buka(t) {
    setForm({
      tugas_id: t.id,
      judul: t.judul,
      tipe_pengumpulan: t.tipe_pengumpulan || "link",
      file_url: t.file_url || "",
      jawaban_teks: t.jawaban_teks || "",
    });
    setMsg(null);
    setShow(true);
  }

  function pilihFile(e) {
    const f = e.target.files?.[0];
    if (f) setForm((prev) => ({ ...prev, tipe_pengumpulan: "file", file_url: f.name }));
  }

  async function simpan(e) {
    e.preventDefault();
    if (!form.file_url.trim()) {
      setMsg({ type: "error", text: form.tipe_pengumpulan === "link" ? "Isi link tugas dulu." : "Pilih / isi nama file PDF dulu." });
      return;
    }
    setSaving(true);
    const res = await fetch("/api/siswa/tugas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (!d.success) { setMsg({ type: "error", text: d.message }); return; }
    setShow(false);
    setMsg({ type: "success", text: d.message });
    load();
  }

  const badgeTipe = (t) => ({ tugas: "bg-slate-100 text-slate-600", ulangan: "bg-brand-50 text-brand-dark", latihan: "bg-amber-100 text-amber-700" }[t] || "bg-slate-100 text-slate-600");

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Tugas / Proyek" subtitle="Kerjakan tugas dari guru, lalu kirim melalui link atau file PDF." />
      <Notice msg={msg} />

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">Belum ada tugas.</div>
          ) : rows.map((t) => {
            const dikumpul = !!t.pengumpulan_id;
            return (
              <div key={t.id} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{t.judul}</p>
                      <span className={"rounded-md px-2 py-0.5 text-xs font-medium capitalize " + badgeTipe(t.tipe)}>{t.tipe}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{t.deskripsi || "-"}</p>
                    <div className="mt-2 flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{t.mapel || "-"}</span><span>·</span><span>Guru: {t.guru || "-"}</span><span>·</span>
                      <span>Deadline: {t.deadline || "-"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {dikumpul ? (
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                        {t.status_kumpul === "dinilai" ? "Sudah dinilai" : "Sudah dikumpul"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Belum dikumpul</span>
                    )}
                    {t.nilai != null && <p className="mt-2 text-lg font-bold text-brand-dark">Nilai: {t.nilai}</p>}
                  </div>
                </div>

                {dikumpul && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Metode: <b className="capitalize">{t.tipe_pengumpulan}</b> · {t.file_url}
                    {t.catatan_guru && <span> · Catatan guru: {t.catatan_guru}</span>}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button onClick={() => buka(t)} className={"rounded-lg px-4 py-2 text-sm font-semibold transition " + (dikumpul ? "bg-white text-brand-dark ring-1 ring-slate-200 hover:bg-slate-50" : "bg-brand text-white hover:bg-brand-600")}>
                    {dikumpul ? "Ubah Pengumpulan" : "Kumpulkan Tugas"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {show && (
        <Modal title={"Kumpulkan: " + form.judul} onClose={() => setShow(false)} wide>
          <form onSubmit={simpan}>
            <Notice msg={msg} />
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-slate-600">Metode Pengumpulan</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ k: "link", label: "Kirim Link", desc: "Google Drive / Docs / dsb." }, { k: "file", label: "Kirim File (PDF)", desc: "Unggah berkas PDF" }].map((m) => (
                  <button key={m.k} type="button" onClick={() => setForm({ ...form, tipe_pengumpulan: m.k, file_url: "" })}
                    className={"rounded-xl border p-4 text-left transition " + (form.tipe_pengumpulan === m.k ? "border-brand bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50")}>
                    <p className={"text-sm font-semibold " + (form.tipe_pengumpulan === m.k ? "text-brand-dark" : "text-slate-700")}>{m.label}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {form.tipe_pengumpulan === "link" ? (
              <Field label="Link Tugas" required>
                <input required className={inputCls} placeholder="https://drive.google.com/..." value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
              </Field>
            ) : (
              <Field label="File PDF" required>
                <input ref={fileRef} type="file" accept="application/pdf" className={inputCls} onChange={pilihFile} />
                {form.file_url && <p className="mt-1 text-xs text-brand-dark">File: {form.file_url}</p>}
              </Field>
            )}

            <div className="mt-4">
              <Field label="Catatan / Jawaban (opsional)">
                <textarea rows={3} className={inputCls} placeholder="Tambahkan catatan untuk guru..." value={form.jawaban_teks} onChange={(e) => setForm({ ...form, jawaban_teks: e.target.value })} />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Mengirim..." : "Kumpulkan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

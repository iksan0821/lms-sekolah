"use client";

import { useEffect, useState } from "react";
import { PageTitle, Loading, Table, EmptyRow, Notice, Modal, Field, inputCls } from "@/components/guru-ui";

const empty = { id: null, judul: "", deskripsi: "", tipe: "tugas", mapel_id: "", kelas_id: "", deadline: "" };
const emptySoal = { id: null, tugas_id: null, pertanyaan: "", pilihan_a: "", pilihan_b: "", pilihan_c: "", pilihan_d: "", jawaban_benar: "A" };

const TIPE_BADGE = {
  tugas: "bg-slate-100 text-slate-600",
  ulangan: "bg-brand-50 text-brand-dark",
  latihan: "bg-amber-100 text-amber-700",
};

export default function TugasGuru() {
  const [rows, setRows] = useState([]);
  const [opsi, setOpsi] = useState({ kelas: [], mapel: [] });
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  // Kelola soal pilihan ganda milik satu tugas
  const [tugasSoal, setTugasSoal] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [soalForm, setSoalForm] = useState(emptySoal);
  const [showSoal, setShowSoal] = useState(false);
  const [msgSoal, setMsgSoal] = useState(null);
  const [savingSoal, setSavingSoal] = useState(false);

  async function load() {
    setLoading(true);
    const [r1, r2] = await Promise.all([
      fetch("/api/guru?bagian=tugas").then((r) => r.json()),
      fetch("/api/guru?bagian=opsi").then((r) => r.json()),
    ]);
    setRows(r1.data || []);
    setOpsi(r2.data || { kelas: [], mapel: [] });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function muatSoalTugas(t) {
    setTugasSoal(t);
    setMsgSoal(null);
    const r = await fetch(`/api/guru?bagian=soal-tugas&tugas_id=${t.id}`);
    const d = await r.json();
    setSoalList(d.success ? d.data || [] : []);
  }

  function tambahSoal() {
    setSoalForm({ ...emptySoal, tugas_id: tugasSoal.id });
    setMsgSoal(null);
    setShowSoal(true);
  }

  function editSoal(s) {
    setSoalForm({
      id: s.id, tugas_id: tugasSoal.id, pertanyaan: s.pertanyaan,
      pilihan_a: s.pilihan_a || "", pilihan_b: s.pilihan_b || "",
      pilihan_c: s.pilihan_c || "", pilihan_d: s.pilihan_d || "",
      jawaban_benar: s.jawaban_benar || "A",
    });
    setMsgSoal(null);
    setShowSoal(true);
  }

  async function simpanSoal(e) {
    e.preventDefault();
    setSavingSoal(true);
    const isEdit = !!soalForm.id;
    const res = await fetch("/api/guru/soal", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(soalForm),
    });
    const d = await res.json();
    setSavingSoal(false);
    if (!d.success) { setMsgSoal({ type: "error", text: d.message }); return; }
    setShowSoal(false);
    setMsgSoal({ type: "success", text: d.message });
    await muatSoalTugas(tugasSoal);
    load();
  }

  async function hapusSoal(s) {
    if (!confirm("Hapus soal ini?")) return;
    const res = await fetch("/api/guru/soal?id=" + s.id, { method: "DELETE" });
    const d = await res.json();
    setMsgSoal({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) { await muatSoalTugas(tugasSoal); load(); }
  }

  function bukaTambah() { setForm(empty); setMsg(null); setShow(true); }
  function bukaEdit(t) {
    setForm({
      id: t.id, judul: t.judul, deskripsi: t.deskripsi || "", tipe: t.tipe || "tugas",
      mapel_id: t.mapel_id || "", kelas_id: t.kelas_id || "",
      deadline: t.deadline ? String(t.deadline).replace(" ", "T").slice(0, 16) : "",
    });
    setMsg(null); setShow(true);
  }

  async function simpan(e) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!form.id;
    const res = await fetch("/api/guru/tugas", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (!d.success) { setMsg({ type: "error", text: d.message }); return; }
    setShow(false); setMsg({ type: "success", text: d.message }); load();
  }

  async function hapus(t) {
    if (!confirm("Hapus " + t.judul + "?")) return;
    const res = await fetch("/api/guru/tugas?id=" + t.id, { method: "DELETE" });
    const d = await res.json();
    setMsg({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Buat Tugas & Ulangan" subtitle="Buat tugas/ulangan yang akan dikerjakan siswa pada kelas tujuan." action="+ Buat Tugas" onAction={bukaTambah} />
      <Notice msg={msg} onClose={() => setMsg(null)} />

      {loading ? (
        <Loading />
      ) : (
        <Table columns={["Judul", "Tipe", "Mapel", "Kelas", "Deadline", "Soal", "Terkumpul", "Aksi"]}>
          {rows.length ? (
            rows.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{t.judul}</p>
                  <p className="text-xs text-slate-400">{t.deskripsi || "-"}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={"rounded-md px-2 py-0.5 text-xs font-medium capitalize " + (TIPE_BADGE[t.tipe] || TIPE_BADGE.tugas)}>{t.tipe}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{t.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{t.deadline || "-"}</td>
                <td className="px-4 py-3">
                  <span className={"rounded-md px-2 py-0.5 text-xs font-semibold " + (t.jumlah_soal > 0 ? "bg-brand-50 text-brand-dark" : "bg-slate-100 text-slate-500")}>
                    {t.jumlah_soal || 0} soal
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{t.jumlah_terkumpul}/{t.jumlah_siswa}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => muatSoalTugas(t)} className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">Kelola Soal</button>
                    <button onClick={() => bukaEdit(t)} className="rounded-md border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                    <button onClick={() => hapus(t)} className="rounded-md border-rose-100 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={8} text="Belum ada tugas. Klik Buat Tugas." />
          )}
        </Table>
      )}

      {show && (
        <Modal title={form.id ? "Edit Tugas" : "Buat Tugas Baru"} onClose={() => setShow(false)} wide>
          <form onSubmit={simpan}>
            <Notice msg={msg} onClose={() => setMsg(null)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Judul" required>
                <input required className={inputCls} placeholder="cth: Latihan Bab 1" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
              </Field>
              <Field label="Tipe" required>
                <select className={inputCls} value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
                  <option value="tugas">Tugas (dikerjakan di rumah)</option>
                  <option value="ulangan">Ulangan (dikerjakan langsung)</option>
                  <option value="latihan">Latihan Soal</option>
                </select>
              </Field>
              <Field label="Deadline">
                <input type="datetime-local" className={inputCls} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </Field>
              <Field label="Mata Pelajaran">
                <select className={inputCls} value={form.mapel_id} onChange={(e) => setForm({ ...form, mapel_id: e.target.value })}>
                  <option value="">-- Pilih Mapel --</option>
                  {opsi.mapel.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </Field>
              <Field label="Kelas Tujuan" required>
                <select required className={inputCls} value={form.kelas_id} onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}>
                  <option value="">-- Pilih Kelas --</option>
                  {opsi.kelas.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Deskripsi / Instruksi">
                  <textarea rows={4} className={inputCls} placeholder="Tulis instruksi tugas di sini..." value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
                </Field>
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-dark">
              Tugas ini akan muncul di dashboard siswa yang berada di kelas tujuan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}

      {tugasSoal && (
        <Modal title={"Kelola Soal: " + tugasSoal.judul} onClose={() => setTugasSoal(null)} wide>
          <Notice msg={msgSoal} onClose={() => setMsgSoal(null)} />
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">{soalList.length} soal tersedia</span>
            <button onClick={tambahSoal} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600">+ Tambah Soal</button>
          </div>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto">
            {soalList.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Belum ada soal. Klik Tambah Soal untuk membuat pertanyaan pertama.</p>
            ) : (
              soalList.map((s, i) => (
                <div key={s.id} className="rounded-xl border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">{i + 1}. {s.pertanyaan}</p>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => editSoal(s)} className="rounded-md border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-white">Edit</button>
                      <button onClick={() => hapusSoal(s)} className="rounded-md border-rose-100 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50">Hapus</button>
                    </div>
                  </div>
                  <div className="mt-2 grid-cols-2 gap-1 text-xs text-slate-500">
                    {["A", "B", "C", "D"].map((k) => (
                      <span key={k} className={s.jawaban_benar === k ? "font-semibold text-brand-dark" : ""}>
                        {k}. {s["pilihan_" + k.toLowerCase()]}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Jawaban benar: <b className="text-brand-dark">{s.jawaban_benar}</b></p>
                </div>
              ))
            )}
          </div>
          <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-dark">
            Siswa dapat mengerjakan seluruh soal tugas ini sekaligus, bukan hanya satu soal.
          </p>
        </Modal>
      )}

      {showSoal && (
        <Modal title={soalForm.id ? "Edit Soal" : "Tambah Soal Baru"} onClose={() => setShowSoal(false)} wide>
          <form onSubmit={simpanSoal}>
            <Notice msg={msgSoal} onClose={() => setMsgSoal(null)} />
            <div className="space-y-4">
              <Field label="Pertanyaan" required>
                <textarea required rows={3} className={inputCls} placeholder="Tulis pertanyaan di sini..." value={soalForm.pertanyaan} onChange={(e) => setSoalForm({ ...soalForm, pertanyaan: e.target.value })} />
              </Field>
              {["a", "b", "c", "d"].map((k) => (
                <Field key={k} label={"Pilihan " + k.toUpperCase()} required>
                  <input required className={inputCls} value={soalForm["pilihan_" + k]} onChange={(e) => setSoalForm({ ...soalForm, ["pilihan_" + k]: e.target.value })} />
                </Field>
              ))}
              <Field label="Jawaban Benar" required>
                <div className="flex gap-2">
                  {["A", "B", "C", "D"].map((j) => (
                    <button type="button" key={j} onClick={() => setSoalForm({ ...soalForm, jawaban_benar: j })}
                      className={"h-10 w-10 rounded-lg text-sm font-bold transition " + (soalForm.jawaban_benar === j ? "bg-brand text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}>
                      {j}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowSoal(false)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={savingSoal} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{savingSoal ? "Menyimpan..." : "Simpan Soal"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

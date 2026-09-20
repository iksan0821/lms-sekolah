"use client";

import { useEffect, useState } from "react";
import { PageTitle, Loading, Table, EmptyRow, Notice, Modal, Field, inputCls, RowActions } from "@/components/guru-ui";

const empty = { id: null, judul: "", deskripsi: "", tipe: "tugas", mapel_id: "", kelas_id: "", deadline: "" };

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
        <Table columns={["Judul", "Tipe", "Mapel", "Kelas", "Deadline", "Terkumpul", "Aksi"]}>
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
                <td className="px-4 py-3 text-slate-600">{t.jumlah_terkumpul}/{t.jumlah_siswa}</td>
                <td className="px-4 py-3"><RowActions onEdit={() => bukaEdit(t)} onDelete={() => hapus(t)} /></td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={7} text="Belum ada tugas. Klik Buat Tugas." />
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
    </div>
  );
}

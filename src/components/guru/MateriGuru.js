"use client";

import { useEffect, useState } from "react";
import { PageTitle, Card, Loading, Table, EmptyRow, Notice, Modal, Field, inputCls, RowActions } from "@/components/guru-ui";

const empty = { id: null, judul: "", deskripsi: "", tipe: "teks", mapel_id: "", kelas_id: "", file_url: "" };

export default function MateriGuru() {
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
      fetch("/api/guru?bagian=materi").then((r) => r.json()),
      fetch("/api/guru?bagian=opsi").then((r) => r.json()),
    ]);
    setRows(r1.data || []);
    setOpsi(r2.data || { kelas: [], mapel: [] });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function bukaTambah() { setForm(empty); setMsg(null); setShow(true); }
  function bukaEdit(m) {
    setForm({ id: m.id, judul: m.judul, deskripsi: m.deskripsi || "", tipe: m.tipe || "teks", mapel_id: m.mapel_id || "", kelas_id: m.kelas_id || "", file_url: m.file_url || "" });
    setMsg(null); setShow(true);
  }

  async function simpan(e) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!form.id;
    const res = await fetch("/api/guru/materi", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (!d.success) { setMsg({ type: "error", text: d.message }); return; }
    setShow(false); setMsg({ type: "success", text: d.message }); load();
  }

  async function hapus(m) {
    if (!confirm(`Hapus materi "${m.judul}"?`)) return;
    const res = await fetch(`/api/guru/materi?id=${m.id}`, { method: "DELETE" });
    const d = await res.json();
    setMsg({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Upload Materi" subtitle="Unggah materi pembelajaran untuk kelas yang Anda ajar." action="+ Tambah Materi" onAction={bukaTambah} />
      <Notice msg={msg} onClose={() => setMsg(null)} />

      {loading ? (
        <Loading />
      ) : (
        <Table columns={["Judul", "Tipe", "Mapel", "Kelas", "Dibuat", "Aksi"]}>
          {rows.length ? (
            rows.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{m.judul}</p>
                  <p className="text-xs text-slate-400">{m.deskripsi || "-"}</p>
                </td>
                <td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">{m.tipe}</span></td>
                <td className="px-4 py-3 text-slate-600">{m.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{m.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{m.created_at}</td>
                <td className="px-4 py-3"><RowActions onEdit={() => bukaEdit(m)} onDelete={() => hapus(m)} /></td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={6} text="Belum ada materi. Klik Tambah Materi." />
          )}
        </Table>
      )}

      {show && (
        <Modal title={form.id ? "Edit Materi" : "Tambah Materi"} onClose={() => setShow(false)} wide>
          <form onSubmit={simpan}>
            <Notice msg={msg} onClose={() => setMsg(null)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Judul Materi" required>
                <input required className={inputCls} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
              </Field>
              <Field label="Tipe Konten">
                <select className={inputCls} value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
                  <option value="teks">Teks</option>
                  <option value="file">File (PDF/DOC)</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </Field>
              <Field label="Mata Pelajaran">
                <select className={inputCls} value={form.mapel_id} onChange={(e) => setForm({ ...form, mapel_id: e.target.value })}>
                  <option value="">-- Pilih Mapel --</option>
                  {opsi.mapel.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </Field>
              <Field label="Kelas">
                <select className={inputCls} value={form.kelas_id} onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}>
                  <option value="">-- Pilih Kelas --</option>
                  {opsi.kelas.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </Field>
              <Field label="Link / Nama File">
                <input className={inputCls} placeholder="cth: materi-aljabar.pdf atau https://..." value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
              </Field>
              <Field label="Deskripsi">
                <textarea rows={3} className={inputCls} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

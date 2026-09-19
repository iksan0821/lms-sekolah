"use client";

import { useEffect, useState } from "react";
import { Field, ModalShell, Notice, PageHeader, RowActions, inputStyle } from "@/components/crud-ui";

const emptyForm = {
  id: null,
  nama: "",
  tingkat: "10",
  jurusan_id: "",
  wali_kelas_id: "",
  tahun_ajaran: "",
};

export default function KelasClient() {
  const [rows, setRows] = useState([]);
  const [opsi, setOpsi] = useState({ jurusan: [], guru: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/kelas");
    const data = await res.json();
    setRows(data.data || []);
    setOpsi(data.opsi || { jurusan: [], guru: [] });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setNotice(null);
    setShowModal(true);
  }

  function openEdit(r) {
    setForm({
      id: r.id,
      nama: r.nama,
      tingkat: r.tingkat,
      jurusan_id: r.jurusan_id || "",
      wali_kelas_id: r.wali_kelas_id || "",
      tahun_ajaran: r.tahun || "",
    });
    setNotice(null);
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!form.id;
    const res = await fetch(isEdit ? `/api/admin/kelas/${form.id}` : "/api/admin/kelas", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.success) {
      setNotice({ type: "error", text: data.message });
      return;
    }
    setShowModal(false);
    setNotice({ type: "success", text: data.message });
    load();
    setTimeout(() => setNotice(null), 3000);
  }

  async function remove(r) {
    if (!confirm(`Hapus kelas "${r.nama}"?`)) return;
    const res = await fetch(`/api/admin/kelas/${r.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) alert(data.message);
    else {
      setNotice({ type: "success", text: data.message });
      load();
      setTimeout(() => setNotice(null), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Kelas"
        subtitle="Kelola data kelas, jurusan, dan wali kelas."
        actionLabel="+ Tambah Kelas"
        onAction={openCreate}
      />

      <Notice msg={notice} />

      <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama Kelas</th>
                <th className="px-4 py-3">Tingkat</th>
                <th className="px-4 py-3">Jurusan</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Belum ada data.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-brand-50/40">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.nama}</td>
                  <td className="px-4 py-3 text-slate-600">{r.tingkat}</td>
                  <td className="px-4 py-3 text-slate-600">{r.jurusan || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.wali || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.tahun || "-"}</td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalShell title={form.id ? "Edit Kelas" : "Tambah Kelas"} onClose={() => setShowModal(false)}>
          <form onSubmit={save}>
            <Notice msg={notice} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama Kelas" required>
                <input required style={inputStyle} placeholder="cth: X PPLG" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
              </Field>
              <Field label="Tingkat" required>
                <select style={inputStyle} value={form.tingkat} onChange={(e) => setForm({ ...form, tingkat: e.target.value })}>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </Field>
              <Field label="Jurusan">
                <select style={inputStyle} value={form.jurusan_id} onChange={(e) => setForm({ ...form, jurusan_id: e.target.value })}>
                  <option value="">-- Tanpa Jurusan --</option>
                  {opsi.jurusan.map((j) => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </Field>
              <Field label="Wali Kelas">
                <select style={inputStyle} value={form.wali_kelas_id} onChange={(e) => setForm({ ...form, wali_kelas_id: e.target.value })}>
                  <option value="">-- Tanpa Wali --</option>
                  {opsi.guru.map((g) => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tahun Ajaran">
                <input
                  style={inputStyle}
                  placeholder="cth: 2024/2025"
                  value={form.tahun_ajaran}
                  onChange={(e) => setForm({ ...form, tahun_ajaran: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Batal
              </button>
              <button type="submit" disabled={saving} className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}

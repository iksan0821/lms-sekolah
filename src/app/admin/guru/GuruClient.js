"use client";

import { useEffect, useState } from "react";
import { Field, ModalShell, Notice, PageHeader, RowActions, inputStyle } from "@/components/crud-ui";

const emptyForm = {
  id: null,
  nama: "",
  username: "",
  email: "",
  password: "",
  nip: "",
  jenis_kelamin: "L",
  no_telepon: "",
  status: "aktif",
};

export default function GuruClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/guru");
    const data = await res.json();
    setRows(data.data || []);
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
      username: r.username,
      email: r.email || "",
      password: "",
      nip: r.nip || "",
      jenis_kelamin: r.jenis_kelamin || "L",
      no_telepon: r.no_telepon || "",
      status: r.status,
    });
    setNotice(null);
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!form.id;
    const res = await fetch(isEdit ? `/api/admin/guru/${form.id}` : "/api/admin/guru", {
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
    if (!confirm(`Hapus guru "${r.nama}"?`)) return;
    const res = await fetch(`/api/admin/guru/${r.id}`, { method: "DELETE" });
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
        title="Data Guru"
        subtitle="Kelola data guru pengajar (tambah, edit, hapus)."
        actionLabel="+ Tambah Guru"
        onAction={openCreate}
      />

      <Notice msg={notice} />

      <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">JK</th>
                <th className="px-4 py-3">No. Telepon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Belum ada data.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{r.nama}</p>
                    <p className="text-xs text-slate-400">{r.email || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.nip || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.username}</td>
                  <td className="px-4 py-3 text-slate-600">{r.jenis_kelamin || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.no_telepon || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${r.status === "aktif" ? "text-brand" : "text-slate-400"}`}>
                        {r.status}
                    </span>
                  </td>
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
        <ModalShell title={form.id ? "Edit Guru" : "Tambah Guru"} onClose={() => setShowModal(false)}>
          <form onSubmit={save}>
            <Notice msg={notice} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" required>
                <input required style={inputStyle} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
              </Field>
              <Field label="NIP">
                <input style={inputStyle} value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} />
              </Field>
              <Field label="Username" required>
                <input required style={inputStyle} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </Field>
              <Field label="Email">
                <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label={form.id ? "Password (kosongkan bila tidak ganti)" : "Password"} required={!form.id}>
                <input type="password" required={!form.id} style={inputStyle} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Field>
              <Field label="Jenis Kelamin">
                <select style={inputStyle} value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </Field>
              <Field label="No. Telepon">
                <input style={inputStyle} value={form.no_telepon} onChange={(e) => setForm({ ...form, no_telepon: e.target.value })} />
              </Field>
              <Field label="Status">
                <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
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

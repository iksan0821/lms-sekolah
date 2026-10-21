"use client";

import { useEffect, useState } from "react";
import { Field, ModalShell, Notice, PageHeader, RowActions } from "@/components/crud-ui";

const emptyForm = { id: null, kode: "", nama: "" };

export default function JurusanClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/jurusan");
    const data = await res.json();
    setRows(data.data || []);
    setLoading(false);
  }

  // Muat data saat komponen pertama kali dirender
  useEffect(() => {
    let batal = false;
    (async () => {
      const res = await fetch("/api/admin/jurusan");
      const data = await res.json();
      if (!batal) {
        setRows(data.data || []);
        setLoading(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setNotice(null);
    setShowModal(true);
  }

  function openEdit(r) {
    setForm({ id: r.id, kode: r.kode, nama: r.nama });
    setNotice(null);
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!form.id;
    const res = await fetch(isEdit ? `/api/admin/jurusan/${form.id}` : "/api/admin/jurusan", {
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
    if (!confirm(`Hapus jurusan "${r.nama}"? Kelas terkait tidak ikut terhapus.`)) return;
    const res = await fetch(`/api/admin/jurusan/${r.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      setNotice({ type: "error", text: data.message });
      return;
    }
    setNotice({ type: "success", text: data.message });
    load();
    setTimeout(() => setNotice(null), 3000);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Manajemen Jurusan"
        subtitle="Kelola jurusan seperti PPLG, TJKT, DKV, dan lainnya."
        actionLabel="+ Tambah Jurusan"
        onAction={openCreate}
      />

      <Notice msg={notice} />

      <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Jurusan</th>
                <th className="px-4 py-3">Jumlah Kelas</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-dark">
                        {r.kode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.nama}</td>
                    <td className="px-4 py-3 text-slate-600">{r.jumlah_kelas}</td>
                    <td className="px-4 py-3">
                      <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalShell title={form.id ? "Edit Jurusan" : "Tambah Jurusan"} onClose={() => setShowModal(false)}>
          <form onSubmit={save}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Kode Jurusan" required>
                <input
                  required
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  placeholder="cth: PPLG"
                  style={inputStyle}
                />
              </Field>
              <Field label="Nama Jurusan" required>
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="cth: Pengembangan Perangkat Lunak dan Gim"
                  style={inputStyle}
                />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}

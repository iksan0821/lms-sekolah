"use client";

import { useEffect, useState } from "react";

const ROLES = [
  { slug: "admin", nama: "Administrator" },
  { slug: "kepsek", nama: "Kepala Sekolah" },
  { slug: "kurikulum", nama: "Kurikulum" },
  { slug: "guru", nama: "Guru" },
  { slug: "siswa", nama: "Siswa" },
];

const BADGE = {
  admin: "bg-brand-100 text-brand-dark",
  kepsek: "bg-amber-100 text-amber-700",
  kurikulum: "bg-amber-100 text-amber-700",
  guru: "bg-slate-100 text-slate-600",
  siswa: "bg-slate-100 text-slate-600",
};

const emptyForm = {
  id: null,
  nama: "",
  username: "",
  email: "",
  password: "",
  role: "siswa",
  nip: "",
  nis: "",
  jenis_kelamin: "L",
  no_telepon: "",
  status: "aktif",
};

export default function UsersClient({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterRole) params.set("role", filterRole);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole]);

  function openCreate() {
    setForm(emptyForm);
    setMsg(null);
    setShowModal(true);
  }

  function openEdit(u) {
    setForm({
      id: u.id,
      nama: u.nama,
      username: u.username,
      email: u.email || "",
      password: "",
      role: u.role,
      nip: u.nip || "",
      nis: u.nis || "",
      jenis_kelamin: u.jenis_kelamin || "L",
      no_telepon: u.no_telepon || "",
      status: u.status,
    });
    setMsg(null);
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const isEdit = !!form.id;
    const res = await fetch(
      isEdit ? `/api/admin/users/${form.id}` : "/api/admin/users",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();
    setSaving(false);
    if (!data.success) {
      setMsg({ type: "error", text: data.message });
      return;
    }
    setShowModal(false);
    load();
  }

  async function remove(u) {
    if (!confirm(`Hapus user "${u.nama}"?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) alert(data.message);
    else load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola akun admin, kepsek, kurikulum, guru, dan siswa.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:brightness-110"
        >
          + Tambah User
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Cari nama / username / email..."
          className="w-full rounded-lg border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-72"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">Semua Role</option>
          {ROLES.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.nama}
            </option>
          ))}
        </select>
        <button
          onClick={load}
          className="rounded-lg border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cari
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{u.nama}</p>
                      <p className="text-xs text-slate-400">
                        {u.email || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.username}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          BADGE[u.role] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.role_nama}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.no_telepon || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          u.status === "aktif"
                            ? "text-brand"
                            : "text-slate-400"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-md border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(u)}
                          disabled={u.id === currentUserId}
                          className="rounded-md border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              {form.id ? "Edit User" : "Tambah User"}
            </h2>

            {msg?.type === "error" && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {msg.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap *">
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Username *">
                <input
                  required
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="input"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label={form.id ? "Password (kosongkan bila tidak ganti)" : "Password *"}>
                <input
                  type="password"
                  required={!form.id}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="input"
                />
              </Field>
              <Field label="Role *">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input"
                >
                  {ROLES.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jenis Kelamin">
                <select
                  value={form.jenis_kelamin}
                  onChange={(e) =>
                    setForm({ ...form, jenis_kelamin: e.target.value })
                  }
                  className="input"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </Field>
              <Field label="NIP (guru/staf)">
                <input
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="NIS (siswa)">
                <input
                  value={form.nis}
                  onChange={(e) => setForm({ ...form, nis: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="No. Telepon">
                <input
                  value={form.no_telepon}
                  onChange={(e) =>
                    setForm({ ...form, no_telepon: e.target.value })
                  }
                  className="input"
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
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
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #cbd5e1;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

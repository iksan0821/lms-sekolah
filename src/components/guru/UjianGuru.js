"use client";

import { useEffect, useState } from "react";
import { PageTitle, Loading, Table, EmptyRow, Notice, Modal, Field, inputCls } from "@/components/guru-ui";

const emptyU = { id: null, judul: "", mapel_id: "", kelas_id: "", tanggal_mulai: "", durasi_menit: "", status: "draft" };
const emptyS = { id: null, ujian_id: null, pertanyaan: "", pilihan_a: "", pilihan_b: "", pilihan_c: "", pilihan_d: "", jawaban_benar: "A" };

function StatusBadge({ s }) {
  const map = { draft: "bg-slate-100 text-slate-500", berlangsung: "bg-amber-100 text-amber-700", selesai: "bg-brand-50 text-brand-dark" };
  return <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (map[s] || "")}>{s}</span>;
}

export default function UjianGuru() {
  const [rows, setRows] = useState([]);
  const [opsi, setOpsi] = useState({ kelas: [], mapel: [] });
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(emptyU);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Kelola soal
  const [soalFor, setSoalFor] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [soalForm, setSoalForm] = useState(emptyS);
  const [showSoal, setShowSoal] = useState(false);
  const [msgSoal, setMsgSoal] = useState(null);

  async function load() {
    setLoading(true);
    const [r1, r2] = await Promise.all([
      fetch("/api/guru?bagian=ujian").then((r) => r.json()),
      fetch("/api/guru?bagian=opsi").then((r) => r.json()),
    ]);
    setRows(r1.data || []);
    setOpsi(r2.data || { kelas: [], mapel: [] });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function bukaTambah() { setForm(emptyU); setMsg(null); setShow(true); }
  function bukaEdit(u) {
    setForm({
      id: u.id, judul: u.judul, mapel_id: u.mapel_id || "", kelas_id: u.kelas_id || "",
      tanggal_mulai: u.tanggal_mulai ? String(u.tanggal_mulai).replace(" ", "T").slice(0, 16) : "",
      durasi_menit: u.durasi_menit || "", status: u.status || "draft",
    });
    setMsg(null); setShow(true);
  }

  async function simpan(e) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!form.id;
    const res = await fetch("/api/guru/ujian", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (!d.success) { setMsg({ type: "error", text: d.message }); return; }
    setShow(false);
    setMsg({ type: "success", text: d.message + " Sekarang tambahkan soal agar bisa dikerjakan siswa." });
    await load();
    // Langsung buka kelola soal untuk ujian yang baru dibuat/diedit
    const ujianBaru = { id: d.id || form.id, judul: form.judul, jumlah_soal: 0 };
    if (ujianBaru.id) {
      setSoalFor(ujianBaru);
      await muatSoal(ujianBaru.id);
    }
  }

  async function hapus(u) {
    if (!confirm("Hapus ujian " + u.judul + " beserta semua soalnya?")) return;
    const res = await fetch("/api/guru/ujian?id=" + u.id, { method: "DELETE" });
    const d = await res.json();
    setMsg({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) load();
  }

  // ---- SOAL ----
  async function muatSoal(ujianId) {
    const r = await fetch("/api/guru?bagian=soal&ujian_id=" + ujianId);
    const d = await r.json();
    setSoalList(d.data || []);
  }
  async function bukaSoal(u) {
    setSoalFor(u);
    setMsgSoal(null);
    await muatSoal(u.id);
  }
  function tambahSoal() { setSoalForm({ ...emptyS, ujian_id: soalFor.id }); setShowSoal(true); }
  function editSoal(s) { setSoalForm({ ...s }); setShowSoal(true); }

  async function simpanSoal(e) {
    e.preventDefault();
    const isEdit = !!soalForm.id;
    const res = await fetch("/api/guru/soal", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(soalForm),
    });
    const d = await res.json();
    if (!d.success) { setMsgSoal({ type: "error", text: d.message }); return; }
    setShowSoal(false);
    setMsgSoal({ type: "success", text: d.message });
    // Perbarui daftar soal & status ujian di tabel
    await muatSoal(soalFor.id);
    load();
  }
  async function hapusSoal(s) {
    if (!confirm("Hapus soal ini?")) return;
    const res = await fetch("/api/guru/soal?id=" + s.id, { method: "DELETE" });
    const d = await res.json();
    setMsgSoal({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) { await muatSoal(soalFor.id); load(); }
  }

  const siapDikerjakan = (u) => u.status !== "draft" && u.jumlah_soal > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Latihan Soal / Ujian" subtitle="Buat ujian & soal pilihan ganda yang bisa dikerjakan siswa." action="+ Buat Ujian" onAction={bukaTambah} />
      <Notice msg={msg} onClose={() => setMsg(null)} />

      {loading ? (
        <Loading />
      ) : (
        <Table columns={["Judul Ujian", "Mapel", "Kelas", "Mulai", "Jumlah Soal", "Status", "Siap?", "Aksi"]}>
          {rows.length ? (
            rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">{u.judul}</td>
                <td className="px-4 py-3 text-slate-600">{u.mapel || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.kelas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{u.tanggal_mulai || "-"}</td>
                <td className="px-4 py-3">
                  <span className={"rounded-md px-2 py-0.5 text-xs font-semibold " + (u.jumlah_soal > 0 ? "bg-brand-50 text-brand-dark" : "bg-rose-50 text-rose-600")}>
                    {u.jumlah_soal} soal
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge s={u.status} /></td>
                <td className="px-4 py-3">
                  {siapDikerjakan(u)
                    ? <span className="text-xs font-semibold text-brand-dark">Ya</span>
                    : <span className="text-xs font-semibold text-rose-500">Belum</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => bukaSoal(u)} className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">Kelola Soal</button>
                    <button onClick={() => bukaEdit(u)} className="rounded-md border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                    <button onClick={() => hapus(u)} className="rounded-md border-rose-100 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={8} text="Belum ada ujian. Klik Buat Ujian." />
          )}
        </Table>
      )}

      {show && (
        <Modal title={form.id ? "Edit Ujian" : "Buat Ujian / Latihan Soal"} onClose={() => setShow(false)} wide>
          <form onSubmit={simpan}>
            <Notice msg={msg} onClose={() => setMsg(null)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Judul Ujian" required>
                <input required className={inputCls} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft (belum dibuka)</option>
                  <option value="berlangsung">Berlangsung</option>
                  <option value="selesai">Selesai</option>
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
              <Field label="Tanggal Mulai">
                <input type="datetime-local" className={inputCls} value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} />
              </Field>
              <Field label="Durasi (menit)">
                <input type="number" min="0" className={inputCls} value={form.durasi_menit} onChange={(e) => setForm({ ...form, durasi_menit: e.target.value })} />
              </Field>
            </div>
            <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-dark">
              Setelah disimpan, Anda akan langsung diarahkan untuk menambahkan soal pilihan ganda.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan & Lanjut Buat Soal"}</button>
            </div>
          </form>
        </Modal>
      )}

      {soalFor && (
        <Modal title={"Kelola Soal: " + soalFor.judul} onClose={() => setSoalFor(null)} wide>
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
                    <span className={s.jawaban_benar === "A" ? "font-semibold text-brand-dark" : ""}>A. {s.pilihan_a}</span>
                    <span className={s.jawaban_benar === "B" ? "font-semibold text-brand-dark" : ""}>B. {s.pilihan_b}</span>
                    <span className={s.jawaban_benar === "C" ? "font-semibold text-brand-dark" : ""}>C. {s.pilihan_c}</span>
                    <span className={s.jawaban_benar === "D" ? "font-semibold text-brand-dark" : ""}>D. {s.pilihan_d}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Jawaban benar: <b className="text-brand-dark">{s.jawaban_benar}</b></p>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {showSoal && (
        <Modal title={soalForm.id ? "Edit Soal" : "Tambah Soal Baru"} onClose={() => setShowSoal(false)} wide>
          <form onSubmit={simpanSoal}>
            <div className="space-y-4">
              <Field label="Pertanyaan" required>
                <textarea required rows={3} className={inputCls} placeholder="Tulis pertanyaan di sini..." value={soalForm.pertanyaan} onChange={(e) => setSoalForm({ ...soalForm, pertanyaan: e.target.value })} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {["a", "b", "c", "d"].map((o) => (
                  <Field key={o} label={"Pilihan " + o.toUpperCase()} required>
                    <input required className={inputCls} placeholder={"Pilihan " + o.toUpperCase()} value={soalForm["pilihan_" + o]} onChange={(e) => setSoalForm({ ...soalForm, ["pilihan_" + o]: e.target.value })} />
                  </Field>
                ))}
              </div>
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
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowSoal(false)} className="rounded-lg border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Simpan Soal</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader, Notice } from "@/components/crud-ui";

export default function BackupClient() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const linkUnduhRef = useRef(null);

  async function load() {
    const res = await fetch("/api/admin/backup");
    const data = await res.json();
    setFiles(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    let batal = false;
    (async () => {
      const res = await fetch("/api/admin/backup");
      const data = await res.json();
      if (!batal) {
        setFiles(data.data || []);
        setLoading(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  async function buatBackup() {
    setNotice({ type: "success", text: "Membuat backup..." });
    // Unduh otomatis via link; file juga tersimpan di folder /backups
    linkUnduhRef.current?.click();
    setTimeout(() => {
      setNotice({ type: "success", text: "Backup dibuat dan tersimpan di folder /backups." });
      load();
      setTimeout(() => setNotice(null), 4000);
    }, 1500);
  }

  async function hapus(f) {
    if (!confirm(`Hapus backup "${f.nama}"?`)) return;
    const res = await fetch(`/api/admin/backup?file=${encodeURIComponent(f.nama)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setNotice({ type: data.success ? "success" : "error", text: data.message });
    load();
    setTimeout(() => setNotice(null), 3000);
  }

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Backup & Pemulihan"
        subtitle="Cadangkan seluruh data LMS ke file .sql. Untuk pemulihan, impor file .sql ke MySQL (mis. lewat phpMyAdmin)."
        actionLabel="+ Buat Backup Sekarang"
        onAction={buatBackup}
      />

      <Notice msg={notice} />

      {/* Link unduhan tersembunyi untuk memicu download backup */}
      <a
        ref={linkUnduhRef}
        href="/api/admin/backup?download=1"
        className="hidden"
        aria-hidden="true"
      />

      <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama File</th>
                <th className="px-4 py-3">Ukuran</th>
                <th className="px-4 py-3">Dibuat</th>
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
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Belum ada file backup. Klik &quot;Buat Backup Sekarang&quot; untuk membuat.
                  </td>
                </tr>
              ) : (
                files.map((f) => (
                  <tr key={f.nama} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{f.nama}</td>
                    <td className="px-4 py-3 text-slate-600">{kb(f.ukuran)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(f.dibuat).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/api/admin/backup?download=1`}
                          className="rounded-md border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Unduh Terbaru
                        </a>
                        <button
                          onClick={() => hapus(f)}
                          className="rounded-md border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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

      <div className="mt-4 rounded-2xl border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Cara pemulihan:</strong> buka phpMyAdmin (atau MySQL CLI Laragon), pilih database{" "}
        <code>lms_sekolah</code>, lalu impor file <code>.sql</code> hasil backup.
      </div>
    </div>
  );
}

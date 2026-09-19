import { query } from "@/lib/db";

export const metadata = { title: "Pengumuman - LMS Sekolah" };

export default async function PengumumanPage() {
  const rows = await query(
    `SELECT p.judul, p.isi, p.target_role, p.created_at, u.nama AS penulis
     FROM pengumuman p LEFT JOIN users u ON u.id = p.created_by
     ORDER BY p.created_at DESC`
  );
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800">Pengumuman</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">Informasi dan pengumuman sekolah.</p>
      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada pengumuman.</p>
        ) : rows.map((r, i) => (
          <div key={i} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-slate-800">{r.judul}</h2>
              <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-dark">
                {r.target_role}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{r.isi}</p>
            <p className="mt-3 text-xs text-slate-400">
                  {r.penulis || "Sistem"} - {r.created_at}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

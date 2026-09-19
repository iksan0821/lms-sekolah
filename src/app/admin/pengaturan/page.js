export const metadata = { title: "Pengaturan - LMS Sekolah" };

export default function PengaturanPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Informasi konfigurasi aplikasi LMS.
      </p>
      <div className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
        <dl className="divide-y divide-slate-100 text-sm">
          {[
            ["Aplikasi", "LMS Sekolah"],
            ["Framework", "Next.js (App Router)"],
            ["Database", "MySQL / MariaDB (XAMPP)"],
            ["Autentikasi", "JWT Session Cookie"],
            ["Role tersedia", "Admin, Kepsek, Kurikulum, Guru, Siswa"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-3">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

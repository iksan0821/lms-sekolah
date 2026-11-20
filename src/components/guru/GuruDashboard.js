"use client";

import { useGuru, PageTitle, Card, Loading } from "@/components/guru-ui";
import { useBahasa } from "@/lib/i18n";

export default function GuruDashboard({ nama }) {
  const { t } = useBahasa();
  const { data, loading, error } = useGuru("dashboard");
  const sapaan = nama ? nama.split(" ")[0] : "Guru";
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = data
    ? [
      { label: t("kelas diajar"), value: data.jumlahKelas, icon: "🏫" },
      { label: t("total siswa"), value: data.jumlahSiswa, icon: "👥" },
      { label: t("materi"), value: data.jumlahMateri, icon: "📚" },
      { label: t("tugas"), value: data.jumlahTugas, icon: "📝" },
      { label: t("ujian / latihan"), value: data.jumlahUjian, icon: "🧪" },
    ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title={`${t("selamat datang")}, ${sapaan}`} subtitle={today} />
      {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <Card key={s.label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{s.label}</span>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-800">{s.value}</p>
                <div className="mt-3 h-1 w-10 rounded-full bg-brand" />
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Card>
              <h2 className="mb-4 text-base font-semibold text-slate-800">{t("rekap absensi")}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {["hadir", "izin", "sakit", "alpa"].map((st) => {
                  const found = (data.absensi || []).find((a) => a.status === st);
                  return (
                    <div key={st} className="rounded-xl bg-slate-50 p-4 text-center">
                      <p className="text-2xl font-bold text-slate-800">{found ? found.n : 0}</p>
                      <p className="mt-1 text-xs font-medium capitalize text-slate-500">{t(st)}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

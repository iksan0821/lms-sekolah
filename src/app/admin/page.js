import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";

async function getStats() {
  const perRole = await query(
    `SELECT r.slug, r.nama, COUNT(u.id) AS jumlah
     FROM roles r LEFT JOIN users u ON u.role_id = r.id
     GROUP BY r.id ORDER BY r.id`
  );
  const totalUsers = await query("SELECT COUNT(*) AS n FROM users");
  const totalKelas = await query("SELECT COUNT(*) AS n FROM kelas");
  const totalMapel = await query("SELECT COUNT(*) AS n FROM mata_pelajaran");
  const aktivitas = await query(
    `SELECT l.aktivitas, l.created_at, u.nama
     FROM log_aktivitas l LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC LIMIT 6`
  );
  return {
    perRole,
    totalUsers: totalUsers[0].n,
    totalKelas: totalKelas[0].n,
    totalMapel: totalMapel[0].n,
    aktivitas,
  };
}

// Semua bar distribusi pakai SATU warna utama (hijau) - fokus 1 warna
const BAR_COLOR = "bg-brand";

export default async function AdminDashboard() {
  const session = await getSession();
  const { perRole, totalUsers, totalKelas, totalMapel, aktivitas } = await getStats();
  const bySlug = Object.fromEntries(perRole.map((r) => [r.slug, r.jumlah]));
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cards = [
    { label: "Total Pengguna", value: totalUsers, hint: "Semua role", icon: "users" },
    { label: "Total Kelas", value: totalKelas, hint: "Kelas aktif", icon: "class" },
    { label: "Mata Pelajaran", value: totalMapel, hint: "Terdaftar", icon: "book" },
    { label: "Guru", value: bySlug.guru || 0, hint: "Pengajar", icon: "teacher" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Selamat datang, {session?.nama?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{today}</p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:brightness-110"
        >
          + Kelola Pengguna
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {c.label}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand">
                <StatIcon name={c.icon} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-800">{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Distribusi role */}
        <div className="lg:col-span-3 rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            Distribusi Pengguna per Role
          </h2>
          <div className="space-y-4">
            {perRole.map((r) => {
              const pct = totalUsers ? Math.round((r.jumlah / totalUsers) * 100) : 0;
              return (
                <div key={r.slug}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{r.nama}</span>
                    <span className="text-slate-500">
                      {r.jumlah} orang - {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${BAR_COLOR}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aktivitas terbaru */}
        <div className="lg:col-span-2 rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            Aktivitas Terbaru
          </h2>
          {aktivitas.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada aktivitas.</p>
          ) : (
            <ul className="space-y-3">
              {aktivitas.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-light" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">
                      {a.aktivitas}
                    </p>
                    <p className="text-xs text-slate-400">{a.created_at}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Ikon SVG untuk kartu statistik (pengganti emoji agar tampilan lebih rapi)
function StatIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "class":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8M8 11h6" />
        </svg>
      );
    case "teacher":
      return (
        <svg {...common}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    default:
      return null;
  }
}

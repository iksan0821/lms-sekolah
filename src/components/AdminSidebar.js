"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/users", label: "Manajemen User", icon: "users" },
  { href: "/admin/siswa", label: "Data Siswa", icon: "student" },
  { href: "/admin/guru", label: "Data Guru", icon: "teacher" },
  { href: "/admin/kelas", label: "Kelas", icon: "class" },
  { href: "/admin/jurusan", label: "Jurusan", icon: "branch" },
  { href: "/admin/mapel", label: "Mata Pelajaran", icon: "book" },
  { href: "/admin/monitor", label: "Monitor Pembelajaran", icon: "monitor" },
  { href: "/admin/pantau", label: "Pantau Akun", icon: "eye" },
  { href: "/admin/aktivitas", label: "Riwayat Aktivitas", icon: "history" },
  { href: "/admin/laporan", label: "Laporan", icon: "report" },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: "megaphone" },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "settings" },
];

// Menu khusus Super Admin
const MENU_SUPER = [
  { href: "/admin/backup", label: "Backup & Pemulihan", icon: "backup" },
];

function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "users":
    case "student":
    case "teacher":
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
    case "branch":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M6 9v6M9 6h3a3 3 0 0 1 3 3v6" />
        </svg>
      );
    case "monitor":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l4 2" />
        </svg>
      );
    case "report":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
    case "backup":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/masuk");
    router.refresh();
  }

  const semuaMenu = user?.role === "super_admin" ? [...MENU, ...MENU_SUPER] : MENU;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 overflow-y-auto">
      {semuaMenu.map((m) => {
        const active =
          m.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-white/95 text-brand-dark shadow-lg shadow-black/10"
                : "text-brand-50/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className={`transition ${
                active ? "text-brand" : "text-brand-100 group-hover:text-white"
              }`}
            >
              <Icon name={m.icon} />
            </span>
            {m.label}
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-xs font-bold text-white">
            LMS
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Admin Panel
          </span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {open ? "Tutup" : "Menu"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`sidebar-gradient fixed inset-y-0 left-0 z-40 flex w-64 flex-col text-white shadow-2xl shadow-brand-dark/30 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-slate-900">
            LMS
          </div>
          <div>
            <p className="text-sm font-bold text-white">SMK Citra Negara</p>
            <p className="text-xs text-brand-100">Panel Administrator</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">{nav}</div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-slate-900">
              {user?.nama?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.nama || "Admin"}
              </p>
              <p className="truncate text-xs text-brand-100">
                {user?.role_nama || "Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-rose-600 hover:text-white"
          >
            Keluar
          </button>
          <p className="mt-3 text-center text-[11px] text-brand-100/70">
            Dikembangkan oleh <span className="font-semibold text-white">Iksan</span>
          </p>
        </div>
      </aside>

      {/* Overlay mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}

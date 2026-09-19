"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Menu untuk role kepsek & kurikulum (hanya pantau, tanpa CRUD)
function buildMenu(base, role) {
  const menu = [
    { href: base, label: "Dashboard", icon: "grid" },
    { href: `${base}/kinerja-guru`, label: "Kinerja Guru", icon: "teacher" },
    { href: `${base}/tugas-materi`, label: "Tugas & Materi", icon: "book" },
    { href: `${base}/ujian`, label: "Pantau Ujian Online", icon: "exam" },
    { href: `${base}/jadwal`, label: "Pantau Jadwal Pelajaran", icon: "calendar" },
  ];
  if (role === "kurikulum") {
    menu.push({ href: `${base}/nilai`, label: "Download Nilai", icon: "download" });
  }
  return menu;
}

function Icon({ name }) {
  const c = {
    width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "grid":
      return (<svg {...c}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
    case "teacher":
      return (<svg {...c}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>);
    case "book":
      return (<svg {...c}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 7h8M8 11h6" /></svg>);
    case "exam":
      return (<svg {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></svg>);
    case "calendar":
      return (<svg {...c}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
    case "download":
      return (<svg {...c}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></svg>);
    default:
      return null;
  }
}

export default function MonitorSidebar({ user, base }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menu = buildMenu(base, user?.role);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {menu.map((m) => {
        const active = m.href === base ? pathname === base : pathname.startsWith(m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-white/95 text-brand-dark shadow-lg shadow-black/10" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className={active ? "text-brand" : "text-white/70 group-hover:text-white"}>
              <Icon name={m.icon} />
            </span>
            {m.label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">LMS</div>
          <span className="text-sm font-semibold text-slate-800">{user?.role_nama}</span>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          {open ? "Tutup" : "Menu"}
        </button>
      </div>

      <aside
        className={`sidebar-gradient fixed inset-y-0 left-0 z-40 flex w-64 flex-col text-white shadow-2xl transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-slate-900">LMS</div>
          <div>
            <p className="text-sm font-bold text-white">LMS Sekolah</p>
            <p className="text-xs text-white/70">{user?.role_nama}</p>
          </div>
        </div>

        <div className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Mode Pantau
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-2">{nav}</div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-slate-900">
              {user?.nama?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.nama || "User"}</p>
              <p className="truncate text-xs text-white/70">{user?.role_nama}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-rose-600 hover:text-white"
          >
            Keluar
          </button>
        </div>
      </aside>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" />
      )}
    </>
  );
}

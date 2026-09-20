"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const MENU = [
  { href: "/guru", label: "Dashboard", icon: "grid" },
  { href: "/guru/siswa", label: "Siswa di Kelas Saya", icon: "users" },
  { href: "/guru/absensi", label: "Absensi", icon: "calendar-check" },
  { href: "/guru/asesmen", label: "Asesmen", icon: "clipboard" },
  { href: "/guru/materi", label: "Upload Materi", icon: "upload" },
  { href: "/guru/tugas", label: "Buat Tugas", icon: "task" },
  { href: "/guru/ujian", label: "Latihan Soal / Ujian", icon: "exam" },
  { href: "/guru/nilai", label: "Download Nilai", icon: "download" },
];

function Icon({ name }) {
  const c = {
    width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "grid":
      return (<svg {...c}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
    case "users":
      return (<svg {...c}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
    case "calendar-check":
      return (<svg {...c}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></svg>);
    case "clipboard":
      return (<svg {...c}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>);
    case "upload":
      return (<svg {...c}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" /></svg>);
    case "task":
      return (<svg {...c}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>);
    case "exam":
      return (<svg {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></svg>);
    case "download":
      return (<svg {...c}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></svg>);
    default:
      return null;
  }
}

export default function GuruSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {MENU.map((m) => {
        const active = m.href === "/guru" ? pathname === "/guru" : pathname.startsWith(m.href);
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
          <span className="text-sm font-semibold text-slate-800">Panel Guru</span>
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
            <p className="text-xs text-white/70">Panel Guru</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3">{nav}</div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-slate-900">
              {user?.nama?.charAt(0)?.toUpperCase() || "G"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.nama || "Guru"}</p>
              <p className="truncate text-xs text-white/70">{user?.role_nama || "Guru"}</p>
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

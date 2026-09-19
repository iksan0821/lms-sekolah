import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard Guru - LMS Sekolah" };

export default async function guruPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-2xl border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800">
          Dashboard {session.role_nama}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Selamat datang, {session.nama}. Modul ini akan dikembangkan pada tahap berikutnya.
        </p>
        <a
          href="/api/auth/logout"
          className="mt-6 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-dark ring-1 ring-slate-200 transition hover:bg-rose-600 hover:text-white"
        >
          Keluar
        </a>
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, ROLE_HOME } from "@/lib/auth";
import LoginClient from "./LoginClient";

export const metadata = { title: "Masuk - SMK Citra Negara" };

export default async function MasukPage() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] || "/");
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-10">
      {/* Background foto sekolah */}
      <img
        src="/img/sekolah.jpg"
        alt="Gedung dan lapangan SMK Citra Negara"
        width={1024}
        height={768}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Overlay gelap supaya form tetap terbaca */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-900/90 via-brand-800/85 to-slate-900/95" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
        >
          <span aria-hidden="true">&larr;</span> Kembali ke Beranda
        </Link>
        <LoginClient />
      </div>
    </main>
  );
}

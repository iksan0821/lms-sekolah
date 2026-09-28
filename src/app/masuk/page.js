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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-50 px-4 py-10">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-brand-700 transition hover:text-brand-800"
        >
          <span aria-hidden="true">&larr;</span> Kembali ke Beranda
        </Link>
        <LoginClient />
      </div>
    </main>
  );
}

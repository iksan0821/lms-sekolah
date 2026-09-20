import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import GuruSidebar from "@/components/GuruSidebar";

export const metadata = { title: "Panel Guru - LMS Sekolah" };

export default async function GuruLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "guru") {
    const home = { admin: "/admin", kepsek: "/kepsek", kurikulum: "/kurikulum", siswa: "/siswa" };
    redirect(home[session.role] || "/login");
  }
  return (
    <div className="flex min-h-screen bg-slate-50">
      <GuruSidebar user={session} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
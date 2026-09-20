import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SiswaSidebar from "@/components/SiswaSidebar";

export const metadata = { title: "Panel Siswa - LMS Sekolah" };

export default async function SiswaLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "siswa") {
    const home = { admin: "/admin", kepsek: "/kepsek", kurikulum: "/kurikulum", guru: "/guru" };
    redirect(home[session.role] || "/login");
  }
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SiswaSidebar user={session} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

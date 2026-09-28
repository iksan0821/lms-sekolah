import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SiswaSidebar from "@/components/SiswaSidebar";

export const metadata = { title: "Panel Siswa - SMK Citra Negara" };

export default async function SiswaLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "siswa") {
    const home = { admin: "/admin", kepsek: "/kepsek", kurikulum: "/kurikulum", guru: "/guru" };
    redirect(home[session.role] || "/");
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

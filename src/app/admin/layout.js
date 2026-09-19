import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = { title: "Dashboard Admin - LMS Sekolah" };

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") {
    const home = { kepsek: "/kepsek", kurikulum: "/kurikulum", guru: "/guru", siswa: "/siswa" };
    redirect(home[session.role] || "/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={session} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

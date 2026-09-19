import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import MonitorSidebar from "@/components/MonitorSidebar";

// Layout bersama untuk role kepsek & kurikulum.
// Mengunci akses: hanya pemilik role yang boleh masuk ke areanya.
export default async function MonitorLayout({ children, role, base, title }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== role) {
    const home = { admin: "/admin", kepsek: "/kepsek", kurikulum: "/kurikulum", guru: "/guru", siswa: "/siswa" };
    redirect(home[session.role] || "/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MonitorSidebar user={session} base={base} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

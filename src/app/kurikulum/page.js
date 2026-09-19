import { getSession } from "@/lib/auth";
import MonitorDashboard from "@/components/MonitorDashboard";

export default async function DashboardkurikulumPage() {
  const session = await getSession();
  return <MonitorDashboard nama={session?.nama} />;
}
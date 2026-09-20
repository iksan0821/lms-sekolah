import { getSession } from "@/lib/auth";
import GuruDashboard from "@/components/guru/GuruDashboard";

export default async function Page() {
  const session = await getSession();
  return <GuruDashboard nama={session?.nama} />;
}
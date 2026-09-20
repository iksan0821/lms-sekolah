import { getSession } from "@/lib/auth";
import SiswaDashboard from "@/components/siswa/SiswaDashboard";

export default async function Page() {
  const session = await getSession();
  return <SiswaDashboard nama={session?.nama} />;
}

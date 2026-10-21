import { getSession } from "@/lib/auth";
import PengaturanClient from "./PengaturanClient";

export const metadata = { title: "Pengaturan - SMK Citra Negara" };

export default async function PengaturanPage() {
  const session = await getSession();
  return <PengaturanClient isSuperAdmin={session?.role === "super_admin"} />;
}

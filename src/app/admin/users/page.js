import { getSession } from "@/lib/auth";
import UsersClient from "./UsersClient";

export const metadata = { title: "Manajemen User - SMK Citra Negara" };

export default async function UsersPage() {
  const session = await getSession();
  return <UsersClient currentUserId={session?.id} />;
}

import { getSession } from "@/lib/auth";
import UsersClient from "./UsersClient";

export const metadata = { title: "Manajemen User - LMS Sekolah" };

export default async function UsersPage() {
  const session = await getSession();
  return <UsersClient currentUserId={session?.id} />;
}

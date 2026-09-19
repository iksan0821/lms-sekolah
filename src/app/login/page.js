import { redirect } from "next/navigation";
import { getSession, ROLE_HOME } from "@/lib/auth";
import LoginClient from "./LoginClient";

export const metadata = { title: "Masuk - LMS Sekolah" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] || "/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-10">
      <LoginClient />
    </main>
  );
}

import { redirect } from "next/navigation";
import { getSession, ROLE_HOME } from "@/lib/auth";

// Halaman /login lama, dipertahankan agar tautan lama tidak rusak.
// Form login ada di /masuk, jadi selalu arahkan ke sana.
export default async function LoginRedirect() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] || "/");
  }
  redirect("/masuk");
}

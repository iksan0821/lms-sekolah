import { redirect } from "next/navigation";
import { getSession, ROLE_HOME } from "@/lib/auth";

// Halaman /login lama.
// Landing page sekarang ada di "/" sehingga pengunjung selalu melewati
// kata-kata motivasi sebelum masuk ke form login (/masuk).
export default async function LoginRedirect() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] || "/");
  }
  redirect("/");
}

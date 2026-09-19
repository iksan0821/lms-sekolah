import { NextResponse } from "next/server";
import { verifySession, COOKIE_NAME, ROLE_HOME } from "@/lib/auth";

const PROTECTED_PREFIX = ["/admin", "/kepsek", "/kurikulum", "/guru", "/siswa"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIX.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Pastikan user hanya mengakses area sesuai role-nya
  const rolePrefix = ROLE_HOME[session.role];
  if (rolePrefix && !pathname.startsWith(rolePrefix)) {
    const url = request.nextUrl.clone();
    url.pathname = rolePrefix;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/kepsek/:path*", "/kurikulum/:path*", "/guru/:path*", "/siswa/:path*"],
};

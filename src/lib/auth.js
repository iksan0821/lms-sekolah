import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lms-sekolah-dev-secret"
);

export const COOKIE_NAME = "lms_token";

/** Membuat token JWT untuk session login */
export async function signSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

/** Memverifikasi token JWT, mengembalikan payload atau null */
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

/** Mengambil session user dari cookie (server side) */
export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySession(token);
}

/** Mapping slug role ke dashboard masing-masing */
export const ROLE_HOME = {
  admin: "/admin",
  kepsek: "/kepsek",
  kurikulum: "/kurikulum",
  guru: "/guru",
  siswa: "/siswa",
};

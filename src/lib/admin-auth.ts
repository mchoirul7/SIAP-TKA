import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Masuk admin dengan satu password dari variabel lingkungan `ADMIN_PASSWORD`.
 * Cookie berisi HMAC dari password itu, jadi mengganti password otomatis
 * mengeluarkan semua admin yang sedang masuk. Tanpa variabel itu halaman
 * admin tertutup sama sekali.
 */

export const ADMIN_COOKIE_NAME = "siaptka-admin";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12;

function adminToken(password: string): string {
  return createHmac("sha256", password).update("siaptka-admin-v1").digest("base64url");
}

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const value = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(value && equal(value, adminToken(password)));
}

/** Dipanggil di awal setiap server action admin. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
}

export async function signInAdmin(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !equal(adminToken(password), adminToken(expected))) return false;
  (await cookies()).set(ADMIN_COOKIE_NAME, adminToken(expected), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return true;
}

export async function signOutAdmin(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE_NAME);
}

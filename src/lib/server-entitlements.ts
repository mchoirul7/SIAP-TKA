import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { ContentEntitlement } from "@/data/types";
import { hasContentAccess } from "@/lib/entitlements";
import { getServerStudent, studentCanAccess } from "@/lib/student-session";

export const ENTITLEMENT_COOKIE_NAME = "siaptka-entitlements";
export const ENTITLEMENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface EntitlementCookiePayload {
  v: 1;
  keys: string[];
  issuedAt: number;
}

function secret(): string {
  return (
    process.env.ENTITLEMENT_COOKIE_SECRET ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    "siaptka-dev-cookie-secret"
  );
}

function base64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

function equalSignature(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createEntitlementCookieValue(keys: string[]): string {
  const payload: EntitlementCookiePayload = {
    v: 1,
    keys: [...new Set(keys)].sort(),
    issuedAt: Date.now(),
  };
  const body = base64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function parseEntitlementCookieValue(value?: string): string[] {
  if (!value) return [];
  const [body, signature] = value.split(".");
  if (!body || !signature || !equalSignature(sign(body), signature)) return [];

  try {
    const payload = JSON.parse(fromBase64Url(body)) as Partial<EntitlementCookiePayload>;
    if (payload.v !== 1 || !Array.isArray(payload.keys)) return [];
    return payload.keys.filter((key): key is string => typeof key === "string");
  } catch {
    return [];
  }
}

export async function getServerEntitlementKeys(): Promise<string[]> {
  const store = await cookies();
  return parseEntitlementCookieValue(store.get(ENTITLEMENT_COOKIE_NAME)?.value);
}

/**
 * Akses konten terkunci: paket gratis, voucher seri di cookie, atau grant milik
 * murid yang sedang masuk dengan kode muridnya.
 */
export async function hasServerContentAccess(
  content: ContentEntitlement & { id: string; isFreeAccess?: boolean },
): Promise<boolean> {
  if (hasContentAccess(content, await getServerEntitlementKeys())) return true;
  try {
    const student = await getServerStudent();
    return student ? await studentCanAccess(student.id, content.id) : false;
  } catch {
    // Basis data murid tidak terjangkau: tetap tertutup, jangan sampai halaman error.
    return false;
  }
}

import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Pembatas tebak-tebakan PIN. PIN hanya 6 angka, jadi percobaan yang salah
 * dicatat per alamat IP dan dibatasi dalam jendela waktu singkat.
 */

const WINDOW_MINUTES = 15;
const MAX_FAILURES = 10;

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function isLockedOut(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabaseAdmin()
    .from("login_failures")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);
  return (count ?? 0) >= MAX_FAILURES;
}

export async function recordLoginFailure(ip: string): Promise<void> {
  await supabaseAdmin().from("login_failures").insert({ ip });
}

export const LOCKOUT_MESSAGE = `Terlalu banyak percobaan yang salah. Coba lagi dalam ${WINDOW_MINUTES} menit.`;

/** PIN murid: tepat 6 angka. */
export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase dengan secret key, hanya untuk route dan halaman server.
 *
 * Melewati RLS, jadi dipakai untuk tabel murid (students, student_grants,
 * student_sessions, attempts) yang sengaja tertutup bagi kunci publik. Jangan
 * diimpor dari komponen "use client": kuncinya akan ikut terkirim ke peramban.
 */
let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL dan SUPABASE_SECRET_KEY belum diisi. Lihat .env.example.");
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Data murid selalu dibaca segar, tidak lewat cache fetch Next.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return client;
}

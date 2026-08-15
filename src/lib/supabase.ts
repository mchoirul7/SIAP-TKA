import { createClient } from "@supabase/supabase-js";

/**
 * Klien Supabase untuk membaca konten.
 *
 * Hanya dipakai di sisi server (server component dan generateStaticParams), dan
 * dijalankan saat `next build`. Dengan begitu halaman tetap statis, egress
 * Supabase saat pengguna membuka halaman praktis nol, dan Supabase tidak pernah
 * menjadi titik gagal ketika seseorang sedang mengerjakan ujian.
 *
 * Kuncinya publishable: hanya bisa membaca, dan hanya paket yang sudah terbit
 * karena dibatasi kebijakan RLS.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diisi. Salin .env.example menjadi .env.local.",
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

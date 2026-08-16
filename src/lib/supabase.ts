import { createClient } from "@supabase/supabase-js";

/**
 * Klien Supabase untuk membaca konten.
 *
 * Dipakai di sisi server. Halaman katalog/detail memakai data ini saat build,
 * sedangkan route konten terkunci membacanya saat request agar cookie voucher
 * dapat diperiksa sebelum soal dikirim.
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

type NextFetchInit = RequestInit & { next?: { revalidate?: number } };

const contentFetch: typeof fetch = (input, init) => {
  const nextInit = init as NextFetchInit | undefined;
  return fetch(input, {
    ...nextInit,
    next: {
      ...nextInit?.next,
      revalidate: 1,
    },
  } as RequestInit);
};

export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: contentFetch },
});

import { inlineHtml } from "@/lib/markup";

/**
 * Menampilkan isi soal hasil impor yang berbentuk HTML.
 *
 * Isinya berasal dari berkas data di dalam repo, bukan masukan pengguna, namun
 * tetap disaring lewat daftar tag dan atribut yang diizinkan supaya tidak ada
 * markup tak terduga yang lolos bila bank soal diperbarui.
 */

const ALLOWED_TAGS = new Set(["p", "br", "strong", "em", "sup", "sub", "ul", "ol", "li", "img"]);
const ALLOWED_IMG_ATTRS = new Set(["src", "alt", "width", "height"]);

/**
 * Ilustrasi soal yang lebih baru diunggah ke bucket publik Supabase Storage,
 * bukan ke `public/soal`. Hanya alamat bucket publik yang diterima; sumber luar
 * lainnya tetap dibuang.
 */
const SUPABASE_PUBLIC_STORAGE = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//;

function isAllowedImageSource(src: string): boolean {
  return (src.startsWith("/") && !src.startsWith("//")) || SUPABASE_PUBLIC_STORAGE.test(src);
}

function sanitizeAttributes(tag: string, attributes: string): string {
  if (tag !== "img") return "";

  const kept: string[] = [];
  for (const match of attributes.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) {
    const [, name, value] = match;
    if (!ALLOWED_IMG_ATTRS.has(name.toLowerCase())) continue;
    // Hanya gambar lokal dan bucket publik Supabase yang diterima.
    if (name.toLowerCase() === "src" && !isAllowedImageSource(value)) return "";
    kept.push(`${name.toLowerCase()}="${value}"`);
  }
  if (kept.length === 0) return "";

  // Gambar dimuat saat mendekati layar dan diuraikan di luar utas utama, supaya
  // teks soal tidak tertahan menunggu gambar yang belum terlihat.
  kept.push('loading="lazy"', 'decoding="async"');
  return ` ${kept.join(" ")}`;
}

export function sanitizeHtml(html: string): string {
  return html
    // Komentar dan deklarasi dibuang lebih dulu. Bank soal hasil ekspor sering
    // menyisakan penanda seperti <!--?xml encoding="utf-8" ?--> di setiap pilihan.
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<![^>]*>/g, "")
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)\/?>/g, (full, rawTag, attributes) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (full.startsWith("</")) return `</${tag}>`;
    if (tag === "br" || tag === "img") return `<${tag}${sanitizeAttributes(tag, attributes)}/>`;
    return `<${tag}>`;
  });
}

export function RichText({
  html,
  className = "",
  as: Tag = "div",
  inline = false,
}: {
  html: string;
  className?: string;
  as?: "div" | "span";
  /**
   * Isi dipasang di dalam judul atau di tengah kalimat. Markup bloknya
   * diratakan lebih dulu supaya tidak ada `<p>` di dalam `<p>`, sementara
   * gambar rumusnya tetap tampil sebaris teks.
   */
  inline?: boolean;
}) {
  const source = inline ? inlineHtml(html) : html;
  return (
    <Tag
      className={["rich-text", inline ? "inline" : "", className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(source) }}
    />
  );
}

/**
 * Perlakuan terhadap teks katalog yang ternyata berisi HTML.
 *
 * Nama konsep, penjelasan materi, dan catatan miskonsepsi sebagian ditulis
 * sebagai teks biasa, sebagian lagi ikut terbawa markup dari bank soal asalnya:
 * pembungkus `<p>`, penanda `<sup>`, sampai rumus yang berbentuk gambar
 * (`<img data-latex="…" src="/soal/….png">`). Bila teks seperti itu ditaruh apa
 * adanya, tagnya yang justru terbaca siswa.
 *
 * Tiga keperluan yang berbeda dilayani di sini:
 *
 *   - `hasMarkup`  : apakah teksnya perlu diperlakukan sebagai HTML sama sekali.
 *   - `inlineHtml` : markup blok dijadikan satu baris, supaya isinya aman
 *                    dipasang di dalam judul atau di tengah kalimat.
 *   - `plainText`  : seluruh markup dibuang, untuk tempat yang hanya menerima
 *                    teks (aria-label, judul halaman, kunci daftar).
 *
 * Isinya berasal dari katalog konten, bukan masukan pengguna; penyaringan tag
 * yang benar-benar dirender tetap dilakukan `sanitizeHtml` di `RichText`.
 */

/** Tanda bahwa teks perlu dirender sebagai HTML, bukan sebagai teks biasa. */
export function hasMarkup(text: string): boolean {
  return /<[a-zA-Z!/]/.test(text) || /&[a-zA-Z]+;|&#\d+;/.test(text);
}

/**
 * Markup blok diratakan menjadi satu baris. Dipakai sebelum isi dipasang di
 * dalam elemen yang tidak boleh memuat blok — judul `<h3>`, chip, atau paragraf
 * yang sudah terbentuk — sehingga `<p>` di dalam `<p>` tidak pernah terjadi.
 * Gambar rumus dibiarkan utuh: itu justru bagian yang harus tetap terlihat.
 */
export function inlineHtml(html: string): string {
  return html
    .replace(/<li(\s[^>]*)?>/gi, " • ")
    .replace(/<\/?(p|div|section|article|ul|ol|li|h[1-6])(\s[^>]*)?\/?>/gi, " ")
    .replace(/<br(\s[^>]*)?\/?>/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/**
 * Isi tanpa markup sama sekali. Rumus yang berbentuk gambar diwakili teks
 * penggantinya — `alt` bila ada, kalau tidak sumber LaTeX-nya — supaya kalimatnya
 * tidak kehilangan bagian yang justru menjadi inti soalnya.
 */
export function plainText(html: string): string {
  return inlineHtml(html)
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const alt = /\balt\s*=\s*"([^"]*)"/i.exec(tag)?.[1]?.trim();
      if (alt) return ` ${alt} `;
      const latex = /\bdata-latex\s*=\s*"([^"]*)"/i.exec(tag)?.[1]?.trim();
      return latex ? ` ${latex} ` : " ";
    })
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-zA-Z#0-9]+;/g, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Mengubah huruf pertama teks, walaupun huruf itu berada di belakang tag
 * pembuka ("<p>keliru: …"). Dipakai penyesuaian huruf awal label supaya tetap
 * bekerja pada label yang terbawa markup.
 */
export function withFirstLetter(text: string, change: (letter: string) => string): string {
  return text.replace(
    /^((?:\s|<[^>]+>|&[a-zA-Z#0-9]+;)*)([^\s<&])/,
    (_full, lead: string, letter: string) => `${lead}${change(letter)}`,
  );
}

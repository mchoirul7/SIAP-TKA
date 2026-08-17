/**
 * Menyisipkan data terstruktur ke dalam halaman.
 *
 * Isinya selalu kita susun sendiri dari data konten, tidak pernah dari masukan
 * pengguna. Meski begitu `<` tetap dilolos-kodekan: satu judul paket yang kelak
 * memuat `</script>` akan memutus tag lebih awal dan sisanya terbaca sebagai
 * markah halaman.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

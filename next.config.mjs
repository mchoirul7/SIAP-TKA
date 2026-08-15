/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        /**
         * Gambar soal tidak pernah berubah isinya: namanya diturunkan dari isi
         * berkas oleh sumber soalnya, dan gambar baru selalu memakai nama baru.
         * Tanpa header ini Next menyajikan `max-age=0`, sehingga setiap gambar
         * diperiksa ulang ke server pada tiap kunjungan — satu perjalanan bolak
         * balik per gambar, dan satu paket soal bisa memuat puluhan gambar.
         */
        source: "/soal/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;

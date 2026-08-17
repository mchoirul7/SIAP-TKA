import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Rute yang ditutup adalah rute yang isinya memang tidak untuk dibaca umum:
 * layar pengerjaan, halaman hasil, dan pembahasan hanya terbuka bagi pemegang
 * kode akses, dan alamatnya berumur pendek. Halaman katalog dan detail paket
 * justru sebaliknya — itulah yang ingin ditemukan orang tua lewat pencarian.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/latihan/*/kerjakan",
          "/latihan/*/hasil",
          "/latihan/*/pembahasan",
          "/tryout/*/attempt",
          "/tryout/*/hasil",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}

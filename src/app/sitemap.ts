import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { isSubjectReleased } from "@/lib/subject-release";
import { getPracticePackages, getSubjects, getTryouts } from "@/services/content-service";

/**
 * Peta situs disusun dari konten yang sama dengan yang dipakai halaman, jadi
 * paket baru yang terbit di Supabase ikut terdaftar pada build berikutnya tanpa
 * ada daftar terpisah yang harus diingat untuk diperbarui.
 *
 * Halaman terkunci sengaja tidak dimasukkan — lihat alasannya di `robots.ts`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [subjects, tryouts, packages] = await Promise.all([
    getSubjects(),
    getTryouts(),
    getPracticePackages(),
  ]);

  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tryout"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/tentang"), lastModified, changeFrequency: "monthly", priority: 0.4 },
  ];

  return [
    ...staticRoutes,
    // Mapel yang belum dirilis halamannya masih kosong dan tidak ditautkan dari
    // mana pun, jadi tidak ada gunanya diajukan ke mesin telusur.
    ...subjects
      .filter((subject) => isSubjectReleased(subject.slug))
      .map((subject) => ({
        url: absoluteUrl(`/mapel/${subject.slug}`),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ...tryouts.map((tryout) => ({
      url: absoluteUrl(`/tryout/${tryout.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...packages.map((pkg) => ({
      url: absoluteUrl(`/latihan/${pkg.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

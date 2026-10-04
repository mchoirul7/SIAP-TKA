import type { Metadata } from "next";
import { ExamTypeShowcase } from "@/components/ujian/ExamTypeShowcase";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { absoluteUrl, jsonLdGraph, ogImage } from "@/lib/seo";
import { site, siteKeywords } from "@/lib/site";
import { getSubjectSummaries } from "@/services/content-service";

/**
 * Judul halaman depan ditulis penuh, tidak lewat templat: di sinilah kata yang
 * paling banyak dicari orang tua harus berdiri di depan, bukan nama produknya.
 */
export const metadata: Metadata = {
  title: { absolute: `Latihan Soal TKA & Tryout Online Sesuai Kisi-Kisi — ${site.name}` },
  description:
    "Latihan soal TKA dan tryout online untuk SD/MI, SMP/MTs, dan SMA/MA/SMK sederajat. Dikerjakan dari rumah, sesuai kisi-kisi terbaru, lengkap dengan pembahasan tiap soal dan analisa materi yang perlu diperkuat.",
  keywords: [...siteKeywords],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: site.brandName,
    locale: site.locale,
    title: `${site.brandName} — Latihan Soal TKA & Tryout Sesuai Kisi-Kisi`,
    description:
      "Siapkan ananda menghadapi TKA dari rumah: paket soal latihan, tryout dengan timer, pembahasan lengkap, dan analisa materi yang perlu diperkuat.",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.brandName} — Latihan Soal TKA & Tryout Sesuai Kisi-Kisi`,
    description:
      "Siapkan ananda menghadapi TKA dari rumah: paket soal latihan, tryout dengan timer, pembahasan lengkap, dan analisa materi yang perlu diperkuat.",
    images: [ogImage.url],
  },
};

/**
 * Halaman depan langsung menampilkan pilihan jenis ujian.
 * Tidak ada banner pengantar di atasnya: pengguna dibawa langsung ke isi produk.
 */
export default async function HomePage() {
  const summaries = await getSubjectSummaries();
  const available = summaries.filter((item) => item.isAvailable);

  return (
    <div className="pt-8 sm:pt-9">
      <JsonLd
        data={jsonLdGraph(
          // Daftar mata pelajaran yang sudah berisi, agar mesin telusur mengenali
          // halaman ini sebagai katalog dan ikut merayapi tiap halaman mapelnya.
          {
            "@type": "ItemList",
            name: `Mata pelajaran TKA di ${site.brandName}`,
            itemListElement: available.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.subject.name,
              url: absoluteUrl(`/mapel/${item.subject.slug}`),
            })),
          },
        )}
      />

      <ExamTypeShowcase />

      <WhatsAppFab />
    </div>
  );
}

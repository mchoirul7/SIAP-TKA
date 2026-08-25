import type { Metadata } from "next";
import { HomeCatalog } from "./HomeCatalog";
import { HomeSeoSection } from "./HomeSeoSection";
import { JsonLd } from "@/components/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { homeFaq } from "@/data/faq";
import { absoluteUrl, faqSchema, jsonLdGraph, ogImage } from "@/lib/seo";
import { site, siteKeywords } from "@/lib/site";
import { getSubjectSummaries } from "@/services/content-service";

/**
 * Judul halaman depan ditulis penuh, tidak lewat templat: di sinilah kata yang
 * paling banyak dicari orang tua harus berdiri di depan, bukan nama produknya.
 */
export const metadata: Metadata = {
  title: { absolute: `Latihan Soal TKA & Tryout Online Sesuai Kisi-Kisi — ${site.name}` },
  description:
    "Latihan soal TKA dan tryout online untuk SMA/SMK, SD, dan SMP. Dikerjakan dari rumah, sesuai kisi-kisi terbaru, lengkap dengan pembahasan tiap soal dan analisa materi yang perlu diperkuat.",
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
 * Halaman depan langsung menampilkan katalog mata pelajaran.
 * Tidak ada banner pengantar di atasnya: pengguna dibawa langsung ke isi produk.
 */
export default async function HomePage() {
  const summaries = await getSubjectSummaries();
  const available = summaries.filter((item) => item.isAvailable);

  return (
    <div className="pt-8 sm:pt-10">
      <JsonLd
        data={jsonLdGraph(
          faqSchema(homeFaq),
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

      {/*
        Satu-satunya teks di atas katalog. Sengaja bukan banner: judul halaman
        harus ada demi urutan tajuk yang benar dan demi kata kunci yang dibaca
        mesin telusur, tetapi tidak boleh mendorong isi produk ke bawah layar.
      */}
      <div className="container-page pb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
          Latihan Soal TKA & Tryout Online Sesuai Kisi-Kisi
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600 sm:max-w-none">
          Paket latihan per materi untuk SMA/SMK, SD, dan SMP, dilanjut tryout dengan suasana
          ujian TKA serta pembahasan setelah pengerjaan.
        </p>
      </div>

      <HomeCatalog summaries={summaries} />

      <HomeSeoSection />

      <WhatsAppFab />
    </div>
  );
}

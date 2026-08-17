import type { Metadata } from "next";
import { shopeeVoucherUrl, site, siteKeywords } from "@/lib/site";

/**
 * Lapisan tipis di atas metadata Next.
 *
 * Tujuannya satu: setiap halaman publik mendapat perlakuan yang sama — alamat
 * kanonis, kartu pratinjau untuk WhatsApp dan media sosial, serta judul yang
 * bentuknya konsisten — tanpa mengulang belasan baris yang sama di tiap berkas.
 */

/** Menyusun alamat penuh dari jalur relatif. Dibutuhkan pratinjau tautan, yang tidak menerima jalur relatif. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

/**
 * Gambar pratinjau tautan, dihasilkan `app/opengraph-image.tsx`.
 *
 * Ditulis di sini dan dirujuk tiap halaman, tidak dibiarkan disisipkan otomatis
 * oleh konvensi berkas Next: halaman yang menyusun `openGraph` sendiri ternyata
 * terbit tanpa `og:image` sama sekali, dan tanpa tag itu WhatsApp hanya
 * menampilkan tautan polos.
 *
 * Ukurannya ikut disebutkan karena WhatsApp dan Facebook memakainya untuk
 * memutuskan kartu besar atau ikon kecil, sebelum gambarnya sendiri diunduh.
 */
export const ogImage = {
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: `${site.brandName} — ${site.tagline}`,
  type: "image/png",
} as const;

interface PageSeo {
  /** Tanpa nama produk: templat judul di layout akar yang menambahkannya. */
  title: string;
  description: string;
  /** Jalur relatif, diawali garis miring. Menjadi alamat kanonis halaman. */
  path: string;
  /** Ditambahkan setelah kata kunci umum situs. */
  keywords?: readonly string[];
}

export function pageMetadata({ title, description, path, keywords = [] }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  // Judul kartu pratinjau ditulis penuh karena templat judul hanya berlaku pada
  // tab peramban, tidak ikut terbawa ke tautan yang dibagikan.
  const fullTitle = `${title} — ${site.name}`;

  return {
    title,
    description,
    keywords: [...keywords, ...siteKeywords],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: site.brandName,
      locale: site.locale,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}

// ------------------------------------------------------------ data terstruktur
//
// Google membaca JSON-LD untuk memahami apa isi halaman: siapa penyelenggaranya,
// paket mana yang berupa kursus, dan di posisi mana halaman berada dalam situs.
// Bentuk yang dipakai mengikuti kosakata schema.org.

const ORGANIZATION_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

export function organizationSchema() {
  return {
    "@type": "EducationalOrganization",
    "@id": ORGANIZATION_ID,
    name: site.brandName,
    alternateName: site.name,
    url: site.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo-siaptka.png"),
      width: 302,
      height: 170,
    },
    description: site.searchDescription,
    areaServed: { "@type": "Country", name: "Indonesia" },
    // Tempat kode voucher dibeli; menautkan situs dengan lapak resminya.
    sameAs: [shopeeVoucherUrl],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.brandName,
    description: site.searchDescription,
    inLanguage: "id-ID",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Jejak navigasi yang tampil sebagai baris tautan di bawah judul hasil pencarian. */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

interface CourseSeo {
  name: string;
  description: string;
  path: string;
  /** Perkiraan waktu pengerjaan dalam menit, ditulis sebagai durasi ISO 8601. */
  minutes?: number;
}

/**
 * Satu paket latihan atau tryout dinyatakan sebagai `Course`.
 *
 * `hasCourseInstance` wajib ada agar Google mau menampilkannya sebagai hasil
 * kaya; tanpa itu datanya terbaca valid tetapi tidak pernah muncul.
 */
export function courseSchema({ name, description, path, minutes }: CourseSeo) {
  return {
    "@type": "Course",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "id-ID",
    provider: { "@id": ORGANIZATION_ID },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: minutes ? `PT${minutes}M` : undefined,
      inLanguage: "id-ID",
    },
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Tanya jawab yang dapat tampil melebar di bawah hasil pencarian. */
export function faqSchema(entries: FaqEntry[]) {
  return {
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

/** Membungkus satu atau beberapa simpul menjadi satu graf `@context` tunggal. */
export function jsonLdGraph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

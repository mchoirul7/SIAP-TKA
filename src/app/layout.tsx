import type { Metadata, Viewport } from "next";
import { JsonLd } from "@/components/JsonLd";
import { jsonLdGraph, ogImage, organizationSchema, websiteSchema } from "@/lib/seo";
import { site, siteKeywords } from "@/lib/site";
import "./globals.css";
import { NavigationProvider } from "@/components/NavigationProgress";

export const metadata: Metadata = {
  /**
   * Pratinjau tautan di WhatsApp dan media sosial hanya menerima alamat penuh.
   * Dengan alamat dasar di sini, tiap halaman cukup menulis jalur relatifnya
   * dan Next yang melengkapkan menjadi alamat utuh.
   */
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.searchDescription,
  keywords: [...siteKeywords],
  applicationName: site.brandName,
  authors: [{ name: site.brandName }],
  creator: site.brandName,
  publisher: site.brandName,
  category: "education",
  // Nomor pada soal dan hasil tidak boleh berubah menjadi tautan telepon di iOS.
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Tanpa ini Google hanya menampilkan gambar kecil pada hasil pencarian.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: site.brandName,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.searchDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.searchDescription,
    images: [ogImage.url],
  },
  // Satu berkas lambang dipakai ulang untuk tab peramban dan pintasan layar utama.
  icons: {
    icon: "/logo-siaptka.png",
    apple: "/logo-siaptka.png",
  },
  // Diisi dari env setelah situs didaftarkan di Google Search Console.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  // Ungu lambang: warna bilah peramban pada ponsel.
  themeColor: "#5001da",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/*
          Keterangan penyelenggara dan situs, dipasang satu kali di akar. Halaman
          di dalamnya menambahkan simpulnya sendiri (jejak navigasi, paket soal)
          dan menunjuk balik ke dua simpul ini lewat `@id`.
        */}
        <JsonLd data={jsonLdGraph(organizationSchema(), websiteSchema())} />
      </head>
      <body className="min-h-screen bg-white"><NavigationProvider>{children}</NavigationProvider></body>
    </html>
  );
}

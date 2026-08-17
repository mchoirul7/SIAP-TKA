import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import "./globals.css";
import { NavigationProvider } from "@/components/NavigationProgress";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.valueProposition,
  // Satu berkas lambang dipakai ulang untuk tab peramban dan pintasan layar utama.
  icons: {
    icon: "/logo-siaptka.png",
    apple: "/logo-siaptka.png",
  },
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
      <body className="min-h-screen bg-white"><NavigationProvider>{children}</NavigationProvider></body>
    </html>
  );
}

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
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
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

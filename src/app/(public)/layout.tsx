import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VoucherProvider } from "@/components/VoucherDialog";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <VoucherProvider>
      <div className="flex min-h-screen flex-col bg-ink-50">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Lompat ke konten
        </a>
        <SiteHeader />
        <main id="konten" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </VoucherProvider>
  );
}

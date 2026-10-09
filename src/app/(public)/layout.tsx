import { SiteHeader } from "@/components/SiteHeader";
import { StudyContextGate } from "@/components/StudyContextGate";
import { VoucherProvider } from "@/components/VoucherDialog";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <VoucherProvider>
      <div className="flex min-h-screen flex-col bg-[#f4f9ff] bg-[radial-gradient(circle_at_8%_4%,rgba(210,232,255,0.72),transparent_24rem),radial-gradient(circle_at_97%_33%,rgba(225,242,255,0.8),transparent_22rem),linear-gradient(180deg,#f7fbff_0%,#eef7ff_58%,#f8fbff_100%)]">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Lompat ke konten
        </a>
        <StudyContextGate />
        <SiteHeader />
        <main id="konten" className="flex-1">
          {children}
        </main>
      </div>
    </VoucherProvider>
  );
}

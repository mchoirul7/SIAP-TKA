import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { homeFaq } from "@/data/faq";
import { faqSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: `Pertanyaan yang sering ditanyakan tentang ${site.brandName}: isi paket, jenjang, mata pelajaran, akun murid, dan cara mulai latihan TKA.`,
  path: "/tentang",
});

export default function FaqPage() {
  return (
    <div className="container-page py-12 sm:py-14">
      <JsonLd data={jsonLdGraph(faqSchema(homeFaq))} />

      <div className="mx-auto max-w-4xl">
        <SectionHeader
          as="h1"
          eyebrow="FAQ"
          icon="help"
          title="Pertanyaan yang Sering Ditanyakan"
          description={`Jawaban singkat tentang isi paket ${site.brandName}, jenjang yang tersedia, akun murid, dan cara mulai belajar.`}
        />

        <section className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_35px_-24px_rgba(12,10,55,0.45)]">
          {homeFaq.map((item) => (
            <details key={item.question} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left marker:content-none">
                <span className="flex min-w-0 gap-3">
                  <IconBadge name="help" tone="sky" size="sm" />
                  <span className="pt-0.5 text-[15px] font-extrabold leading-snug text-ink-900 sm:text-base">
                    {item.question}
                  </span>
                </span>
                <Icon
                  name="arrow-right"
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0 text-brand-600 transition-transform group-open:rotate-90"
                  strokeWidth={2.3}
                />
              </summary>
              <p className="ml-11 mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </section>
      </div>
    </div>
  );
}

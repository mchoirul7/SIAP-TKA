import Link from "next/link";
import { HomeCatalog } from "./HomeCatalog";
import { site } from "@/lib/site";
import { getSubjectSummaries, getTryouts } from "@/services/content-service";

export default async function HomePage() {
  const [summaries, tryouts] = await Promise.all([getSubjectSummaries(), getTryouts()]);
  // Banner menampilkan paket soal resmi sebagai pintu masuk tercepat.
  const featured = tryouts.find((tryout) => tryout.variant === "resmi") ?? tryouts[0];

  return (
    <>
      {/* Pita warna di belakang header. Halaman langsung menampilkan isi, bukan halaman pengantar. */}
      <section className="relative -mt-[68px] overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 pt-[68px] sm:-mt-20 sm:pt-20">
        <div className="container-page relative z-10 pb-28 pt-7 sm:pt-9">
          <p className="flex items-center gap-1.5 text-sm font-bold text-white/90">
            <span aria-hidden="true">✦</span>
            Terbaru dari {site.name}
          </p>

          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {featured ? (
              <Banner
                title="Coba Simulasi TKA Gratis"
                body={`${featured.title} — ${featured.questionIds.length} soal, disarankan ${featured.durationMinutes} menit.`}
                href={`/tryout/${featured.slug}`}
                cta="Mulai Sekarang"
                variant="solid"
              />
            ) : null}
            <Banner
              title="Punya Kode Voucher?"
              body="Buka paket latihan beserta pembahasan setiap soalnya."
              href="/latihan"
              cta="Lihat Paket Latihan"
              variant="soft"
            />
          </div>
        </div>

        {/* Lengkungan yang menyambung pita warna ke latar halaman. */}
        <svg
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-14 w-full sm:h-20"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path d="M0 0c360 96 1080 96 1440 0v80H0z" fill="#f8f7f6" />
        </svg>
      </section>

      <div className="relative z-10 -mt-6">
        <HomeCatalog summaries={summaries} />
      </div>
    </>
  );
}

function Banner({
  title,
  body,
  href,
  cta,
  variant,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  variant: "solid" | "soft";
}) {
  const isSolid = variant === "solid";

  return (
    <div
      className={[
        "relative isolate overflow-hidden rounded-2xl p-5 shadow-float sm:p-6",
        isSolid
          ? "bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900"
          : "bg-white/15 ring-1 ring-inset ring-white/35 backdrop-blur-sm",
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-white/10"
        viewBox="0 0 400 96"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 50c70-38 130 24 210 6s130-40 190-12v52H0z" />
      </svg>

      <div className="relative z-10 flex h-full flex-col">
        <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85">{body}</p>
        <Link
          href={href}
          className={[
            "mt-5 inline-flex h-11 w-fit items-center justify-center rounded-xl px-5 text-sm font-bold transition-colors",
            isSolid
              ? "bg-white text-brand-800 hover:bg-brand-50"
              : "bg-ink-900/85 text-white hover:bg-ink-900",
          ].join(" ")}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LinkPending } from "@/components/NavigationProgress";
import { StudyContextDialog } from "@/components/StudyContextDialog";
import { Icon } from "@/components/ui/Icon";
import { useStudyContext } from "@/hooks/useStudyContext";
import { ASSESSMENT_LABEL, examTypeHref } from "@/lib/assessment";
import { DEFAULT_STUDY_CONTEXT, levelOptionFor, serializeStudyContext } from "@/lib/study-context";

/**
 * Ilustrasi di `public/beranda/` dipotong dari mockup beranda. Gambar kartu
 * sudah memuat ikon pojok kiri atas dan lengkung putih badan kartu di bagian
 * bawahnya, jadi badan kartu disambung langsung di bawah gambar.
 */
type HomeExamCard = {
  key: string;
  title: string;
  badge: string;
  description: string;
  art: string;
  arrow: string;
  /** Satu tujuan untuk seluruh kartu, beberapa tombol, atau kosong bila belum tersedia. */
  target: { href: string } | { links: { label: string; href: string }[] } | null;
};

const cards: HomeExamCard[] = [
  {
    key: "tka",
    title: ASSESSMENT_LABEL.tka,
    badge: "Persiapan & latihan",
    description: "Latihan untuk mempersiapkan Tes Kemampuan Akademik.",
    art: "/beranda/tka.png",
    arrow: "bg-[#efe5ff] text-[#6617f4]",
    target: { href: examTypeHref("tka") },
  },
  {
    key: "ulangan_harian",
    title: ASSESSMENT_LABEL.ulangan_harian,
    badge: "Latihan materi",
    description: "Latihan untuk mengukur pemahaman materi yang sedang dipelajari.",
    art: "/beranda/ulangan-harian.png",
    arrow: "bg-[#fff0d5] text-[#ec7d00]",
    target: { href: examTypeHref("ulangan_harian") },
  },
  {
    // Sumatif tengah dan akhir semester digabung dalam satu kartu.
    key: "sumatif",
    title: "Sumatif",
    badge: "Evaluasi semester",
    description: "Persiapan penilaian tengah dan akhir semester sesuai materi.",
    art: "/beranda/sas.png",
    arrow: "bg-[#e5f9e9] text-[#15963c]",
    target: {
      links: [
        { label: "Tengah Semester", href: examTypeHref("sumatif_tengah_semester") },
        { label: "Akhir Semester", href: examTypeHref("sumatif_akhir_semester") },
      ],
    },
  },
  {
    key: "osn",
    title: "OSN",
    badge: "Olimpiade Sains Nasional",
    description: "Latihan soal olimpiade untuk ananda yang suka tantangan.",
    art: "/beranda/osn.svg",
    arrow: "bg-[#fff0d5] text-[#ec7d00]",
    target: null,
  },
];

const cardClass =
  "group flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-white text-left shadow-[0_24px_60px_-42px_rgba(14,23,64,0.45)]";
const hoverClass = "card-lift";

function HomeCard({ card }: { card: HomeExamCard }) {
  const { target } = card;
  const body = (
    <>
      {/* Gambar dipotong lebih pendek supaya beranda muat satu layar tanpa gulir. */}
      <span className="relative block aspect-[383/215] w-full overflow-hidden">
        <Image
          src={card.art}
          alt=""
          fill
          unoptimized={card.art.endsWith(".svg")}
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 46vw, 92vw"
          className={`card-art object-cover object-top ${target ? "" : "opacity-80 grayscale-[35%]"}`}
        />
        {target ? null : (
          <span className="absolute right-3 top-3 rounded-full bg-[#080d3f] px-3 py-1 text-[12px] font-black uppercase tracking-wide text-white shadow-lg">
            Coming Soon
          </span>
        )}
      </span>
      <div className="relative -mt-4 flex flex-1 flex-col rounded-t-[1.2rem] bg-white px-5 pb-5 pt-4">
        <h2 className="text-[clamp(1.1rem,1.25vw,1.35rem)] font-black leading-tight tracking-[-0.01em] text-[#080d3f]">
          {card.title}
        </h2>
        <span className={`mt-2 w-fit rounded-full px-3 py-0.5 text-[13px] font-semibold ${card.arrow}`}>
          {card.badge}
        </span>
        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-snug text-[#52607c]">
          {card.description}
        </p>
        {target && "links" in target ? (
          <span className="mt-auto grid grid-cols-2 gap-2 pt-3">
            {target.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-center text-[13px] font-black leading-tight transition-opacity hover:opacity-80 ${card.arrow}`}
              >
                <LinkPending />
                {link.label}
              </Link>
            ))}
          </span>
        ) : target ? (
          <span className={`ml-auto mt-auto flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:translate-x-1 ${card.arrow}`}>
            <LinkPending />
            <Icon name="arrow-right" className="h-6 w-6" strokeWidth={2.8} />
          </span>
        ) : (
          <span className="ml-auto mt-auto inline-flex h-11 items-center rounded-xl bg-slate-100 px-4 text-[13px] font-black text-slate-500">
            Segera hadir
          </span>
        )}
      </div>
    </>
  );

  if (target && "href" in target) {
    return (
      <Link href={target.href} className={`${cardClass} ${hoverClass}`}>
        {body}
      </Link>
    );
  }
  return <div className={cardClass}>{body}</div>;
}

export function ExamTypeShowcase() {
  const { context, saveContext } = useStudyContext();
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const activeContext = context ?? DEFAULT_STUDY_CONTEXT;
  const levelLabel = levelOptionFor(activeContext.level).label;
  const contextKey = serializeStudyContext(activeContext);

  return (
    <div id="katalog-mapel" className="container-page scroll-mt-24 pb-8 pt-5 sm:pb-10 lg:pt-6">
      <section className="relative lg:min-h-[15rem]">
        {/* Hero dipotong dari mockup; balon teksnya dihapus dari gambar dan
            digambar ulang di sini agar kelasnya mengikuti kelas aktif. */}
        <div className="pointer-events-none absolute right-[-2.5%] top-[-1.75rem] hidden aspect-[1021/334] w-[56%] lg:block hero-float">
          <Image src="/beranda/hero.png" alt="" fill sizes="65vw" className="object-contain" priority />
          <div className="absolute left-[74%] top-[17%] flex h-[45%] w-[19%] rotate-[-9deg] items-center justify-center rounded-[1.4rem] bg-white text-center text-[clamp(0.9rem,1.25vw,1.25rem)] font-black leading-tight text-[#0b1245] shadow-[0_16px_35px_-22px_rgba(18,21,58,0.55)]">
            <span key={contextKey} className="anim-pop">
              Semangat
              <br />
              belajar,
              <br />
              Kelas {activeContext.grade}!
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-[40rem] pb-6 lg:pb-7">
          {/* Pintasan ganti jenjang dan kelas, sama dengan tombol kelas di header. */}
          <button
            type="button"
            onClick={() => setIsClassDialogOpen(true)}
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-[#eadcff] pl-4 pr-1.5 text-[clamp(0.9rem,1.1vw,1rem)] font-black text-[#6418ed] transition-colors hover:bg-[#dfcaff]"
          >
            {levelLabel} &bull; Kelas {activeContext.grade}
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-white px-3 text-[13px] font-black text-[#6418ed] shadow-sm">
              <Icon name="refresh" className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" strokeWidth={2.6} />
              Ganti Kelas
            </span>
          </button>
          <h1 className="mt-4 max-w-[39rem] text-[clamp(2.2rem,3.8vw,3.6rem)] font-black leading-[1.02] tracking-[-0.02em] text-[#080d3f]">
            Mau belajar
            <br />
            apa{" "}
            <span className="bg-gradient-to-r from-[#6818f1] via-[#7a23ff] to-[#8e35ff] bg-clip-text text-transparent">
              hari ini?
            </span>
          </h1>
          <p className="mt-3 max-w-[32rem] text-[clamp(1rem,1.2vw,1.15rem)] font-medium leading-snug text-[#56627c]">
            Latihan seru, rasakan ujian sungguhan! Kerjakan dari laptop atau HP dengan mode aman anti contek, lalu pelajari pembahasannya biar makin siap.
          </p>
        </div>
      </section>

      {/* Kunci kelas aktif memutar ulang gerak kartu setiap jenjang atau kelas diganti. */}
      <ul key={contextKey} className="anim-stagger grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li key={card.key}>
            <HomeCard card={card} />
          </li>
        ))}
      </ul>
      <StudyContextDialog
        open={isClassDialogOpen}
        initialContext={context}
        onClose={() => setIsClassDialogOpen(false)}
        onApply={(nextContext) => {
          saveContext(nextContext);
          setIsClassDialogOpen(false);
        }}
      />
    </div>
  );
}

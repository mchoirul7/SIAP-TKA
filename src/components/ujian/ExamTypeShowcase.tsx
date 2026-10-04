"use client";

import Image from "next/image";
import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon } from "@/components/ui/Icon";
import type { AssessmentType } from "@/data/types";
import { useStudyContext } from "@/hooks/useStudyContext";
import { ASSESSMENT_LABEL, examTypeHref } from "@/lib/assessment";
import { DEFAULT_STUDY_CONTEXT, levelOptionFor } from "@/lib/study-context";

/**
 * Ilustrasi di `public/beranda/` dipotong dari mockup beranda. Gambar kartu
 * sudah memuat ikon pojok kiri atas dan lengkung putih badan kartu di bagian
 * bawahnya, jadi badan kartu disambung langsung di bawah gambar.
 */
type HomeExamCard = {
  type: AssessmentType;
  title: string;
  badge: string;
  description: string;
  art: string;
  arrow: string;
};

const cards: HomeExamCard[] = [
  {
    type: "tka",
    title: ASSESSMENT_LABEL.tka,
    badge: "Persiapan & latihan",
    description: "Latihan untuk mempersiapkan Tes Kemampuan Akademik.",
    art: "/beranda/tka.png",
    arrow: "bg-[#efe5ff] text-[#6617f4]",
  },
  {
    type: "ulangan_harian",
    title: ASSESSMENT_LABEL.ulangan_harian,
    badge: "Latihan materi",
    description: "Latihan untuk mengukur pemahaman materi yang sedang dipelajari.",
    art: "/beranda/ulangan-harian.png",
    arrow: "bg-[#fff0d5] text-[#ec7d00]",
  },
  {
    type: "sumatif_tengah_semester",
    title: ASSESSMENT_LABEL.sumatif_tengah_semester,
    badge: "Evaluasi tengah semester",
    description: "Persiapan penilaian untuk melihat pemahaman ananda sejauh ini.",
    art: "/beranda/sts.png",
    arrow: "bg-[#e0f2ff] text-[#1787e8]",
  },
  {
    type: "sumatif_akhir_semester",
    title: ASSESSMENT_LABEL.sumatif_akhir_semester,
    badge: "Evaluasi akhir semester",
    description: "Persiapan penilaian akhir dengan latihan yang sesuai materi.",
    art: "/beranda/sas.png",
    arrow: "bg-[#e5f9e9] text-[#15963c]",
  },
];

function HomeCard({ card }: { card: HomeExamCard }) {
  return (
    <Link
      href={examTypeHref(card.type)}
      className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-white text-left shadow-[0_24px_60px_-42px_rgba(14,23,64,0.45)] transition-transform hover:-translate-y-1 hover:shadow-[0_34px_70px_-46px_rgba(14,23,64,0.55)]"
    >
      <Image
        src={card.art}
        alt=""
        width={383}
        height={308}
        sizes="(min-width: 1280px) 24vw, (min-width: 768px) 46vw, 92vw"
        className="block h-auto w-full"
      />
      <div className="-mt-2 flex flex-1 flex-col px-6 pb-6">
        <h2 className="text-[clamp(1.2rem,1.4vw,1.6rem)] font-black leading-tight tracking-[-0.01em] text-[#080d3f]">
          {card.title}
        </h2>
        <span className={`mt-3 w-fit rounded-full px-3.5 py-1 text-[clamp(0.88rem,1.15vw,1rem)] font-semibold ${card.arrow}`}>
          {card.badge}
        </span>
        <p className="mt-3 max-w-[18rem] text-[clamp(1rem,1.3vw,1.12rem)] font-medium leading-snug text-[#52607c]">
          {card.description}
        </p>
        <span className={`ml-auto mt-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:translate-x-1 ${card.arrow}`}>
          <LinkPending />
          <Icon name="arrow-right" className="h-7 w-7" strokeWidth={2.8} />
        </span>
      </div>
    </Link>
  );
}

export function ExamTypeShowcase() {
  const { context } = useStudyContext();
  const activeContext = context ?? DEFAULT_STUDY_CONTEXT;
  const levelLabel = levelOptionFor(activeContext.level).label;

  return (
    <div id="katalog-mapel" className="container-page scroll-mt-24 pb-10 pt-7 sm:pb-12 lg:pt-9">
      <section className="relative lg:min-h-[19rem] xl:aspect-[1583/320] xl:min-h-0">
        {/* Hero dipotong dari mockup; balon teksnya dihapus dari gambar dan
            digambar ulang di sini agar kelasnya mengikuti kelas aktif. */}
        <div className="pointer-events-none absolute right-[-2.5%] top-[-1.75rem] hidden aspect-[1021/334] w-[64.5%] lg:block">
          <Image src="/beranda/hero.png" alt="" fill sizes="65vw" className="object-contain" priority />
          <div className="absolute left-[74%] top-[17%] flex h-[45%] w-[19%] rotate-[-9deg] items-center justify-center rounded-[1.4rem] bg-white text-center text-[clamp(1rem,1.45vw,1.45rem)] font-black leading-tight text-[#0b1245] shadow-[0_16px_35px_-22px_rgba(18,21,58,0.55)]">
            Semangat
            <br />
            belajar,
            <br />
            Kelas {activeContext.grade}!
          </div>
        </div>

        <div className="relative z-10 max-w-[40rem] pb-8 sm:pt-1 lg:pb-10">
          <span className="inline-flex h-10 items-center rounded-full bg-[#eadcff] px-5 text-[clamp(1rem,1.3vw,1.15rem)] font-black text-[#6418ed]">
            {levelLabel} &bull; Kelas {activeContext.grade}
          </span>
          <h1 className="mt-6 max-w-[39rem] text-[clamp(2.45rem,4.6vw,4.4rem)] font-black leading-[1.02] tracking-[-0.02em] text-[#080d3f]">
            Mau belajar
            <br />
            apa hari ini,{" "}
            <span className="bg-gradient-to-r from-[#6818f1] via-[#7a23ff] to-[#8e35ff] bg-clip-text text-transparent">
              Adit?
            </span>
          </h1>
          <p className="mt-5 max-w-[39rem] text-[clamp(1.1rem,1.45vw,1.4rem)] font-medium leading-snug text-[#56627c]">
            Pilih jenis penilaian sesuai kebutuhan belajar ananda.
          </p>
        </div>
      </section>

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li key={card.type}>
            <HomeCard card={card} />
          </li>
        ))}
      </ul>
    </div>
  );
}

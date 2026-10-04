import type { IconName } from "@/components/ui/Icon";
import { iconForSubject } from "@/lib/content-icons";

/** Ikon dan warna latar kartu mapel, ditebak dari slug atau namanya. */
export interface SubjectVisual {
  icon: IconName;
  bg: string;
  iconClass: string;
  arrow: string;
}

const visuals: { pattern: RegExp; visual: SubjectVisual }[] = [
  {
    pattern: /matematika|math/,
    visual: { icon: "sigma", bg: "from-[#edf7ff] to-[#f7fbff]", iconClass: "text-sky-700", arrow: "text-sky-600" },
  },
  {
    pattern: /bahasa[-\s]?indonesia/,
    visual: { icon: "book", bg: "from-[#fff1eb] to-[#fff7f4]", iconClass: "text-brand-700", arrow: "text-brand-600" },
  },
  {
    pattern: /bahasa[-\s]?inggris|english/,
    visual: { icon: "globe", bg: "from-[#f8ebff] to-[#fff8ff]", iconClass: "text-brand-700", arrow: "text-brand-600" },
  },
  {
    pattern: /ipa|ipas|biologi|sains|fisika|kimia/,
    visual: { icon: "flask", bg: "from-[#eafff1] to-[#f5fff8]", iconClass: "text-emerald-700", arrow: "text-emerald-600" },
  },
  {
    pattern: /pancasila|ppkn|pkn|sosiologi/,
    visual: { icon: "shield-check", bg: "from-[#fff2d9] to-[#fffbef]", iconClass: "text-brand-700", arrow: "text-brand-600" },
  },
  {
    pattern: /seni|budaya|musik|tari/,
    visual: { icon: "sparkles", bg: "from-[#fff0f6] to-[#fff8fb]", iconClass: "text-brand-700", arrow: "text-brand-600" },
  },
  {
    pattern: /pjok|olahraga|jasmani/,
    visual: { icon: "trophy", bg: "from-[#eafff1] to-[#f5fff8]", iconClass: "text-emerald-700", arrow: "text-emerald-600" },
  },
  {
    pattern: /agama/,
    visual: { icon: "star", bg: "from-[#fff2d9] to-[#fffbef]", iconClass: "text-brand-700", arrow: "text-brand-600" },
  },
];

const fallback: SubjectVisual = {
  bg: "from-[#eef7ff] to-[#ffffff]",
  icon: "layers",
  iconClass: "text-brand-700",
  arrow: "text-brand-600",
};

export function visualForSubject(subject: { slug?: string; shortName?: string; name?: string }): SubjectVisual {
  const key = `${subject.slug ?? ""} ${subject.shortName ?? ""} ${subject.name ?? ""}`.toLowerCase();
  const visual = visuals.find((item) => item.pattern.test(key))?.visual ?? fallback;
  return { ...visual, icon: iconForSubject(subject) };
}

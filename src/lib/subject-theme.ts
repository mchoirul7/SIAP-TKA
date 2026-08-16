import type { CoverTone } from "@/components/CoverArt";
import type { IconName } from "@/components/ui/Icon";
import type { AccentTone } from "@/lib/tone";

/**
 * Warna per mata pelajaran.
 *
 * Tiap mata pelajaran memakai satu keluarga warna yang sama di mana pun kartunya
 * muncul — beranda, halaman mata pelajaran, maupun daftar paket latihan — supaya
 * siswa mengenali "warna Matematika" atau "warna Bahasa Inggris" tanpa membaca
 * judulnya lebih dulu.
 */

export interface SubjectTheme {
  /** Gradasi sampul kartu. */
  cover: CoverTone;
  /** Warna keping, kotak ikon, dan tombol. */
  accent: AccentTone;
  /** Ikon khas mata pelajaran. */
  icon: IconName;
}

const THEMES: Record<string, SubjectTheme> = {
  violet: { cover: "violet", accent: "violet", icon: "chart" },
  rose: { cover: "rose", accent: "rose", icon: "book" },
  sky: { cover: "sky", accent: "sky", icon: "globe" },
  emerald: { cover: "emerald", accent: "emerald", icon: "leaf" },
  neon: { cover: "neon", accent: "neon", icon: "book" },
  honey: { cover: "honey", accent: "amber", icon: "flask" },
  orange: { cover: "orange", accent: "brand", icon: "compass" },
};

/** Kata kunci pada nama atau slug mata pelajaran → warna yang dipakai. */
const KEYWORDS: { match: RegExp; theme: keyof typeof THEMES; icon?: IconName }[] = [
  { match: /matematika|math/, theme: "violet" },
  { match: /bahasa[-\s]?indonesia|indonesian/, theme: "neon" },
  { match: /bahasa[-\s]?inggris|english/, theme: "sky" },
  { match: /kimia|chemistry/, theme: "honey" },
  { match: /biologi|biology/, theme: "emerald" },
  { match: /fisika|physics/, theme: "sky", icon: "bolt" },
  { match: /ipa|sains|science/, theme: "emerald", icon: "flask" },
  { match: /sejarah|history/, theme: "orange", icon: "hourglass" },
  { match: /ekonomi|economy/, theme: "honey", icon: "chart" },
  { match: /geografi|geography/, theme: "emerald", icon: "compass" },
  { match: /sosiologi|ppkn|ips/, theme: "orange", icon: "cap" },
];

/** Urutan warna cadangan untuk mata pelajaran yang belum dikenali. */
const FALLBACK: (keyof typeof THEMES)[] = ["violet", "sky", "emerald", "honey", "rose", "orange"];

/** Penjumlahan kode karakter: warna cadangan tetap sama setiap kali halaman dibuka. */
function stableIndex(key: string, size: number): number {
  let total = 0;
  for (let index = 0; index < key.length; index += 1) {
    total = (total + key.charCodeAt(index) * (index + 1)) % 9973;
  }
  return total % size;
}

/**
 * Mata pelajaran Matematika. Dipakai untuk memutuskan apakah label diagnostik
 * ditampilkan, karena baru soal Matematika yang penandaannya lengkap.
 */
export function isMathSubject(subject: { slug?: string; name?: string } | null | undefined): boolean {
  if (!subject) return false;
  return /matematika|math/.test(`${subject.slug ?? ""} ${subject.name ?? ""}`.toLowerCase());
}

export function getSubjectTheme(subject: { slug?: string; name?: string }): SubjectTheme {
  const key = `${subject.slug ?? ""} ${subject.name ?? ""}`.toLowerCase();

  const found = KEYWORDS.find((entry) => entry.match.test(key));
  if (found) {
    const theme = THEMES[found.theme];
    return found.icon ? { ...theme, icon: found.icon } : theme;
  }

  return THEMES[FALLBACK[stableIndex(key, FALLBACK.length)]];
}

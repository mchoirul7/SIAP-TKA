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

/**
 * Hanya tiga keluarga warna, semuanya dari lambang: ungu, kuning keemasan, dan
 * biru es. Tiga cukup untuk membedakan mapel yang berjalan sekarang, dan mapel
 * berikutnya dibedakan lewat ikonnya — bukan dengan menambah warna baru yang
 * tidak ada pada lambang.
 */
const THEMES: Record<string, SubjectTheme> = {
  grape: { cover: "grape", accent: "brand", icon: "chart" },
  gold: { cover: "gold", accent: "gold", icon: "book" },
  aqua: { cover: "aqua", accent: "aqua", icon: "globe" },
};

/** Kata kunci pada nama atau slug mata pelajaran → warna yang dipakai. */
const KEYWORDS: { match: RegExp; theme: keyof typeof THEMES; icon?: IconName }[] = [
  { match: /matematika|math/, theme: "grape" },
  { match: /bahasa[-\s]?indonesia|indonesian/, theme: "gold" },
  { match: /bahasa[-\s]?inggris|english/, theme: "aqua" },
  { match: /kimia|chemistry/, theme: "gold", icon: "flask" },
  { match: /biologi|biology/, theme: "aqua", icon: "leaf" },
  { match: /fisika|physics/, theme: "grape", icon: "bolt" },
  { match: /ipa|sains|science/, theme: "aqua", icon: "flask" },
  { match: /sejarah|history/, theme: "gold", icon: "hourglass" },
  { match: /ekonomi|economy/, theme: "gold", icon: "chart" },
  { match: /geografi|geography/, theme: "aqua", icon: "compass" },
  { match: /sosiologi|ppkn|ips/, theme: "grape", icon: "cap" },
];

/** Urutan warna cadangan untuk mata pelajaran yang belum dikenali. */
const FALLBACK: (keyof typeof THEMES)[] = ["grape", "gold", "aqua"];

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

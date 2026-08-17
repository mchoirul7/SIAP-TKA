/**
 * Palet warna aksen untuk kartu.
 *
 * Tiga warna pertama — `brand` (ungu), `gold` (kuning keemasan), dan `aqua`
 * (biru es) — diambil dari lambang Siap TKA One dan dipakai untuk membedakan
 * mata pelajaran. Sisanya warna bermakna tetap: hijau untuk yang benar, merah
 * untuk yang salah, dan abu untuk yang netral. Daftarnya sengaja tertutup
 * supaya seluruh halaman tetap terlihat satu keluarga.
 */

export type AccentTone =
  | "brand"
  | "gold"
  | "aqua"
  | "emerald"
  | "rose"
  | "sky"
  | "amber"
  | "violet"
  | "slate";

/** Latar dan garis kartu lembut. */
export const toneSurface: Record<AccentTone, string> = {
  brand: "border-brand-200 bg-brand-50",
  gold: "border-accent-200 bg-accent-50",
  aqua: "border-aqua-200 bg-aqua-50",
  emerald: "border-emerald-200 bg-emerald-50",
  rose: "border-rose-200 bg-rose-50",
  sky: "border-aqua-200 bg-aqua-50",
  amber: "border-accent-200 bg-accent-50",
  violet: "border-brand-200 bg-brand-50",
  slate: "border-slate-200 bg-slate-50",
};

/** Kotak ikon padat bergradasi, dipakai di pojok kartu. */
export const toneIconBox: Record<AccentTone, string> = {
  brand: "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
  gold: "bg-gradient-to-br from-accent-400 to-accent-600 text-ink-900",
  aqua: "bg-gradient-to-br from-aqua-400 to-aqua-600 text-white",
  emerald: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
  rose: "bg-gradient-to-br from-rose-400 to-rose-600 text-white",
  sky: "bg-gradient-to-br from-aqua-400 to-aqua-600 text-white",
  amber: "bg-gradient-to-br from-accent-400 to-accent-600 text-ink-900",
  violet: "bg-gradient-to-br from-brand-400 to-brand-600 text-white",
  slate: "bg-gradient-to-br from-ink-400 to-ink-600 text-white",
};

/** Warna angka besar di dalam kartu. */
export const toneValue: Record<AccentTone, string> = {
  brand: "text-brand-800",
  gold: "text-accent-900",
  aqua: "text-aqua-900",
  emerald: "text-emerald-800",
  rose: "text-rose-800",
  sky: "text-aqua-900",
  amber: "text-accent-900",
  violet: "text-brand-800",
  slate: "text-ink-800",
};

/** Warna label kecil di dalam kartu. */
export const toneLabel: Record<AccentTone, string> = {
  brand: "text-brand-700",
  gold: "text-accent-800",
  aqua: "text-aqua-800",
  emerald: "text-emerald-700",
  rose: "text-rose-700",
  sky: "text-aqua-800",
  amber: "text-accent-800",
  violet: "text-brand-700",
  slate: "text-ink-600",
};

/** Tombol utama di dalam kartu, mengikuti warna kartunya. */
export const toneButton: Record<AccentTone, string> = {
  brand: "bg-gradient-to-r from-brand-500 to-brand-700 text-white",
  gold: "bg-gradient-to-r from-accent-400 to-accent-600 text-ink-900",
  aqua: "bg-gradient-to-r from-aqua-400 to-aqua-600 text-white",
  emerald: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
  rose: "bg-gradient-to-r from-rose-500 to-rose-600 text-white",
  sky: "bg-gradient-to-r from-aqua-500 to-aqua-600 text-white",
  amber: "bg-gradient-to-r from-accent-400 to-accent-600 text-ink-900",
  violet: "bg-gradient-to-r from-brand-500 to-brand-600 text-white",
  slate: "bg-gradient-to-r from-ink-500 to-ink-700 text-white",
};

/** Keping lembut untuk daftar penanda di badan kartu. */
export const toneTag: Record<AccentTone, string> = {
  brand: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-100",
  gold: "bg-accent-50 text-accent-900 ring-1 ring-inset ring-accent-200",
  aqua: "bg-aqua-50 text-aqua-900 ring-1 ring-inset ring-aqua-200",
  emerald: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100",
  rose: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-100",
  sky: "bg-aqua-50 text-aqua-900 ring-1 ring-inset ring-aqua-200",
  amber: "bg-accent-50 text-accent-900 ring-1 ring-inset ring-accent-200",
  violet: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-100",
  slate: "bg-ink-50 text-ink-700 ring-1 ring-inset ring-ink-200",
};

/** Keping kecil: badge, penanda, dan label status. */
export const toneChip: Record<AccentTone, string> = {
  brand: "bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-200",
  gold: "bg-accent-100 text-accent-900 ring-1 ring-inset ring-accent-300",
  aqua: "bg-aqua-100 text-aqua-900 ring-1 ring-inset ring-aqua-300",
  emerald: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  rose: "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200",
  sky: "bg-aqua-100 text-aqua-900 ring-1 ring-inset ring-aqua-300",
  amber: "bg-accent-100 text-accent-900 ring-1 ring-inset ring-accent-300",
  violet: "bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-200",
  slate: "bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200",
};

/**
 * Palet warna aksen untuk kartu.
 *
 * Halaman ini dipakai siswa, jadi angka dan status penting diberi warna agar
 * cepat terbaca sekilas. Warna dipilih dari satu daftar tertutup supaya seluruh
 * halaman tetap terlihat satu keluarga: oranye untuk aksen produk, hijau untuk
 * yang benar, merah untuk yang salah, dan sisanya untuk informasi netral.
 */

export type AccentTone = "brand" | "emerald" | "rose" | "sky" | "amber" | "violet" | "slate";

/** Latar dan garis kartu lembut. */
export const toneSurface: Record<AccentTone, string> = {
  brand: "border-brand-200 bg-brand-50",
  emerald: "border-emerald-200 bg-emerald-50",
  rose: "border-rose-200 bg-rose-50",
  sky: "border-sky-200 bg-sky-50",
  amber: "border-amber-200 bg-amber-50",
  violet: "border-violet-200 bg-violet-50",
  slate: "border-slate-200 bg-slate-50",
};

/** Kotak ikon padat bergradasi, dipakai di pojok kartu. */
export const toneIconBox: Record<AccentTone, string> = {
  brand: "bg-gradient-to-br from-brand-400 to-brand-600 text-white",
  emerald: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
  rose: "bg-gradient-to-br from-rose-400 to-rose-600 text-white",
  sky: "bg-gradient-to-br from-sky-400 to-sky-600 text-white",
  amber: "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
  violet: "bg-gradient-to-br from-violet-400 to-violet-600 text-white",
  slate: "bg-gradient-to-br from-slate-400 to-slate-600 text-white",
};

/** Warna angka besar di dalam kartu. */
export const toneValue: Record<AccentTone, string> = {
  brand: "text-brand-800",
  emerald: "text-emerald-800",
  rose: "text-rose-800",
  sky: "text-sky-800",
  amber: "text-amber-900",
  violet: "text-violet-800",
  slate: "text-slate-800",
};

/** Warna label kecil di dalam kartu. */
export const toneLabel: Record<AccentTone, string> = {
  brand: "text-brand-700",
  emerald: "text-emerald-700",
  rose: "text-rose-700",
  sky: "text-sky-700",
  amber: "text-amber-800",
  violet: "text-violet-700",
  slate: "text-slate-600",
};

/** Tombol utama di dalam kartu, mengikuti warna kartunya. */
export const toneButton: Record<AccentTone, string> = {
  brand: "bg-gradient-to-r from-brand-500 to-brand-600 text-white",
  emerald: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
  rose: "bg-gradient-to-r from-rose-500 to-rose-600 text-white",
  sky: "bg-gradient-to-r from-sky-500 to-sky-600 text-white",
  amber: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
  violet: "bg-gradient-to-r from-violet-500 to-violet-600 text-white",
  slate: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
};

/** Keping lembut untuk daftar penanda di badan kartu. */
export const toneTag: Record<AccentTone, string> = {
  brand: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-100",
  emerald: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100",
  rose: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-100",
  sky: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-100",
  amber: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-100",
  violet: "bg-violet-50 text-violet-800 ring-1 ring-inset ring-violet-100",
  slate: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
};

/** Keping kecil: badge, penanda, dan label status. */
export const toneChip: Record<AccentTone, string> = {
  brand: "bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-200",
  emerald: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  rose: "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200",
  sky: "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200",
  amber: "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200",
  violet: "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200",
  slate: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
};

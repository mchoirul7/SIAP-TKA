import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">Halaman tidak ditemukan</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Halaman yang dicari tidak tersedia
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Tautan mungkin sudah berubah atau salah ketik. Silakan kembali ke beranda untuk memulai
          dari pilihan seri mapel.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-800 px-5 text-[15px] font-semibold text-white hover:bg-brand-900"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/tryout"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-[15px] font-semibold text-brand-800 hover:bg-brand-50"
          >
            Lihat Tryout
          </Link>
        </div>
      </div>
    </div>
  );
}

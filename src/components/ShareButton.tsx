import { Icon } from "@/components/ui/Icon";
import { shareContent, site } from "@/lib/site";

/**
 * Tombol berbagi di kepala halaman.
 *
 * Sengaja langsung menuju WhatsApp, bukan lembar berbagi bawaan sistem: yang
 * dituju adalah grup wali murid, dan lembar bawaan justru menyisipkan satu
 * langkah pemilihan aplikasi sebelum sampai ke sana. Tautan `wa.me` membuka
 * WhatsApp Web di komputer dan aplikasinya di ponsel, dengan pesan ajakan
 * yang sudah terisi.
 *
 * Pesannya sendiri hidup di `shareContent` — satu tempat, supaya bunyi ajakan
 * yang sampai ke grup wali murid tidak berbeda-beda antar tombol.
 *
 * Alamat halaman tidak dioper terpisah: pesannya sudah memuat alamat situs dan
 * tautan voucher.
 */
export function ShareButton() {
  const href = `https://wa.me/?text=${encodeURIComponent(shareContent.message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[11px] border border-brand-200 bg-white px-3 text-sm font-extrabold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50 sm:h-11 sm:px-5"
    >
      <Icon name="share" className="h-4 w-4" strokeWidth={2.4} />
      <span className="hidden sm:inline">Bagikan</span>
      <span className="sr-only sm:hidden">Bagikan {site.brandName} lewat WhatsApp</span>
    </a>
  );
}

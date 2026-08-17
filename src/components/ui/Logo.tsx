import Image from "next/image";
import { site } from "@/lib/site";

/** Ukuran asli berkas di /public; dipakai agar Next tahu rasionya sejak awal. */
const LOGO_WIDTH = 302;
const LOGO_HEIGHT = 170;

/**
 * Lambang layanan. Berkasnya sudah memuat nama produk, jadi tidak perlu
 * ditemani tulisan nama lagi — cukup satu gambar dengan teks alternatif.
 *
 * Tinggi diatur lewat `className` (misalnya `h-10`), lebarnya mengikuti.
 */
export function Logo({
  className = "h-10",
  priority = false,
  /** Dipakai bila di dekatnya sudah ada tulisan nama produk. */
  decorative = false,
}: {
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  return (
    <Image
      src="/logo-siaptka.png"
      alt={decorative ? "" : site.name}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={["w-auto object-contain", className].filter(Boolean).join(" ")}
    />
  );
}

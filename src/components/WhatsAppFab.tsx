import { Icon } from "@/components/ui/Icon";

const whatsappPhone = "6285649834654";
const whatsappMessage =
  "Halo SIAP TKA One, mohon saya dibantu terkait produk ini untuk kesiapan TKA anak saya";

const whatsappHref = `https://web.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(
  whatsappMessage,
)}`;

export function WhatsAppFab() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Hubungi SIAP TKA One lewat WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_rgba(37,211,102,0.35)] ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      <Icon name="whatsapp" className="h-7 w-7" strokeWidth={1.9} />
    </a>
  );
}

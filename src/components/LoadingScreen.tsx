import { Logo } from "@/components/ui/Logo";

/**
 * Layar tunggu bersama.
 *
 * Sebelumnya tiap halaman menampilkan satu baris "Menyiapkan…" berwarna abu,
 * yang mudah disangka halaman kosong. Sekarang lambang layanan yang muncul —
 * penantiannya jadi terasa disengaja, dan sama di semua halaman.
 */
export function LoadingScreen({
  message = "Menyiapkan…",
  tone = "light",
  className = "",
}: {
  message?: string;
  /** `exam` dipakai di atas latar biru layar ujian. */
  tone?: "light" | "exam";
  className?: string;
}) {
  const isExam = tone === "exam";

  return (
    <div
      className={[
        "flex w-full flex-col items-center justify-center gap-5 px-6 py-16 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Logo className="logo-breathe h-16 sm:h-20" priority />

      <div
        aria-hidden="true"
        className={[
          "h-1.5 w-40 overflow-hidden rounded-full",
          isExam ? "bg-white/25" : "bg-brand-100",
        ].join(" ")}
      >
        <div
          className={[
            "nav-progress-bar h-full w-1/3 rounded-full",
            isExam
              ? "bg-white/90"
              : "bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400",
          ].join(" ")}
        />
      </div>

      <p
        role="status"
        aria-live="polite"
        className={["text-sm", isExam ? "text-white/90" : "text-slate-500"].join(" ")}
      >
        {message}
      </p>
    </div>
  );
}

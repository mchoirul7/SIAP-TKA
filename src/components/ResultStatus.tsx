import { Icon, type IconName } from "@/components/ui/Icon";
import { statusChipClass, statusLabel } from "@/lib/format";
import type { MasteryStatus } from "@/lib/scoring";

/** Ikon status: menguatkan arti warna, sekaligus membuat chip tidak terlihat polos. */
const statusIcon: Record<MasteryStatus, IconName> = {
  "perlu-diperkuat": "bolt",
  cukup: "target",
  dikuasai: "trophy",
};

/** Dipakai di atas bidang berwarna: keping putih dengan teks berwarna status. */
const statusSolidClass: Record<MasteryStatus, string> = {
  "perlu-diperkuat": "bg-white text-rose-700 shadow-card",
  cukup: "bg-white text-amber-800 shadow-card",
  dikuasai: "bg-white text-emerald-700 shadow-card",
};

export function ResultStatus({
  status,
  appearance = "soft",
  className,
}: {
  status: MasteryStatus;
  appearance?: "soft" | "solid";
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        appearance === "solid" ? statusSolidClass[status] : statusChipClass[status],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon name={statusIcon[status]} className="h-4 w-4" strokeWidth={2} />
      {statusLabel[status]}
    </span>
  );
}

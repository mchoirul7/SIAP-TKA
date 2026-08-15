import { statusChipClass, statusLabel } from "@/lib/format";
import type { MasteryStatus } from "@/lib/scoring";

export function ResultStatus({
  status,
  className,
}: {
  status: MasteryStatus;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold",
        statusChipClass[status],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {statusLabel[status]}
    </span>
  );
}

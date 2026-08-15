import { Icon, type IconName } from "@/components/ui/Icon";
import type { QuestionLabel } from "@/lib/question-labels";
import { toneTag, type AccentTone } from "@/lib/tone";

/**
 * Deretan keping penanda sebuah soal: konsep, subtopik, tingkat kesulitan, dan
 * jenis penalaran. Isinya statis — diambil apa adanya dari penandaan soal — dan
 * dipakai untuk membaca pola kelemahan siswa, bukan untuk menilai.
 */

const items: { key: keyof QuestionLabel; label: string; icon: IconName; tone: AccentTone }[] = [
  { key: "conceptName", label: "Konsep", icon: "target", tone: "violet" },
  { key: "subtopicName", label: "Subtopik", icon: "layers", tone: "sky" },
  { key: "difficulty", label: "Tingkat", icon: "chart", tone: "amber" },
  { key: "reasoning", label: "Penalaran", icon: "bulb", tone: "emerald" },
];

export function QuestionLabels({
  label,
  className,
  showCompetency = true,
}: {
  label: QuestionLabel | undefined;
  className?: string;
  showCompetency?: boolean;
}) {
  if (!label) return null;

  const chips = items.filter((item) => label[item.key]);
  if (chips.length === 0) return null;

  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-1.5">
        {chips.map((item) => (
          <li
            key={item.key}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneTag[item.tone]}`}
          >
            <Icon name={item.icon} className="h-3.5 w-3.5" />
            <span className="font-normal opacity-80">{item.label}:</span>
            {label[item.key]}
          </li>
        ))}
      </ul>

      {showCompetency && label.competency ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
          <Icon name="note" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Kompetensi yang diuji: {label.competency}</span>
        </p>
      ) : null}
    </div>
  );
}

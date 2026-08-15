"use client";

export interface NavigatorItem {
  questionId: string;
  answered: boolean;
  marked: boolean;
}

/**
 * Status dibedakan lewat warna sekaligus bentuk (garis tebal + titik penanda),
 * sehingga tetap terbaca tanpa mengandalkan warna saja.
 */
export function QuestionNavigator({
  items,
  currentIndex,
  onJump,
}: {
  items: NavigatorItem[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <div>
      <ol className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
        {items.map((item, index) => {
          const isCurrent = index === currentIndex;
          const classes = [
            "relative flex h-10 w-full items-center justify-center rounded-md border text-sm font-semibold tabular-nums transition-colors",
          ];

          // Hijau untuk yang sudah dijawab: warnanya sama dengan penanda benar di pembahasan.
          if (item.answered) {
            classes.push(
              "border-emerald-600 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:opacity-90",
            );
          } else {
            classes.push("border-slate-300 bg-white text-slate-600 hover:border-brand-400");
          }
          if (isCurrent) {
            classes.push("ring-2 ring-brand-500 ring-offset-1");
          }

          return (
            <li key={item.questionId}>
              <button
                type="button"
                onClick={() => onJump(index)}
                aria-current={isCurrent ? "true" : undefined}
                aria-label={`Soal nomor ${index + 1}${item.answered ? ", sudah dijawab" : ", belum dijawab"}${
                  item.marked ? ", ditandai ragu-ragu" : ""
                }`}
                className={classes.join(" ")}
              >
                {index + 1}
                {item.marked ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-amber-500"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      <dl className="mt-4 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 rounded border border-emerald-600 bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <dt className="sr-only">Keterangan</dt>
          <dd>Sudah dijawab</dd>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-4 w-4 rounded border border-slate-300 bg-white" />
          <dd>Belum dijawab</dd>
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 rounded border border-slate-300 bg-white ring-1 ring-amber-500"
          />
          <dd>Ditandai ragu-ragu</dd>
        </div>
      </dl>
    </div>
  );
}

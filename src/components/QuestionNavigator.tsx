"use client";

export interface NavigatorItem {
  questionId: string;
  answered: boolean;
  marked: boolean;
}

/**
 * Petak nomor soal seperti "Daftar Soal" pada ANBK: biru untuk yang sudah
 * dijawab, kuning untuk yang ditandai ragu-ragu, putih untuk yang belum
 * disentuh. Status juga ditulis pada label agar tidak bergantung warna saja,
 * dan soal yang sedang dibuka diberi cincin gelap.
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
      <ol className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-10">
        {items.map((item, index) => {
          const isCurrent = index === currentIndex;
          const classes = [
            "relative flex h-10 w-full items-center justify-center rounded-md border text-sm font-bold tabular-nums transition-colors",
          ];

          // Ragu-ragu didahulukan: itu penanda yang ingin dicari peserta lebih dulu.
          if (item.marked) {
            classes.push("border-amber-500 bg-amber-400 text-slate-900 hover:bg-amber-300");
          } else if (item.answered) {
            classes.push("border-[#1877d2] bg-[#1877d2] text-white hover:bg-[#1466b6]");
          } else {
            classes.push("border-slate-300 bg-white text-slate-600 hover:border-slate-400");
          }
          if (isCurrent) {
            classes.push("ring-2 ring-slate-800 ring-offset-2");
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
              </button>
            </li>
          );
        })}
      </ol>

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 rounded border border-[#1877d2] bg-[#1877d2]"
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
            className="h-4 w-4 rounded border border-amber-500 bg-amber-400"
          />
          <dd>Ditandai ragu-ragu</dd>
        </div>
      </dl>
    </div>
  );
}

import { RichText } from "@/components/RichText";
import { VisualPromptHint } from "@/components/VisualPromptHint";
import type { Question } from "@/data/types";

/**
 * Bacaan pendamping soal pada layar pengerjaan.
 *
 * Penyusun soal menandai stimulus yang seharusnya bergambar dengan tulisan
 * `[STIMULUS VISUAL]` di paragraf pertamanya. Di situlah tombol prompt gambar
 * ditempel — persis di sebelah penandanya, tempat mata sudah tertuju ketika
 * gambarnya dicari. Bila penanda itu tidak ada, tombolnya menyusul di bawah
 * bacaan.
 *
 * Dipakai bersama layar latihan dan layar tryout supaya keduanya sama persis.
 */
const MARKER = "[STIMULUS VISUAL]";

/** Memotong tepat setelah paragraf penanda, supaya sisanya tetap utuh sebagai HTML. */
function splitAfterMarker(html: string): [string, string] | null {
  const at = html.indexOf(MARKER);
  if (at === -1) return null;

  const closing = html.indexOf("</p>", at);
  const cut = closing === -1 ? at + MARKER.length : closing + "</p>".length;
  return [html.slice(0, cut), html.slice(cut)];
}

export function QuestionStimulus({ question }: { question: Question }) {
  const stimulus = question.stimulus;
  if (!stimulus) return null;

  const hint = <VisualPromptHint question={question} />;

  if (question.contentFormat !== "html") {
    return (
      <p className="stimulus-text">
        {stimulus} {hint}
      </p>
    );
  }

  const parts = splitAfterMarker(stimulus);
  if (!parts) {
    return (
      <>
        <RichText html={stimulus} className="stimulus-text" />
        {hint}
      </>
    );
  }

  const [head, rest] = parts;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <RichText html={head} className="stimulus-text" />
        {hint}
      </div>
      {rest.trim() ? <RichText html={rest} className="stimulus-text" /> : null}
    </>
  );
}

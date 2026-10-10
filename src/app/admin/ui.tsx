/** Potongan tampilan bersama halaman admin. Sengaja polos: alat kerja, bukan etalase. */

export const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[14px] text-slate-900 focus:border-brand-500";
export const labelClass = "block text-[13px] font-bold text-slate-700";
export const primaryButton =
  "inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-[14px] font-black text-white hover:bg-brand-800";
export const dangerButton =
  "inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-[13px] font-bold text-rose-700 hover:bg-rose-50";

export function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[17px] font-black text-ink-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Flash({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mb-5 rounded-lg px-4 py-3 text-[14px] font-bold ${error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}
    >
      {error ?? message}
    </p>
  );
}

export const WIB = "Asia/Jakarta";

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: WIB,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { studentOwnedPackages, type OwnedPackage } from "@/lib/student-account";
import { getServerStudent, studentAccess } from "@/lib/student-session";
import { ClearStaleStudent, LogoutButton, SignInButton } from "../akun/AccountClient";

export const metadata: Metadata = {
  title: "Latihan Saya",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

function scoreTone(score: number): string {
  if (score >= 80) return "bg-emerald-50 text-emerald-700";
  if (score >= 60) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

/** Kelompok "Ulangan Harian · Matematika" dan seterusnya, mengikuti urutan paket. */
function groupPackages(items: OwnedPackage[]) {
  const groups = new Map<string, OwnedPackage[]>();
  for (const item of items) {
    const key = `${item.assessmentLabel} · ${item.subjectName} · Kelas ${item.gradeLevel}${item.semester ? ` Semester ${item.semester}` : ""}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()];
}

/**
 * Latihan Saya: semua paket yang sudah dibeli dan dibukakan admin ke akun
 * murid ini, siap dikerjakan, beserta nilai terakhirnya.
 */
export default async function MyPracticePage() {
  const student = await getServerStudent().catch(() => null);

  if (!student) {
    return (
      <div className="container-page py-12">
        <ClearStaleStudent />
        <section className="mx-auto max-w-xl rounded-[18px] border border-sky-100 bg-white p-8 text-center shadow-[0_16px_34px_-26px_rgba(18,21,58,0.5)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon name="layers" className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-[26px] font-black text-ink-900">Latihan Saya</h1>
          <p className="mt-2 text-[15px] font-medium text-slate-600">
            Masuk dengan PIN untuk melihat paket yang sudah dibeli dan mulai mengerjakannya.
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>
        </section>
      </div>
    );
  }

  const access = await studentAccess(student);
  const packages = await studentOwnedPackages(student.id, access.packageSlugs);
  const groups = groupPackages(packages);

  return (
    <div className="container-page space-y-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-600">{access.student.name}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3.4vw,2.6rem)] font-black leading-tight text-ink-900">Latihan Saya</h1>
          <p className="mt-1 text-[15px] font-medium text-slate-600">
            {packages.length} paket siap dikerjakan. Paket yang baru dibeli muncul di sini setelah dibukakan admin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/akun" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-sky-100 bg-white px-4 text-[13px] font-black text-brand-700 hover:border-brand-200">
            <Icon name="chart" className="h-4 w-4" />
            Riwayat nilai & akun
          </Link>
          <LogoutButton label="Keluar" />
        </div>
      </div>

      {groups.length === 0 ? (
        <section className="rounded-[16px] border border-dashed border-sky-200 bg-white p-8 text-center">
          <p className="text-[16px] font-black text-ink-900">Belum ada paket di akun ini.</p>
          <p className="mt-2 text-[14px] font-medium text-slate-600">
            Pilih paket di halaman Jenis Ujian lalu beli lewat WhatsApp. Setelah admin membukakannya, paket muncul di sini.
          </p>
          <Link href="/ujian" className="mt-5 inline-flex h-11 items-center gap-2 rounded-[12px] bg-gradient-to-r from-brand-500 to-brand-700 px-5 text-sm font-black text-white">
            <Icon name="layers" className="h-4 w-4" />
            Lihat paket
          </Link>
        </section>
      ) : (
        groups.map(([title, items]) => (
          <section key={title}>
            <h2 className="mb-3 text-[18px] font-black text-ink-900">
              {title} <span className="text-slate-400">({items.length})</span>
            </h2>
            <ul className="anim-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const href = item.kind === "tryout" ? `/tryout/${item.slug}` : `/latihan/${item.slug}`;
                return (
                  <li key={item.slug}>
                    <article className="card-lift flex h-full flex-col rounded-[14px] border border-sky-100 bg-white p-5 shadow-[0_12px_24px_-22px_rgba(18,21,58,0.5)]">
                      <span className="w-fit rounded-full bg-sky-50 px-2.5 py-1 text-[12px] font-bold text-sky-800">
                        {item.kind === "tryout" ? "Tryout" : "Latihan"}
                      </span>
                      <h3 className="mt-3 text-[16px] font-black leading-snug text-ink-900">{item.title}</h3>
                      <p className="mt-auto pt-4 text-[13px] font-semibold text-slate-500">
                        {item.lastScore !== null ? (
                          <>
                            Nilai terakhir{" "}
                            <span className={`ml-1 rounded-full px-2.5 py-0.5 font-black ${scoreTone(item.lastScore)}`}>
                              {String(item.lastScore).replace(".", ",")}
                            </span>
                            <span className="ml-2">· {item.attemptCount}x dikerjakan</span>
                          </>
                        ) : (
                          "Belum dikerjakan"
                        )}
                      </p>
                      <Link
                        href={href}
                        className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-brand-500 to-brand-700 text-sm font-black text-white transition-opacity hover:opacity-90"
                      >
                        <Icon name="play" className="h-4 w-4" />
                        {item.lastScore !== null ? "Kerjakan lagi" : "Kerjakan"}
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

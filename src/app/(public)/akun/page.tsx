import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { grantLabels, studentAttemptHistory, studentDevices } from "@/lib/student-account";
import { getServerStudent, studentAccess } from "@/lib/student-session";
import { removeDeviceAction } from "./actions";
import { ClearStaleStudent, LogoutButton, SignInButton } from "./AccountClient";

export const metadata: Metadata = {
  title: "Akun Murid",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const WIB = "Asia/Jakarta";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: WIB,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { timeZone: WIB, day: "numeric", month: "long", year: "numeric" });
}

function scoreTone(score: number): string {
  if (score >= 80) return "bg-emerald-50 text-emerald-700";
  if (score >= 60) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

/**
 * Akun murid yang masuk dengan kode: paket yang dimiliki, riwayat nilai yang
 * bisa diunduh, dan perangkat yang sedang masuk beserta tombol hapusnya.
 */
export default async function AccountPage() {
  const student = await getServerStudent().catch(() => null);

  if (!student) {
    return (
      <div className="container-page py-12">
        <ClearStaleStudent />
        <section className="mx-auto max-w-xl rounded-[18px] border border-sky-100 bg-white p-8 text-center shadow-[0_16px_34px_-26px_rgba(18,21,58,0.5)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon name="cap" className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-[26px] font-black text-ink-900">Akun Murid</h1>
          <p className="mt-2 text-[15px] font-medium text-slate-600">
            Masuk dengan kode murid untuk melihat paket yang dimiliki, riwayat nilai, dan perangkat yang sedang dipakai.
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>
        </section>
      </div>
    );
  }

  const [access, history, devices] = await Promise.all([
    studentAccess(student),
    studentAttemptHistory(student.id),
    studentDevices(student.id, student.sessionId),
  ]);
  const labels = await grantLabels(access.grants);
  const average = history.length
    ? Math.round((history.reduce((sum, item) => sum + item.score, 0) / history.length) * 10) / 10
    : null;

  return (
    <div className="container-page space-y-6 py-10">
      <section className="flex flex-col gap-4 rounded-[18px] bg-gradient-to-r from-[#5b0fd6] to-[#8e35ff] p-6 text-white shadow-[0_18px_34px_-22px_rgba(80,1,218,0.9)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-white/70">Akun Murid</p>
          <h1 className="mt-1 text-[28px] font-black leading-tight text-white">{access.student.name}</h1>
          <p className="mt-1 text-sm font-semibold text-white/80">
            {access.student.level} Kelas {access.student.gradeLevel}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-[12px] bg-white/15 px-5 py-3">
            <p className="text-[24px] font-black leading-none">{history.length}</p>
            <p className="mt-1 text-[12px] font-bold text-white/80">Ujian dikerjakan</p>
          </div>
          <div className="rounded-[12px] bg-white/15 px-5 py-3">
            <p className="text-[24px] font-black leading-none">{average ?? "-"}</p>
            <p className="mt-1 text-[12px] font-bold text-white/80">Rata-rata nilai</p>
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-sky-100 bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-[20px] font-black text-ink-900">Paket yang dimiliki</h2>
        {access.grants.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-slate-500">Belum ada paket aktif. Hubungi admin untuk membeli paket.</p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {access.grants.map((grant, index) => (
              <li key={`${grant.scope}-${index}`} className="flex items-start gap-3 rounded-[12px] bg-sky-50/70 p-4">
                <Icon name="unlock" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>
                  <span className="block text-[15px] font-black text-ink-900">{labels[index]}</span>
                  <span className="mt-0.5 block text-[13px] font-semibold text-slate-500">
                    Berlaku sampai {formatDay(grant.expiresAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[16px] border border-sky-100 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-black text-ink-900">
            Riwayat nilai <span className="text-slate-400">({history.length})</span>
          </h2>
          {history.length > 0 ? (
            <a
              href="/api/student/history"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-emerald-600 px-4 text-[13px] font-black text-white transition-opacity hover:opacity-90"
            >
              <Icon name="data" className="h-4 w-4" />
              Unduh Riwayat (Excel)
            </a>
          ) : null}
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-slate-500">
            Belum ada ujian yang tercatat. Nilai otomatis masuk ke sini setiap selesai mengerjakan latihan atau tryout.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[12px] font-black uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Waktu</th>
                  <th className="py-2 pr-3">Paket</th>
                  <th className="py-2 pr-3">Mapel</th>
                  <th className="py-2 pr-3 text-center">Benar</th>
                  <th className="py-2 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap py-3 pr-3 font-semibold text-slate-600">
                      {formatDateTime(item.finishedAt ?? item.startedAt)}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="block font-black text-ink-900">{item.packageTitle}</span>
                      <span className="text-[12px] font-semibold text-slate-500">
                        {item.assessmentLabel} · {item.kind === "tryout" ? "Tryout" : "Latihan"}
                        {item.violations > 0 ? ` · ${item.violations} pelanggaran mode aman` : ""}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-semibold text-slate-700">{item.subjectName}</td>
                    <td className="whitespace-nowrap py-3 pr-3 text-center font-semibold text-slate-700">
                      {item.correctCount}/{item.totalCount}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-[13px] font-black ${scoreTone(item.score)}`}>
                        {String(item.score).replace(".", ",")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-[16px] border border-sky-100 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-black text-ink-900">Perangkat yang masuk</h2>
          <LogoutButton />
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Satu kode bisa dipakai di 2 perangkat sekaligus. Hapus perangkat yang tidak dikenal atau sudah tidak dipakai.
        </p>
        <ul className="mt-4 space-y-3">
          {devices.map((device) => (
            <li key={device.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-sky-50/70 p-4">
              <span>
                <span className="block text-[15px] font-black text-ink-900">
                  {device.label}
                  {device.isCurrent ? (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                      Perangkat ini
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[13px] font-semibold text-slate-500">
                  Masuk {formatDateTime(device.createdAt)} · terakhir aktif {formatDateTime(device.lastSeen)}
                </span>
              </span>
              {device.isCurrent ? null : (
                <form action={removeDeviceAction}>
                  <input type="hidden" name="sessionId" value={device.id} />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-rose-200 bg-white px-3 text-[13px] font-black text-rose-700 transition-colors hover:bg-rose-50"
                  >
                    <Icon name="close" className="h-4 w-4" strokeWidth={2.6} />
                    Hapus
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

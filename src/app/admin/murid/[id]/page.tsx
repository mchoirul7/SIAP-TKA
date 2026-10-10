import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminStudent, listGrants } from "@/lib/admin-students";
import { formatRupiah } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/seo";
import { grantLabels, studentAttemptHistory, studentDevices } from "@/lib/student-account";
import { scopeCatalog, scopeFromParams } from "@/lib/admin-catalog";
import {
  addGrantAction,
  deleteGrantAction,
  removeDeviceAdminAction,
  resetPinAction,
  setStudentActiveAction,
} from "../../actions";
import { PackagePicker } from "../../PackagePicker";
import { Card, dangerButton, Flash, formatDateTime, inputClass, labelClass, primaryButton } from "../../ui";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    baru?: string;
    pesan?: string;
    galat?: string;
    ujian?: string;
    jenjang?: string;
    kelas?: string;
    semester?: string;
  }>;
}

/** 0812… → 62812… untuk tautan wa.me. */
function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

/** Detail satu murid: kode untuk dikirim, grant, perangkat, dan riwayat nilai. */
export default async function AdminStudentPage({ params, searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const query = await searchParams;
  const { baru, pesan, galat } = query;
  const student = await getAdminStudent(id);
  if (!student) notFound();

  // Pemilih paket langsung menampilkan Ulangan Harian kelas murid ini bila belum dipilih lain.
  const scope = scopeFromParams(query) ?? {
    assessmentType: "ulangan_harian" as const,
    level: student.level,
    gradeLevel: student.gradeLevel,
    semester: null,
  };
  const [grants, devices, history, catalog] = await Promise.all([
    listGrants(student.id),
    studentDevices(student.id, ""),
    studentAttemptHistory(student.id),
    scopeCatalog(scope),
  ]);
  const labels = await grantLabels(grants);
  const now = Date.now();

  const waMessage = [
    `Halo, berikut PIN akun SIAP TKA ONE untuk ${student.name}:`,
    "",
    `*${student.accessCode}*`,
    "",
    `Cara masuk: buka ${absoluteUrl("/akun")}, tekan "Masuk / Daftar", pilih "Sudah punya akun", lalu ketik PIN di atas.`,
    "Satu akun bisa dipakai di 2 perangkat. Riwayat nilai bisa dilihat dan diunduh di halaman Akun.",
  ].join("\n");

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-[13px] font-bold text-brand-700 hover:underline">
        ← Semua murid
      </Link>
      <Flash message={baru ? "Akun murid dibuat. Kirim PIN-nya ke orang tua, lalu bukakan paket yang dibeli." : pesan} error={galat} />

      <Card
        title={student.name}
        action={
          <form action={setStudentActiveAction}>
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="active" value={student.isActive ? "0" : "1"} />
            <button type="submit" className={student.isActive ? dangerButton : primaryButton}>
              {student.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
            </button>
          </form>
        }
      >
        <div className="grid gap-5 md:grid-cols-[auto_1fr]">
          <div>
            <p className="text-[12px] font-black uppercase tracking-wide text-slate-500">PIN masuk</p>
            <p className="mt-1 select-all font-mono text-[28px] font-black text-brand-700">{student.accessCode}</p>
            <form action={resetPinAction} className="mt-2">
              <input type="hidden" name="studentId" value={student.id} />
              <button type="submit" className={dangerButton}>
                Reset PIN (orang tua lupa)
              </button>
            </form>
            <p className="mt-2 text-[14px] text-slate-600">
              {student.level} Kelas {student.gradeLevel} · {student.parentPhone ?? "tanpa no. WA"} ·{" "}
              {student.isActive ? "Aktif" : "Nonaktif"}
            </p>
          </div>
          <div>
            <p className={labelClass}>Pesan untuk dikirim lewat WhatsApp</p>
            <textarea readOnly value={waMessage} rows={6} className={`${inputClass} mt-1.5 h-auto py-2 font-mono text-[13px]`} />
            {student.parentPhone ? (
              <a
                href={`https://wa.me/${waNumber(student.parentPhone)}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noreferrer"
                className={`${primaryButton} mt-2 bg-emerald-600 hover:bg-emerald-700`}
              >
                Kirim lewat WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </Card>

      <Card title={`Paket yang dimiliki (${grants.length})`}>
        {grants.length === 0 ? (
          <p className="mb-4 text-[14px] text-slate-500">Belum ada grant. Tambahkan paket yang dibeli di bawah.</p>
        ) : (
          <ul className="mb-5 space-y-2">
            {grants.map((grant, index) => {
              const expired = new Date(grant.expiresAt).getTime() < now;
              return (
                <li key={grant.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
                  <span>
                    <span className="block text-[14px] font-black text-ink-900">{labels[index]}</span>
                    <span className="text-[13px] text-slate-600">
                      {formatDateTime(grant.startsAt)} s.d. {formatDateTime(grant.expiresAt)}
                      {expired ? " · KEDALUWARSA" : ""}
                      {grant.pricePaid !== null ? ` · ${formatRupiah(grant.pricePaid)}` : ""}
                      {grant.note ? ` · ${grant.note}` : ""}
                    </span>
                  </span>
                  <form action={deleteGrantAction}>
                    <input type="hidden" name="studentId" value={student.id} />
                    <input type="hidden" name="grantId" value={grant.id} />
                    <button type="submit" className={dangerButton}>
                      Hapus
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <div id="tambah-paket" className="rounded-lg border border-dashed border-slate-300 p-4">
          <p className="mb-3 text-[14px] font-black text-ink-900">Bukakan paket untuk {student.name}</p>
          <PackagePicker
            basePath={`/admin/murid/${student.id}`}
            scope={scope}
            catalog={catalog}
            defaultLevel={student.level}
            defaultGrade={student.gradeLevel}
            action={addGrantAction}
            hidden={{ studentId: student.id }}
            submitLabel="Simpan ke akun murid"
            extraFields={
              <>
                <label className={labelClass}>
                  Harga dibayar (Rp)
                  <input name="pricePaid" inputMode="numeric" placeholder="75000" className={`${inputClass} mt-1.5`} />
                </label>
                <label className={`${labelClass} md:col-span-2`}>
                  Catatan
                  <input name="note" placeholder="mis. transfer BCA 10/10" className={`${inputClass} mt-1.5`} />
                </label>
              </>
            }
          />
        </div>
      </Card>

      <Card
        title={`Perangkat yang masuk (${devices.length}/2)`}
        action={
          devices.length > 0 ? (
            <form action={removeDeviceAdminAction}>
              <input type="hidden" name="studentId" value={student.id} />
              <button type="submit" className={dangerButton}>
                Keluarkan semua
              </button>
            </form>
          ) : null
        }
      >
        {devices.length === 0 ? (
          <p className="text-[14px] text-slate-500">Belum ada perangkat yang masuk.</p>
        ) : (
          <ul className="space-y-2">
            {devices.map((device) => (
              <li key={device.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
                <span>
                  <span className="block text-[14px] font-black text-ink-900">{device.label}</span>
                  <span className="text-[13px] text-slate-600">
                    Masuk {formatDateTime(device.createdAt)} · aktif {formatDateTime(device.lastSeen)}
                  </span>
                </span>
                <form action={removeDeviceAdminAction}>
                  <input type="hidden" name="studentId" value={student.id} />
                  <input type="hidden" name="sessionId" value={device.id} />
                  <button type="submit" className={dangerButton}>
                    Keluarkan
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`Riwayat nilai (${history.length})`}>
        {history.length === 0 ? (
          <p className="text-[14px] text-slate-500">Belum ada ujian yang tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-slate-200 text-[12px] font-black uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Waktu</th>
                  <th className="py-2 pr-3">Paket</th>
                  <th className="py-2 pr-3">Benar</th>
                  <th className="py-2 pr-3">Nilai</th>
                  <th className="py-2">Pelanggaran</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 50).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-600">{formatDateTime(item.finishedAt ?? item.startedAt)}</td>
                    <td className="py-2 pr-3 font-semibold text-ink-900">{item.packageTitle}</td>
                    <td className="py-2 pr-3">
                      {item.correctCount}/{item.totalCount}
                    </td>
                    <td className="py-2 pr-3 font-black">{String(item.score).replace(".", ",")}</td>
                    <td className="py-2">{item.violations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

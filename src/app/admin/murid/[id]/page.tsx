import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { EducationLevel } from "@/data/types";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminStudent, listGrants } from "@/lib/admin-students";
import { ASSESSMENT_LABEL } from "@/lib/assessment";
import { formatRupiah } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/seo";
import { grantLabels, studentAttemptHistory, studentDevices } from "@/lib/student-account";
import { getSubjects } from "@/services/content-service";
import {
  addGrantAction,
  deleteGrantAction,
  removeDeviceAdminAction,
  setStudentActiveAction,
} from "../../actions";
import { Card, dangerButton, Flash, formatDateTime, inputClass, labelClass, primaryButton } from "../../ui";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baru?: string; pesan?: string; galat?: string }>;
}

/** 0812… → 62812… untuk tautan wa.me. */
function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

const LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];

/** Detail satu murid: kode untuk dikirim, grant, perangkat, dan riwayat nilai. */
export default async function AdminStudentPage({ params, searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const { baru, pesan, galat } = await searchParams;
  const student = await getAdminStudent(id);
  if (!student) notFound();

  const [grants, devices, history, subjects] = await Promise.all([
    listGrants(student.id),
    studentDevices(student.id, ""),
    studentAttemptHistory(student.id),
    getSubjects(),
  ]);
  const labels = await grantLabels(grants);
  const now = Date.now();

  const waMessage = [
    `Halo, berikut kode murid SIAP TKA ONE untuk ${student.name}:`,
    "",
    `*${student.accessCode}*`,
    "",
    `Cara masuk: buka ${absoluteUrl("/akun")}, tekan "Masuk dengan Kode Murid", lalu ketik kode di atas.`,
    "Satu kode bisa dipakai di 2 perangkat. Riwayat nilai bisa dilihat dan diunduh di halaman Akun.",
  ].join("\n");

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-[13px] font-bold text-brand-700 hover:underline">
        ← Semua murid
      </Link>
      <Flash message={baru ? "Kode murid dibuat. Kirim kodenya ke orang tua, lalu tambahkan paket yang dibeli." : pesan} error={galat} />

      <Card
        title={student.name}
        action={
          <form action={setStudentActiveAction}>
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="active" value={student.isActive ? "0" : "1"} />
            <button type="submit" className={student.isActive ? dangerButton : primaryButton}>
              {student.isActive ? "Nonaktifkan kode" : "Aktifkan kode"}
            </button>
          </form>
        }
      >
        <div className="grid gap-5 md:grid-cols-[auto_1fr]">
          <div>
            <p className="text-[12px] font-black uppercase tracking-wide text-slate-500">Kode murid</p>
            <p className="mt-1 select-all font-mono text-[28px] font-black text-brand-700">{student.accessCode}</p>
            <p className="mt-1 text-[14px] text-slate-600">
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

        <form action={addGrantAction} className="rounded-lg border border-dashed border-slate-300 p-4">
          <input type="hidden" name="studentId" value={student.id} />
          <p className="mb-3 text-[14px] font-black text-ink-900">Tambah paket yang dibeli</p>
          <div className="grid gap-4 md:grid-cols-4">
            <label className={labelClass}>
              Jenis pembelian
              <select name="scope" defaultValue="all_in" className={`${inputClass} mt-1.5`}>
                <option value="all_in">All-in (semua mapel)</option>
                <option value="subject">Paket lengkap per mapel</option>
                <option value="package">Paket satuan</option>
              </select>
            </label>
            <label className={labelClass}>
              Jenis ujian
              <select name="assessmentType" defaultValue="ulangan_harian" className={`${inputClass} mt-1.5`}>
                {Object.entries(ASSESSMENT_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Jenjang
              <select name="level" defaultValue={student.level} className={`${inputClass} mt-1.5`}>
                {LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Kelas
              <input name="gradeLevel" type="number" min={1} max={12} defaultValue={student.gradeLevel} className={`${inputClass} mt-1.5`} />
            </label>
            <label className={labelClass}>
              Semester
              <select name="semester" defaultValue="" className={`${inputClass} mt-1.5`}>
                <option value="">Semua semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </label>
            <label className={labelClass}>
              Mapel (untuk per mapel)
              <select name="subjectId" defaultValue="" className={`${inputClass} mt-1.5`}>
                <option value="">-</option>
                {LEVELS.map((level) => (
                  <optgroup key={level} label={level}>
                    {subjects
                      .filter((subject) => subject.level === level)
                      .map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Slug paket (untuk satuan)
              <input name="packageSlug" placeholder="mis. pkg-uh-sd-k2-matematika-bab-01" className={`${inputClass} mt-1.5 font-mono`} />
            </label>
            <label className={labelClass}>
              Lama akses (bulan)
              <input name="months" type="number" min={1} max={24} defaultValue={6} className={`${inputClass} mt-1.5`} />
            </label>
            <label className={labelClass}>
              Harga dibayar (Rp)
              <input name="pricePaid" inputMode="numeric" placeholder="75000" className={`${inputClass} mt-1.5`} />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Catatan
              <input name="note" placeholder="mis. transfer BCA 10/10" className={`${inputClass} mt-1.5`} />
            </label>
          </div>
          <p className="mt-3 text-[12px] text-slate-500">
            Paket satuan cukup diisi slug-nya; jenis ujian, jenjang, kelas, dan semester diambil otomatis dari paketnya.
            Slug terlihat di alamat halaman paket, setelah <code>/latihan/</code>.
          </p>
          <button type="submit" className={`${primaryButton} mt-4`}>
            Tambah Grant
          </button>
        </form>
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

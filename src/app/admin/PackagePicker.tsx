import type { EducationLevel } from "@/data/types";
import type { AdminScope, ScopeSubject } from "@/lib/admin-catalog";
import { ASSESSMENT_LABEL } from "@/lib/assessment";
import { inputClass, labelClass, primaryButton } from "./ui";

const LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];

/**
 * Pemilih paket dua langkah, tanpa JavaScript di peramban:
 * 1. Pilih jenis ujian, jenjang, kelas, dan semester (formulir GET).
 * 2. Centang All-in, mapel penuh, atau paket tertentu sekaligus (formulir POST).
 * Dipakai untuk membukakan paket ke akun murid.
 */
export function PackagePicker({
  basePath,
  scope,
  catalog,
  defaultLevel = "SD",
  defaultGrade,
  action,
  hidden,
  extraFields,
  submitLabel,
}: {
  basePath: string;
  scope: AdminScope | null;
  catalog: ScopeSubject[] | null;
  defaultLevel?: EducationLevel;
  defaultGrade?: number;
  action: (formData: FormData) => Promise<void>;
  hidden: Record<string, string>;
  /** Isian tambahan di formulir simpan, misalnya harga dan catatan. */
  extraFields?: React.ReactNode;
  submitLabel: string;
}) {
  const assessmentLabel = scope ? ASSESSMENT_LABEL[scope.assessmentType] : "";
  const scopeLabel = scope
    ? `${assessmentLabel} ${scope.level} Kelas ${scope.gradeLevel}${scope.semester ? ` Semester ${scope.semester}` : ""}`
    : "";

  return (
    <div className="space-y-4">
      <form action={basePath} className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-5 md:items-end">
        <label className={labelClass}>
          Jenis ujian
          <select name="ujian" defaultValue={scope?.assessmentType ?? "ulangan_harian"} className={`${inputClass} mt-1.5`}>
            {Object.entries(ASSESSMENT_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Jenjang
          <select name="jenjang" defaultValue={scope?.level ?? defaultLevel} className={`${inputClass} mt-1.5`}>
            {LEVELS.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Kelas
          <input name="kelas" type="number" min={1} max={12} required defaultValue={scope?.gradeLevel ?? defaultGrade} className={`${inputClass} mt-1.5`} />
        </label>
        <label className={labelClass}>
          Semester
          <select name="semester" defaultValue={scope?.semester ? String(scope.semester) : ""} className={`${inputClass} mt-1.5`}>
            <option value="">Semua semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </label>
        <button type="submit" className={primaryButton}>
          Tampilkan paket
        </button>
      </form>

      {scope && catalog ? (
        catalog.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-[14px] font-bold text-amber-800">
            Belum ada paket terbit untuk {scopeLabel}. All-in tetap bisa diberikan dan otomatis membuka paket yang terbit nanti.
          </p>
        ) : null
      ) : (
        <p className="text-[13px] text-slate-500">Pilih jenis ujian, jenjang, dan kelas, lalu tekan &quot;Tampilkan paket&quot;.</p>
      )}

      {scope && catalog ? (
        <form action={action} className="space-y-4">
          {Object.entries(hidden).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <input type="hidden" name="assessmentType" value={scope.assessmentType} />
          <input type="hidden" name="level" value={scope.level} />
          <input type="hidden" name="gradeLevel" value={scope.gradeLevel} />
          <input type="hidden" name="semester" value={scope.semester ?? ""} />

          <label className="flex items-start gap-3 rounded-lg border-2 border-brand-200 bg-brand-50 p-4">
            <input type="checkbox" name="allIn" value="1" className="mt-1 h-5 w-5 accent-brand-700" />
            <span>
              <span className="block text-[15px] font-black text-ink-900">All-in: semua mapel {scopeLabel}</span>
              <span className="text-[13px] text-slate-600">
                Termasuk mapel dan paket yang terbit belakangan. Bila dicentang, pilihan di bawah diabaikan.
              </span>
            </span>
          </label>

          <div className="grid gap-3 lg:grid-cols-2">
            {catalog.map((subject) => (
              <div key={subject.id} className="rounded-lg border border-slate-200 p-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="subjectId" value={subject.id} className="mt-1 h-5 w-5 accent-brand-700" />
                  <span>
                    <span className="block text-[15px] font-black text-ink-900">{subject.name}: paket lengkap</span>
                    <span className="text-[13px] text-slate-600">
                      {subject.packages.length} paket sekarang, ikut terbuka bila ada paket baru
                    </span>
                  </span>
                </label>
                <details className="mt-3">
                  <summary className="cursor-pointer text-[13px] font-bold text-brand-700">atau pilih paket satuan</summary>
                  <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pl-1">
                    {subject.packages.map((pkg) => (
                      <li key={pkg.id}>
                        <label className="flex items-start gap-2 text-[13px] text-slate-700">
                          <input type="checkbox" name="packageId" value={pkg.id} className="mt-0.5 h-4 w-4 accent-brand-700" />
                          <span>
                            {pkg.title}
                            {pkg.kind === "tryout" ? <span className="ml-1 font-bold text-amber-700">(tryout)</span> : null}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <label className={labelClass}>
              Lama akses (bulan)
              <input name="months" type="number" min={1} max={24} defaultValue={6} className={`${inputClass} mt-1.5`} />
            </label>
            {extraFields}
          </div>
          <button type="submit" className={primaryButton}>
            {submitLabel}
          </button>
        </form>
      ) : null}
    </div>
  );
}

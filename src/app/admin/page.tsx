import Link from "next/link";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { searchStudents } from "@/lib/admin-students";
import { createStudentAction, signInAdminAction } from "./actions";
import { Card, Flash, formatDateTime, inputClass, labelClass, primaryButton } from "./ui";

interface PageProps {
  searchParams: Promise<{ q?: string; pesan?: string; galat?: string }>;
}

/** Daftar murid, pencarian kode, dan pembuatan kode murid baru. */
export default async function AdminPage({ searchParams }: PageProps) {
  const { q = "", pesan, galat } = await searchParams;

  if (!isAdminConfigured()) {
    return (
      <Card title="Admin belum disiapkan">
        <p className="text-[14px] text-slate-600">
          Isi variabel <code className="font-bold">ADMIN_PASSWORD</code> di <code>.env.local</code> dan di Vercel, lalu muat ulang halaman ini.
        </p>
      </Card>
    );
  }

  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-sm">
        <Flash error={galat} />
        <Card title="Masuk Admin">
          <form action={signInAdminAction} className="space-y-4">
            <label className={labelClass}>
              Password
              <input name="password" type="password" required autoFocus className={`${inputClass} mt-1.5`} />
            </label>
            <button type="submit" className={`${primaryButton} w-full`}>
              Masuk
            </button>
          </form>
        </Card>
      </div>
    );
  }

  const students = await searchStudents(q);

  return (
    <div className="space-y-6">
      <Flash message={pesan} error={galat} />

      <Card title="Buat kode murid baru">
        <form action={createStudentAction} className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_2fr_auto] md:items-end">
          <label className={labelClass}>
            Nama murid
            <input name="name" required className={`${inputClass} mt-1.5`} placeholder="Nama lengkap" />
          </label>
          <label className={labelClass}>
            Jenjang
            <select name="level" className={`${inputClass} mt-1.5`} defaultValue="SD">
              <option>SD</option>
              <option>SMP</option>
              <option>SMA</option>
            </select>
          </label>
          <label className={labelClass}>
            Kelas
            <input name="gradeLevel" type="number" min={1} max={12} required className={`${inputClass} mt-1.5`} />
          </label>
          <label className={labelClass}>
            No. WA orang tua (opsional)
            <input name="parentPhone" className={`${inputClass} mt-1.5`} placeholder="08…" />
          </label>
          <button type="submit" className={primaryButton}>
            Buat Kode
          </button>
        </form>
      </Card>

      <Card
        title={q ? `Hasil cari "${q}" (${students.length})` : `Murid terbaru (${students.length})`}
        action={
          <form className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Cari kode, nama, atau no. WA" className={`${inputClass} w-64`} />
            <button type="submit" className={primaryButton}>
              Cari
            </button>
          </form>
        }
      >
        {students.length === 0 ? (
          <p className="text-[14px] text-slate-500">Belum ada murid.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-slate-200 text-[12px] font-black uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Kode</th>
                  <th className="py-2 pr-3">Nama</th>
                  <th className="py-2 pr-3">Kelas</th>
                  <th className="py-2 pr-3">No. WA</th>
                  <th className="py-2 pr-3">Dibuat</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/murid/${student.id}`} className="font-mono font-bold text-brand-700 hover:underline">
                        {student.accessCode}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-ink-900">{student.name}</td>
                    <td className="py-2.5 pr-3">
                      {student.level} {student.gradeLevel}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600">{student.parentPhone ?? "-"}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{formatDateTime(student.createdAt)}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${student.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {student.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
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

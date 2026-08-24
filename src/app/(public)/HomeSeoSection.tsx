import { homeFaq } from "@/data/faq";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { accessCodeWhatsappUrl } from "@/lib/access-code";

/**
 * Bagian penjelas di bawah katalog.
 *
 * Halaman depan sebelumnya hampir tanpa teks: isinya kartu, dan kartu tidak
 * memberi mesin telusur apa pun untuk dibaca. Bagian ini menutup lubang itu
 * dengan penjelasan yang memang berguna dibaca orang tua — apa isi paketnya,
 * bagaimana urutan belajarnya, dan jawaban atas pertanyaan yang paling sering
 * muncul sebelum membeli.
 *
 * Letaknya di bawah katalog, jadi pengguna yang sudah tahu mau ke mana tidak
 * perlu melewatinya lebih dulu.
 */
export function HomeSeoSection() {
  return (
    <div className="container-page pb-20">
   

      <section className="mt-8">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          <IconBadge name="info" tone="sky" size="md" />
          Pertanyaan yang sering ditanyakan orang tua
        </h2>
        <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {homeFaq.map((item) => (
            // Elemen bawaan peramban: isinya tetap ada di markah halaman meski
            // terlipat, sehingga terbaca mesin telusur tanpa perlu skrip apa pun.
            <details key={item.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink-900 marker:content-none">
                <h3>{item.question}</h3>
                <Icon
                  name="arrow-right"
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-open:rotate-90"
                  strokeWidth={2.2}
                />
              </summary>
              <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Ajakan penutup: pengguna diarahkan ke admin untuk mendapatkan kode akses. */}
      <section className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-7 sm:p-9">
        <h2 className="max-w-xl text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Mulai persiapan TKA ananda dari rumah hari ini
        </h2>
        <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-brand-100">
          Satu kode akses membuka satu mata pelajaran dalam satu seri — beserta seluruh tryout,
          latihan online, hasil, dan pembahasannya.
        </p>
        <a
          href={accessCodeWhatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-accent-400 px-6 text-base font-bold text-ink-950 transition-colors hover:bg-accent-300"
        >
          <Icon name="whatsapp" className="h-5 w-5" strokeWidth={2.2} />
          Dapatkan Kode Akses
        </a>
      </section>
    </div>
  );
}

const packageContents = [
  {
    icon: "layers",
    title: "Paket soal per mata pelajaran",
    body: "Disusun bertahap dari satu subtopik ke subtopik berikutnya, bukan kumpulan soal acak, sehingga anak membangun dasarnya lebih dulu.",
  },
  {
    icon: "hourglass",
    title: "Tryout online dengan pembatas waktu",
    body: "Dikerjakan seperti ujian sebenarnya. Jawaban dan sisa waktu tersimpan di perangkat, jadi halaman yang tertutup dapat dilanjutkan.",
  },
  {
    icon: "bulb",
    title: "Pembahasan di setiap soal",
    body: "Bukan sekadar kunci jawaban: langkah pengerjaannya ditunjukkan, termasuk mengapa pilihan lain keliru.",
  },
  {
    icon: "chart",
    title: "Analisa materi yang perlu diperkuat",
    body: "Hasil dipetakan sampai ke tingkat konsep, lalu disusun menjadi urutan belajar yang bisa langsung dikerjakan.",
  },
] as const;

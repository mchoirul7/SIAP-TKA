import type { AssessmentType, EducationLevel, PracticePackage, Subject, Tryout } from "@/data/types";
import { ASSESSMENT_LABEL, semesterLabel, subjectSegment } from "@/lib/assessment";
import { formatRupiah, fullPackagePrice, packagePrice } from "@/lib/pricing";

/**
 * Daftar mapel pada halaman pilih mapel /ujian.
 *
 * Mapel wajib kelas itu selalu tampil, walau belum punya paket — kartunya lalu memakai
 * penanda "Dalam proses penambahan paket soal". Mapel lain yang punya paket
 * di basis data ikut ditambahkan di belakangnya. Gambar sampul dipotong dari
 * mockup dan dipakai ulang lintas jenjang; SMA punya set sampul sendiri (lihat `artFor`).
 */

export type SubjectTone = "emerald" | "sky" | "orange" | "violet";

interface CatalogEntry {
  key: string;
  name: string;
  description: string;
  /** Segmen slug lain di basis data yang berarti mapel yang sama. */
  aliases?: string[];
  tone: SubjectTone;
}

const ENTRIES: Record<string, CatalogEntry> = {
  agama: { key: "agama", name: "Pendidikan Agama dan Budi Pekerti", description: "Nilai-nilai agama dan akhlak mulia.", aliases: ["pendidikan-agama", "pendidikan-agama-dan-budi-pekerti"], tone: "emerald" },
  pancasila: { key: "pancasila", name: "Pendidikan Pancasila", description: "Nilai-nilai Pancasila dalam kehidupan sehari-hari.", aliases: ["pendidikan-pancasila", "ppkn", "pkn"], tone: "sky" },
  "bahasa-indonesia": { key: "bahasa-indonesia", name: "Bahasa Indonesia", description: "Membaca, menulis, dan memahami teks.", tone: "emerald" },
  matematika: { key: "matematika", name: "Matematika", description: "Bilangan, operasi hitung, dan pemecahan masalah.", tone: "emerald" },
  ipas: { key: "ipas", name: "IPAS", description: "Mengenal makhluk hidup, benda, dan lingkungan sekitar.", tone: "sky" },
  ipa: { key: "ipa", name: "IPA", description: "Makhluk hidup, materi, energi, dan bumi.", aliases: ["ilmu-pengetahuan-alam"], tone: "sky" },
  ips: { key: "ips", name: "IPS", description: "Manusia, tempat, dan kehidupan bermasyarakat.", aliases: ["ilmu-pengetahuan-sosial"], tone: "orange" },
  pjok: { key: "pjok", name: "PJOK", description: "Gerak, olahraga, dan hidup sehat.", tone: "orange" },
  "bahasa-inggris": { key: "bahasa-inggris", name: "Bahasa Inggris", description: "Kosakata, percakapan, dan pemahaman teks.", tone: "emerald" },
  "seni-rupa": { key: "seni-rupa", name: "Seni Rupa", description: "Garis, bentuk, warna, dan karya seni.", tone: "sky" },
  "seni-musik": { key: "seni-musik", name: "Seni Musik", description: "Nada, ritme, dan apresiasi musik.", tone: "orange" },
  "seni-tari": { key: "seni-tari", name: "Seni Tari", description: "Gerakan, ekspresi, dan budaya daerah.", tone: "violet" },
  "seni-budaya": { key: "seni-budaya", name: "Seni dan Budaya", description: "Karya seni dan budaya di sekitar kita.", aliases: ["seni-dan-budaya"], tone: "violet" },
  "seni-teater": { key: "seni-teater", name: "Seni Teater", description: "Ekspresi, peran, dan pertunjukan.", tone: "violet" },
  informatika: { key: "informatika", name: "Informatika", description: "Berpikir komputasional dan teknologi digital.", tone: "sky" },
  prakarya: { key: "prakarya", name: "Prakarya", description: "Kreativitas, kerajinan, dan kewirausahaan.", aliases: ["prakarya-dan-kewirausahaan"], tone: "orange" },
  "bahasa-jawa": { key: "bahasa-jawa", name: "Bahasa Jawa", description: "Bahasa, budaya, dan kearifan lokal.", tone: "violet" },
  sejarah: { key: "sejarah", name: "Sejarah", description: "Peristiwa, tokoh, dan perjalanan bangsa.", tone: "orange" },
  fisika: { key: "fisika", name: "Fisika", description: "Gerak, gaya, energi, dan gejala alam.", tone: "sky" },
  kimia: { key: "kimia", name: "Kimia", description: "Zat, reaksi, dan perubahannya.", tone: "emerald" },
  biologi: { key: "biologi", name: "Biologi", description: "Makhluk hidup dan lingkungannya.", tone: "emerald" },
  ekonomi: { key: "ekonomi", name: "Ekonomi", description: "Kebutuhan, pasar, dan pengelolaan sumber daya.", tone: "orange" },
  geografi: { key: "geografi", name: "Geografi", description: "Bumi, wilayah, dan fenomena alam.", tone: "sky" },
  sosiologi: { key: "sosiologi", name: "Sosiologi", description: "Masyarakat, interaksi, dan perubahan sosial.", tone: "violet" },
};

const COMMON_ARTS = ["agama", "pancasila", "bahasa-indonesia", "matematika", "pjok", "bahasa-inggris", "seni-rupa", "seni-musik", "seni-tari", "seni-teater", "informatika", "bahasa-jawa"];

/** Mapel seni disembunyikan dari daftar, walau sudah punya paket. */
const HIDDEN = ["seni-rupa", "seni-musik", "seni-tari", "seni-teater"];

/**
 * Mapel wajib per fase Kurikulum Merdeka. Fase A (kelas 1-2) belum ada IPAS
 * dan Bahasa Inggris; IPAS dan Bahasa Inggris masuk mulai Fase B (kelas 3).
 * SMA Fase E (kelas 10) masih mempelajari IPA dan IPS lengkap serta
 * Informatika, sedangkan di Fase F (kelas 11-12) mapel itu menjadi pilihan dan
 * hanya tampil di kelompok pilihan bila sudah punya paket. Bahasa Jawa ikut
 * sebagai muatan lokal. Kelas 1 ditambah Bahasa Inggris dan kelas 2 ditambah
 * Seni dan Budaya.
 */
const REQUIRED_BY_PHASE = {
  A: ["agama", "pancasila", "bahasa-indonesia", "matematika", "pjok", "bahasa-jawa"],
  BC: ["agama", "pancasila", "bahasa-indonesia", "matematika", "ipas", "pjok", "bahasa-inggris", "bahasa-jawa"],
  D: ["agama", "pancasila", "bahasa-indonesia", "matematika", "ipa", "ips", "bahasa-inggris", "pjok", "informatika", "prakarya", "bahasa-jawa"],
  E: ["agama", "pancasila", "bahasa-indonesia", "matematika", "bahasa-inggris", "pjok", "sejarah", "informatika", "fisika", "kimia", "biologi", "ekonomi", "geografi", "sosiologi", "bahasa-jawa"],
  F: ["agama", "pancasila", "bahasa-indonesia", "matematika", "bahasa-inggris", "pjok", "sejarah", "bahasa-jawa"],
};

function requiredForGrade(level: EducationLevel, gradeLevel: number): string[] {
  if (level === "SD" && gradeLevel === 1) return [...REQUIRED_BY_PHASE.A, "bahasa-inggris"];
  if (level === "SD" && gradeLevel === 2) return [...REQUIRED_BY_PHASE.A, "seni-budaya"];
  if (level === "SD") return gradeLevel <= 2 ? REQUIRED_BY_PHASE.A : REQUIRED_BY_PHASE.BC;
  if (level === "SMP") return REQUIRED_BY_PHASE.D;
  return gradeLevel <= 10 ? REQUIRED_BY_PHASE.E : REQUIRED_BY_PHASE.F;
}

/** TKA hanya menguji mapel tertentu, jadi mapel wajibnya lebih sedikit. */
const REQUIRED_TKA: Record<EducationLevel, string[]> = {
  SD: ["matematika", "bahasa-indonesia"],
  SMP: ["matematika", "bahasa-indonesia"],
  SMA: ["matematika", "bahasa-indonesia", "bahasa-inggris"],
};

/** Sampul untuk mapel yang tidak punya gambar sendiri di mockup. */
const ART_FALLBACKS: [RegExp, string][] = [
  [/^(ipa|ipas|fisika|kimia|biologi|geografi)/, "ipas"],
  [/^(ips|sejarah|sosiologi|antropologi|ppkn|pkn)/, "pancasila"],
  [/^(ekonomi|matematika)/, "matematika"],
  [/^bahasa-indonesia/, "bahasa-indonesia"],
  [/^bahasa-(inggris|jerman|prancis|jepang|korea|mandarin|arab)/, "bahasa-inggris"],
  [/^(prakarya|seni)/, "seni-rupa"],
  [/^smk/, "informatika"],
];

/** Sampul khusus SMA (wajib dan pilihan), dipotong dari set sampul SMA. */
const SMA_ARTS = [
  "matematika", "matematika-tingkat-lanjut", "bahasa-indonesia", "bahasa-indonesia-tingkat-lanjut",
  "bahasa-inggris", "bahasa-inggris-tingkat-lanjut", "bahasa-jerman", "bahasa-prancis", "bahasa-jepang",
  "bahasa-korea", "bahasa-mandarin", "bahasa-arab", "sejarah", "antropologi", "sosiologi",
  "biologi", "kimia", "fisika", "ekonomi", "geografi",
];

export function artFor(key: string, level: EducationLevel): string {
  if (level === "SMA" && SMA_ARTS.includes(key)) return `/beranda/mapel/sma/${key}.png`;
  const art = COMMON_ARTS.includes(key) || key === "ipas"
    ? key
    : (ART_FALLBACKS.find(([pattern]) => pattern.test(key))?.[1] ?? "bahasa-indonesia");
  return `/beranda/mapel/${art}.png`;
}

export type SubjectGroup = "wajib" | "pilihan-sma" | "pilihan-smk" | "lainnya";

export interface CatalogSubject {
  key: string;
  group: SubjectGroup;
  name: string;
  description: string;
  art: string;
  tone: SubjectTone;
  /** Kosong bila mapel belum punya paket untuk lingkup ini. */
  subject: Subject | null;
  packageCount: number;
  tryoutCount: number;
}

function entryForSegment(segment: string): CatalogEntry | undefined {
  return Object.values(ENTRIES).find((entry) => entry.key === segment || entry.aliases?.includes(segment));
}

const TONES: SubjectTone[] = ["emerald", "sky", "orange", "violet"];

export function buildSubjectCatalog(
  level: EducationLevel,
  gradeLevel: number,
  assessmentType: AssessmentType,
  available: { subject: Subject; packageCount: number; tryoutCount: number }[],
): CatalogSubject[] {
  const required = assessmentType === "tka" ? REQUIRED_TKA[level] : requiredForGrade(level, gradeLevel);
  const byKey = new Map<string, { subject: Subject; packageCount: number; tryoutCount: number }>();
  const extras: CatalogSubject[] = [];

  available.forEach((item, index) => {
    const segment = subjectSegment(item.subject);
    const entry = entryForSegment(segment);
    if (HIDDEN.includes(entry?.key ?? segment)) return;
    if (entry && required.includes(entry.key)) {
      byKey.set(entry.key, item);
      return;
    }
    extras.push({
      key: segment,
      group: segment.startsWith("smk") ? "pilihan-smk" : level === "SMA" ? "pilihan-sma" : "lainnya",
      name: entry?.name ?? item.subject.shortName,
      description: entry?.description ?? item.subject.description ?? "",
      art: artFor(entry?.key ?? segment, level),
      tone: entry?.tone ?? TONES[index % TONES.length],
      subject: item.subject,
      packageCount: item.packageCount,
      tryoutCount: item.tryoutCount,
    });
  });

  const requiredSubjects = required.map((key) => {
    const entry = ENTRIES[key];
    const found = byKey.get(key);
    return {
      key,
      group: "wajib" as const,
      name: entry.name,
      description: entry.description,
      art: artFor(key, level),
      tone: entry.tone,
      subject: found?.subject ?? null,
      packageCount: found?.packageCount ?? 0,
      tryoutCount: found?.tryoutCount ?? 0,
    };
  });

  return [...requiredSubjects, ...extras];
}

const GROUP_TITLES: Record<SubjectGroup, string> = {
  wajib: "Mapel Wajib",
  "pilihan-sma": "Mapel Pilihan SMA",
  "pilihan-smk": "Mapel Pilihan SMK",
  lainnya: "Mapel Lainnya",
};

/** Mapel dikelompokkan per section; kelompok kosong dibuang. */
export function groupSubjectCatalog(items: CatalogSubject[]) {
  return (Object.keys(GROUP_TITLES) as SubjectGroup[])
    .map((group) => ({ group, title: GROUP_TITLES[group], items: items.filter((item) => item.group === group) }))
    .filter((section) => section.items.length > 0);
}

const WHATSAPP_PHONE = "6285649834654";

export function buyPackageHref(details: {
  context: string;
  assessment: string;
  subject: string;
  price: string;
}): string {
  const message = [
    `Halo SIAP TKA ONE, saya berminat beli paket mapel ${details.subject} seharga ${details.price}, mohon dibantu.`,
    "",
    `Kelas: ${details.context}`,
    `Jenis ujian: ${details.assessment}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function buyAllAccessHref(details: { context: string; assessment: string; price: string }): string {
  const message = [
    `Halo SIAP TKA ONE, saya berminat beli All-in Akses ${details.assessment} seharga ${details.price}, mohon dibantu.`,
    "",
    `Kelas: ${details.context}`,
    `Jenis ujian: ${details.assessment}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function buySinglePackageHref(details: {
  context: string;
  assessment: string;
  packageTitle: string;
  price: string;
}): string {
  const message = [
    `Halo SIAP TKA ONE, saya berminat beli satuan paket "${details.packageTitle}" seharga ${details.price}, mohon dibantu.`,
    "",
    `Kelas: ${details.context}`,
    `Jenis ujian: ${details.assessment}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function customRequestHref(details: { context: string; assessment: string }): string {
  const message = [
    "Halo SIAP TKA ONE, saya ingin custom request soal sesuai kebutuhan.",
    "",
    `Kelas: ${details.context}`,
    `Jenis ujian: ${details.assessment}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/** Label kelas satu paket untuk pesan WhatsApp, misalnya "SD Kelas 3 Semester 1". */
export function packageContextLabel(pkg: {
  level: EducationLevel;
  gradeLevel: number;
  semester: number | null;
}): string {
  return [pkg.level, `Kelas ${pkg.gradeLevel}`, ...(pkg.semester ? [semesterLabel(pkg.semester)] : [])].join(" ");
}

export interface PurchaseOptions {
  subjectName: string;
  packageTitle: string;
  fullPrice: number | null;
  fullHref: string | null;
  singlePrice: number;
  singleHref: string;
}

/**
 * Dua pilihan beli untuk paket yang terkunci: paket lengkap mapelnya atau
 * paket ini saja. Keduanya dilayani admin lewat WhatsApp.
 */
export function purchaseOptionsFor(pkg: PracticePackage | Tryout, subjectName: string): PurchaseOptions {
  const context = packageContextLabel(pkg);
  const assessment = ASSESSMENT_LABEL[pkg.assessmentType];
  // Paket ini sudah ada, jadi mapelnya pasti punya paket untuk dihargai.
  const fullPrice = fullPackagePrice(pkg.assessmentType, { subject: true, packageCount: 0, tryoutCount: 0 });
  const singlePrice = packagePrice(pkg.kind, pkg.assessmentType);
  return {
    subjectName,
    packageTitle: pkg.title,
    fullPrice,
    fullHref:
      fullPrice !== null
        ? buyPackageHref({ context, assessment, subject: subjectName, price: formatRupiah(fullPrice) })
        : null,
    singlePrice,
    singleHref: buySinglePackageHref({
      context,
      assessment,
      packageTitle: pkg.title,
      price: formatRupiah(singlePrice),
    }),
  };
}

/** Tujuan umum "beli kode akses" bila paket yang dimaksud belum diketahui. */
export const buyAccessCodeHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
  "Halo SIAP TKA ONE, saya ingin membeli kode akses, mohon dibantu.",
)}`;

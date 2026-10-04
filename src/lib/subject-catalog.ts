import type { AssessmentType, EducationLevel, Subject } from "@/data/types";
import { subjectSegment } from "@/lib/assessment";

/**
 * Daftar mapel pada halaman pilih mapel /ujian.
 *
 * Mapel wajib selalu tampil, walau belum punya paket — kartunya lalu memakai
 * penanda "Belum tersedia" dan tombol request soal. Mapel lain yang punya paket
 * di basis data ikut ditambahkan di belakangnya. Gambar sampul dipotong dari
 * mockup dan dipakai ulang lintas jenjang (lihat `artFor`).
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
  agama: { key: "agama", name: "Pendidikan Agama dan Budi Pekerti", description: "Nilai-nilai agama dan akhlak mulia.", aliases: ["pendidikan-agama"], tone: "emerald" },
  pancasila: { key: "pancasila", name: "Pendidikan Pancasila", description: "Nilai-nilai Pancasila dalam kehidupan sehari-hari.", aliases: ["pendidikan-pancasila", "ppkn", "pkn"], tone: "sky" },
  "bahasa-indonesia": { key: "bahasa-indonesia", name: "Bahasa Indonesia", description: "Membaca, menulis, dan memahami teks.", tone: "emerald" },
  matematika: { key: "matematika", name: "Matematika", description: "Bilangan, operasi hitung, dan pemecahan masalah.", tone: "emerald" },
  ipas: { key: "ipas", name: "IPAS", description: "Mengenal makhluk hidup, benda, dan lingkungan sekitar.", tone: "sky" },
  ipa: { key: "ipa", name: "IPA", description: "Makhluk hidup, materi, energi, dan bumi.", tone: "sky" },
  ips: { key: "ips", name: "IPS", description: "Manusia, tempat, dan kehidupan bermasyarakat.", tone: "orange" },
  pjok: { key: "pjok", name: "PJOK", description: "Gerak, olahraga, dan hidup sehat.", tone: "orange" },
  "bahasa-inggris": { key: "bahasa-inggris", name: "Bahasa Inggris", description: "Kosakata, percakapan, dan pemahaman teks.", tone: "emerald" },
  "seni-rupa": { key: "seni-rupa", name: "Seni Rupa", description: "Garis, bentuk, warna, dan karya seni.", tone: "sky" },
  "seni-musik": { key: "seni-musik", name: "Seni Musik", description: "Nada, ritme, dan apresiasi musik.", tone: "orange" },
  "seni-tari": { key: "seni-tari", name: "Seni Tari", description: "Gerakan, ekspresi, dan budaya daerah.", tone: "violet" },
  "seni-teater": { key: "seni-teater", name: "Seni Teater", description: "Ekspresi, peran, dan pertunjukan.", tone: "violet" },
  informatika: { key: "informatika", name: "Informatika", description: "Berpikir komputasional dan teknologi digital.", tone: "sky" },
  prakarya: { key: "prakarya", name: "Prakarya", description: "Kreativitas, kerajinan, dan kewirausahaan.", tone: "orange" },
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

const REQUIRED: Record<EducationLevel, string[]> = {
  SD: ["agama", "pancasila", "bahasa-indonesia", "matematika", "ipas", "pjok", "bahasa-inggris", "seni-rupa", "seni-musik", "seni-tari", "seni-teater", "informatika", "bahasa-jawa"],
  SMP: ["agama", "pancasila", "bahasa-indonesia", "matematika", "ipa", "ips", "bahasa-inggris", "pjok", "informatika", "seni-rupa", "seni-musik", "seni-tari", "seni-teater", "prakarya", "bahasa-jawa"],
  SMA: ["agama", "pancasila", "bahasa-indonesia", "matematika", "bahasa-inggris", "pjok", "sejarah", "informatika", "fisika", "kimia", "biologi", "ekonomi", "geografi", "sosiologi", "seni-rupa", "seni-musik", "seni-tari", "seni-teater", "bahasa-jawa"],
};

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

export function artFor(key: string): string {
  const art = COMMON_ARTS.includes(key) || key === "ipas"
    ? key
    : (ART_FALLBACKS.find(([pattern]) => pattern.test(key))?.[1] ?? "bahasa-indonesia");
  return `/beranda/mapel/${art}.png`;
}

export interface CatalogSubject {
  key: string;
  name: string;
  description: string;
  art: string;
  tone: SubjectTone;
  /** Kosong bila mapel belum punya paket untuk lingkup ini. */
  subject: Subject | null;
  packageCount: number;
}

function entryForSegment(segment: string): CatalogEntry | undefined {
  return Object.values(ENTRIES).find((entry) => entry.key === segment || entry.aliases?.includes(segment));
}

const TONES: SubjectTone[] = ["emerald", "sky", "orange", "violet"];

export function buildSubjectCatalog(
  level: EducationLevel,
  assessmentType: AssessmentType,
  available: { subject: Subject; packageCount: number }[],
): CatalogSubject[] {
  const required = (assessmentType === "tka" ? REQUIRED_TKA : REQUIRED)[level];
  const byKey = new Map<string, { subject: Subject; packageCount: number }>();
  const extras: CatalogSubject[] = [];

  available.forEach((item, index) => {
    const segment = subjectSegment(item.subject);
    const entry = entryForSegment(segment);
    if (entry && required.includes(entry.key)) {
      byKey.set(entry.key, item);
      return;
    }
    extras.push({
      key: segment,
      name: entry?.name ?? item.subject.shortName,
      description: entry?.description ?? item.subject.description ?? "",
      art: artFor(entry?.key ?? segment),
      tone: entry?.tone ?? TONES[index % TONES.length],
      subject: item.subject,
      packageCount: item.packageCount,
    });
  });

  const requiredSubjects = required.map((key) => {
    const entry = ENTRIES[key];
    const found = byKey.get(key);
    return {
      key,
      name: entry.name,
      description: entry.description,
      art: artFor(key),
      tone: entry.tone,
      subject: found?.subject ?? null,
      packageCount: found?.packageCount ?? 0,
    };
  });

  return [...requiredSubjects, ...extras];
}

const WHATSAPP_PHONE = "6285649834654";

export function requestSoalHref(details: { context: string; assessment: string; subject: string }): string {
  const message = [
    "Halo SIAP TKA ONE, saya ingin request materi soal.",
    "",
    `Kelas: ${details.context}`,
    `Jenis ujian: ${details.assessment}`,
    `Mata pelajaran: ${details.subject}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

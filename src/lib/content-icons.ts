import type { IconName } from "@/components/ui/Icon";

type IconInput = {
  slug?: string;
  title?: string;
  name?: string;
  shortName?: string;
  summary?: string;
  description?: string;
};

const subjectIcons: { match: RegExp; icon: IconName }[] = [
  { match: /matematika|math/, icon: "sigma" },
  { match: /bahasa[-\s]?indonesia|indonesian|literasi/, icon: "book" },
  { match: /bahasa[-\s]?inggris|english/, icon: "globe" },
  { match: /kimia|chemistry/, icon: "flask" },
  { match: /biologi|biology/, icon: "leaf" },
  { match: /fisika|physics/, icon: "bolt" },
  { match: /ipa|ipas|sains|science/, icon: "flask" },
  { match: /sejarah|history/, icon: "hourglass" },
  { match: /ekonomi|economy|akuntansi/, icon: "chart" },
  { match: /geografi|geography/, icon: "compass" },
  { match: /pancasila|ppkn|pkn|kewarganegaraan/, icon: "shield-check" },
  { match: /sosiologi|ips/, icon: "cap" },
  { match: /seni|budaya|musik|tari|rupa/, icon: "sparkles" },
  { match: /pjok|olahraga|jasmani/, icon: "trophy" },
  { match: /agama/, icon: "star" },
];

const packageIcons: { match: RegExp; icon: IconName }[] = [
  { match: /tryout|simulasi|ujian|tka/, icon: "trophy" },
  { match: /bilangan|pecahan|desimal|persen|kpk|fpb|operasi hitung/, icon: "sigma" },
  { match: /aljabar|fungsi|persamaan|pertidaksamaan|linear|kuadrat|barisan|deret/, icon: "function" },
  { match: /geometri|bangun|segitiga|lingkaran|kubus|balok|ruang|sudut/, icon: "triangle" },
  { match: /ukur|pengukuran|panjang|berat|volume|luas|keliling|waktu|kecepatan/, icon: "ruler" },
  { match: /data|diagram|grafik|tabel|statistika|peluang|kombinasi|permutasi/, icon: "data" },
  { match: /trigonometri|sinus|kosinus|tangen/, icon: "trig" },
  { match: /teks|bacaan|cerita|paragraf|puisi|pantun|gagasan|membaca|menulis/, icon: "book" },
  { match: /grammar|reading|listening|speaking|vocabulary|english|inggris/, icon: "globe" },
  { match: /kimia|atom|reaksi|larutan|asam|basa|molekul/, icon: "flask" },
  { match: /biologi|sel|organ|ekosistem|genetik|tumbuhan|hewan/, icon: "leaf" },
  { match: /fisika|gaya|energi|listrik|gelombang|optik|mekanika/, icon: "bolt" },
  { match: /sejarah|kronologi|kerajaan|peristiwa/, icon: "hourglass" },
  { match: /ekonomi|pasar|uang|inflasi|akuntansi/, icon: "chart" },
  { match: /geografi|peta|iklim|litosfer|atmosfer/, icon: "compass" },
  { match: /pancasila|ppkn|norma|konstitusi|demokrasi/, icon: "shield-check" },
];

function keyOf(input: IconInput): string {
  return [
    input.slug,
    input.title,
    input.name,
    input.shortName,
    input.summary,
    input.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function iconForSubject(subject: IconInput): IconName {
  const key = keyOf(subject);
  return subjectIcons.find((item) => item.match.test(key))?.icon ?? "layers";
}

export function iconForPackage(pkg: IconInput, fallback: IconName = "list-check"): IconName {
  const key = keyOf(pkg);
  return packageIcons.find((item) => item.match.test(key))?.icon ?? fallback;
}

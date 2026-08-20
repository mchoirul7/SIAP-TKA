/**
 * Nama materi yang cukup pendek untuk disebut di tengah kalimat.
 *
 * Nama di katalog ditulis lengkap supaya tim konten dan guru tidak salah
 * mengartikannya — "Hubungan antar-satuan baku panjang (mm, dm, cm, m, dam, hm,
 * km)" atau "Pecahan senilai menggunakan gambar dan simbol matematika". Nama
 * seperti itu benar di kartu materi, tetapi bila dua di antaranya dirangkai
 * menjadi satu kalimat ringkasan, kalimatnya menjadi tidak terbaca.
 *
 * Fungsi di file ini memotong keterangan di belakang inti namanya, bukan
 * mengarang nama baru: yang tersisa selalu potongan awal dari nama aslinya.
 * Nama utuhnya tetap tampil pada kartu rincian di bawah ringkasan.
 *
 *   "Pecahan senilai menggunakan gambar dan simbol matematika" -> "Pecahan senilai"
 *   "Hubungan antar-satuan baku panjang (mm, dm, ...)"         -> "Hubungan antar-satuan baku panjang"
 *   "Makna ungkapan dalam cerita, kisah nyata, dan puisi"      -> "Makna ungkapan"
 */

/**
 * Kata yang menandai awal keterangan, bukan inti nama materinya. Dicocokkan
 * dengan spasi di kedua sisi supaya tidak memotong di tengah kata.
 */
const TAIL_MARKERS = [
  " menggunakan ",
  " berdasarkan ",
  " dengan ",
  " lewat ",
  " melalui ",
  " terhadap ",
  " dalam ",
  " pada ",
  " untuk ",
  " beserta ",
  " bidang ",
  " yaitu ",
];

/** Potongan sependek satu kata sudah tidak menunjuk materi apa pun ("Objek"). */
const MIN_HEAD_WORDS = 2;

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Keterangan dalam tanda kurung selalu berupa daftar contoh atau satuan. */
function dropParenthetical(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

/** Bagian setelah "serta" adalah materi kedua yang digabung dalam satu nama. */
function cutBeforeSerta(name: string): string {
  const match = /,?\s+serta\s+/i.exec(name);
  if (!match || match.index <= 0) return name;
  const head = name.slice(0, match.index).trim();
  return wordCount(head) >= MIN_HEAD_WORDS ? head : name;
}

function cutBeforeTailMarker(name: string): string {
  let result = name;
  for (const marker of TAIL_MARKERS) {
    const at = result.toLowerCase().indexOf(marker);
    if (at < 0) continue;
    const head = result.slice(0, at).trim();
    if (wordCount(head) >= MIN_HEAD_WORDS) result = head;
  }
  return result;
}

/**
 * Nama berisi daftar disebut lewat butir pertamanya, ditambah keterangan yang
 * dipakai bersama seluruh butir bila ada.
 *
 *   "Operasi penjumlahan, pengurangan, perkalian, dan pembagian bilangan cacah"
 *     -> "Operasi penjumlahan bilangan cacah"
 *
 * Bila butir pertamanya hanya satu kata, daftar itu justru inti namanya
 * ("Kelipatan, faktor, KPK, dan FPB bilangan asli"), jadi namanya dibiarkan utuh.
 */
function shortenEnumeration(name: string): string {
  const comma = name.indexOf(",");
  if (comma < 0) return name;

  const head = name.slice(0, comma).trim();
  if (wordCount(head) < MIN_HEAD_WORDS) return name;

  const shared = /,\s+dan\s+\S+\s+(.+)$/i.exec(name);
  return shared ? `${head} ${shared[1].trim()}` : head;
}

/** Nama materi sependek mungkin tanpa menambah kata apa pun. */
export function shortMaterialName(name: string): string {
  const short = shortenEnumeration(cutBeforeTailMarker(cutBeforeSerta(dropParenthetical(name))));
  return short || name.trim();
}

/**
 * Nama materi untuk disebut di tengah kalimat.
 *
 * Sebagian nama ditulis dengan Huruf Kapital Pada Setiap Kata ("Makna Kontekstual
 * Kata Serapan"). Bila dibiarkan, kalimatnya terbaca timbul-tenggelam: "terdapat
 * pada makna Kontekstual Kata Serapan". Jadi setiap katanya diturunkan, kecuali
 * singkatan seperti KPK, FPB, atau AI yang justru salah bila diturunkan.
 */
export function materialNameInSentence(name: string): string {
  return shortMaterialName(name)
    .split(/(\s+)/)
    .map((word) => {
      if (/^\s+$/.test(word)) return word;
      // Singkatan ditulis seluruhnya dengan huruf kapital; itu bentuk bakunya.
      if (/^[A-Z0-9./-]+$/.test(word)) return word;
      return word.charAt(0).toLowerCase() + word.slice(1);
    })
    .join("");
}

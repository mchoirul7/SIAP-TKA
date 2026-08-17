import { readValue, removeValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

/**
 * Mode penyusun: alat bantu yang hanya berguna bagi yang menyiapkan soal, dan
 * tidak boleh terlihat siswa. Sejauh ini isinya satu — tombol prompt gambar
 * pada layar pengerjaan, lihat `VisualPromptHint`.
 *
 * Dinyalakan dengan menambahkan `?prompt=1` pada alamat halaman mana pun, lalu
 * menempel di perangkat ini sampai dimatikan dengan `?prompt=0`. Tidak ada
 * tombolnya di antarmuka: justru itu maksudnya — tidak ada yang tersandung
 * menyalakannya tanpa sengaja.
 */
const QUERY_KEY = "prompt";

export function readAuthorMode(): boolean {
  return readValue<boolean>(storageKeys.authorMode) === true;
}

/**
 * Membaca mode penyusun sekaligus menerapkan `?prompt=` bila ada di alamat.
 * Dipanggil dari efek, jadi aman terhadap render di server.
 */
export function resolveAuthorMode(search: string): boolean {
  const requested = new URLSearchParams(search).get(QUERY_KEY);
  if (requested === "1") writeValue(storageKeys.authorMode, true);
  if (requested === "0") removeValue(storageKeys.authorMode);
  return readAuthorMode();
}

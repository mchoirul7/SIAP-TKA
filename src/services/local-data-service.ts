import { clearAllValues } from "@/storage/local-storage";
import { STORAGE_PREFIX } from "@/storage/storage-keys";

/**
 * Pengerjaan siswa tidak dicatat sebagai riwayat dan tidak dikirim ke mana pun.
 * Yang tersimpan hanya keadaan yang sedang berjalan di perangkat ini, dan
 * pengguna dapat menghapusnya kapan saja lewat fungsi berikut.
 */
export function clearLocalData(): number {
  return clearAllValues(`${STORAGE_PREFIX}:`);
}

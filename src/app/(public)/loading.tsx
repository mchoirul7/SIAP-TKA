import { LoadingScreen } from "@/components/LoadingScreen";

/**
 * Tampil selama halaman dirakit di server. Isinya sama dengan layar tunggu di
 * dalam halaman, jadi lambangnya tidak berkedip berganti bentuk saat isi datang.
 */
export default function PublicLoading() {
  return (
    <div className="container-page py-20">
      <LoadingScreen message="Memuat halaman…" />
    </div>
  );
}

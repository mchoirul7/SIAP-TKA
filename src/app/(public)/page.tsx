import { HomeCatalog } from "./HomeCatalog";
import { getSubjectSummaries } from "@/services/content-service";

/**
 * Halaman depan langsung menampilkan katalog mata pelajaran.
 * Tidak ada banner pengantar di atasnya: pengguna dibawa langsung ke isi produk.
 */
export default async function HomePage() {
  const summaries = await getSubjectSummaries();

  return (
    <div className="pt-8 sm:pt-10">
      <HomeCatalog summaries={summaries} />
    </div>
  );
}

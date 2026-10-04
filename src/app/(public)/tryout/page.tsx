import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { getSubjects, getTryouts } from "@/services/content-service";
import { TryoutCatalog } from "./TryoutCatalog";

export const metadata: Metadata = pageMetadata({
  title: "Tryout TKA Online",
  description:
    "Daftar tryout TKA online per mata pelajaran, lengkap dengan jumlah soal dan durasi. Dikerjakan dengan pembatas waktu seperti ujian sebenarnya.",
  path: "/tryout",
  keywords: ["tryout TKA online", "simulasi TKA", "tryout TKA gratis"],
});

export default async function TryoutListPage() {
  const [tryouts, subjects] = await Promise.all([getTryouts(), getSubjects()]);

  return (
    <div className="container-page py-12 sm:py-14">
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: "Tryout TKA", path: "/tryout" },
          ]),
        )}
      />

      <TryoutCatalog tryouts={tryouts} subjects={subjects} />
    </div>
  );
}

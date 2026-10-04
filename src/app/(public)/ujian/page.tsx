import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { ExamTypeShowcase } from "@/components/ujian/ExamTypeShowcase";

export const metadata: Metadata = pageMetadata({
  title: "Pilih Jenis Ujian",
  description:
    "Latihan TKA, Ulangan Harian, Sumatif Tengah Semester, dan Sumatif Akhir Semester sesuai jenjang dan kelasmu.",
  path: "/ujian",
});

export default function ExamTypeListPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: "Jenis Ujian", path: "/ujian" },
          ]),
        )}
      />
      {/* Tampilan pilih jenis ujian sama persis dengan beranda. */}
      <ExamTypeShowcase />
    </>
  );
}


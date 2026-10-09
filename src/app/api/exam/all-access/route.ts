import { NextResponse } from "next/server";
import type { AssessmentType } from "@/data/types";
import { examScopeFor, SEMESTERS } from "@/lib/assessment";
import { allAccessPrice } from "@/lib/pricing";
import { buildSubjectCatalog } from "@/lib/subject-catalog";
import { parseStudyContext, type StudyContext } from "@/lib/study-context";
import { getExamSubjects } from "@/services/content-service";

type Offer = { price: number; originalPrice: number | null };

async function offerFor(type: AssessmentType, context: StudyContext, semester: number | null): Promise<Offer | null> {
  const scope = examScopeFor(type, context, semester);
  const catalog = buildSubjectCatalog(scope.level, type, await getExamSubjects(scope));
  const offer = allAccessPrice(type, scope.level, catalog);
  return offer ? { price: offer.price, originalPrice: offer.originalPrice } : null;
}

/**
 * Harga All-in Akses tiap kartu jenis ujian di beranda untuk satu kelas
 * (`?kelas=SD-4`). Sumatif memakai harga termurah dari STS dan SAS kedua
 * semester, ditampilkan sebagai "mulai".
 */
export async function GET(request: Request) {
  const context = parseStudyContext(new URL(request.url).searchParams.get("kelas"));
  if (!context) return NextResponse.json({ message: "Kelas tidak valid." }, { status: 400 });

  const sumatifTypes: AssessmentType[] = ["sumatif_tengah_semester", "sumatif_akhir_semester"];
  const [tka, ulanganHarian, ...sumatif] = await Promise.all([
    offerFor("tka", context, null),
    offerFor("ulangan_harian", context, null),
    ...sumatifTypes.flatMap((type) => SEMESTERS.map((semester) => offerFor(type, context, semester))),
  ]);
  const cheapestSumatif = sumatif
    .filter((offer): offer is Offer => offer !== null)
    .reduce<Offer | null>((min, offer) => (min === null || offer.price < min.price ? offer : min), null);

  return NextResponse.json(
    {
      tka,
      ulangan_harian: ulanganHarian,
      sumatif: cheapestSumatif,
    },
    // Jumlah paket jarang berubah; cukup dihitung ulang tiap jam.
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}

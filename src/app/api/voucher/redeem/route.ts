import { NextResponse } from "next/server";
import { entitlementKey } from "@/lib/entitlements";
import {
  createEntitlementCookieValue,
  ENTITLEMENT_COOKIE_MAX_AGE,
  ENTITLEMENT_COOKIE_NAME,
  parseEntitlementCookieValue,
} from "@/lib/server-entitlements";
import { supabase } from "@/lib/supabase";
import { normalizeVoucherCode, voucherErrorMessage } from "@/lib/voucher";

interface RedeemVoucherRow {
  product_slug: string | null;
  subject_slug: string | null;
  series_slug: string | null;
  package_slug: string | null;
}

function errorCode(message?: string): string {
  if (message?.includes("VOUCHER_EXPIRED")) return "VOUCHER_EXPIRED";
  if (message?.includes("VOUCHER_EXHAUSTED")) return "VOUCHER_EXHAUSTED";
  return "VOUCHER_INVALID";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
  const code = normalizeVoucherCode(typeof body?.code === "string" ? body.code : "");

  if (!code) {
    return NextResponse.json(
      { code: "VOUCHER_EMPTY", message: voucherErrorMessage("VOUCHER_EMPTY") },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("redeem_voucher", { p_code: code });
  if (error) {
    const code = errorCode(error.message);
    return NextResponse.json({ code, message: voucherErrorMessage(code) }, { status: 400 });
  }

  const rows = (data ?? []) as RedeemVoucherRow[];
  const unlockedPackageSlugs = [
    ...new Set(rows.flatMap((row) => (row.package_slug ? [row.package_slug] : []))),
  ];
  const unlockedSeriesKeys = [
    ...new Set(
      rows.flatMap((row) =>
        row.subject_slug && row.series_slug ? [entitlementKey(row.subject_slug, row.series_slug)] : [],
      ),
    ),
  ];

  if (unlockedSeriesKeys.length === 0) {
    return NextResponse.json(
      { code: "VOUCHER_INVALID", message: "Kode akses tidak terhubung ke seri yang aktif." },
      { status: 400 },
    );
  }

  const currentKeys = parseEntitlementCookieValue(
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ENTITLEMENT_COOKIE_NAME}=`))
      ?.slice(ENTITLEMENT_COOKIE_NAME.length + 1),
  );

  const response = NextResponse.json({
    code,
    message: "Kode akses berhasil digunakan.",
    unlockedSeriesKeys,
    unlockedPackageSlugs,
  });
  response.cookies.set(
    ENTITLEMENT_COOKIE_NAME,
    createEntitlementCookieValue([...currentKeys, ...unlockedSeriesKeys]),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ENTITLEMENT_COOKIE_MAX_AGE,
    },
  );
  return response;
}

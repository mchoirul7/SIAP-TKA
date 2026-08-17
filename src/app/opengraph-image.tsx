import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * Gambar pratinjau tautan.
 *
 * WhatsApp baru menampilkan kartu besar bila gambarnya cukup lapang; berkas
 * lambang aslinya hanya 302×170 dan akan tampil sebagai ikon kecil di samping
 * teks. Karena itu lambangnya disusun ulang di sini pada kanvas 1200×630 —
 * ukuran yang sama-sama diterima WhatsApp, Facebook, X, dan Telegram.
 *
 * Berkas ini juga menjadi gambar bawaan seluruh halaman: Next memakainya untuk
 * setiap rute di bawah `app/` yang tidak menyediakan gambarnya sendiri.
 */
export const alt = `${site.brandName} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dibaca sekali saat build, lalu ditanam sebagai data URI di dalam gambar. */
const logoDataUri = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "logo-siaptka.png"),
).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Ungu lambang, digelapkan ke arah biru dongker garis tepinya.
          backgroundImage: "linear-gradient(135deg, #5001da 0%, #2f0289 55%, #01024f 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Kartu putih: lambangnya bertuliskan warna gelap, jadi perlu alas terang. */}
        <div
          style={{
            display: "flex",
            padding: "36px 56px",
            borderRadius: 32,
            background: "#ffffff",
            boxShadow: "0 24px 60px rgba(1, 2, 79, 0.45)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} alt="" width={444} height={250} />
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          Latihan &amp; Tryout TKA Sesuai Kisi-Kisi
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 30,
            color: "#b7f0fc",
          }}
        >
          SD · SMP · SMA — dikerjakan dari rumah, lengkap dengan pembahasan
        </div>

        {/* Pita bawah: penanda merek, sekaligus mengunci komposisi ke tepi kanvas. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 14,
            backgroundImage: "linear-gradient(90deg, #fdbe01 0%, #fd9101 50%, #8232ff 100%)",
          }}
        />
      </div>
    ),
    size,
  );
}

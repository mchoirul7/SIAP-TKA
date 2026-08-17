import type { Config } from "tailwindcss";

/**
 * Palet diambil langsung dari lambang Siap TKA One: ungu topi wisuda, kuning
 * keemasan tulisan "ONE", biru es tulisan "SiAP TKA", dan biru dongker garis
 * tepinya. Empat warna itu yang dipakai seluruh layanan, sehingga kartu,
 * tombol, dan sampul terbaca satu keluarga dengan lambangnya.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /** Ungu lambang (#5001da) — warna utama produk: tombol, tautan, aksen. */
        brand: {
          50: "#f6f2ff",
          100: "#ece2ff",
          200: "#dbc9ff",
          300: "#c2a1ff",
          400: "#a26bff",
          500: "#8232ff",
          600: "#6a0ff0",
          700: "#5001da",
          800: "#4200b0",
          900: "#2f0289",
          950: "#1c0158",
        },
        /** Kuning keemasan sampai oranye tulisan "ONE" (#fdbe01 - #fd9101). */
        accent: {
          50: "#fff8e5",
          100: "#ffefc0",
          200: "#ffe085",
          300: "#fdd02b",
          400: "#fdbe01",
          500: "#fda801",
          600: "#fd9101",
          700: "#d96f00",
          800: "#ad5405",
          900: "#8a420b",
          950: "#4d2001",
        },
        /** Biru es tulisan "SiAP TKA" (#a9eefc - #cbf4fc). */
        aqua: {
          50: "#eafafd",
          100: "#d3f6fc",
          200: "#b7f0fc",
          300: "#7fe4fb",
          400: "#3ed2f6",
          500: "#16bce6",
          600: "#0898c2",
          700: "#0d799c",
          800: "#12627f",
          900: "#14516a",
          950: "#073448",
        },
        /** Biru dongker garis tepi lambang (#01024f), dipakai judul dan teks. */
        ink: {
          50: "#f5f6fb",
          100: "#eaecf5",
          200: "#d3d7ea",
          300: "#adb4d3",
          400: "#7f88b2",
          500: "#5a6392",
          600: "#434a75",
          700: "#33385c",
          800: "#202444",
          900: "#12153a",
          950: "#060730",
        },
      },
      fontFamily: {
        sans: [
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        prose: "68ch",
      },
      boxShadow: {
        card: "0 1px 2px rgba(12, 10, 55, 0.07)",
        raised: "0 6px 20px -8px rgba(12, 10, 55, 0.3)",
        /** Untuk kartu yang mengambang di atas pita warna. */
        float: "0 10px 30px -12px rgba(12, 10, 55, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;

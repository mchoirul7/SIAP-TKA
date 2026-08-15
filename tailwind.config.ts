import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /** Warna utama produk. Dipakai untuk tombol, tautan, aksen, dan gradasi. */
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#451a03",
        },
        /** Grafit hangat untuk judul dan teks, agar tidak bersaing dengan oranye. */
        ink: {
          50: "#f8f7f6",
          100: "#f0eeec",
          200: "#e0dcd8",
          300: "#c4beb8",
          400: "#9c948c",
          500: "#7a7169",
          600: "#5f574f",
          700: "#4a433c",
          800: "#332e29",
          900: "#1f1b17",
          950: "#12100e",
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
        card: "0 1px 2px rgba(60, 40, 25, 0.06)",
        raised: "0 6px 20px -8px rgba(60, 40, 25, 0.25)",
        /** Untuk kartu yang mengambang di atas pita warna. */
        float: "0 10px 30px -12px rgba(60, 40, 25, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;

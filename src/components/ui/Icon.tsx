import type { ReactNode, SVGProps } from "react";

/**
 * Kumpulan ikon garis, digambar langsung sebagai SVG.
 *
 * Sengaja tidak memakai pustaka ikon: jumlah ikon yang dipakai produk ini
 * sedikit, dan menyimpannya di sini membuat berkas hasil build tetap kecil
 * serta tidak menambah paket pihak ketiga. Semua ikon memakai `currentColor`,
 * jadi warnanya mengikuti kelas teks pada elemen pembungkusnya.
 */

export type IconName =
  | "check"
  | "close"
  | "minus"
  | "clock"
  | "hourglass"
  | "target"
  | "sparkles"
  | "trophy"
  | "medal"
  | "book"
  | "bulb"
  | "chart"
  | "flag"
  | "play"
  | "arrow-right"
  | "arrow-left"
  | "lock"
  | "unlock"
  | "ticket"
  | "bolt"
  | "fire"
  | "star"
  | "refresh"
  | "list-check"
  | "pencil"
  | "info"
  | "alert"
  | "compass"
  | "cap"
  | "layers"
  | "shield-check"
  | "note"
  | "globe"
  | "flask"
  | "share"
  | "leaf";

const paths: Record<IconName, ReactNode> = {
  check: <path d="M4.5 12.5l5 5L19.5 6.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  minus: <path d="M5.5 12h13" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  hourglass: (
    <>
      <path d="M7.5 3.2h9M7.5 20.8h9" />
      <path d="M8.6 3.2v3.1c0 1.9 3.4 3.2 3.4 5.7s-3.4 3.8-3.4 5.7v3.1" />
      <path d="M15.4 3.2v3.1c0 1.9-3.4 3.2-3.4 5.7s3.4 3.8 3.4 5.7v3.1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  sparkles: (
    <>
      <path d="M11 3.4l1.7 4.4 4.4 1.7-4.4 1.7-1.7 4.4-1.7-4.4L4.9 9.5l4.4-1.7z" />
      <path d="M17.6 14.4l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3.8h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5.4H4.4v1.4a3.6 3.6 0 0 0 3.1 3.5" />
      <path d="M17 5.4h2.6v1.4a3.6 3.6 0 0 1-3.1 3.5" />
      <path d="M12 13.8v3.6M8.4 20.2h7.2" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5.2" />
      <path d="M8.6 10.4L6 3.4h12l-2.6 7" />
      <path d="M12 12.9l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3z" />
    </>
  ),
  book: (
    <>
      <path d="M4.2 5.6A2.6 2.6 0 0 1 6.8 3H19.4v13.6H6.8a2.6 2.6 0 0 0-2.6 2.6z" />
      <path d="M4.2 19.2A2.6 2.6 0 0 0 6.8 21.8h12.6v-5.2" />
    </>
  ),
  bulb: (
    <>
      <path d="M12 3.2a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2l.1.8h4.8l.1-.8c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3.2z" />
      <path d="M9.7 19.2h4.6M10.6 21.4h2.8" />
    </>
  ),
  chart: (
    <>
      <path d="M3.4 20.4h17.2" />
      <path d="M7 20.4v-5.6M12 20.4v-9.6M17 20.4v-13" />
    </>
  ),
  flag: (
    <>
      <path d="M5.4 21V3.4" />
      <path d="M5.4 4.6h11.4l-1.7 3.6 1.7 3.6H5.4z" />
    </>
  ),
  play: <path d="M8.2 5.4l10.2 6.6-10.2 6.6z" />,
  "arrow-right": <path d="M4.6 12h13.8M12.8 6.2l5.8 5.8-5.8 5.8" />,
  "arrow-left": <path d="M19.4 12H5.6M11.2 6.2L5.4 12l5.8 5.8" />,
  lock: (
    <>
      <rect x="4.4" y="10.2" width="15.2" height="10.4" rx="2.6" />
      <path d="M8.4 10.2V7.8a3.6 3.6 0 0 1 7.2 0v2.4" />
      <path d="M12 14.4v2.2" />
    </>
  ),
  unlock: (
    <>
      <rect x="4.4" y="10.2" width="15.2" height="10.4" rx="2.6" />
      <path d="M8.4 10.2V7.8a3.6 3.6 0 0 1 7-1.2" />
      <path d="M12 14.4v2.2" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.6 8.6A1.6 1.6 0 0 1 5.2 7h13.6a1.6 1.6 0 0 1 1.6 1.6v1.7a2 2 0 0 0 0 3.4v1.7a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6v-1.7a2 2 0 0 0 0-3.4z" />
      <path d="M14.4 7.6v1.6M14.4 11.2v1.6M14.4 14.8v1.6" />
    </>
  ),
  bolt: <path d="M13.4 2.8L5.6 13.4h5.2L10.6 21.2l7.8-10.6h-5.2z" />,
  fire: (
    <>
      <path d="M12 3.2c.9 2.4 2.3 3.4 3.5 4.9A6.4 6.4 0 0 1 17 12.2a5 5 0 0 1-10 0c0-1.8.7-3 1.7-4 .2.9.7 1.5 1.4 1.8.5-2.2-.1-4.3 1.9-6.8z" />
      <path d="M12 20.2a2.6 2.6 0 0 1-2.6-2.6c0-1.3.9-2 1.5-2.9.5.9 1.6 1.2 1.9 2.3.6-.4.8-1 .8-1.6.6.7 1 1.4 1 2.2a2.6 2.6 0 0 1-2.6 2.6z" />
    </>
  ),
  star: (
    <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
  ),
  refresh: (
    <>
      <path d="M20.2 12a8.2 8.2 0 1 1-2.5-5.9" />
      <path d="M20.6 3.6v4.6H16" />
    </>
  ),
  "list-check": (
    <>
      <path d="M3.4 6.4l1.4 1.4 2.6-2.8" />
      <path d="M3.4 12.4l1.4 1.4 2.6-2.8" />
      <path d="M3.4 18.4l1.4 1.4 2.6-2.8" />
      <path d="M10.4 6.2h10.2M10.4 12.2h10.2M10.4 18.2h10.2" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4.2L19 9.2 14.8 5 4 15.8z" />
      <path d="M13.4 6.4l4.2 4.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.2" />
      <path d="M12 7.6h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.2l9.2 15.6H2.8z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M15.6 8.4l-2.2 5-5 2.2 2.2-5z" />
    </>
  ),
  cap: (
    <>
      <path d="M2.8 9.4L12 4.8l9.2 4.6-9.2 4.6z" />
      <path d="M6.8 11.4v4.4c0 1.5 2.3 2.8 5.2 2.8s5.2-1.3 5.2-2.8v-4.4" />
      <path d="M21.2 9.4v5.2" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.4l8.6 4.4-8.6 4.4-8.6-4.4z" />
      <path d="M3.8 12.4L12 16.6l8.2-4.2" />
      <path d="M3.8 16.6L12 20.8l8.2-4.2" />
    </>
  ),
  "shield-check": (
    <>
      <path d="M12 3.2l7.4 2.8v5.6c0 4.4-3 7.6-7.4 8.8-4.4-1.2-7.4-4.4-7.4-8.8V6z" />
      <path d="M9 12l2.2 2.2L15.4 10" />
    </>
  ),
  note: (
    <>
      <path d="M6 3.2h7.6L18.6 8v12.8H6z" />
      <path d="M13.4 3.2V8h5" />
      <path d="M9 12.4h6.2M9 16.2h4.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.6 9.4h16.8M3.6 14.6h16.8" />
      <path d="M12 3.4c2.2 2.4 3.4 5.4 3.4 8.6s-1.2 6.2-3.4 8.6c-2.2-2.4-3.4-5.4-3.4-8.6S9.8 5.8 12 3.4z" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5.6" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="18.4" r="2.6" />
      <path d="M8.3 10.7l7.4-3.8M8.3 13.3l7.4 3.8" />
    </>
  ),
  flask: (
    <>
      <path d="M9.6 3.2h4.8" />
      <path d="M10.4 3.2v6L5.6 17.6a2.4 2.4 0 0 0 2.1 3.6h8.6a2.4 2.4 0 0 0 2.1-3.6L13.6 9.2v-6" />
      <path d="M7.8 14.4h8.4" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c.6 6.4-1.4 10.8-4.6 12.9-3 2-6.7 1.6-8.6-.4-1.9-2-1.6-5.4.6-7.6C10 6.2 15 5.2 20 4z" />
      <path d="M4.4 20.4C7 16.6 10.6 13 15 10.6" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, className = "h-5 w-5", strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

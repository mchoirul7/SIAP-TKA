"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Deretan kartu yang dapat digeser ke samping, dengan tombol panah di kiri dan
 * kanan. Tetap dapat digeser dengan sentuhan atau roda mouse bila tombol tidak
 * dipakai, dan tombol disembunyikan bila seluruh kartu sudah terlihat.
 */
export function CardCarousel({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    sync();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    return () => observer.disconnect();
  }, [sync]);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    // Bergeser kira-kira selebar satu kartu.
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.8, 360), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={sync}
        role="group"
        aria-label={ariaLabel}
        className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <CarouselButton
        side="left"
        visible={canScrollLeft}
        onClick={() => scrollByCard(-1)}
        label="Geser ke kiri"
      />
      <CarouselButton
        side="right"
        visible={canScrollRight}
        onClick={() => scrollByCard(1)}
        label="Geser ke kanan"
      />
    </div>
  );
}

function CarouselButton({
  side,
  visible,
  onClick,
  label,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={[
        "absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
        "bg-brand-100 text-brand-800 shadow-card ring-1 ring-brand-200 transition",
        "hover:bg-brand-200 sm:flex",
        side === "left" ? "-left-4" : "-right-4",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d={side === "left" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

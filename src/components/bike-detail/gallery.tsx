"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

const SHOT_LABELS = ["Full bike", "Cockpit", "Battery", "Drivetrain", "Wear marks"];

export function Gallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }

  return (
    <div>
      {/* Desktop: main photo + clickable thumbnails */}
      <div className="hidden md:block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-line">
          <Image
            src={photos[activeIndex]}
            alt={`${alt} — ${SHOT_LABELS[activeIndex] ?? "photo"}`}
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {photos.slice(1, 5).map((photo, i) => {
            const index = i + 1;
            return (
              <button
                key={photo}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={clsx(
                  "relative aspect-[4/3] overflow-hidden rounded-control bg-line transition-shadow",
                  activeIndex === index &&
                    "ring-2 ring-brand ring-offset-2 ring-offset-paper",
                )}
              >
                <Image
                  src={photo}
                  alt={`${alt} — ${SHOT_LABELS[index] ?? "photo"}`}
                  fill
                  sizes="12vw"
                  className="object-cover"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-ink/60 px-1.5 py-0.5 text-[11px] text-paper">
                  {SHOT_LABELS[index]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: swipeable gallery with dot indicator */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="relative aspect-[4/3] w-full shrink-0 snap-center bg-line"
            >
              <Image
                src={photo}
                alt={`${alt} — ${SHOT_LABELS[index] ?? "photo"}`}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {photos.map((_, index) => (
            <span
              key={index}
              className={clsx(
                "h-1.5 w-1.5 rounded-full transition-colors",
                index === activeIndex ? "bg-brand" : "bg-line",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

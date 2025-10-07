"use client";
import { useRef } from "react";
import CourseCard from "./RecommandationCard";

type Item = {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  days: string;
  time: string;
  price: string;
  teacherName: string;
  rating: number;
  distanceKm?: number;
  avatarUrl?: string;
  popular?: boolean;
};

export default function CardCarousel({ items }: { items: Item[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Recommandations</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy("left")}
            className="rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
            aria-label="Précédent"
          >
            ←
          </button>
          <button
            onClick={() => scrollBy("right")}
            className="rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
            aria-label="Suivant"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {items.map((it) => (
          <div key={it.id} className="snap-start shrink-0">
            <CourseCard
              {...it}
              liked={false}
              onToggleLike={() => {}}
              className="mr-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

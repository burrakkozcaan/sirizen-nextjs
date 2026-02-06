"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface Attribute {
  id: number;
  key: string;
  value: string;
}

interface ProductAttributesSliderProps {
  attributes: Attribute[];
}

export function ProductAttributesSlider({
  attributes,
}: ProductAttributesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      return () => element.removeEventListener("scroll", checkScroll);
    }
  }, [attributes]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (attributes.length === 0) return null;

  return (
    <section className="relative -mx-4 px-4">
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {attributes.slice(0, 8).map((attr) => (
            <div
              key={attr.id}
              className="flex-shrink-0 bg-[#fff6e8] rounded px-3 py-2 min-w-[140px]"
            >
              <p className="text-[10px] text-[#f27a1a] mb-1 leading-tight">
                {attr.key}
              </p>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {attr.value}
              </p>
            </div>
          ))}
        </div>
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-1 z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && attributes.length > 3 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-1 z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}


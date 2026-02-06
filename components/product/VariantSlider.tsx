"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface VariantSliderProps {
  variants: Array<{
    id: number;
    value?: string;
    stock: number;
    is_default?: boolean;
  }>;
  selectedId: number | null;
  onSelect: (id: number) => void;
  title: string;
  selectedValue?: string;
}

export function VariantSlider({
  variants,
  selectedId,
  onSelect,
  title,
  selectedValue,
}: VariantSliderProps) {
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
  }, [variants]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          {title}: <span className="text-primary">{selectedValue || "Seçilmedi"}</span>
        </h3>
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth -mx-4 px-4 pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {variants.map((variant) => {
            const isSelected = selectedId === variant.id;
            return (
              <button
                key={variant.id}
                onClick={() => onSelect(variant.id)}
                disabled={variant.stock === 0}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                  isSelected
                    ? "border-[#f27a1a] bg-white text-[#f27a1a] pointer-events-none"
                    : "border-[#e6e6e6] bg-white hover:border-[#f27a1a]/50",
                  variant.stock === 0 && "opacity-50 line-through"
                )}
              >
                {variant.value || `Varyant ${variant.id}`}
              </button>
            );
          })}
        </div>
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-1 z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-1 z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}


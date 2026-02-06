"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategoryDrawer } from "@/contexts/CategoryDrawerContext";

export function CategorySectionHeader() {
  const { openDrawer } = useCategoryDrawer();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openDrawer();
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg md:text-xl font-bold">Kategoriler</h2>
      <Button variant="ghost" size="sm" asChild>
        <Link 
          href="/categories" 
          className="group"
          onClick={handleClick}
        >
          Tümünü Gör
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  );
}

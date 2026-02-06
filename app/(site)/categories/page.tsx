"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Grid3X3 } from "lucide-react";
import type { Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useCategoryDrawer } from "@/contexts/CategoryDrawerContext";
import { CategoryGrid } from "@/components/home/CategoryGrid";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { openDrawer } = useCategoryDrawer();

  useEffect(() => {
    // On mobile, open drawer instead of showing page
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      openDrawer();
      // Redirect to home after opening drawer
      router.push("/");
      return;
    }

    // On desktop, fetch and show categories
    const fetchCategories = async () => {
      try {
        const data = await api.get<{ data: Category[] }>("/categories");
        setCategories(data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Silently fail, show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [openDrawer, router]);

  const parentCategories = categories.filter((c) => !c.parent_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20 lg:pb-8">
        <div className="container mx-auto px-4 pt-4 pb-4 lg:pb-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-8">
      <div className="container mx-auto px-4 pt-4 pb-4 lg:pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Grid3X3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Tüm Kategoriler</h1>
          </div>
          <button
            onClick={openDrawer}
            className="lg:hidden flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-medium">Tümünü Gör</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {parentCategories.length > 0 ? (
          <CategoryGrid categories={parentCategories} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Kategori bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}

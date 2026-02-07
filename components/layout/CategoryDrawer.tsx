"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { api } from "@/lib/api";

/** Slug / isim bazlı ikon fallback (API icon gelmezse; veritabanındaki icon öncelikli) */
const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  kadin: "👗",
  erkek: "👔",
  "anne-cocuk": "👶",
  "ev-yasam": "🏠",
  supermarket: "🛒",
  kozmetik: "💄",
  "ayakkabi-canta": "👠",
  elektronik: "📱",
  "saat-aksesuar": "⌚",
  "kadin-giyim": "👗",
  "erkek-giyim": "👔",
  "bebek-giyim": "👶",
  "cocuk-giyim": "👕",
  "spor-giyim": "⚽",
  "ev-ic-giyim": "🛏️",
  moda: "👗",
  giyim: "👕",
  ev: "🏠",
  spor: "⚽",
  "ev-dekorasyon": "🖼️",
  "mutfak": "🍳",
  "bilgisayar": "💻",
  "telefon": "📱",
  "oyuncak": "🧸",
  "kitap": "📚",
  "takı": "💎",
  aksesuar: "👜",
};

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDrawer({ open, onOpenChange }: CategoryDrawerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); // Store all categories for icon lookup
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);

  // Helper: veritabanından gelen icon öncelikli, yoksa slug/isim ile eşleştir
  const getCategoryIcon = (category: Category): string => {
    // 1) Kategori kendi icon'una sahipse (API/DB)
    if (category.icon && String(category.icon).trim() !== "") return category.icon;

    // 2) allCategories içinde id/slug ile bul, icon varsa kullan
    const foundById = allCategories.find((c) => c.id === category.id);
    if (foundById?.icon && String(foundById.icon).trim() !== "") return foundById.icon;
    const foundBySlug = allCategories.find((c) => c.slug === category.slug);
    if (foundBySlug?.icon && String(foundBySlug.icon).trim() !== "") return foundBySlug.icon;

    const findInChildren = (cats: Category[]): string | null => {
      for (const cat of cats) {
        if (cat.id === category.id && cat.icon) return cat.icon;
        if (cat.slug === category.slug && cat.icon) return cat.icon;
        if (cat.children) {
          const found = findInChildren(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    const foundInChildren = findInChildren(allCategories);
    if (foundInChildren) return foundInChildren;

    if (category.parent_id && selectedCategory?.icon) return selectedCategory.icon;

    // 3) Slug ile eşleştir (kadin-giyim -> 👗 vb.)
    const slug = (category.slug || "").toLowerCase();
    if (CATEGORY_ICON_BY_SLUG[slug]) return CATEGORY_ICON_BY_SLUG[slug];
    const slugParts = slug.split("-");
    for (const part of slugParts) {
      if (CATEGORY_ICON_BY_SLUG[part]) return CATEGORY_ICON_BY_SLUG[part];
    }

    // 4) İsim anahtar kelime (Giyim, Moda, Elektronik vb.)
    const name = (category.name || "").toLowerCase();
    if (name.includes("giyim") || name.includes("moda")) return "👗";
    if (name.includes("erkek")) return "👔";
    if (name.includes("kadın") || name.includes("kadin")) return "👗";
    if (name.includes("çocuk") || name.includes("cocuk") || name.includes("bebek")) return "👶";
    if (name.includes("ev") || name.includes("yaşam") || name.includes("yasam")) return "🏠";
    if (name.includes("market") || name.includes("süper")) return "🛒";
    if (name.includes("kozmetik") || name.includes("güzellik")) return "💄";
    if (name.includes("ayakkabı") || name.includes("ayakkabi") || name.includes("çanta") || name.includes("canta")) return "👠";
    if (name.includes("elektronik") || name.includes("telefon")) return "📱";
    if (name.includes("saat") || name.includes("aksesuar")) return "⌚";
    if (name.includes("spor")) return "⚽";

    return "📦";
  };

  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const response = await api.get<Category[] | { data: Category[] }>("/categories");
          const cats = Array.isArray(response) ? response : response.data || [];
          
          // Store all categories for icon lookup
          setAllCategories(cats);
          
          // Filter main categories (no parent_id) - these should already have children populated from API
          const mainCats = cats.filter((c) => !c.parent_id);
          setCategories(mainCats);
          setSelectedCategory(null);
          setCategoryPath([]);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
          setAllCategories([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    } else {
      // Reset when drawer closes
      setSelectedCategory(null);
      setCategoryPath([]);
    }
  }, [open]);

  const handleCategoryClick = (category: Category, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (category.children && category.children.length > 0) {
      // Has subcategories, show them
      setCategoryPath([...categoryPath, category]);
      setSelectedCategory(category);
    } else {
      // No subcategories, navigate to category page
      handleClose();
      window.location.href = `/category/${category.slug}`;
    }
  };

  const handleBack = () => {
    if (categoryPath.length > 0) {
      const newPath = categoryPath.slice(0, -1);
      setCategoryPath(newPath);
      setSelectedCategory(newPath.length > 0 ? newPath[newPath.length - 1] : null);
    } else {
      setSelectedCategory(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Get current categories to display
  const currentCategories = selectedCategory?.children || categories;
  const hasBackButton = categoryPath.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent
        className="max-h-[75vh] rounded-t-[24px]"
        style={{ height: "75%" }}
      >
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between border-b px-4 py-3 pb-3">
          <div className="flex items-center gap-2 flex-1">
            {hasBackButton && (
              <button
                onClick={handleBack}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Geri"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <DrawerTitle className="text-lg font-semibold m-0">
              {selectedCategory ? selectedCategory.name : "Kategoriler"}
            </DrawerTitle>
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Kapat"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-4 px-2 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="flex-1 h-5 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2">
              {currentCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Alt kategori bulunamadı
                </div>
              ) : (
                currentCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={(e) => handleCategoryClick(category, e)}
                    className="flex w-full items-center gap-3 py-4 px-2 hover:bg-muted/50 rounded-lg transition-colors group cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                      {getCategoryIcon(category)}
                    </div>

                    {/* Category Name */}
                    <span className="flex-1 text-left text-base font-medium text-foreground">
                      {category.name}
                    </span>

                    {/* Arrow - show if has children */}
                    {category.children && category.children.length > 0 && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Category } from "@/types";

interface MegaMenuProps {
  onClose: () => void;
}

export function MegaMenu({ onClose }: MegaMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get<Category[] | { data: Category[] }>("/categories");
        const cats = Array.isArray(response) ? response : response.data || [];
        const mainCats = cats.filter((c) => !c.parent_id);
        setCategories(mainCats);
        if (mainCats.length > 0 && !activeCategory) {
          setActiveCategory(mainCats[0].id);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const activeParent = categories.find((c) => c.id === activeCategory);

  // Group children into columns for the subcategory display
  const getSubcategoryGroups = () => {
    if (!activeParent?.children) return [];
    const children = activeParent.children;
    // Split into groups of 5 for columns
    const groups: (typeof children)[] = [];
    for (let i = 0; i < children.length; i += 5) {
      groups.push(children.slice(i, i + 5));
    }
    return groups;
  };

  return (
    <div
      className="bg-card shadow-xl rounded-b-lg border animate-in fade-in slide-in-from-top-2 duration-200 flex min-w-[800px]"
      onMouseLeave={onClose}
    >
      {/* Left sidebar - Category list */}
      <div className="w-48 border-r bg-muted/30 py-2 shrink-0">
        {loading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Yükleniyor...</div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Kategori bulunamadı</div>
        ) : (
          categories.slice(0, 10).map((category) => (
          <button
            key={category.id}
            onMouseEnter={() => setActiveCategory(category.id)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150",
              activeCategory === category.id
                ? "bg-background text-primary font-medium"
                : "text-foreground hover:bg-background/50"
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{category.icon}</span>
              <span>{category.name}</span>
            </span>
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-150",
                activeCategory === category.id
                  ? "text-primary translate-x-0.5"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))
        )}
      </div>

      {/* Right content - Subcategories */}
      <div className="w-[600px] p-6">
        {activeParent && (
          <>
            <Link
              href={`/category/${activeParent.slug}`}
              onClick={onClose}
              className="text-primary font-semibold text-sm hover:underline mb-4 inline-block"
            >
              {activeParent.name} →
            </Link>

            <div className="grid grid-cols-3 gap-6 mt-4">
              {/* Mock subcategory groups based on Trendyol's layout */}
              {activeParent.children && activeParent.children.length > 0 ? (
                <>
                  {/* Giyim group */}
                  <div>
                    <h4 className="text-primary font-medium text-sm mb-2">
                      Giyim →
                    </h4>
                    <ul className="space-y-1.5">
                      {activeParent.children.slice(0, 5).map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/category/${sub.slug}`}
                            onClick={onClose}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Daha Fazla Gör ↓
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Ayakkabı group */}
                  <div>
                    <h4 className="text-primary font-medium text-sm mb-2">
                      Ayakkabı →
                    </h4>
                    <ul className="space-y-1.5">
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Topuklu Ayakkabı
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Sneaker
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Günlük Ayakkabı
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Babet
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Sandalet
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Daha Fazla Gör ↓
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Çanta group */}
                  <div>
                    <h4 className="text-primary font-medium text-sm mb-2">
                      Çanta →
                    </h4>
                    <ul className="space-y-1.5">
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Omuz Çantası
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Sırt Çantası
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Bel Çantası
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Okul Çantası
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Laptop Çantası
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Daha Fazla Gör ↓
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Second row */}
                  <div>
                    <h4 className="text-primary font-medium text-sm mb-2">
                      Ev & İç Giyim →
                    </h4>
                    <ul className="space-y-1.5">
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Pijama Takımı
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Gecelik
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Sütyen
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          İç Çamaşırı Takımları
                        </Link>
                      </li>
                      <li>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Daha Fazla Gör ↓
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-primary font-medium text-sm mb-2">
                      Kozmetik →
                    </h4>
                    <ul className="space-y-1.5">
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Parfüm
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Göz Makyajı
                        </Link>
                      </li>
                      <li>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Daha Fazla Gör ↓
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-primary font-medium text-sm mb-2">
                      Spor & Outdoor →
                    </h4>
                    <ul className="space-y-1.5">
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Sweatshirt
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Tişört
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Spor Sütyeni
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Tayt
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={onClose}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Eşofman
                        </Link>
                      </li>
                      <li>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Daha Fazla Gör ↓
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Alt kategori bulunamadı
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

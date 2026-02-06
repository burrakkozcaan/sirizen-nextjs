"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronRight, User, HelpCircle, Info, Globe } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { api } from "@/lib/api";
import { SirizenLogo } from "@/components/SirizenLogo";

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenuDrawer({
  open,
  onOpenChange,
}: MobileMenuDrawerProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const response = await api.get<Category[] | { data: Category[] }>("/categories");
          const cats = Array.isArray(response) ? response : response.data || [];
          setCategories(cats);
          if (cats.length > 0) {
            setActiveSection(0);
            setActiveCategoryIndex(0);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    }
  }, [open]);

  // Update indicator position when active section changes
  useEffect(() => {
    if (sectionRef.current && indicatorRef.current && categories.length > 0) {
      const activeElement = sectionRef.current.querySelector(`[data-section-id="${activeSection}"]`) as HTMLElement;
      if (activeElement) {
        const left = activeElement.offsetLeft;
        const width = activeElement.offsetWidth;
        indicatorRef.current.style.insetInlineStart = `${left}px`;
        indicatorRef.current.style.width = `${width}px`;
      }
    }
  }, [activeSection, categories]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    setActiveCategoryIndex(0);
  };

  const currentCategory = categories[activeSection];
  const currentChildren = currentCategory?.children || [];

  // Group children for the left sidebar (simulate subcategory groups)
  // For now, just use the children directly as category titles
  const categoryTitles = currentChildren.map(child => child.name);

  // Get items for the current selected category (in real implementation, this would fetch subcategories)
  const getCurrentCategoryItems = () => {
    if (!currentCategory) return [];

    // Add "Tümünü Gör" as first item
    const items: { id: number; name: string; slug: string; image: string | null }[] = [
      {
        id: 0,
        name: "Tümünü Gör",
        slug: currentCategory.slug,
        image: currentCategory.image || null
      }
    ];

    // Add all children with their images
    currentChildren.forEach(child => {
      items.push({
        id: child.id,
        name: child.name,
        slug: child.slug,
        image: child.image || null
      });
    });

    return items;
  };

  const currentCategoryItems = getCurrentCategoryItems();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        hideCloseButton
        className="w-full p-0 flex flex-col bg-white max-w-none sm:max-w-none border-0"
        style={{ maxWidth: "100vw" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <Link href="/" onClick={handleClose}>
            <SirizenLogo size="md" />
          </Link>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Sections (horizontal scrollable tabs) */}
        <div
          ref={sectionRef}
          className="flex items-center gap-6 px-4 py-0 border-b border-gray-200 overflow-x-auto scrollbar-hide relative min-h-[40px]"
        >
          {loading ? (
            // Skeleton tabs
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse my-3" />
            ))
          ) : (
            categories.map((category, index) => (
              <button
                key={category.id}
                data-section-id={index}
                onClick={() => handleSectionClick(index)}
                className={cn(
                  "whitespace-nowrap py-3 px-1 text-sm font-normal transition-colors",
                  activeSection === index
                    ? "text-primary"
                    : "text-gray-800"
                )}
              >
                {category.name}
              </button>
            ))
          )}
          {/* Tab indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-200"
            style={{ insetInlineStart: "16px", width: "42px" }}
          />
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Categories section */}
          <div className="flex flex-1 overflow-hidden">
            {/* Category titles (left sidebar) */}
            <div className="bg-gray-100 min-w-[108px] overflow-y-auto scrollbar-hide">
              <div className="flex flex-col">
                {loading ? (
                  // Skeleton sidebar
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-3 py-3">
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))
                ) : (
                  categoryTitles.map((title, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCategoryIndex(index)}
                      className={cn(
                        "text-left px-3 py-3 text-xs font-normal transition-colors border-l-2",
                        activeCategoryIndex === index
                          ? "bg-white text-gray-900 border-l-primary"
                          : "text-gray-700 border-l-transparent hover:bg-gray-50"
                      )}
                    >
                      {title}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Category items grid (right side) */}
            <div className="flex-1 overflow-y-auto p-3">
              {loading ? (
                // Skeleton grid
                <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-[60px] h-[72px] bg-gray-200 rounded animate-pulse" />
                      <div className="mt-1.5 h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                  {currentCategoryItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/category/${item.slug}`}
                      onClick={handleClose}
                      className="flex flex-col items-center"
                    >
                      <div className="w-[60px] h-[72px] bg-gray-100 rounded overflow-hidden relative">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="60px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-xl text-gray-400">📦</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 text-[10px] font-medium text-gray-800 text-center line-clamp-2 leading-tight max-h-6">
                        {item.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation menu */}
          <div className="border-t border-gray-100 shadow-[0_-4px_8px_rgba(0,0,0,0.05)]">
            {/* Login item */}
            <Link
              href="/login"
              onClick={handleClose}
              className="flex items-center justify-between px-4 h-10 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="h-[18px] w-[18px] text-gray-800" />
                <span className="text-xs text-gray-800">Üye Ol/Giriş Yap</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>

            {/* Help item */}
            <Link
              href="/help"
              onClick={handleClose}
              className="flex items-center justify-between px-4 h-10 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-[18px] w-[18px] text-gray-800" />
                <span className="text-xs text-gray-800">Yardım</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>

            {/* About us item */}
            <Link
              href="/about"
              onClick={handleClose}
              className="flex items-center justify-between px-4 h-10 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="h-[18px] w-[18px] text-gray-800" />
                <span className="text-xs text-gray-800">Hakkımızda</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>

            {/* Country selection */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-[18px] w-[18px] text-gray-800" />
                <span className="text-xs text-gray-800">Ülke Değiştir</span>
              </div>
              <button className="flex items-center justify-between w-full pl-8">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇹🇷</span>
                  <span className="text-xs text-gray-800">Türkiye</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* App download section */}
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 mb-3">
                Daha iyi bir deneyim için uygulamamızı indirin!
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  className="flex-1"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="h-10 bg-black rounded-lg flex items-center justify-center px-3 gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[8px] text-gray-300">Download on the</div>
                      <div className="text-xs text-white font-semibold -mt-0.5">App Store</div>
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex-1"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="h-10 bg-black rounded-lg flex items-center justify-center px-3 gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[8px] text-gray-300">GET IT ON</div>
                      <div className="text-xs text-white font-semibold -mt-0.5">Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

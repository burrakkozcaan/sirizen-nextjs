"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  Clock,
  Tag,
  Store,
  ChevronRight,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";

interface SearchCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Popüler aramalar
const trendingSearches = [
  "iPhone 15",
  "Spor Ayakkabı",
  "Sweatshirt Erkek",
  "Çanta Kadın",
  "Laptop",
  "Parfüm",
  "Televizyon",
  "Kulaklık",
];

// Kategori ikonları mapping
const categoryIcons: Record<string, string> = {
  electronics: "📱",
  fashion: "👗",
  home: "🏠",
  sports: "⚽",
  beauty: "💄",
  toys: "🧸",
  books: "📚",
  automotive: "🚗",
  garden: "🌿",
  food: "🍕",
};

export function SearchCommandDialog({
  open,
  onOpenChange,
}: SearchCommandDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 5));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((term: string) => {
    if (typeof window !== "undefined" && term.trim()) {
      const saved = localStorage.getItem("recentSearches");
      let searches: string[] = [];
      try {
        searches = saved ? JSON.parse(saved) : [];
      } catch {
        searches = [];
      }
      // Remove duplicates and add new term at the beginning
      searches = [term, ...searches.filter((s) => s !== term)].slice(0, 10);
      localStorage.setItem("recentSearches", JSON.stringify(searches));
      setRecentSearches(searches.slice(0, 5));
    }
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        // Search mode
        const [productsRes, categoriesRes] = await Promise.all([
          api
            .get<{ data: Product[] }>(
              `/search?q=${encodeURIComponent(searchQuery)}&per_page=6`
            )
            .catch(() => ({ data: [] })),
          api
            .get<Category[] | { data: Category[] }>(
              `/categories?search=${encodeURIComponent(searchQuery)}`
            )
            .catch(() => []),
        ]);

        const products = productsRes.data || [];
        const categories = Array.isArray(categoriesRes)
          ? categoriesRes
          : categoriesRes.data || [];

        setFilteredProducts(products.slice(0, 6));
        setFilteredCategories(categories.slice(0, 4));
      } else {
        // Popular mode - fetch bestsellers and main categories
        const [productsRes, categoriesRes] = await Promise.all([
          api
            .get<{ data: Product[] }>("/products?sort_by=bestseller&per_page=6")
            .catch(() => ({ data: [] })),
          api
            .get<Category[] | { data: Category[] }>("/categories/main")
            .catch(() => []),
        ]);

        const products = productsRes.data || [];
        const categories = Array.isArray(categoriesRes)
          ? categoriesRes
          : categoriesRes.data || [];

        setFilteredProducts(products.slice(0, 6));
        setFilteredCategories(categories.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setFilteredProducts([]);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for debounced search
  useEffect(() => {
    if (!open) return;

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced fetch
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, open, fetchSuggestions]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      onOpenChange(false);
      setQuery("");
    }
  };

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.slug}`);
    onOpenChange(false);
    setQuery("");
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`);
    onOpenChange(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0 && product.images[0]?.url) {
      return product.images[0].url;
    }
    return "/placeholder-product.png";
  };

  const getProductName = (product: Product): string => {
    return product.name || product.title || "Ürün";
  };

  const getCategoryIcon = (category: Category): string => {
    if (category.icon) return category.icon;
    const slug = category.slug?.toLowerCase() || "";
    return categoryIcons[slug] || "📦";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden data-[state=open]:animate-none data-[state=closed]:animate-none">
        <DialogTitle className="sr-only">Ürün Ara</DialogTitle>

        {/* Search Input */}
        <div className="flex items-center border-b px-4 bg-background">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            type="text"
            placeholder="Ürün, kategori veya marka ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 h-14 text-base"
            autoFocus
          />
          {loading && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin mr-2" />
          )}
          {query && !loading && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-6">
            {/* Trending Searches */}
            {!query && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Popüler Aramalar</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      className="rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Son Aramalar</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={clearRecentSearches}
                  >
                    Temizle
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
                      onClick={() => handleSearch(term)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{term}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {filteredCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <span>{query ? "Kategoriler" : "Popüler Kategoriler"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                      onClick={() => handleCategoryClick(category.slug)}
                    >
                      {category.image ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-2xl flex-shrink-0">
                          {getCategoryIcon(category)}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {category.name}
                        </p>
                        {category.product_count !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {category.product_count.toLocaleString("tr-TR")} ürün
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Suggestions */}
            {filteredProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                  {query ? (
                    <>
                      <Store className="h-4 w-4 text-green-500" />
                      <span>Ürün Önerileri</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      <span>Öne Çıkan Ürünler</span>
                    </>
                  )}
                </div>
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left group"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={getProductImage(product)}
                          alt={getProductName(product)}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-1 rounded-br">
                            %{product.discount_percentage}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                          {typeof product.brand === "string"
                            ? product.brand
                            : product.brand?.name}{" "}
                          <span className="font-normal text-muted-foreground">
                            {getProductName(product)}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-primary">
                            {product.price.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            TL
                          </span>
                          {product.original_price &&
                            product.original_price > product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {product.original_price.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                TL
                              </span>
                            )}
                        </div>
                        {product.has_free_shipping && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] mt-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          >
                            Ücretsiz Kargo
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query &&
              !loading &&
              filteredProducts.length === 0 &&
              filteredCategories.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    &quot;{query}&quot; için sonuç bulunamadı
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Farklı kelimelerle aramayı deneyin
                  </p>
                </div>
              )}

            {/* Search All Results */}
            {query && (filteredProducts.length > 0 || filteredCategories.length > 0) && (
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleSearch(query)}
              >
                <Search className="h-4 w-4 mr-2" />
                &quot;{query}&quot; için tüm sonuçları gör
              </Button>
            )}
          </div>
        </ScrollArea>

        {/* Keyboard Shortcut Hint */}
        <div className="border-t p-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>Aramak için Enter&apos;a basın</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              ESC
            </kbd>
            <span>kapatır</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

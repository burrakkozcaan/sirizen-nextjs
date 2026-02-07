"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Star, Zap, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryFilters } from "@/components/category/CategoryFilters";
import { Pagination } from "@/components/category/Pagination";
import { api } from "@/lib/api";
import type { Product, ProductFilters } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [gridCols, setGridCols] = useState<2 | 4>(4);

  const [filters, setFilters] = useState<ProductFilters>({
    sort_by: "relevance",
    brand: [],
    min_price: undefined,
    max_price: undefined,
    has_free_shipping: false,
    is_in_stock: false,
    rating: undefined,
  });

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("q", query);
        params.append("page", currentPage.toString());
        params.append("per_page", "24");
        if (filters.sort_by) params.append("sort_by", filters.sort_by);
        if (filters.brand && filters.brand.length > 0) {
          filters.brand.forEach((b) => params.append("brand[]", b));
        }
        if (filters.min_price)
          params.append("min_price", filters.min_price.toString());
        if (filters.max_price)
          params.append("max_price", filters.max_price.toString());
        if (filters.has_free_shipping) params.append("free_shipping", "true");
        if (filters.is_in_stock) params.append("in_stock", "true");
        if (filters.rating) params.append("rating", filters.rating.toString());

        const response = await api.get<{
          query: string;
          data: any[];
          meta: { total: number; last_page: number; current_page: number };
        }>(`/search?${params.toString()}`);

        const mappedProducts = (
          (response.data || (response as any).products || []) as any[]
        ).map((p: any) => ({
          ...p,
          name: p.name || p.title || "",
          brand:
            typeof p.brand === "string"
              ? p.brand
              : p.brand?.name || p.brand_slug || "",
          brand_slug:
            p.brand_slug || (typeof p.brand === "object" ? p.brand?.slug : ""),
          rating:
            typeof p.rating === "string" ? parseFloat(p.rating) : p.rating || 0,
          review_count: p.review_count || p.reviews_count || 0,
          images: p.images || [],
        }));

        setProducts(mappedProducts);
        setTotalProducts(
          response.meta?.total || (response as any).products?.total || 0
        );
        setLastPage(
          response.meta?.last_page || (response as any).products?.last_page || 1
        );
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, filters, currentPage]);

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilter = (key: keyof ProductFilters) => {
    const newFilters = { ...filters };
    if (key === "brand") {
      newFilters.brand = [];
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const activeFilterCount = [
    filters.brand?.length ? 1 : 0,
    filters.min_price || filters.max_price ? 1 : 0,
    filters.has_free_shipping ? 1 : 0,
    filters.is_in_stock ? 1 : 0,
    filters.rating ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Arama Yapın</h1>
        <p className="text-muted-foreground">
          Ürün, kategori veya marka arayabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            "{query}" için arama sonuçları
          </h1>
          <p className="text-muted-foreground">
            {totalProducts.toLocaleString("tr-TR")} ürün bulundu
          </p>
        </div>

        {/* Quick Filter Tabs */}
        <div className="mb-6">
          <div className="w-full overflow-x-auto scrollbar-hide overflow-y-hidden -mx-4 px-4">
            <div className="flex gap-[10px] min-w-max pb-2">
              <button
                onClick={() =>
                  updateFilters({
                    has_free_shipping: !filters.has_free_shipping,
                  })
                }
                className={`h-[50px] rounded-sm transition-colors flex items-center gap-[15px] pl-[14px] pr-[14px] py-[2px] flex-shrink-0 ${
                  filters.has_free_shipping
                    ? "bg-white border-2 border-primary shadow-sm"
                    : "bg-white/5 hover:bg-white/10 border border-gray-200"
                }`}
              >
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium whitespace-nowrap">
                  Kargo Bedava
                </span>
              </button>

              <button
                onClick={() =>
                  updateFilters({
                    rating: filters.rating === 4 ? undefined : 4,
                  })
                }
                className={`h-[50px] rounded-sm transition-colors flex items-center gap-[15px] pl-[14px] pr-[14px] py-[2px] flex-shrink-0 ${
                  filters.rating === 4
                    ? "bg-white border-2 border-primary shadow-sm"
                    : "bg-white/5 hover:bg-white/10 border border-gray-200"
                }`}
                style={{
                  background:
                    filters.rating === 4
                      ? "linear-gradient(90deg, #fff9eb 0%, #fff9eb 100%)"
                      : undefined,
                }}
              >
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium whitespace-nowrap">
                  Yüksek Puanlı Ürünler
                </span>
              </button>

              <button
                onClick={() =>
                  updateFilters({
                    sort_by:
                      filters.sort_by === "bestseller"
                        ? "relevance"
                        : "bestseller",
                  })
                }
                className={`h-[50px] rounded-sm transition-colors flex items-center gap-[15px] pl-[14px] pr-[14px] py-[2px] flex-shrink-0 ${
                  filters.sort_by === "bestseller"
                    ? "bg-white border-2 border-primary shadow-sm"
                    : "bg-white/5 hover:bg-white/10 border border-gray-200"
                }`}
                style={{
                  background:
                    filters.sort_by === "bestseller"
                      ? "linear-gradient(90deg, #ffe9dc 0%, #ffe4ee 100%)"
                      : undefined,
                }}
              >
                <Zap className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium whitespace-nowrap">
                  Flaş Ürünler
                </span>
              </button>

              <button
                onClick={() =>
                  updateFilters({
                    sort_by:
                      filters.sort_by === "newest" ? "relevance" : "newest",
                  })
                }
                className={`h-[50px] rounded-sm transition-colors flex items-center gap-[15px] pl-[14px] pr-[14px] py-[2px] flex-shrink-0 ${
                  filters.sort_by === "newest"
                    ? "bg-white border-2 border-primary shadow-sm"
                    : "bg-white/5 hover:bg-white/10 border border-gray-200"
                }`}
              >
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium whitespace-nowrap">
                  Yeni Eklenenler
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-card p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Filtreler</h2>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ sort_by: "relevance" })}
                    className="text-xs text-primary"
                  >
                    Temizle
                  </Button>
                )}
              </div>
              <CategoryFilters
                filters={filters}
                onFilterChange={updateFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-card p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Arama Sonuçları
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {totalProducts.toLocaleString("tr-TR")} ürün
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <select
                    value={filters.sort_by || "relevance"}
                    onChange={(e) =>
                      updateFilters({
                        sort_by: e.target.value as ProductFilters["sort_by"],
                      })
                    }
                    className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="relevance">Önerilen</option>
                    <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                    <option value="rating">Değerlendirme</option>
                    <option value="newest">Yeni Ürünler</option>
                    <option value="bestseller">Çok Satanlar</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  {filters.brand &&
                    filters.brand.length > 0 &&
                    filters.brand.map((brand) => (
                      <Badge key={brand} variant="secondary" className="gap-1">
                        {brand}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            updateFilters({
                              brand: filters.brand?.filter((b) => b !== brand),
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  {(filters.min_price || filters.max_price) && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.min_price || 0} - {filters.max_price || "∞"} TL
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          clearFilter("min_price");
                          clearFilter("max_price");
                        }}
                      />
                    </Badge>
                  )}
                  {filters.has_free_shipping && (
                    <Badge variant="secondary" className="gap-1">
                      Ücretsiz Kargo
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => clearFilter("has_free_shipping")}
                      />
                    </Badge>
                  )}
                  {filters.is_in_stock && (
                    <Badge variant="secondary" className="gap-1">
                      Stokta Var
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => clearFilter("is_in_stock")}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-card animate-pulse"
                  >
                    <Skeleton className="aspect-[3/4]" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-card p-12 text-center">
                <p className="text-muted-foreground">
                  "{query}" için sonuç bulunamadı
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilters({ sort_by: "relevance" })}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  gridCols === 4
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  lastPage={lastPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Zap,
  Flame,
  Filter,
  X,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicFilters } from "@/components/category/DynamicFilters";
import { Pagination } from "@/components/category/Pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilters } from "@/hooks/useFilters";
import { api } from "@/lib/api";
import type { Product, ProductFilters } from "@/types";

interface Campaign {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  discount_percentage?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface CampaignProductsClientProps {
  campaign: Campaign;
  initialProducts: Product[];
  searchParams?: Record<string, string>;
}

export function CampaignProductsClient({
  campaign,
  initialProducts,
  searchParams = {},
}: CampaignProductsClientProps) {
  const router = useRouter();

  // Dynamic filters
  const {
    filters: filterConfigs,
    filterValues,
    isLoading: filtersLoading,
    updateFilter,
    clearFilter,
    clearAllFilters,
    getActiveFilterCount,
    getActiveFilters,
    buildQueryParams,
  } = useFilters({
    campaignSlug: campaign.slug,
    filterType: "campaign",
    initialSearchParams: searchParams,
  });

  // Products state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(initialProducts.length);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.page) || 1);
  const [lastPage, setLastPage] = useState(1);
  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sort state
  const [sortBy, setSortBy] = useState<ProductFilters["sort_by"]>(
    (searchParams.sort_by as ProductFilters["sort_by"]) || "relevance"
  );

  const activeFilterCount = getActiveFilterCount();
  const activeFilters = useMemo(() => getActiveFilters(), [getActiveFilters]);

  // Countdown
  const endDate = new Date(campaign.end_date);
  const now = new Date();
  const timeLeft = endDate.getTime() - now.getTime();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(
    0,
    Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  );

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = buildQueryParams();
        params.set("page", currentPage.toString());
        params.set("per_page", "24");
        if (sortBy && sortBy !== "relevance") {
          params.set("sort_by", sortBy);
        }

        const response = await api.get<{
          data: any[];
          meta: { total: number; last_page: number; current_page: number };
        }>(`/campaigns/${campaign.slug}/products?${params.toString()}`);

        const mappedProducts = (response.data || []).map((p: any) => ({
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
        setTotalProducts(response.meta?.total || 0);
        setLastPage(response.meta?.last_page || 1);

        // Update URL
        const urlParams = new URLSearchParams();
        Object.entries(filterValues).forEach(([key, value]) => {
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0) ||
            value === false
          ) {
            return;
          }

          if (Array.isArray(value)) {
            if (typeof value[0] === "number" && typeof value[1] === "number") {
              urlParams.set(key, `${value[0]}-${value[1]}`);
            } else {
              urlParams.set(key, value.join(","));
            }
          } else if (typeof value === "boolean") {
            urlParams.set(key, "true");
          } else {
            urlParams.set(key, String(value));
          }
        });

        if (sortBy && sortBy !== "relevance") urlParams.set("sort_by", sortBy);
        if (currentPage > 1) urlParams.set("page", currentPage.toString());

        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      } catch (error) {
        console.error("Error fetching campaign products:", error);
      } finally {
        setLoading(false);
      }
    };

    // Skip initial fetch if we have initialProducts and no filters
    if (activeFilterCount > 0 || currentPage > 1 || sortBy !== "relevance") {
      fetchProducts();
    }
  }, [
    campaign.slug,
    filterValues,
    sortBy,
    currentPage,
    router,
    buildQueryParams,
    activeFilterCount,
  ]);

  const handleSortChange = (value: string) => {
    setSortBy(value as ProductFilters["sort_by"]);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilter = (key: string, value?: string) => {
    const currentValue = filterValues[key];
    if (
      Array.isArray(currentValue) &&
      value &&
      typeof currentValue[0] === "string"
    ) {
      const newValue = (currentValue as string[]).filter((v) => v !== value);
      updateFilter(key, newValue.length > 0 ? newValue : undefined);
    } else {
      clearFilter(key);
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-6">
        {/* Campaign Header */}
        <div className="bg-gradient-to-r from-primary via-primary to-destructive rounded-xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Zap
                  className="h-6 w-6 text-primary-foreground"
                  fill="currentColor"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-2">
                  {campaign.title}
                </h1>
                {campaign.discount_percentage && (
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-primary-foreground border-0"
                  >
                    <Flame className="h-3 w-3 mr-1" />%{campaign.discount_percentage} İndirim
                  </Badge>
                )}
              </div>
            </div>
            {campaign.description && (
              <p className="text-primary-foreground/90 mb-4 max-w-2xl">
                {campaign.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Kalan Süre:</span>
              </div>
              <div className="text-lg font-bold">
                {hoursLeft > 0
                  ? `${hoursLeft} saat ${minutesLeft} dakika`
                  : "Süresi doldu"}
              </div>
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
                    onClick={() => {
                      clearAllFilters();
                      setCurrentPage(1);
                    }}
                    className="text-xs text-primary"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
              </div>
              <DynamicFilters
                filters={filterConfigs}
                filterValues={filterValues}
                isLoading={filtersLoading}
                onFilterChange={(key, value) => {
                  updateFilter(key, value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-card p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {totalProducts.toLocaleString("tr-TR")} ürün
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet
                    open={mobileFiltersOpen}
                    onOpenChange={setMobileFiltersOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtreler
                        {activeFilterCount > 0 && (
                          <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                            {activeFilterCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filtreler</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        <DynamicFilters
                          filters={filterConfigs}
                          filterValues={filterValues}
                          isLoading={filtersLoading}
                          onFilterChange={(key, value) => {
                            updateFilter(key, value);
                            setCurrentPage(1);
                          }}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select
                    value={sortBy || "relevance"}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sırala" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Önerilen</SelectItem>
                      <SelectItem value="price_asc">
                        Fiyat: Düşükten Yükseğe
                      </SelectItem>
                      <SelectItem value="price_desc">
                        Fiyat: Yüksekten Düşüğe
                      </SelectItem>
                      <SelectItem value="rating">Değerlendirme</SelectItem>
                      <SelectItem value="newest">Yeni Ürünler</SelectItem>
                      <SelectItem value="bestseller">Çok Satanlar</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Grid Toggle */}
                  <div className="hidden sm:flex border rounded-lg">
                    <Button
                      variant={gridCols === 4 ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9 rounded-r-none"
                      onClick={() => setGridCols(4)}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={gridCols === 2 ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9 rounded-l-none"
                      onClick={() => setGridCols(2)}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  {activeFilters.map((filter, index) => (
                    <Badge
                      key={`${filter.key}-${filter.value}-${index}`}
                      variant="secondary"
                      className="gap-1"
                    >
                      {filter.label}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          handleClearFilter(filter.key, filter.value)
                        }
                      />
                    </Badge>
                  ))}
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
                <p className="text-muted-foreground">Sonuç bulunamadı</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    clearAllFilters();
                    setCurrentPage(1);
                  }}
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
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

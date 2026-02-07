"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import {
  Filter,
  Grid3X3,
  LayoutGrid,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryFilters } from "@/components/category/CategoryFilters";
import { Pagination } from "@/components/category/Pagination";
import { api } from "@/lib/api";
import type { Product, Category, ProductFilters } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryClientProps {
  category: Category;
  slug: string;
  searchParams: Record<string, string>;
}

export function CategoryClient({
  category,
  slug,
  searchParams: initialSearchParams,
}: CategoryClientProps) {
  const router = useRouter();
  const nextSearchParams = useNextSearchParams();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    Number(initialSearchParams.page) || 1
  );
  const [lastPage, setLastPage] = useState(1);
  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters state - sync with URL params
  const [filters, setFilters] = useState<ProductFilters>(() => {
    const sortBy = initialSearchParams.sort_by || initialSearchParams.sort || "relevance";
    const brandParam = initialSearchParams.brand || "";
    const brands = brandParam ? brandParam.split(",").filter(Boolean) : [];
    
    return {
      sort_by: (sortBy as ProductFilters["sort_by"]) || "relevance",
      brand: brands,
      min_price: initialSearchParams.min_price ? Number(initialSearchParams.min_price) : undefined,
      max_price: initialSearchParams.max_price ? Number(initialSearchParams.max_price) : undefined,
      has_free_shipping: initialSearchParams.free_shipping === "true" || initialSearchParams.has_free_shipping === "true",
      is_in_stock: initialSearchParams.in_stock === "true" || initialSearchParams.is_in_stock === "true",
      rating: initialSearchParams.rating ? Number(initialSearchParams.rating) : undefined,
    };
  });

  // Sync filters with URL params when they change externally (e.g., browser back/forward)
  useEffect(() => {
    const urlSortBy = nextSearchParams.get("sort_by") || nextSearchParams.get("sort") || "relevance";
    const urlBrand = nextSearchParams.get("brand") || "";
    const urlBrands = urlBrand ? urlBrand.split(",").filter(Boolean) : [];
    const urlMinPrice = nextSearchParams.get("min_price");
    const urlMaxPrice = nextSearchParams.get("max_price");
    const urlFreeShipping = nextSearchParams.get("free_shipping");
    const urlInStock = nextSearchParams.get("in_stock");
    const urlRating = nextSearchParams.get("rating");
    const urlPage = Number(nextSearchParams.get("page")) || 1;

    // Only update if URL params differ from current state (to avoid infinite loops)
    const urlFilters: ProductFilters = {
      sort_by: (urlSortBy as ProductFilters["sort_by"]) || "relevance",
      brand: urlBrands,
      min_price: urlMinPrice ? Number(urlMinPrice) : undefined,
      max_price: urlMaxPrice ? Number(urlMaxPrice) : undefined,
      has_free_shipping: urlFreeShipping === "true",
      is_in_stock: urlInStock === "true",
      rating: urlRating ? Number(urlRating) : undefined,
    };

    // Check if filters need to be updated
    const needsFilterUpdate = 
      filters.sort_by !== urlFilters.sort_by ||
      JSON.stringify(filters.brand || []) !== JSON.stringify(urlFilters.brand || []) ||
      filters.min_price !== urlFilters.min_price ||
      filters.max_price !== urlFilters.max_price ||
      filters.has_free_shipping !== urlFilters.has_free_shipping ||
      filters.is_in_stock !== urlFilters.is_in_stock ||
      filters.rating !== urlFilters.rating;

    if (needsFilterUpdate) {
      setFilters(urlFilters);
    }

    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nextSearchParams.get("sort_by"),
    nextSearchParams.get("sort"),
    nextSearchParams.get("brand"),
    nextSearchParams.get("min_price"),
    nextSearchParams.get("max_price"),
    nextSearchParams.get("free_shipping"),
    nextSearchParams.get("in_stock"),
    nextSearchParams.get("rating"),
    nextSearchParams.get("page"),
  ]);

  // Active filter count
  const activeFilterCount = [
    filters.brand?.length ? 1 : 0,
    filters.min_price || filters.max_price ? 1 : 0,
    filters.has_free_shipping ? 1 : 0,
    filters.is_in_stock ? 1 : 0,
    filters.rating ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("per_page", "24");
        
        if (filters.sort_by && filters.sort_by !== "relevance") {
          params.set("sort_by", filters.sort_by);
        }
        
        if (filters.brand && filters.brand.length > 0) {
          // Backend expects brand[] array format (as per actions/product.actions.ts)
          filters.brand.forEach((b) => {
            params.append("brand[]", b);
          });
        }
        
        if (filters.min_price) {
          params.set("min_price", filters.min_price.toString());
        }
        
        if (filters.max_price) {
          params.set("max_price", filters.max_price.toString());
        }
        
        if (filters.has_free_shipping) {
          params.set("free_shipping", "true");
        }
        
        if (filters.is_in_stock) {
          params.set("in_stock", "true");
        }
        
        if (filters.rating) {
          params.set("rating", filters.rating.toString());
        }

        const apiUrl = `/categories/${slug}/products?${params.toString()}`;
        console.log('Category API Request:', apiUrl);
        console.log('Filters:', filters);
        
        const response = await api.get<{
          data: any[];
          meta: { total: number; last_page: number; current_page: number };
        }>(apiUrl);
        
        console.log('Category API Response:', {
          total: response.meta?.total,
          productsCount: response.data?.length,
          firstProductBrand: response.data?.[0]?.brand
        });

        // Map API response to Product type
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
        
        if (filters.sort_by && filters.sort_by !== "relevance") {
          urlParams.set("sort_by", filters.sort_by);
        }
        
        if (filters.brand && filters.brand.length > 0) {
          // URL format: brand=brand1,brand2 (comma-separated for URL readability)
          urlParams.set("brand", filters.brand.join(","));
        }
        
        if (filters.min_price) {
          urlParams.set("min_price", filters.min_price.toString());
        }
        
        if (filters.max_price) {
          urlParams.set("max_price", filters.max_price.toString());
        }
        
        if (filters.has_free_shipping) {
          urlParams.set("free_shipping", "true");
        }
        
        if (filters.is_in_stock) {
          urlParams.set("in_stock", "true");
        }
        
        if (filters.rating) {
          urlParams.set("rating", filters.rating.toString());
        }
        
        if (currentPage > 1) {
          urlParams.set("page", currentPage.toString());
        }

        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, filters, currentPage, router]);

  // Handle filter change
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Clear single filter
  const clearFilter = (key: keyof ProductFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (key === "brand") {
        newFilters.brand = [];
      } else if (key === "min_price" || key === "max_price") {
        // Clear both price filters together
        delete newFilters.min_price;
        delete newFilters.max_price;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ sort_by: "relevance" });
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sort_by: value as ProductFilters["sort_by"] }));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white container mx-auto">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Ana Sayfa</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name || "Kategori"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className=" px-2 py-2 md:px-0 ">
        <div className="flex container mx-auto">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-card p-2 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Filtreler</h2>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs text-primary"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
              </div>
              <CategoryFilters filters={filters} onFilterChange={updateFilters} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-card  mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {category.name || "Tüm Ürünler"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {totalProducts.toLocaleString("tr-TR")} ürün
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
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
                        <CategoryFilters filters={filters} onFilterChange={updateFilters} />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select
                    value={filters.sort_by || "relevance"}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sırala" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance" className="">Önerilen</SelectItem>
                      <SelectItem value="price_asc">Fiyat: Düşükten Yükseğe</SelectItem>
                      <SelectItem value="price_desc">Fiyat: Yüksekten Düşüğe</SelectItem>
                      <SelectItem value="rating">Değerlendirme</SelectItem>
                      <SelectItem value="newest">Yeni Ürünler</SelectItem>
                      <SelectItem value="bestseller">Çok Satanlar</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Grid Toggle */}
                  <div className="flex border rounded-lg">
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
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  {filters.brand && filters.brand.length > 0 && (
                    filters.brand.map((brand) => (
                      <Badge key={brand} variant="secondary" className="gap-1 pr-1">
                        <span>{brand}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedBrands = filters.brand?.filter((b) => b !== brand) || [];
                            updateFilters({ brand: updatedBrands });
                          }}
                          className="ml-1 hover:bg-secondary rounded-full p-0.5 transition-colors"
                          aria-label={`${brand} filtresini kaldır`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                  {(filters.min_price || filters.max_price) && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <span>{filters.min_price || 0} - {filters.max_price || "∞"} TL</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters((prev) => {
                            const newFilters = { ...prev };
                            delete newFilters.min_price;
                            delete newFilters.max_price;
                            return newFilters;
                          });
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-secondary rounded-full p-0.5 transition-colors"
                        aria-label="Fiyat filtresini kaldır"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.has_free_shipping && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <span>Ücretsiz Kargo</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFilter("has_free_shipping");
                        }}
                        className="ml-1 hover:bg-secondary rounded-full p-0.5 transition-colors"
                        aria-label="Ücretsiz kargo filtresini kaldır"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.is_in_stock && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <span>Stokta Var</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFilter("is_in_stock");
                        }}
                        className="ml-1 hover:bg-secondary rounded-full p-0.5 transition-colors"
                        aria-label="Stok filtresini kaldır"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.rating && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <span>{filters.rating} Yıldız ve Üzeri</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFilter("rating");
                        }}
                        className="ml-1 hover:bg-secondary rounded-full p-0.5 transition-colors"
                        aria-label="Puan filtresini kaldır"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-card animate-pulse">
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
                <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
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

            {/* SEO Content Section */}
            {category && (
              <div className="mt-12 bg-white rounded-lg shadow-card p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">
                    {category.name} Modelleri ve Fiyatları
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.name} kategorisinde {totalProducts.toLocaleString("tr-TR")} üründen fazla
                    seçenek arasından size en uygun olanı bulabilirsiniz. En popüler markalardan,
                    en uygun fiyatlara {category.name?.toLowerCase() || "ürün"} ürünleri Trendyol'da.
                    Ücretsiz kargo ve kapıda ödeme avantajlarıyla alışverişinizi kolayca tamamlayın.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {category.name} Nasıl Seçilir?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.name} seçerken ihtiyacınıza, kullanım amacınıza ve bütçenize uygun
                    modelleri değerlendirmeniz önemlidir. Ürün yorumlarını ve puanlarını inceleyerek
                    diğer kullanıcıların deneyimlerinden faydalanabilirsiniz. Filtreleme seçeneklerini
                    kullanarak arama sonuçlarınızı daraltabilir, size en uygun ürünü hızlıca bulabilirsiniz.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {category.name} Avantajları
                  </h3>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Binlerce marka ve model seçeneği</li>
                    <li>Uygun fiyat garantisi</li>
                    <li>Hızlı ve güvenli teslimat</li>
                    <li>Kolay iade imkanı</li>
                    <li>Müşteri yorumları ile ürün karşılaştırma</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Related Tags Section */}
            {category && (
              <div className="mt-8 bg-white rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold mb-4">Bunlar da İlginizi Çekebilir</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    `${category.name} Modelleri`,
                    `${category.name} Fiyatları`,
                    `Ucuz ${category.name}`,
                    `En İyi ${category.name}`,
                    `${category.name} Kampanyaları`,
                    `${category.name} İndirim`,
                    `Yeni ${category.name}`,
                    `Popüler ${category.name}`,
                  ].map((tag, index) => (
                    <Link
                      key={index}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-sm text-foreground rounded-full border border-border hover:border-primary/30 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Product, PaginatedResponse, ProductFilters, SearchSuggestion } from '@/types';
import { mockProducts, mockCategories, allProducts } from '@/data/mock-data';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  /**
   * Get all products with filters and pagination
   */
  async getAll(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    await delay(300); // Simulate API delay

    let filtered = [...allProducts];

    // Apply filters
    if (filters.category_id) {
      filtered = filtered.filter(p => p.category_id === filters.category_id);
    }

    if (filters.vendor_id) {
      filtered = filtered.filter(p => p.vendor_id === filters.vendor_id);
    }

    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter(p => filters.brand!.includes(p.brand));
    }

    if (filters.min_price !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.min_price!);
    }

    if (filters.max_price !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.max_price!);
    }

    if (filters.rating !== undefined) {
      filtered = filtered.filter(p => p.rating >= filters.rating!);
    }

    if (filters.has_discount) {
      filtered = filtered.filter(p => p.discount_percentage && p.discount_percentage > 0);
    }

    if (filters.has_free_shipping) {
      filtered = filtered.filter(p => p.has_free_shipping);
    }

    if (filters.is_in_stock) {
      filtered = filtered.filter(p => p.is_in_stock);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'bestseller':
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      default:
        // relevance - bestsellers first, then by rating
        filtered.sort((a, b) => {
          if (a.is_bestseller && !b.is_bestseller) return -1;
          if (!a.is_bestseller && b.is_bestseller) return 1;
          return b.rating - a.rating;
        });
    }

    // Pagination
    const page = filters.page || 1;
    const perPage = filters.per_page || 24;
    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      data: filtered.slice(start, end),
      meta: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
      },
    };
  },

  /**
   * Get product by ID
   */
  async getById(id: number): Promise<Product | null> {
    await delay(200);
    return allProducts.find(p => p.id === id) || null;
  },

  /**
   * Get product by slug
   */
  async getBySlug(slug: string): Promise<Product | null> {
    await delay(200);
    return allProducts.find(p => p.slug === slug) || null;
  },

  /**
   * Search products
   */
  async search(query: string, limit: number = 10): Promise<Product[]> {
    await delay(150);
    const queryLower = query.toLowerCase();
    return allProducts
      .filter(p =>
        p.name.toLowerCase().includes(queryLower) ||
        p.brand.toLowerCase().includes(queryLower)
      )
      .slice(0, limit);
  },

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    await delay(100);
    const queryLower = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Product suggestions
    const products = allProducts
      .filter(p => p.name.toLowerCase().includes(queryLower))
      .slice(0, 4);
    
    products.forEach(p => {
      suggestions.push({
        type: 'product',
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0]?.url,
      });
    });

    // Category suggestions
    const flatCategories = mockCategories.flatMap(c => [c, ...(c.children || [])]);
    const categories = flatCategories
      .filter(c => c.name.toLowerCase().includes(queryLower))
      .slice(0, 2);

    categories.forEach(c => {
      suggestions.push({
        type: 'category',
        id: c.id,
        name: c.name,
        slug: c.slug,
      });
    });

    // Brand suggestions
    const brands = [...new Set(allProducts.map(p => p.brand))];
    const matchingBrands = brands
      .filter(b => b.toLowerCase().includes(queryLower))
      .slice(0, 2);

    matchingBrands.forEach(b => {
      const product = allProducts.find(p => p.brand === b);
      suggestions.push({
        type: 'brand',
        id: 0,
        name: b,
        slug: product?.brand_slug || b.toLowerCase(),
      });
    });

    return suggestions;
  },

  /**
   * Get products by category
   */
  async getByCategory(categoryId: number, filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    return this.getAll({ ...filters, category_id: categoryId });
  },

  /**
   * Get products by vendor
   */
  async getByVendor(vendorId: number, filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    return this.getAll({ ...filters, vendor_id: vendorId });
  },

  /**
   * Get bestseller products
   */
  async getBestsellers(limit: number = 10): Promise<Product[]> {
    await delay(200);
    return allProducts
      .filter(p => p.is_bestseller)
      .slice(0, limit);
  },

  /**
   * Get new products
   */
  async getNewArrivals(limit: number = 10): Promise<Product[]> {
    await delay(200);
    return allProducts
      .filter(p => p.is_new)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  /**
   * Get similar products
   */
  async getSimilar(productId: number, limit: number = 8): Promise<Product[]> {
    await delay(200);
    const product = allProducts.find(p => p.id === productId);
    if (!product) return [];

    return allProducts
      .filter(p => p.id !== productId && p.category_id === product.category_id)
      .slice(0, limit);
  },

  /**
   * Get products from same seller
   */
  async getFromSameSeller(productId: number, limit: number = 8): Promise<Product[]> {
    await delay(200);
    const product = allProducts.find(p => p.id === productId);
    if (!product) return [];

    return allProducts
      .filter(p => p.id !== productId && p.vendor_id === product.vendor_id)
      .slice(0, limit);
  },
};

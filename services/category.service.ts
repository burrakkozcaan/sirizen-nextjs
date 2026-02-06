import type { Category } from '@/types';
import { mockCategories } from '@/data/mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    await delay(150);
    return mockCategories;
  },

  /**
   * Get category by ID
   */
  async getById(id: number): Promise<Category | null> {
    await delay(100);
    const findCategory = (categories: Category[]): Category | null => {
      for (const cat of categories) {
        if (cat.id === id) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCategory(mockCategories);
  },

  /**
   * Get category by slug
   */
  async getBySlug(slug: string): Promise<Category | null> {
    await delay(100);
    const findCategory = (categories: Category[]): Category | null => {
      for (const cat of categories) {
        if (cat.slug === slug) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCategory(mockCategories);
  },

  /**
   * Get main (parent) categories
   */
  async getMainCategories(): Promise<Category[]> {
    await delay(100);
    return mockCategories.filter(c => c.parent_id === null);
  },

  /**
   * Get subcategories of a category
   */
  async getSubcategories(parentId: number): Promise<Category[]> {
    await delay(100);
    const parent = mockCategories.find(c => c.id === parentId);
    return parent?.children || [];
  },
};

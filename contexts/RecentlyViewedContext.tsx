"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Product } from '@/types';

const MAX_ITEMS = 20;

interface RecentlyViewedState {
  items: Product[];
}

type RecentlyViewedAction =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_RECENTLY_VIEWED'; payload: RecentlyViewedState };

interface RecentlyViewedContextType extends RecentlyViewedState {
  addProduct: (product: Product) => void;
  clearAll: () => void;
  getProducts: (limit?: number) => Product[];
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

function recentlyViewedReducer(state: RecentlyViewedState, action: RecentlyViewedAction): RecentlyViewedState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const product = action.payload;
      // Remove if already exists
      const filtered = state.items.filter(item => item.id !== product.id);
      // Add to beginning and limit
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      return { items: updated };
    }

    case 'CLEAR_ALL': {
      return { items: [] };
    }

    case 'LOAD_RECENTLY_VIEWED': {
      return action.payload;
    }

    default:
      return state;
  }
}

const initialState: RecentlyViewedState = {
  items: [],
};

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(recentlyViewedReducer, initialState);

  // Load recently viewed from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trendyol-recently-viewed');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: 'LOAD_RECENTLY_VIEWED', payload: parsed });
        } catch (error) {
          console.error('Failed to load recently viewed from localStorage:', error);
        }
      }
    }
  }, []);

  // Save recently viewed to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trendyol-recently-viewed', JSON.stringify(state));
    }
  }, [state]);

  const addProduct = useCallback((product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const getProducts = useCallback((limit?: number) => {
    return limit ? state.items.slice(0, limit) : state.items;
  }, [state.items]);

  const value: RecentlyViewedContextType = {
    ...state,
    addProduct,
    clearAll,
    getProducts,
  };

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}


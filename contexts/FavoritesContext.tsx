"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Product } from '@/types';

interface FavoritesState {
  items: Product[];
}

type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: Product }
  | { type: 'REMOVE_FAVORITE'; payload: { productId: number } }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: FavoritesState };

interface FavoritesContextType extends FavoritesState {
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (product: Product) => void;
  clearFavorites: () => void;
  isFavorite: (productId: number) => boolean;
  getCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'ADD_FAVORITE': {
      const product = action.payload;
      if (state.items.find(item => item.id === product.id)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, product],
      };
    }

    case 'REMOVE_FAVORITE': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.productId),
      };
    }

    case 'CLEAR_FAVORITES': {
      return { items: [] };
    }

    case 'LOAD_FAVORITES': {
      return action.payload;
    }

    default:
      return state;
  }
}

const initialState: FavoritesState = {
  items: [],
};

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('trendyol-favorites');
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          dispatch({ type: 'LOAD_FAVORITES', payload: parsed });
        } catch (error) {
          console.error('Failed to load favorites from localStorage:', error);
        }
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trendyol-favorites', JSON.stringify(state));
    }
  }, [state]);

  const addFavorite = useCallback((product: Product) => {
    dispatch({ type: 'ADD_FAVORITE', payload: product });
  }, []);

  const removeFavorite = useCallback((productId: number) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: { productId } });
  }, []);

  const toggleFavorite = useCallback((product: Product) => {
    if (state.items.some(item => item.id === product.id)) {
      dispatch({ type: 'REMOVE_FAVORITE', payload: { productId: product.id } });
    } else {
      dispatch({ type: 'ADD_FAVORITE', payload: product });
    }
  }, [state.items]);

  const clearFavorites = useCallback(() => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  }, []);

  const isFavorite = useCallback((productId: number) => {
    return state.items.some(item => item.id === productId);
  }, [state.items]);

  const getCount = useCallback(() => {
    return state.items.length;
  }, [state.items]);

  const value: FavoritesContextType = {
    ...state,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    isFavorite,
    getCount,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}


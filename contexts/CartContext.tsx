"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import type { CartItem, Product, ProductVariant } from '@/types';

const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 29.99;

interface CartState {
  items: CartItem[];
  couponCode: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number; variant?: ProductVariant } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: { code: string } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'LOAD_CART'; payload: CartState };

interface CartContextType extends CartState {
  isLoading: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingTotal: () => number;
  getDiscountTotal: () => number;
  getTotal: () => number;
  getItemsByVendor: () => Record<number, CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, variant } = action.payload;
      const itemId = variant 
        ? `${product.id}-${variant.id}` 
        : `${product.id}`;
      
      const existingItem = state.items.find(item => item.id === itemId);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        const price = variant?.price ?? product.price;
        const originalPrice = variant?.original_price ?? product.original_price;
        
        const newItem: CartItem = {
          id: itemId,
          product_id: product.id,
          product,
          vendor_id: product.vendor_id,
          variant_id: variant?.id,
          variant,
          quantity,
          price,
          original_price: originalPrice,
          shipping_type: product.has_free_shipping ? 'free' : 'paid',
          shipping_cost: product.has_free_shipping ? 0 : SHIPPING_COST,
        };
        
        return {
          ...state,
          items: [...state.items, newItem],
        };
      }
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== itemId),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      };
    }

    case 'CLEAR_CART': {
      return { items: [], couponCode: null };
    }

    case 'APPLY_COUPON': {
      return {
        ...state,
        couponCode: action.payload.code,
      };
    }

    case 'REMOVE_COUPON': {
      return {
        ...state,
        couponCode: null,
      };
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  couponCode: null,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('trendyol-cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsed });
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
        }
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trendyol-cart', JSON.stringify(state));
    }
  }, [state]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: ProductVariant) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, variant } });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const applyCoupon = useCallback((code: string) => {
    dispatch({ type: 'APPLY_COUPON', payload: { code } });
  }, []);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const getItemCount = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  const getSubtotal = useCallback(() => {
    return state.items.reduce(
      (sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
      },
      0
    );
  }, [state.items]);

  const getShippingTotal = useCallback(() => {
    const subtotal = getSubtotal();
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    
    const itemsByVendor = getItemsByVendor();
    let shippingTotal = 0;
    
    Object.values(itemsByVendor).forEach((vendorItems) => {
      const hasNonFreeShipping = vendorItems.some(
        item => item.shipping_type === 'paid'
      );
      if (hasNonFreeShipping) {
        shippingTotal += SHIPPING_COST;
      }
    });
    
    return shippingTotal;
  }, [state.items]);

  const getDiscountTotal = useCallback(() => {
    if (!state.couponCode) return 0;
    
    // Mock discount logic - will be replaced by API
    const subtotal = getSubtotal();
    return subtotal * 0.1; // 10% discount for demo
  }, [state.couponCode, state.items]);

  const getTotal = useCallback(() => {
    const subtotal = getSubtotal();
    const shipping = getShippingTotal();
    const discount = getDiscountTotal();
    const total = subtotal + shipping - discount;
    return isNaN(total) ? 0 : total;
  }, [state.items, state.couponCode]);

  const getItemsByVendor = useCallback(() => {
    return state.items.reduce((acc, item) => {
      const vendorId = item.vendor_id;
      if (!acc[vendorId]) {
        acc[vendorId] = [];
      }
      acc[vendorId].push(item);
      return acc;
    }, {} as Record<number, CartItem[]>);
  }, [state.items]);

  const value: CartContextType = {
    ...state,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getItemCount,
    getSubtotal,
    getShippingTotal,
    getDiscountTotal,
    getTotal,
    getItemsByVendor,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

interface PriceAlert {
  productId: number;
  productName: string;
  productImage: string;
  targetPrice: number;
  currentPrice: number;
  createdAt: string;
  notified: boolean;
}

interface PriceAlertState {
  alerts: PriceAlert[];
  notificationsEnabled: boolean;
}

type PriceAlertAction =
  | { type: 'ADD_ALERT'; payload: Omit<PriceAlert, 'createdAt' | 'notified'> }
  | { type: 'REMOVE_ALERT'; payload: { productId: number } }
  | { type: 'UPDATE_PRICE'; payload: { productId: number; newPrice: number } }
  | { type: 'MARK_NOTIFIED'; payload: { productId: number } }
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'LOAD_PRICE_ALERTS'; payload: PriceAlertState };

interface PriceAlertContextType extends PriceAlertState {
  addAlert: (alert: Omit<PriceAlert, 'createdAt' | 'notified'>) => void;
  removeAlert: (productId: number) => void;
  hasAlert: (productId: number) => boolean;
  getAlert: (productId: number) => PriceAlert | undefined;
  updatePrice: (productId: number, newPrice: number) => void;
  markNotified: (productId: number) => void;
  clearAll: () => void;
  toggleNotifications: () => void;
  getActiveAlerts: () => PriceAlert[];
  getTriggeredAlerts: () => PriceAlert[];
}

const PriceAlertContext = createContext<PriceAlertContextType | undefined>(undefined);

function priceAlertReducer(state: PriceAlertState, action: PriceAlertAction): PriceAlertState {
  switch (action.type) {
    case 'ADD_ALERT': {
      const alert = action.payload;
      if (state.alerts.find(a => a.productId === alert.productId)) {
        return state;
      }
      return {
        ...state,
        alerts: [...state.alerts, {
          ...alert,
          createdAt: new Date().toISOString(),
          notified: false,
        }],
      };
    }

    case 'REMOVE_ALERT': {
      return {
        ...state,
        alerts: state.alerts.filter(a => a.productId !== action.payload.productId),
      };
    }

    case 'UPDATE_PRICE': {
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.productId === action.payload.productId
            ? { ...a, currentPrice: action.payload.newPrice }
            : a
        ),
      };
    }

    case 'MARK_NOTIFIED': {
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.productId === action.payload.productId ? { ...a, notified: true } : a
        ),
      };
    }

    case 'CLEAR_ALL': {
      return { ...state, alerts: [] };
    }

    case 'TOGGLE_NOTIFICATIONS': {
      return { ...state, notificationsEnabled: !state.notificationsEnabled };
    }

    case 'LOAD_PRICE_ALERTS': {
      return action.payload;
    }

    default:
      return state;
  }
}

const initialState: PriceAlertState = {
  alerts: [],
  notificationsEnabled: true,
};

export function PriceAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(priceAlertReducer, initialState);

  // Load price alerts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trendyol-price-alerts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: 'LOAD_PRICE_ALERTS', payload: parsed });
        } catch (error) {
          console.error('Failed to load price alerts from localStorage:', error);
        }
      }
    }
  }, []);

  // Save price alerts to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trendyol-price-alerts', JSON.stringify(state));
    }
  }, [state]);

  const addAlert = useCallback((alert: Omit<PriceAlert, 'createdAt' | 'notified'>) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
  }, []);

  const removeAlert = useCallback((productId: number) => {
    dispatch({ type: 'REMOVE_ALERT', payload: { productId } });
  }, []);

  const hasAlert = useCallback((productId: number) => {
    return state.alerts.some(a => a.productId === productId);
  }, [state.alerts]);

  const getAlert = useCallback((productId: number) => {
    return state.alerts.find(a => a.productId === productId);
  }, [state.alerts]);

  const updatePrice = useCallback((productId: number, newPrice: number) => {
    dispatch({ type: 'UPDATE_PRICE', payload: { productId, newPrice } });
  }, []);

  const markNotified = useCallback((productId: number) => {
    dispatch({ type: 'MARK_NOTIFIED', payload: { productId } });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const toggleNotifications = useCallback(() => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  }, []);

  const getActiveAlerts = useCallback(() => {
    return state.alerts.filter(a => a.currentPrice > a.targetPrice);
  }, [state.alerts]);

  const getTriggeredAlerts = useCallback(() => {
    return state.alerts.filter(a => a.currentPrice <= a.targetPrice);
  }, [state.alerts]);

  const value: PriceAlertContextType = {
    ...state,
    addAlert,
    removeAlert,
    hasAlert,
    getAlert,
    updatePrice,
    markNotified,
    clearAll,
    toggleNotifications,
    getActiveAlerts,
    getTriggeredAlerts,
  };

  return <PriceAlertContext.Provider value={value}>{children}</PriceAlertContext.Provider>;
}

export function usePriceAlert() {
  const context = useContext(PriceAlertContext);
  if (context === undefined) {
    throw new Error('usePriceAlert must be used within a PriceAlertProvider');
  }
  return context;
}


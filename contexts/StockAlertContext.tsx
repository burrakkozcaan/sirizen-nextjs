"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

interface StockAlert {
  productId: number;
  variantId: number;
  productName: string;
  variantName: string;
  variantValue: string;
  productImage: string;
  createdAt: string;
  notified: boolean;
}

interface StockAlertState {
  alerts: StockAlert[];
}

type StockAlertAction =
  | { type: "ADD_ALERT"; payload: Omit<StockAlert, "createdAt" | "notified"> }
  | { type: "REMOVE_ALERT"; payload: { productId: number; variantId: number } }
  | { type: "CLEAR_ALL" }
  | { type: "LOAD_STOCK_ALERTS"; payload: StockAlertState };

interface StockAlertContextType extends StockAlertState {
  addAlert: (alert: Omit<StockAlert, "createdAt" | "notified">) => void;
  removeAlert: (productId: number, variantId: number) => void;
  hasAlert: (productId: number, variantId: number) => boolean;
  clearAll: () => void;
  getAlertCount: () => number;
}

const StockAlertContext = createContext<StockAlertContextType | undefined>(
  undefined
);

function stockAlertReducer(
  state: StockAlertState,
  action: StockAlertAction
): StockAlertState {
  switch (action.type) {
    case "ADD_ALERT": {
      const alert = action.payload;
      const exists = state.alerts.find(
        (a) =>
          a.productId === alert.productId && a.variantId === alert.variantId
      );
      if (exists) {
        return state;
      }
      return {
        ...state,
        alerts: [
          ...state.alerts,
          {
            ...alert,
            createdAt: new Date().toISOString(),
            notified: false,
          },
        ],
      };
    }

    case "REMOVE_ALERT": {
      return {
        ...state,
        alerts: state.alerts.filter(
          (a) =>
            !(
              a.productId === action.payload.productId &&
              a.variantId === action.payload.variantId
            )
        ),
      };
    }

    case "CLEAR_ALL": {
      return { alerts: [] };
    }

    case "LOAD_STOCK_ALERTS": {
      return action.payload;
    }

    default:
      return state;
  }
}

const initialState: StockAlertState = {
  alerts: [],
};

export function StockAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(stockAlertReducer, initialState);

  // Load stock alerts from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trendyol-stock-alerts");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: "LOAD_STOCK_ALERTS", payload: parsed });
        } catch (error) {
          console.error(
            "Failed to load stock alerts from localStorage:",
            error
          );
        }
      }
    }
  }, []);

  // Save stock alerts to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trendyol-stock-alerts", JSON.stringify(state));
    }
  }, [state]);

  const addAlert = useCallback(
    (alert: Omit<StockAlert, "createdAt" | "notified">) => {
      dispatch({ type: "ADD_ALERT", payload: alert });
    },
    []
  );

  const removeAlert = useCallback((productId: number, variantId: number) => {
    dispatch({ type: "REMOVE_ALERT", payload: { productId, variantId } });
  }, []);

  const hasAlert = useCallback(
    (productId: number, variantId: number) => {
      return state.alerts.some(
        (a) => a.productId === productId && a.variantId === variantId
      );
    },
    [state.alerts]
  );

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const getAlertCount = useCallback(() => {
    return state.alerts.length;
  }, [state.alerts]);

  const value: StockAlertContextType = {
    ...state,
    addAlert,
    removeAlert,
    hasAlert,
    clearAll,
    getAlertCount,
  };

  return (
    <StockAlertContext.Provider value={value}>
      {children}
    </StockAlertContext.Provider>
  );
}

export function useStockAlert() {
  const context = useContext(StockAlertContext);
  if (context === undefined) {
    throw new Error("useStockAlert must be used within a StockAlertProvider");
  }
  return context;
}

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { OrderItem } from "@/types";

export type ReturnReason =
  | "wrong_product"
  | "defective"
  | "not_as_described"
  | "changed_mind"
  | "wrong_size"
  | "late_delivery"
  | "other";

export type ReturnStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "shipped"
  | "received"
  | "refunded";

export interface ReturnRequest {
  id: string;
  orderId: number;
  orderNumber: string;
  orderItem: OrderItem;
  reason: ReturnReason;
  reasonDetail?: string;
  status: ReturnStatus;
  refundAmount: number;
  refundMethod: "original" | "wallet";
  images?: string[];
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  statusHistory: Array<{
    status: ReturnStatus;
    date: string;
    note?: string;
  }>;
}

interface ReturnsState {
  requests: ReturnRequest[];
}

type ReturnsAction =
  | {
      type: "CREATE_REQUEST";
      payload: {
        request: Omit<
          ReturnRequest,
          "id" | "createdAt" | "updatedAt" | "statusHistory"
        >;
        id: string;
      };
    }
  | {
      type: "UPDATE_STATUS";
      payload: {
        requestId: string;
        status: ReturnStatus;
        note?: string;
      };
    }
  | { type: "LOAD_RETURNS"; payload: ReturnsState };

interface ReturnsContextType extends ReturnsState {
  createRequest: (
    request: Omit<
      ReturnRequest,
      "id" | "createdAt" | "updatedAt" | "statusHistory"
    >
  ) => string;
  updateStatus: (
    requestId: string,
    status: ReturnStatus,
    note?: string
  ) => void;
  getByOrderId: (orderId: number) => ReturnRequest[];
  getByOrderItemId: (orderItemId: number) => ReturnRequest | undefined;
  getAll: () => ReturnRequest[];
  hasActiveReturn: (orderItemId: number) => boolean;
}

export const returnReasonLabels: Record<ReturnReason, string> = {
  wrong_product: "Yanlış ürün gönderildi",
  defective: "Ürün hasarlı/kusurlu",
  not_as_described: "Ürün açıklamayla uyuşmuyor",
  changed_mind: "Fikrim değişti",
  wrong_size: "Beden/Numara uymuyor",
  late_delivery: "Geç teslimat",
  other: "Diğer",
};

export const returnStatusLabels: Record<ReturnStatus, string> = {
  pending: "İnceleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  shipped: "Kargoya Verildi",
  received: "Teslim Alındı",
  refunded: "İade Tamamlandı",
};

export const returnStatusColors: Record<ReturnStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  shipped: "bg-purple-100 text-purple-800",
  received: "bg-indigo-100 text-indigo-800",
  refunded: "bg-green-100 text-green-800",
};

const ReturnsContext = createContext<ReturnsContextType | undefined>(
  undefined
);

function returnsReducer(
  state: ReturnsState,
  action: ReturnsAction
): ReturnsState {
  switch (action.type) {
    case "CREATE_REQUEST": {
      const { request, id } = action.payload;
      const now = new Date().toISOString();

      const newRequest: ReturnRequest = {
        ...request,
        id,
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          { status: "pending", date: now, note: "İade talebi oluşturuldu" },
        ],
      };

      return {
        ...state,
        requests: [...state.requests, newRequest],
      };
    }

    case "UPDATE_STATUS": {
      const { requestId, status, note } = action.payload;
      const now = new Date().toISOString();

      return {
        ...state,
        requests: state.requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status,
                updatedAt: now,
                statusHistory: [
                  ...req.statusHistory,
                  { status, date: now, note },
                ],
              }
            : req
        ),
      };
    }

    case "LOAD_RETURNS": {
      return action.payload;
    }

    default:
      return state;
  }
}

const initialState: ReturnsState = {
  requests: [],
};

export function ReturnsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(returnsReducer, initialState);

  // Load returns from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trendyol-returns");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: "LOAD_RETURNS", payload: parsed });
        } catch (error) {
          console.error(
            "Failed to load returns from localStorage:",
            error
          );
        }
      }
    }
  }, []);

  // Save returns to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trendyol-returns", JSON.stringify(state));
    }
  }, [state]);

  const createRequest = useCallback(
    (
      request: Omit<
        ReturnRequest,
        "id" | "createdAt" | "updatedAt" | "statusHistory"
      >
    ) => {
      const id = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: "CREATE_REQUEST", payload: { request, id } });
      return id;
    },
    []
  );

  const updateStatus = useCallback(
    (requestId: string, status: ReturnStatus, note?: string) => {
      dispatch({ type: "UPDATE_STATUS", payload: { requestId, status, note } });
    },
    []
  );

  const getByOrderId = useCallback(
    (orderId: number) => {
      return state.requests.filter((req) => req.orderId === orderId);
    },
    [state.requests]
  );

  const getByOrderItemId = useCallback(
    (orderItemId: number) => {
      return state.requests.find((req) => req.orderItem.id === orderItemId);
    },
    [state.requests]
  );

  const getAll = useCallback(() => {
    return [...state.requests].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.requests]);

  const hasActiveReturn = useCallback(
    (orderItemId: number) => {
      const request = state.requests.find(
        (req) => req.orderItem.id === orderItemId
      );
      if (!request) return false;
      return !["rejected", "refunded"].includes(request.status);
    },
    [state.requests]
  );

  const value: ReturnsContextType = {
    ...state,
    createRequest,
    updateStatus,
    getByOrderId,
    getByOrderItemId,
    getAll,
    hasActiveReturn,
  };

  return (
    <ReturnsContext.Provider value={value}>{children}</ReturnsContext.Provider>
  );
}

export function useReturns() {
  const context = useContext(ReturnsContext);
  if (context === undefined) {
    throw new Error("useReturns must be used within a ReturnsProvider");
  }
  return context;
}


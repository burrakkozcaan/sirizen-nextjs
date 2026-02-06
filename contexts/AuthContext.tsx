"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { api, ApiError } from "@/lib/api";
import { logoutAction } from "@/actions/auth.actions";

// Forward declaration for syncCartToServer
let syncCartToServerRef: (() => Promise<void>) | null = null;

// User type matching Laravel API response
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  email_verified_at?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<LoginResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Get current user from Laravel API
        const data = await api.get<{ data: User }>("/auth/me");
        setUser(data.data);
        
        // Sync local cart to Laravel if user is authenticated
        if (data.data && syncCartToServerRef) {
          syncCartToServerRef();
        }
      } catch {
        // Token is invalid, remove it
        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call server action to logout (clears cookie)
      await logoutAction();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<{ data: User }>("/auth/me");
      setUser(data.data);
      
      // Sync local cart to Laravel if user is authenticated
      if (data.data && syncCartToServerRef) {
        syncCartToServerRef();
      }
    } catch {
      // Token is invalid, logout
      await logout();
    }
  }, [logout]);

  const syncCartToServer = useCallback(async () => {
    try {
      const localCart = localStorage.getItem('trendyol-cart');
      if (!localCart) return;
      
      const cartData = JSON.parse(localCart);
      if (!cartData.items || cartData.items.length === 0) return;

      // Sync each cart item to Laravel backend
      for (const item of cartData.items) {
        try {
          // Get vendor_id from product
          const vendorId = item.vendor_id || item.product?.vendor_id || item.product?.vendor?.id;
          
          // Only sync if vendor_id is available
          if (!vendorId || vendorId === 0) {
            console.warn('Skipping cart item sync - vendor_id not found:', item);
            continue;
          }

          await api.post('/cart/add', {
            product_id: item.product_id || item.product?.id,
            quantity: item.quantity,
            variant_id: item.variant_id,
            product_seller_id: vendorId, // Include vendor_id
          });
        } catch (error) {
          console.error('Error syncing cart item:', error);
          // Don't break the loop, continue with other items
        }
      }
      
      // Clear local cart after successful sync
      localStorage.removeItem('trendyol-cart');
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, []);

  // Export sync function reference
  syncCartToServerRef = syncCartToServer;

  // Google login
  const loginWithGoogle = useCallback(async (credential: string): Promise<LoginResult> => {
    try {
      const response = await api.post<{ success: boolean; message?: string; data?: AuthResponse }>('/auth/google', {
        credential,
      });

      if (response.success && response.data) {
        // Store token
        localStorage.setItem('auth_token', response.data.token);
        document.cookie = `auth_token=${response.data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

        // Set user
        setUser(response.data.user);

        // Sync cart
        if (syncCartToServerRef) {
          syncCartToServerRef();
        }

        return { success: true };
      }

      return { success: false, message: response.message || 'Google ile giriş başarısız' };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, message: 'Google ile giriş sırasında bir hata oluştu' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

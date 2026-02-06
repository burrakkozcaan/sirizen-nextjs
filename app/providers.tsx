"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/Provider/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { PriceAlertProvider } from "@/contexts/PriceAlertContext";
import { StockAlertProvider } from "@/contexts/StockAlertContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ReturnsProvider } from "@/contexts/ReturnsContext";
import { BottomSheetProvider } from "@/contexts/BottomSheetContext";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <RecentlyViewedProvider>
                <PriceAlertProvider>
                  <StockAlertProvider>
                    <NotificationsProvider>
                      <ReturnsProvider>
                        <BottomSheetProvider>
                          {children}
                          <Toaster />
                        </BottomSheetProvider>
                      </ReturnsProvider>
                    </NotificationsProvider>
                  </StockAlertProvider>
                </PriceAlertProvider>
              </RecentlyViewedProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

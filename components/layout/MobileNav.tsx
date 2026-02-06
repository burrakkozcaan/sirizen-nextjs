"use client";

import { useState, useEffect, useRef } from "react";
import { Home, Grid3X3, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { MenuBar } from "@/components/ui/bottom-menu";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { getItemCount } = useCart();
  const { getCount } = useFavorites();
  const { isOpen: isBottomSheetOpen } = useBottomSheet();
  const cartCount = getItemCount();
  const favCount = getCount();

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;

          // Show when scrolling up or at top, hide when scrolling down
          if (currentScrollY < 50) {
            // Always show near the top
            setIsVisible(true);
          } else if (scrollDiff > 10) {
            // Scrolling down - hide
            setIsVisible(false);
          } else if (scrollDiff < -10) {
            // Scrolling up - show
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      path: "/",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <Home {...props} className="w-full h-full" />
      ),
      label: "Ana Sayfa",
    },
    // {
    //   path: "/categories",
    //   icon: (props: React.SVGProps<SVGSVGElement>) => (
    //     <Grid3X3 {...props} className="w-full h-full" />
    //   ),
    //   label: "Kategoriler",
    // },
    {
      path: "/cart",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <ShoppingCart {...props} className="w-full h-full" />
      ),
      label: "Sepetim",
      badge: cartCount,
    },
    {
      path: "/favorites",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <Heart {...props} className="w-full h-full" />
      ),
      label: "Favoriler",
      badge: favCount,
    },
    {
      path: "/account",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <User {...props} className="w-full h-full" />
      ),
      label: "Hesabım",
    },
  ];

  // Hide when scrolling down OR when bottom sheet is open
  const shouldShow = isVisible && !isBottomSheetOpen;

  return (
    <nav
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 lg:hidden z-50 safe-area-pb",
        "flex items-center justify-center",
        "transition-all duration-300 ease-in-out",
        shouldShow
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-20 pointer-events-none"
      )}
    >
      <MenuBar items={navItems} />
    </nav>
  );
}

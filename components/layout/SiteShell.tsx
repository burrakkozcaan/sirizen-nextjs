"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CategoryDrawerProvider } from "@/contexts/CategoryDrawerContext";

interface SiteShellProps {
  children: ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/email-verification-code" ||
    pathname?.startsWith("/email-verification-code");

  // Hide MobileNav on product pages (sticky add to cart bar is shown instead)
  const isProductPage = pathname?.startsWith("/product/");

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <CategoryDrawerProvider>
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <Footer />
        {!isProductPage && <MobileNav />}
      </div>
    </CategoryDrawerProvider>
  );
}

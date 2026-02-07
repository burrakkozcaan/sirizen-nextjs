"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import { useTranslation } from "react-i18next"; // Disabled until i18next is properly configured
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Grid3X3,
  ChevronRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { MegaMenu } from "./MegaMenu";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { CategoryDrawer } from "./CategoryDrawer";
import { ThemeToggle } from "@/components/Provider/ThemeToggle";
import { useCategoryDrawer } from "@/contexts/CategoryDrawerContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SearchCommandDialog } from "@/components/search/SearchCommandDialog";
import { SirizenLogo } from "@/components/SirizenLogo";
import { useRouter, usePathname } from "next/navigation";

const categoryTabs = [
  { name: "Kadın", slug: "kadin", highlight: true },
  { name: "Erkek", slug: "erkek" },
  { name: "Anne & Çocuk", slug: "anne-cocuk" },
  { name: "Ev & Yaşam", slug: "ev-yasam" },
  { name: "Süpermarket", slug: "supermarket" },
  { name: "Kozmetik", slug: "kozmetik" },
  { name: "Ayakkabı & Çanta", slug: "ayakkabi-canta" },
  { name: "Elektronik", slug: "elektronik" },
  { name: "Saat & Aksesuar", slug: "saat-aksesuar" },
  { name: "Spor&Outdoor", slug: "spor-outdoor" },
  { name: "Flaş Ürünler", slug: "flas-urunler", badge: true },
];

export function Header() {
  // Temporarily disable i18next until properly configured
  // const { t, i18n } = useTranslation();
  const t = (key: string) => key; // Fallback function
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isOpen: categoryDrawerOpen, openDrawer: openCategoryDrawer, closeDrawer: closeCategoryDrawer } = useCategoryDrawer();
  const { getItemCount } = useCart();
  const { getCount } = useFavorites();
  const cartItemCount = getItemCount();
  const favoritesCount = getCount();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleLanguage = () => {
    // Language toggle disabled until i18next is properly configured
    // i18n.changeLanguage(i18n.language === "tr" ? "en" : "tr");
  };

  // Check if any category is active from URL
  const anyCategoryActive = categoryTabs.some(tab => pathname.includes(`/category/${tab.slug}`));

  const isActiveCategory = (slug: string, isHighlight?: boolean) => {
    // If URL has this category, it's active
    if (pathname.includes(`/category/${slug}`)) return true;
    // If no category is active in URL and this is the highlight (Kadın), show as default active
    if (!anyCategoryActive && isHighlight) return true;
    return false;
  };

  return (
    <>
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
      <CategoryDrawer
        open={categoryDrawerOpen}
        onOpenChange={(open) => open ? openCategoryDrawer() : closeCategoryDrawer()}
      />
      <SearchCommandDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <header className="sticky top-0 z-50 bg-background shadow-header">
        {/* Top bar */}
        <div className="bg-muted/50">
          <div className="container mx-auto px-4 py-1.5 flex justify-end items-center text-xs text-muted-foreground gap-4 sm:gap-6">
            <Link
              href="https://api.sirizen.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors font-medium flex items-center gap-1"
            >
              <Store className="h-3.5 w-3.5" />
              Satıcı Ol
            </Link>
            <Link
              href="/help"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>🎧</span> Yardım & Destek
            </Link>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-9 w-9" />
            </Button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <SirizenLogo size="md" />
            </Link>

            {/* Search */}
            <div className="flex-1 hidden md:flex">
              <button
                onClick={() => setSearchOpen(true)}
                className="relative w-full max-w-2xl mx-auto"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5 text-orange-500" />
                </div>
                <div className="w-full pl-12 pr-4 h-12 rounded-lg border-2 border-muted bg-muted/30 flex items-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                  Ürün, kategori veya marka ara
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="hidden lg:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 text-xs text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </button>
            </div>

            {/* Actions - ml-auto pushes to right on mobile */}
            <div className="flex items-center gap-0 lg:gap-3 ml-auto lg:ml-0">
              {/* NotificationBell - only on desktop */}
              <div className="hidden lg:block">
                <NotificationBell />
              </div>

              {/* User Menu */}
              {isAuthenticated ? (
                <>
                  {/* Desktop dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hidden lg:flex items-center gap-2 text-foreground hover:text-white h-auto py-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.name || "Kullanıcı"} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user?.name || "Hesabım"}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover">
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="cursor-pointer">
                          Hesabım
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="cursor-pointer">
                          Siparişlerim
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/account/addresses"
                          className="cursor-pointer"
                        >
                          Adreslerim
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Çıkış Yap
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Mobile user icon */}
                  <Link href="/account" className="lg:hidden">
                    <button className="flex items-center justify-center p-2 text-foreground">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name || "Kullanıcı"} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Desktop user button */}
                  <Link href="/login" className="hidden lg:block">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-foreground hover:text-white h-auto py-2"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-sm">Giriş Yap</span>
                    </Button>
                  </Link>
                  {/* Mobile user icon */}
                  <Link href="/login" className="lg:hidden">
                    <button className="flex items-center justify-center p-2 text-foreground">
                      <User className="w-5 h-5" />
                    </button>
                  </Link>
                </>
              )}

              {/* Favorites */}
              <Link href="/favorites" className="relative">
                {/* Desktop favorites */}
                <Button
                  variant="ghost"
                  className="hidden lg:flex items-center gap-2 text-foreground hover:text-white h-auto py-2"
                >
                  <Heart className="h-5 w-5" />
                  <span className="text-sm">Favorilerim</span>
                  {favoritesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-2xs">
                      {favoritesCount}
                    </Badge>
                  )}
                </Button>
                {/* Mobile favorites */}
                <button className="lg:hidden flex items-center justify-center p-2 text-foreground relative">
                  <Heart className="w-5 h-5" />
                  {favoritesCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                      {favoritesCount}
                    </Badge>
                  )}
                </button>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative">
                {/* Desktop cart */}
                <Button
                  variant="ghost"
                  className="hidden lg:flex items-center gap-2 text-foreground hover:text-white h-auto py-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-sm">Sepetim</span>
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-2xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
                {/* Mobile cart */}
                <button className="lg:hidden flex items-center justify-center p-2 text-foreground relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                      {cartItemCount}
                    </Badge>
                  )}
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="mt-3 md:hidden w-full"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
              <div className="w-full pl-10 pr-4 h-10 border-2 border-muted bg-white flex items-center text-muted-foreground rounded-full">
                <span className="text-sm" style={{ minHeight: "1.2em" }}>
                  Ürün, kategori veya marka ara
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Category navigation - visible on both mobile and desktop */}
        <nav className="overflow-visible">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              {/* All Categories Button with MegaMenu - only on desktop */}
              <div
                className="relative hidden lg:block"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button
                  className="flex items-center gap-2 py-3 pr-4 text-sm font-medium hover:text-primary transition-colors border-r mr-4"
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                >
                  <Menu className="h-4 w-4" />
                  <span>Kategoriler</span>
                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">
                    Yeni
                  </Badge>
                </button>
                {showMegaMenu && (
                  <div className="absolute top-full left-0 z-[100]">
                    <MegaMenu onClose={() => setShowMegaMenu(false)} />
                  </div>
                )}
              </div>

              {/* Category Tabs - visible on both mobile and desktop */}
              <div className="flex items-center w-full overflow-x-auto scrollbar-hide overflow-y-hidden -mx-4 px-4">
              {categoryTabs.some(tab => tab.badge) && (
                      <button
                        onClick={openCategoryDrawer}
                        className="flex-shrink-0 mr-2 p-1 hover:bg-muted rounded transition-colors"
                        aria-label="Tüm Kategoriler"
                      >
                        <Grid3X3 className="w-5 h-5 text-primary" />
                      </button>
                    )}
                {categoryTabs.map((tab) => (
                
                  <Link
                    key={tab.slug}
                    href={`/category/${tab.slug}`}
                    className={cn(
                      "py-3 px-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                      isActiveCategory(tab.slug, tab.highlight)
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "pb-1",
                        isActiveCategory(tab.slug, tab.highlight) && "border-b-2 border-primary"
                      )}
                    >
                      {tab.name}
                    </span>
                    {tab.badge && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 ml-1">
                        Yeni
                      </Badge>
                    )}
                  
                  </Link>
                ))}
                {/* Tümünü Gör Button */}
                <button
                  onClick={openCategoryDrawer}
                  className="flex items-center gap-1 flex-shrink-0 py-3 px-3 text-sm font-semibold whitespace-nowrap text-primary hover:opacity-80 transition-opacity"
                >
                  <span>Tümünü Gör</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

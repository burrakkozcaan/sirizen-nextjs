"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PopularBrandsSection } from "./PopularBrandsSection";
import { ThemeToggle } from "@/components/Provider/ThemeToggle";
import { SirizenLogo } from "@/components/SirizenLogo";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }
    // TODO: API call for newsletter subscription
    toast.success("Başarıyla abone oldunuz!");
    setEmail("");
  };

  return (
    <>
      <PopularBrandsSection />
      <div className="container-home relative z-10 mb-4 mt-6 lg:mx-10">
        <footer className="rounded-2xl border border-border bg-muted p-6 sm:p-8 md:p-10 lg:p-14">
          <nav className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
            {/* Logo & Theme Toggle */}
            <div className="col-span-2 flex h-full justify-between sm:col-span-3 lg:col-span-1 lg:flex-col lg:gap-4">
              <Link
                href="/"
                className="w-fit flex items-center gap-2 transition-transform hover:scale-105"
              >
                <SirizenLogo size="md" />
              </Link>
              <div className="hidden w-fit lg:block">
                <ThemeToggle />
              </div>
              {/* Newsletter Form - Logo Altında */}
              <div className="hidden lg:block w-full mt-4">
                <h3 className="text-sm font-normal text-muted-foreground mb-3">
                  Bülten
                </h3>
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col gap-2"
                >
                  <Input
                    type="email"
                    placeholder="E-posta adresinizi girin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 text-base"
                  />
                  <Button type="submit" size="default" className="h-11 w-full">
                    Abone Ol
                  </Button>
                </form>
              </div>
            </div>

            {/* About / Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-normal text-muted-foreground">
                Şirket
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Kariyer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Basın
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    İletişim
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div className="space-y-4">
              <h3 className="text-sm font-normal text-muted-foreground">
                Yardım
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/help"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-to-order"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Nasıl Sipariş Verilir
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Kargo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    İade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-normal text-muted-foreground">
                Yasal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Kullanım Şartları
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Çerez Politikası
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment & App Download */}
            <div className="space-y-4">
              <h3 className="text-sm font-normal text-muted-foreground">
                Ödeme
              </h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-sm text-muted-foreground">
                    Visa, Mastercard, Troy
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">
                    Kapıda Ödeme
                  </span>
                </li>
              </ul>
              <h3 className="text-sm font-normal text-muted-foreground mt-6">
                Uygulamayı İndir
              </h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-sm text-muted-foreground">
                    App Store
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">
                    Google Play
                  </span>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-normal text-muted-foreground">
                Bizi Takip Edin
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Facebook
                    <ExternalLink className="shrink-0 h-4 w-4 ms-1 mt-0.5 rotate-45 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Twitter
                    <ExternalLink className="shrink-0 h-4 w-4 ms-1 mt-0.5 rotate-45 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    Instagram
                    <ExternalLink className="shrink-0 h-4 w-4 ms-1 mt-0.5 rotate-45 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start text-sm text-primary transition-colors hover:text-muted-foreground"
                  >
                    YouTube
                    <ExternalLink className="shrink-0 h-4 w-4 ms-1 mt-0.5 rotate-45 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Mobile Language Selector */}
            <div className="col-span-2 w-fit sm:col-span-3 lg:hidden">

              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 text-base"
                />
                <Button type="submit" size="default" className="h-11">
                  Abone Ol
                </Button>
              </form>
            </div>
          </nav>

          {/* Newsletter Form - Mobile & Tablet (En Alta) */}
          <div className="lg:hidden mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-normal text-muted-foreground mb-3">
              {/* Bülten */}
            </h3>

          </div>
        </footer>
      </div>
    </>
  );
}

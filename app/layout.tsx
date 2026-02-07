import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "Sirizen | Türkiye'nin Yeni Nesil Alışveriş Platformu",
    template: "%s | Sirizen",
  },
  description:
    "Moda, elektronik, ev & yaşam, kozmetik ve daha fazlası — Sirizen'de binlerce mağaza ve milyonlarca ürün. Hızlı teslimat, güvenli ödeme ve kampanyalarla alışverişin keyfini çıkarın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flaş İndirimler - Sınırlı Süre, Büyük Fırsatlar",
  description: "Sınırlı süreli flaş indirimlerle %70'e varan fırsatları kaçırmayın. Stoklar tükenmeden alın!",
  openGraph: {
    title: "Flaş İndirimler - Sınırlı Süre",
    description: "Sınırlı süreli flaş indirimlerle %70'e varan fırsatları kaçırmayın!",
  },
};

export default function FlashSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

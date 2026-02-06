"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Tag, Gift, Percent, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Campaign {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  banner_image?: string;
  discount_percentage?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

interface FeaturedCampaignsProps {
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  viewAllLink?: string;
}

// Mock campaigns for fallback
const mockCampaigns: Campaign[] = [
  {
    id: 1,
    title: "Kış İndirimleri",
    slug: "kis-indirimleri",
    description: "Kış ürünlerinde %50'ye varan indirimler",
    discount_percentage: 50,
    is_active: true,
  },
  {
    id: 2,
    title: "Elektronik Festivali",
    slug: "elektronik-festivali",
    description: "Teknoloji ürünlerinde büyük fırsatlar",
    discount_percentage: 40,
    is_active: true,
  },
  {
    id: 3,
    title: "Ev & Yaşam Fırsatları",
    slug: "ev-yasam-firsatlari",
    description: "Ev dekorasyon ve yaşam ürünlerinde indirimler",
    discount_percentage: 35,
    is_active: true,
  },
  {
    id: 4,
    title: "Moda Günleri",
    slug: "moda-gunleri",
    description: "Giyim ve aksesuar kampanyası",
    discount_percentage: 45,
    is_active: true,
  },
  {
    id: 5,
    title: "Spor & Outdoor",
    slug: "spor-outdoor",
    description: "Spor malzemelerinde özel fiyatlar",
    discount_percentage: 30,
    is_active: true,
  },
  {
    id: 6,
    title: "Kozmetik İndirimleri",
    slug: "kozmetik-indirimleri",
    description: "Güzellik ürünlerinde kaçırılmayacak fırsatlar",
    discount_percentage: 25,
    is_active: true,
  },
];

// Campaign card colors
const cardColors = [
  { bg: "bg-gradient-to-br from-rose-500 to-pink-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-violet-500 to-purple-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-blue-500 to-indigo-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-orange-500 to-amber-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-teal-500 to-cyan-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-emerald-500 to-green-600", text: "text-white" },
];

export function FeaturedCampaigns({
  title = "Öne Çıkan Kampanyalar",
  backgroundColor = "#E6F7EE",
  textColor = "#1A472A",
  iconColor = "#22C55E",
  viewAllLink = "/kampanyalar",
}: FeaturedCampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await api
          .get<{ data: Campaign[] }>("/campaigns?is_active=true&per_page=10")
          .catch(() => ({ data: [] }));

        const fetchedCampaigns = response.data || [];
        setCampaigns(fetchedCampaigns.length > 0 ? fetchedCampaigns : mockCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaigns(mockCampaigns);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [campaigns]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getCardColor = (index: number) => {
    return cardColors[index % cardColors.length];
  };

  if (loading) {
    return (
      <div className="px-4 py-4">
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-48 bg-black/10 rounded animate-pulse" />
            <div className="h-4 w-24 bg-black/10 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-[140px] bg-black/10 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-4">
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{ backgroundColor, color: textColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" style={{ color: iconColor }} />
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <span>Tümünü Gör</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Campaigns Carousel */}
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {campaigns.map((campaign, index) => {
              const colorScheme = getCardColor(index);
              return (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.slug}`}
                  className={cn(
                    "flex-shrink-0 w-[280px] h-[140px] rounded-xl overflow-hidden relative group/card",
                    colorScheme.bg
                  )}
                  style={{ scrollSnapAlign: "start" }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
                    <Sparkles className="absolute top-3 right-3 w-5 h-5 text-white/30" />
                  </div>

                  {/* Content */}
                  <div className={cn("relative z-10 h-full p-4 flex flex-col justify-between", colorScheme.text)}>
                    <div>
                      <h3 className="font-bold text-base line-clamp-1 mb-1">
                        {campaign.title}
                      </h3>
                      {campaign.description && (
                        <p className="text-sm opacity-90 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {campaign.discount_percentage && campaign.discount_percentage > 0 && (
                        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                          <Percent className="w-3 h-3" />
                          <span className="text-xs font-bold">
                            %{campaign.discount_percentage}'e varan indirim
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <span>İncele</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Campaign Image (if available) */}
                  {(campaign.image || campaign.banner_image) && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={campaign.banner_image || campaign.image || ""}
                        alt={campaign.title}
                        fill
                        sizes="280px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

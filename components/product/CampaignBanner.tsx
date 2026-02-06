"use client";

import { Clock, Zap } from "lucide-react";

export function CampaignBanner() {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-lg mb-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-white/20 p-1.5 rounded-full">
          <Zap className="h-5 w-5 fill-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Flash Ürünler</p>
          <p className="text-xs opacity-90">Bu fiyata son ürünler!</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
        <Clock className="h-4 w-4" />
        <span className="font-mono font-bold text-sm">21 : 29 : 51</span>
      </div>
    </div>
  );
}


"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SirizenLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export function SirizenLogo({
  size = "md",
  showText = true,
  className,
  textClassName,
}: SirizenLogoProps) {
  const sizes = {
    sm: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-lg" },
    md: { container: "h-10 w-10", icon: "h-5 w-5", text: "text-xl" },
    lg: { container: "h-12 w-12", icon: "h-6 w-6", text: "text-2xl" },
    xl: { container: "h-14 w-14", icon: "h-7 w-7", text: "text-3xl" },
  };

  const { container, icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon */}
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0",
          container
        )}
      >
        <Sparkles className={cn("text-white", icon)} />
      </div>

      {/* Logo Text */}
      {showText && (
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent",
            text,
            textClassName
          )}
        >
          Sirizen
        </span>
      )}
    </div>
  );
}

// Footer için sadece ikon versiyonu
export function SirizenLogoIcon({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-14 w-14",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg",
        sizes[size],
        className
      )}
    >
      <Sparkles className="h-1/2 w-1/2 text-white" />
    </div>
  );
}

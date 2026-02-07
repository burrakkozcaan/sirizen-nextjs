"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MenuBarItem {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  label: string;
  path?: string;
  badge?: number;
  onClick?: () => void;
}

interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MenuBarItem[];
}

const MOBILE_LABEL_WIDTH = 72;

export function MenuBar({ items, className, ...props }: MenuBarProps) {
  const pathname = usePathname();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Find active item based on pathname
  const activeItemIndex = React.useMemo(() => {
    return items.findIndex((item) => {
      if (!item.path) return false;
      if (item.path === "/") {
        return pathname === item.path;
      }
      // Exact match or starts with path + "/"
      return pathname === item.path || pathname.startsWith(item.path + "/");
    });
  }, [items, pathname]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={cn("relative", className)}
      {...(props as any)}
    >
      <nav
        role="navigation"
        aria-label="Bottom Navigation"
        className={cn(
          "h-12 px-2 inline-flex justify-center items-center gap-1 overflow-x-hidden overflow-y-visible z-10",
          "rounded-full bg-background/95 backdrop-blur",
          "border border-border/50",
          
        )}
      >
      {items.map((item, index) => {
        const isActive = index === activeItemIndex;

        const buttonContent = (
          <>
            <div className="flex justify-center items-center flex-shrink-0">
              <div className="w-5 h-5 flex justify-center items-center overflow-visible relative">
                <item.icon
                  className={cn(
                    "w-full h-full transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-hidden
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 flex items-center justify-center p-0 px-1 text-[10px] font-bold bg-primary text-primary-foreground border-2 border-background shadow-sm">
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </div>
            </div>

            <motion.div
              initial={false}
              animate={{
                width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? "8px" : "0px",
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className="overflow-hidden flex items-center max-w-[72px]"
            >
              <span
                className={cn(
                  "font-medium text-sm whitespace-nowrap select-none transition-opacity duration-200 overflow-hidden text-ellipsis",
                  "text-[clamp(0.75rem,0.65rem+0.5vw,1.125rem)] leading-[1.5]",
                  isActive
                    ? "text-primary opacity-100"
                    : "text-muted-foreground opacity-0"
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </>
        );

        const buttonClassName = cn(
          "flex items-center gap-0 px-3 py-2 rounded-full transition-colors duration-200 relative",
          "h-10 min-w-[44px] min-h-[40px] max-h-[44px]",
          "focus:outline-none focus-visible:ring-0",
          isActive
            ? "bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary gap-2"
            : "bg-transparent text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted"
        );

        if (item.path) {
          return (
            <motion.div
              key={item.path || index}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={item.path}
                className={buttonClassName}
              >
                {buttonContent}
              </Link>
            </motion.div>
          );
        }

        return (
          <motion.button
            key={index}
            whileTap={{ scale: 0.97 }}
            className={buttonClassName}
            onClick={item.onClick}
            type="button"
          >
            {buttonContent}
          </motion.button>
        );
      })}
      </nav>
    </motion.div>
  );
}


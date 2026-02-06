"use client";

import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export function HomeClient() {
  const { notifyFlashSale } = useNotifications();

  // Demo: Show flash sale notification after 3 seconds (only once per session)
  useEffect(() => {
    const hasShownDemo = sessionStorage.getItem("demo-notification-shown");
    if (!hasShownDemo) {
      const timer = setTimeout(() => {
        notifyFlashSale(
          "Flaş İndirim Başladı!",
          "%50'ye varan indirimler sınırlı süreyle devam ediyor. Kaçırmayın!"
        );
        sessionStorage.setItem("demo-notification-shown", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifyFlashSale]);

  return null;
}


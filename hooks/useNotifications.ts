"use client";

import { useCallback } from 'react';
import { useNotifications as useNotificationsContext, NotificationType } from '@/contexts/NotificationsContext';

export function useNotifications() {
  const { addNotification, preferences } = useNotificationsContext();

  const notify = useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      options?: { link?: string; imageUrl?: string }
    ) => {
      // Check if this notification type is enabled
      const shouldNotify = () => {
        switch (type) {
          case 'order':
            return preferences.orderUpdates;
          case 'price_drop':
            return preferences.priceDrops;
          case 'flash_sale':
            return preferences.flashSales;
          case 'stock':
            return preferences.stockAlerts;
          case 'general':
            return true;
          default:
            return true;
        }
      };

      if (shouldNotify()) {
        addNotification({
          type,
          title,
          message,
          link: options?.link,
          imageUrl: options?.imageUrl,
        });
      }
    },
    [addNotification, preferences]
  );

  const notifyOrderUpdate = useCallback(
    (orderId: string, status: string) => {
      const statusMessages: Record<string, string> = {
        confirmed: 'Siparişiniz onaylandı',
        preparing: 'Siparişiniz hazırlanıyor',
        shipped: 'Siparişiniz kargoya verildi',
        delivered: 'Siparişiniz teslim edildi',
        cancelled: 'Siparişiniz iptal edildi',
      };

      notify(
        'order',
        'Sipariş Güncellendi',
        statusMessages[status] || `Sipariş durumu: ${status}`,
        { link: `/siparis/${orderId}` }
      );
    },
    [notify]
  );

  const notifyPriceDrop = useCallback(
    (productName: string, oldPrice: number, newPrice: number, productSlug: string) => {
      // Validate prices are valid numbers
      const validOldPrice = typeof oldPrice === 'number' && !isNaN(oldPrice) && oldPrice > 0 ? oldPrice : 0;
      const validNewPrice = typeof newPrice === 'number' && !isNaN(newPrice) && newPrice > 0 ? newPrice : 0;
      
      // If prices are invalid, use a generic message
      if (validOldPrice === 0 || validNewPrice === 0) {
        notify(
          'price_drop',
          'Fiyat Düştü! 🎉',
          `${productName} ürününün fiyatı düştü!`,
          { link: `/product/${productSlug}` }
        );
        return;
      }
      
      // Calculate discount safely
      const discount = validOldPrice > validNewPrice 
        ? Math.round(((validOldPrice - validNewPrice) / validOldPrice) * 100)
        : 0;
      
      // Format price safely
      const formattedPrice = validNewPrice.toFixed(2);
      
      notify(
        'price_drop',
        'Fiyat Düştü! 🎉',
        `${productName} ürününün fiyatı %${discount} düştü! Yeni fiyat: ₺${formattedPrice}`,
        { link: `/product/${productSlug}` }
      );
    },
    [notify]
  );

  const notifyFlashSale = useCallback(
    (title: string, description: string, link?: string) => {
      notify('flash_sale', `⚡ ${title}`, description, { link: link || '/campaign/flash-sales' });
    },
    [notify]
  );

  const notifyStockAlert = useCallback(
    (productName: string, productSlug: string) => {
      notify(
        'stock',
        'Ürün Stoğa Girdi!',
        `${productName} tekrar satışta! Kaçırmadan alın.`,
        { link: `/product/${productSlug}` }
      );
    },
    [notify]
  );

  return {
    notify,
    notifyOrderUpdate,
    notifyPriceDrop,
    notifyFlashSale,
    notifyStockAlert,
  };
}

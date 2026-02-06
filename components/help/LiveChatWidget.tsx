'use client';

import { useEffect } from 'react';
import { MessageCircle, HelpCircle, ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickReplies = [
  { icon: ShoppingBag, text: 'Sipariş durumu sorgulama', message: 'Sipariş durumumu sorgulamak istiyorum' },
  { icon: RotateCcw, text: 'İade nasıl yapılır?', message: 'İade işlemi hakkında bilgi almak istiyorum' },
  { icon: Truck, text: 'Kargo takibi', message: 'Kargo takibi yapmak istiyorum' },
  { icon: HelpCircle, text: 'Ödeme sorunları', message: 'Ödeme sorunu yaşıyorum' },
];

// Zoho SalesIQ'yu aç - sadece help sayfasında çalışır
declare global {
  interface Window {
    $zoho: any;
  }
}

function openZohoChat() {
  if (typeof window !== 'undefined' && window.$zoho && window.$zoho.salesiq) {
    window.$zoho.salesiq.floatwindow?.visible?.('show');
  }
}

export function LiveChatWidget() {
  const handleOpenChat = () => {
    openZohoChat();
  };

  // Listen for custom event to open assistant
  useEffect(() => {
    const handleOpenAssistant = () => {
      openZohoChat();
    };

    window.addEventListener('open-sirizen-assistant', handleOpenAssistant);
    
    return () => {
      window.removeEventListener('open-sirizen-assistant', handleOpenAssistant);
    };
  }, []);

  return (
    <Button
      onClick={handleOpenChat}
      size="lg"
      className="fixed bottom-24 right-4 z-40 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all hover:scale-105 lg:bottom-6 bg-gradient-to-r from-orange-500 to-orange-600"
      aria-label="Canlı Destek"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}

// Quick Reply Butonları (Help sayfasında kullanılabilir)
export function QuickReplyButtons() {
  const handleQuickReply = (message: string) => {
    openZohoChat();
    
    // Zoho SalesIQ mesaj gönderme (varsa)
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.$zoho && window.$zoho.salesiq) {
        // Zoho'da otomatik mesaj gönderme için uygun method varsa kullanılır
        window.$zoho.salesiq.visitor = {
          ...(window.$zoho.salesiq.visitor || {}),
          question: message
        };
      }
    }, 500);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickReplies.map((item) => (
        <Button
          key={item.text}
          variant="outline"
          className="h-auto py-3 px-4 justify-start gap-3 border-gray-200 hover:bg-orange-50 hover:border-orange-300 text-left"
          onClick={() => handleQuickReply(item.message)}
        >
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <item.icon className="h-4 w-4 text-orange-600" />
          </div>
          <span className="text-sm font-medium">{item.text}</span>
        </Button>
      ))}
    </div>
  );
}

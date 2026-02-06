# Canlı Destek Çözümleri - Sirizen

## 🎯 Önerilen Çözümler (En İyiden Başlayarak)

### 1️⃣ Crisp.chat (ÖNERİLEN) 🥇
```typescript
// Kurulum:
// 1. npm install crisp-sdk-web
// 2. _app.tsx veya layout.tsx'e ekle

import { Crisp } from "crisp-sdk-web";

// Init
Crisp.configure("YOUR_CRISP_WEBSITE_ID", {
  autoload: false,
});

// Kullanıcı giriş yaptıysa bilgileri gönder
if (user) {
  Crisp.user.setEmail(user.email);
  Crisp.user.setNickname(user.name);
  Crisp.session.setData({
    user_id: user.id,
    order_count: user.orders?.length || 0,
  });
}
```

**Avantajları:**
- ✅ Türkçe dil desteği
- ✅ Web + Mobile App SDK
- ✅ Otomatik mesajlar (bot)
- ✅ Ekran paylaşımı
- ✅ Knowledge base entegrasyonu
- ✅ Fiyat: Ücretsiz başlangıç, Pro: €25/ay

---

### 2️⃣ Intercom 🥈
```typescript
// Kurulum:
// 1. npm install @intercom/messenger-js-sdk

import Intercom from '@intercom/messenger-js-sdk';

Intercom({
  app_id: 'YOUR_APP_ID',
  user_id: user?.id,
  email: user?.email,
  name: user?.name,
});
```

**Avantajları:**
- ✅ Çok güçlü CRM entegrasyonu
- ✅ Akıllı botlar (Resolution Bot)
- ✅ Ürün turları (Product Tours)
- ✅ A/B testing
- ❌ Pahalı: $74/ay başlangıç

---

### 3️⃣ Tawk.to (ÜCRETSİZ) 🥉
```typescript
// Kurulum: Script tag

useEffect(() => {
  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = 'https://embed.tawk.to/YOUR_PROPERTY_ID/default';
  document.head.appendChild(s1);
}, []);
```

**Avantajları:**
- ✅ Tamamen ücretsiz
- ✅ Web + Mobile
- ✅ Knowledge base
- ✅ Ticket sistemi
- ❌ Reklam gösterir (ücretsiz versiyonda)

---

### 4️⃣ Kendi Laravel WebSocket Çözümünüz 🛠️

Backend (Laravel):
```php
// Soketi.io veya Laravel Echo Server
// + Laravel Reverb (yeni)
```

Frontend:
```typescript
// socket.io-client
import io from 'socket.io-client';

const socket = io('wss://chat.sirizen.com');

// Odaya katıl
socket.emit('join', { room: 'support_' + userId });

// Mesaj gönder
socket.emit('message', {
  room: 'support_' + userId,
  message: 'Yardım istiyorum',
});

// Mesaj al
socket.on('message', (data) => {
  console.log('Yeni mesaj:', data);
});
```

**Avantajları:**
- ✅ Tam kontrol
- ✅ Kendi verileriniz
- ✅ Özelleştirilebilir
- ❌ Bakım maliyeti
- ❌ Geliştirme zamanı

---

## 🚀 Sirizen İçin Önerim: Crisp.chat

### Neden Crisp?
1. **Türkçe** dil desteği var
2. **Ücretsiz** plan yeterli başlangıç için
3. **Laravel entegrasyonu** kolay
4. **Bot özelliği** var (Sirizen Asistan yerine geçebilir)
5. **E-posta, SMS, Messenger** entegrasyonları

### Kurulum Adımları:

#### 1. Hesap Oluştur
- crisp.chat adresine git
- Website ID al

#### 2. Laravel Backend
```php
// config/services.php
crisp => [
    'website_id' => env('CRISP_WEBSITE_ID'),
    'key' => env('CRISP_API_KEY'),
]
```

#### 3. Next.js Frontend
```typescript
// components/chat/CrispChat.tsx
'use client';

import { useEffect } from 'react';
import { Crisp } from 'crisp-sdk-web';
import { useAuth } from '@/contexts/AuthContext';

export function CrispChat() {
  const { user } = useAuth();

  useEffect(() => {
    // Crisp'i başlat
    Crisp.configure(process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID!, {
      autoload: true,
    });

    // Kullanıcı bilgilerini gönder
    if (user) {
      Crisp.user.setEmail(user.email);
      Crisp.user.setNickname(user.name);
      
      // Özel veriler
      Crisp.session.setData({
        user_id: user.id,
        user_type: user.type, // customer, vendor, admin
        order_count: user.orders_count,
        total_spent: user.total_spent,
        last_order: user.last_order_date,
      });
    }
  }, [user]);

  return null;
}
```

#### 4. Otomatik Bot Kuralları
```javascript
// Crisp Dashboard > Bot > Scenarios

// Karşılama mesajı
if (new_visitor) {
  send_message("Merhaba! 👋 Sirizen'e hoş geldiniz. Size nasıl yardımcı olabilirim?");
  show_quick_replies([
    "Sipariş takibi",
    "İade işlemi",
    "Kampanyalar",
    "Canlı destek"
  ]);
}

// Sipariş takibi
if (message.contains("sipariş", "takip", "kargo")) {
  send_message("Sipariş numaranızı paylaşır mısınız?");
  // API'den sipariş bilgisi çek
  show_order_status(order_id);
}

// İade
if (message.contains("iade", "geri gönder", "iptal")) {
  send_message("İade işlemi için sipariş numaranızı ve iade nedenini paylaşabilir misiniz?");
  create_return_ticket(user_id, order_id);
}
```

---

## 📊 Karşılaştırma Tablosu

| Özellik | Crisp | Intercom | Tawk.to | Kendi Çözüm |
|---------|-------|----------|---------|-------------|
| Fiyat | €0-25 | $74+ | $0 | Server maliyeti |
| Türkçe | ✅ | ✅ | ✅ | Siz ayarlarsınız |
| Bot | ✅ | ✅ | ✅ | Kendi botunuz |
| Web Push | ✅ | ✅ | ✅ | ✅ |
| Mobile SDK | ✅ | ✅ | ✅ | React Native |
| Knowledge Base | ✅ | ✅ | ✅ | Kendiniz yaparsınız |
| Ekran Paylaşımı | ✅ | ✅ | ❌ | WebRTC |
| CRM Entegrasyonu | ✅ | ✅ | ❌ | API yazmanız gerek |

---

## 🎯 Sonuç

**Başlangıç için:** Tawk.to (ücretsiz)
**Orta ölçekli:** Crisp.chat (€25/ay)
**Büyük ölçekli:** Intercom veya kendi çözümünüz

**Sirizen için önerim:** Crisp.chat
- Kolay kurulum
- Türkçe destek
- Laravel/Next.js entegrasyonu hazır
- Bot özellikleri güçlü
- Fiyat/performans dengesi iyi

# Crisp.chat Kurulumu - Sirizen

## ✅ Entegrasyon Tamamlandı

Website ID: `b2a260bb-ff2c-4344-a432-84a09fce46fb`

## Özellikler

### 1. Otomatik Kullanıcı Bilgileri
Kullanıcı giriş yaptığında otomatik olarak Crisp'e iletilir:
- Email
- İsim
- Telefon
- Avatar
- Kullanıcı tipi (customer/vendor/admin)

### 2. Hızlı Erişim Butonları (Help Sayfası)
Help sayfasında 4 hızlı erişim butonu:
- 🛍️ Sipariş durumu sorgulama
- 🔄 İade nasıl yapılır?
- 🚚 Kargo takibi
- 💳 Ödeme sorunları

### 3. Programatik Sohbet Kontrolü
```typescript
import { openCrispChat, closeCrispChat, toggleCrispChat } from '@/components/chat/CrispChat';

// Sohbeti aç
openCrispChat();

// Sohbeti kapat
closeCrispChat();

// Toggle
toggleCrispChat();

// Event takibi
trackCrispEvent('order_completed', { order_id: '123', amount: 1500 });
```

## Crisp Dashboard Ayarları

### 1. Bot Senaryoları (Önerilen)
Crisp Dashboard > Bot > Scenarios'a şunları ekleyin:

```javascript
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

// Sipariş durumu
if (message.contains("sipariş", "takip", "kargo")) {
  send_message("Sipariş numaranızı paylaşır mısınız? 🔍");
}

// İade
if (message.contains("iade", "geri gönder")) {
  send_message("İade işlemi için sipariş numaranızı paylaşabilir misiniz? 📦");
}

// Ödeme
if (message.contains("ödeme", "kart", "banka")) {
  send_message("Ödeme sorununuzu detaylı açıklar mısınız? 💳");
}
```

### 2. Türkçe Dil Ayarı
Crisp Dashboard > Settings > Website Settings > Language: **Turkish**

### 3. Görünüm Ayarları
- Tema Rengi: `#f97316` (Orange-500)
- Pozisyon: Sağ alt
- Avatar: Sirizen logo

## Kullanım

### Herhangi bir sayfada sohbeti açmak:
```typescript
// Event dispatch
window.dispatchEvent(new CustomEvent('open-sirizen-assistant'));

// Veya doğrudan
import { openCrispChat } from '@/components/chat/CrispChat';
openCrispChat();
```

### Help Sayfası
- Sağ altta yüzen sohbet butonu
- Banner'da 4 hızlı erişim butonu
- Tümü Crisp sohbetini açar

## Sorun Giderme

### Crisp yüklenmiyorsa:
1. Adblocker'ı kontrol edin
2. Console'da hata mesajlarına bakın
3. Website ID'nin doğru olduğunu kontrol edin

### Kullanıcı bilgileri gitmiyorsa:
- AuthContext'in düzgün çalıştığından emin olun
- User objesinin yapısını kontrol edin

## Gelişmiş Kullanım

### Özel Veri Gönderme
```typescript
// Sipariş tamamlandığında
trackCrispEvent('order_completed', {
  order_id: '12345',
  amount: 1500,
  currency: 'TRY'
});

// Sepete ekleme
trackCrispEvent('added_to_cart', {
  product_id: '456',
  product_name: 'iPhone 15'
});
```

### Segmentasyon için Session Data
Crisp'te kullanıcıları segmentlere ayırmak için otomatik gönderilen veriler:
- `user_id`: Kullanıcı ID
- `user_type`: customer/vendor/admin
- `orders_count`: Sipariş sayısı
- `total_spent`: Toplam harcama
- `member_since`: Üyelik tarihi

## Destek
Crisp Dokümantasyonu: https://docs.crisp.chat

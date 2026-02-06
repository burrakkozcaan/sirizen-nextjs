import {
  FileText,
  User,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  AlertTriangle,
  Copyright,
  Mail,
  Scale,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const keyPoints = [
  {
    icon: User,
    title: "Hesap Sorumluluğu",
    description: "Hesabınızın güvenliğinden siz sorumlusunuz",
  },
  {
    icon: ShoppingCart,
    title: "Sipariş Kuralları",
    description: "Siparişleriniz bağlayıcıdır",
  },
  {
    icon: RotateCcw,
    title: "İade Politikası",
    description: "14 gün içinde iade hakkınız",
  },
  {
    icon: Shield,
    title: "Güvenli Alışveriş",
    description: "Güvenli ödeme ve teslimat",
  },
];

const sections = [
  {
    title: "1. Genel Hükümler",
    content: `Bu Kullanım Şartları ("Şartlar"), Bazaar Hub platformunu ("Platform", "Site") kullanımınızı düzenler. Platformu kullanarak, bu şartları kabul etmiş sayılırsınız.

Platform, DSM Grup Danışmanlık İletişim ve Satış Ticaret A.Ş. tarafından işletilmektedir. Bu şartlar, Türkiye Cumhuriyeti yasalarına tabidir.

Platformu kullanmadan önce bu şartları dikkatle okumanızı öneririz. Şartları kabul etmiyorsanız, lütfen platformu kullanmayın.`,
  },
  {
    title: "2. Hesap Kaydı ve Sorumluluklar",
    content: `Platformu kullanmak için hesap oluşturmanız gerekebilir. Hesap oluştururken:

• Doğru, güncel ve eksiksiz bilgi vermeniz gerekir
• Hesap bilgilerinizin güvenliğinden siz sorumlusunuz
• Şifrenizi kimseyle paylaşmamalısınız
• Hesabınız üzerinden yapılan tüm işlemlerden sorumlusunuz
• Şüpheli aktivite tespit edilirse hesabınız askıya alınabilir

18 yaşından küçükler, yasal vasi veya velilerinin izni olmadan platformu kullanamaz.`,
  },
  {
    title: "3. Ürün Bilgileri ve Fiyatlandırma",
    content: `Platform üzerindeki ürün bilgileri ve fiyatlar:

• Satıcılar tarafından sağlanır ve doğruluğundan satıcılar sorumludur
• Stok durumuna göre değişebilir
• Fiyatlar, kampanyalar ve indirimler önceden haber verilmeksizin değiştirilebilir
• Ürün görselleri temsilidir, gerçek ürünlerden küçük farklılıklar olabilir
• Ürün özellikleri ve açıklamaları satıcıların sorumluluğundadır

Platform, ürün bilgilerinin doğruluğunu garanti etmez ancak yanlış bilgilerin düzeltilmesi için çaba gösterir.`,
  },
  {
    title: "4. Sipariş ve Ödeme",
    content: `Sipariş süreci:

• Sipariş verdiğinizde, siparişiniz bağlayıcıdır
• Sipariş onayı e-posta ile gönderilir
• Ödeme işlemleri güvenli ödeme sistemleri üzerinden yapılır
• Kredi kartı bilgileriniz saklanmaz, şifrelenmiş olarak işlenir
• Ödeme reddedilirse siparişiniz iptal edilir

Sipariş iptali:
• Siparişiniz kargoya verilmeden önce iptal edebilirsiniz
• Kargoya verildikten sonra iptal için iade sürecini takip etmeniz gerekir`,
  },
  {
    title: "5. Kargo ve Teslimat",
    content: `Teslimat koşulları:

• Teslimat süreleri ürün sayfasında belirtilir
• Kargo ücretleri sepetinizde görüntülenir
• Teslimat adresi sipariş sırasında belirlenir
• Teslimat sırasında ürün kontrolü yapmanız önerilir
• Hasarlı veya eksik ürün tesliminde derhal bildirim yapmalısınız

Gecikmeler:
• Kargo firmalarından kaynaklanan gecikmelerden platform sorumlu değildir
• Hava koşulları, doğal afetler gibi mücbir sebeplerden kaynaklanan gecikmelerden sorumlu değiliz`,
  },
  {
    title: "6. İade ve İptal",
    content: `İade hakkınız:

• Tüketici hakları kapsamında 14 gün içinde cayma hakkınız vardır
• Ürün orijinal ambalajında, kullanılmamış ve hasarsız olmalıdır
• Kişisel kullanıma özel ürünler (iç çamaşırı, kozmetik vb.) iade edilemez
• İade talebinizi müşteri hizmetleri üzerinden oluşturabilirsiniz

İade süreci:
• İade talebi onaylandıktan sonra kargo bilgileri paylaşılır
• Ürün kontrol edildikten sonra ödeme iadesi yapılır
• İade kargo ücreti müşteriye aittir (hatalı ürün hariç)`,
  },
  {
    title: "7. Kullanıcı Davranışı ve Yasaklar",
    content: `Platform kullanımında yasak olan davranışlar:

• Sahte hesap oluşturma
• Dolandırıcılık veya yanıltıcı bilgi verme
• Platformun güvenliğini tehdit eden eylemler
• Telif hakkı ihlali
• Spam, zararlı içerik veya kötüye kullanım
• Diğer kullanıcıları rahatsız edici davranışlar
• Otomatik bot veya script kullanımı

Bu kuralları ihlal eden hesaplar kalıcı olarak kapatılabilir ve yasal işlem başlatılabilir.`,
  },
  {
    title: "8. Fikri Mülkiyet Hakları",
    content: `Platform içeriği:

• Platform üzerindeki tüm içerik, tasarım, logo ve markalar telif hakkı koruması altındadır
• İçerikleri izinsiz kopyalayamaz, dağıtamaz veya kullanamazsınız
• Ürün görselleri ve açıklamaları satıcılara aittir
• Platform içeriğini ticari amaçlarla kullanamazsınız

Kullanıcı içeriği:
• Platforma yüklediğiniz içeriklerin (yorum, değerlendirme vb.) telif hakkı size aittir
• İçerikleri yükleyerek, platformun bunları kullanma hakkını vermiş olursunuz`,
  },
  {
    title: "9. Sorumluluk Sınırlaması",
    content: `Platform sorumluluğu:

• Platform, satıcılar ve üçüncü taraflar arasında aracılık yapar
• Ürün kalitesi, teslimat ve ödeme konularında doğrudan sorumluluk üstlenmez
• Satıcıların yükümlülüklerinden platform sorumlu değildir
• Platform teknik hatalardan veya kesintilerden sorumlu tutulamaz

Tazminat:
• Platform kullanımından kaynaklanan zararlardan sorumluluk sınırlıdır
• Doğrudan, dolaylı veya sonuç zararlarından sorumlu değiliz
• Maksimum sorumluluk, son 12 ayda ödediğiniz toplam tutarla sınırlıdır`,
  },
  {
    title: "10. Değişiklikler ve Güncellemeler",
    content: `Şartların değiştirilmesi:

• Bu şartlar önceden haber verilmeksizin güncellenebilir
• Önemli değişiklikler e-posta veya platform bildirimi ile duyurulur
• Değişikliklerden sonra platformu kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir
• Şartları kabul etmiyorsanız, platformu kullanmayı bırakmalısınız

Son güncelleme tarihi sayfanın başında belirtilmektedir.`,
  },
  {
    title: "11. Uyuşmazlık Çözümü",
    content: `Uyuşmazlıkların çözümü:

• Öncelikle müşteri hizmetleri üzerinden çözüm aranmalıdır
• Tüketici hakem heyetlerine başvurulabilir
• Türkiye Cumhuriyeti yasaları geçerlidir
• İstanbul mahkemeleri yetkilidir

Tüketici hakları:
• 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki haklarınız saklıdır
• Tüketici hakem heyetlerine başvuru hakkınız vardır`,
  },
  {
    title: "12. İletişim",
    content: `Sorularınız ve şikayetleriniz için:

E-posta: destek@bazaarhub.com
Telefon: 0850 XXX XX XX
Adres: Maslak Mah., AOS 55. Sokak No:2, 34398 Sarıyer/İstanbul

Çalışma saatleri: Hafta içi 09:00 - 18:00

Müşteri hizmetleri ekibimiz, sorularınızı en kısa sürede yanıtlamak için hazırdır.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pb-10 lg:pb-8">
      <div className="container mx-auto px-4 py-2">
        <div className="max-w-6xl mx-auto">
          {/* Main Content Card */}
          <div className="relative order-2 mr-4 flex w-full flex-col items-center rounded-3xl border border-gray-200 px-6 md:order-1 md:overflow-y-auto md:border md:bg-white md:px-8 md:shadow-xs dark:border-[#313131] dark:bg-[#171719]">
            <div className="flex h-full w-full flex-col">
              {/* Header */}
              <div className="flex w-full flex-col gap-y-4 py-8 md:flex-row md:items-center md:justify-between md:py-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                    Kullanım Şartları
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Son güncelleme: 19 Ocak 2026
                  </p>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="flex flex-col gap-y-4 py-6">
                <div className="max-w-3xl mx-auto w-full">
                  {/* Key Points Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {keyPoints.map((point) => (
                      <div
                        key={point.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a] text-center"
                      >
                        <point.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-medium text-xs">{point.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-[#2a2a2a]">
                    <div className="flex gap-3">
                      <Scale className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs">
                        Bu kullanım şartları, platformu kullanırken hak ve
                        yükümlülüklerinizi belirler. Lütfen dikkatle okuyunuz.
                        Platformu kullanarak bu şartları kabul etmiş
                        sayılırsınız.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sections.map((section) => (
                      <div
                        key={section.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                      >
                        <h3 className="font-semibold text-base mb-3">
                          {section.title}
                        </h3>
                        <p className="text-muted-foreground whitespace-pre-line text-xs leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  Shield,
  Eye,
  Lock,
  UserCheck,
  Database,
  Bell,
  Mail,
  FileText,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const dataTypes = [
  {
    icon: UserCheck,
    title: "Kimlik Bilgileri",
    description: "Ad, soyad, T.C. kimlik numarası",
  },
  {
    icon: Mail,
    title: "İletişim Bilgileri",
    description: "E-posta, telefon, adres",
  },
  {
    icon: Database,
    title: "İşlem Bilgileri",
    description: "Sipariş geçmişi, ödeme bilgileri",
  },
  {
    icon: Eye,
    title: "Davranışsal Veriler",
    description: "Site kullanım verileri, tercihler",
  },
];

const sections = [
  {
    title: "1. Veri Sorumlusu",
    content: `DSM Grup Danışmanlık İletişim ve Satış Ticaret A.Ş. ("Sirizen") olarak, kişisel verilerinizin güvenliği konusunda azami hassasiyet göstermekteyiz.

Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında hazırlanmıştır.`,
  },
  {
    title: "2. Toplanan Kişisel Veriler",
    content: `Platformumuz üzerinden aşağıdaki kişisel veriler toplanmaktadır:

• Kimlik bilgileri (ad, soyad, T.C. kimlik numarası)
• İletişim bilgileri (e-posta, telefon, adres)
• Finansal bilgiler (banka hesap bilgileri, kredi kartı bilgileri)
• İşlem güvenliği bilgileri (IP adresi, giriş kayıtları)
• Pazarlama verileri (alışveriş geçmişi, tercihler)`,
  },
  {
    title: "3. Verilerin İşlenme Amaçları",
    content: `Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:

• Üyelik işlemlerinin gerçekleştirilmesi
• Sipariş ve teslimat süreçlerinin yönetimi
• Ödeme işlemlerinin gerçekleştirilmesi
• Müşteri hizmetleri desteği
• Yasal yükümlülüklerin yerine getirilmesi
• Pazarlama ve tanıtım faaliyetleri (izninize bağlı)`,
  },
  {
    title: "4. Verilerin Paylaşımı",
    content: `Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:

• Kargo ve lojistik firmaları
• Ödeme kuruluşları ve bankalar
• Yasal merciler ve düzenleyici kurumlar
• İş ortakları ve tedarikçiler (hizmet sunumu için)

Verileriniz hiçbir koşulda satılmaz veya pazarlama amacıyla üçüncü taraflara verilmez.`,
  },
  {
    title: "5. Veri Güvenliği",
    content: `Verilerinizin güvenliği için alınan önlemler:

• SSL şifreleme
• Güvenlik duvarları
• Erişim kontrolü ve yetkilendirme
• Düzenli güvenlik denetimleri
• Personel eğitimleri`,
  },
  {
    title: "6. Haklarınız",
    content: `KVKK kapsamında sahip olduğunuz haklar:

• Verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını öğrenme
• Yurt içi/yurt dışı aktarılan kişileri bilme
• Düzeltme talep etme
• Silme/yok edilmesini isteme
• İtiraz hakkı`,
  },
  {
    title: "7. Çerezler",
    content: `Platformumuzda çeşitli çerezler kullanılmaktadır. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.

Detaylı bilgi için Çerez Politikası sayfamızı inceleyiniz.`,
  },
  {
    title: "8. Değişiklikler",
    content: `Bu politika periyodik olarak güncellenebilir. Önemli değişikliklerde bilgilendirilirsiniz.

Son güncelleme tarihi sayfanın başında belirtilmektedir.`,
  },
  {
    title: "9. İletişim",
    content: `Gizlilik ve kişisel veriler hakkında sorularınız için:

E-posta: kvkk@sirizen.com
Adres: Maslak Mah., AOS 55. Sokak No:2, 34398 Sarıyer/İstanbul`,
  },
];

export default function PrivacyPage() {
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
                    Gizlilik Politikası
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
                  {/* Data Types Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {dataTypes.map((type) => (
                      <div
                        key={type.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a] text-center"
                      >
                        <type.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-medium text-xs">{type.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-[#2a2a2a]">
                    <div className="flex gap-3">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs">
                        Kişisel verilerinizin korunması bizim için önceliktir.
                        Verileriniz, 6698 sayılı KVKK ve ilgili mevzuat
                        kapsamında işlenmekte ve korunmaktadır.
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

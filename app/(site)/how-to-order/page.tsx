import {
  Search,
  ShoppingCart,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const steps = [
  {
    icon: Search,
    title: "Ürün Arama",
    description:
      "Arama çubuğunu kullanarak istediğiniz ürünü bulun veya kategorileri gezin.",
    tips: [
      "Spesifik aramalar için ürün adı, marka veya model girin",
      "Filtreleri kullanarak sonuçları daraltın",
      "Fiyat, puan ve teslimat süresine göre sıralayın",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Sepete Ekleme",
    description:
      "Beğendiğiniz ürünü sepete ekleyin. Beden, renk gibi seçenekleri belirlemeyi unutmayın.",
    tips: [
      "Ürün detay sayfasında özellikleri inceleyin",
      "Yorumları okuyarak diğer alıcıların deneyimlerini görün",
      "Birden fazla ürün ekleyerek kargo avantajından yararlanın",
    ],
  },
  {
    icon: CreditCard,
    title: "Ödeme",
    description:
      "Sepetinizi onaylayın ve güvenli ödeme sayfasında işleminizi tamamlayın.",
    tips: [
      "Kredi kartı, banka kartı veya kapıda ödeme seçenekleri",
      "Taksit imkanlarını kontrol edin",
      "Kupon kodunuzu ödeme sayfasında girin",
    ],
  },
  {
    icon: Truck,
    title: "Teslimat",
    description:
      "Siparişiniz hazırlanır ve kargoya verilir. Takip numarası ile kargonuzu izleyin.",
    tips: [
      "SMS ve e-posta ile kargo bildirimleri alın",
      "Teslimat adresini doğru girdiğinizden emin olun",
      "Gel-Al noktalarını da tercih edebilirsiniz",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Teslim Alma",
    description:
      "Siparişinizi teslim alın ve ürünü kontrol edin. Memnun kalmadığınızda iade edebilirsiniz.",
    tips: [
      "Paketi teslim alırken kontrol edin",
      "15 gün içinde ücretsiz iade hakkı",
      "Ürünü değerlendirerek diğer alıcılara yardımcı olun",
    ],
  },
];

export default function HowToOrderPage() {
  return (
    <div className="min-h-screen bg-white pb-10 lg:pb-8">
      <div className="container mx-auto px-4 py-2">
        <div className="max-w-4xl mx-auto">
          {/* Main Content Card */}
          <div className="relative order-2 mr-4 flex w-full flex-col items-center rounded-3xl border border-gray-200 px-6 md:order-1 md:overflow-y-auto md:border md:bg-white md:px-8 md:shadow-xs dark:border-[#313131] dark:bg-[#171719]">
            <div className="flex h-full w-full flex-col">
              {/* Header */}
              <div className="flex w-full flex-col gap-y-4 py-8 md:flex-row md:items-center md:justify-between md:py-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                    Nasıl Sipariş Verilir?
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Sirizen&apos;de alışveriş yapmak çok kolay! Adım adım
                    rehberimizi takip edin.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="flex flex-col gap-y-4 py-6">
                {/* Steps */}
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.title}
                      className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Step Number & Icon */}
                        <div className="bg-primary/5 p-4 md:w-48 rounded-lg flex flex-col items-center justify-center">
                          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3">
                            <step.icon className="h-8 w-8" />
                          </div>
                          <span className="text-sm font-medium text-primary">
                            Adım {index + 1}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {step.description}
                          </p>
                          <ul className="space-y-2">
                            {step.tips.map((tip, tipIndex) => (
                              <li
                                key={tipIndex}
                                className="flex items-start gap-2 text-sm"
                              >
                                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="mt-6">
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <h3 className="font-semibold text-lg mb-4">
                      Sıkça Sorulan Sorular
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Üye olmadan alışveriş yapabilir miyim?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Evet, misafir olarak alışveriş yapabilirsiniz. Ancak
                          üye olarak siparişlerinizi takip edebilir ve özel
                          indirimlere erişebilirsiniz.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Minimum sipariş tutarı var mı?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Hayır, minimum sipariş tutarı yoktur. Ancak 200 TL
                          üzeri alışverişlerde kargo ücretsizdir.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Siparişimi nasıl iptal edebilirim?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Sipariş kargoya verilmeden önce
                          &quot;Siparişlerim&quot; sayfasından iptal
                          edebilirsiniz.
                        </p>
                      </div>
                    </div>
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

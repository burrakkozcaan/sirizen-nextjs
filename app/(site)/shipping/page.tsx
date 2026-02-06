import {
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "Kargo ve Teslimat",
  description: "Kargo ve teslimat seçenekleri, süreleri ve sıkça sorulan sorular",
};

const shippingOptions = [
  {
    title: "Standart Teslimat",
    time: "2-4 İş Günü",
    price: "29,99 TL",
    freeOver: "200 TL",
    icon: Truck,
  },
  {
    title: "Hızlı Teslimat",
    time: "1-2 İş Günü",
    price: "49,99 TL",
    freeOver: "500 TL",
    icon: Clock,
  },
  {
    title: "Gel-Al Noktası",
    time: "2-3 İş Günü",
    price: "Ücretsiz",
    freeOver: null,
    icon: MapPin,
  },
];

const faqs = [
  {
    question: "Kargo takibi nasıl yapılır?",
    answer:
      'Siparişiniz kargoya verildiğinde SMS ve e-posta ile takip numarası gönderilir. "Siparişlerim" sayfasından da kargo durumunu takip edebilirsiniz.',
  },
  {
    question: "Teslimat adresi değiştirilebilir mi?",
    answer:
      'Sipariş kargoya verilmeden önce teslimat adresini "Siparişlerim" sayfasından değiştirebilirsiniz. Kargoya verildikten sonra değişiklik yapılamaz.',
  },
  {
    question: "Hangi kargo firmaları ile çalışıyorsunuz?",
    answer:
      "Aras Kargo, MNG Kargo, Yurtiçi Kargo, Sürat Kargo ve Trendyol Express ile çalışmaktayız. Satıcıya göre kargo firması değişebilir.",
  },
  {
    question: "Hafta sonu teslimat yapılıyor mu?",
    answer:
      "Evet, Cumartesi günleri teslimat yapılmaktadır. Pazar günleri ise sadece belirli bölgelerde teslimat mevcuttur.",
  },
  {
    question: "Evde yoksam ne olur?",
    answer:
      "Kurye sizi telefonla arar. Ulaşamazsa, en yakın teslim noktasına bırakılır veya ertesi gün tekrar denenir.",
  },
];

export default function ShippingPage() {
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
                    Kargo ve Teslimat
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Siparişlerinizi en hızlı ve güvenli şekilde kapınıza getiriyoruz.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="flex flex-col gap-y-4 py-6">
                {/* Shipping Options */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Teslimat Seçenekleri
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {shippingOptions.map((option) => (
                      <div
                        key={option.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <option.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base">
                              {option.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {option.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-base">
                            {option.price}
                          </span>
                          {option.freeOver && (
                            <Badge variant="secondary" className="text-xs">
                              {option.freeOver} üzeri ücretsiz
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Teslimat Kapsamı
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Türkiye genelinde 81 ile teslimat</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>5000+ Gel-Al noktası</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Aynı gün teslimat (seçili illerde)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Sigortalı kargo hizmeti</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Canlı kargo takibi</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      Önemli Bilgiler
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Resmi tatillerde teslimat yapılmamaktadır</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Büyük ürünlerde ek kargo ücreti uygulanabilir</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Teslimat süresi satıcıya göre değişebilir</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Kampanya dönemlerinde gecikmeler yaşanabilir</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* FAQ */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Sıkça Sorulan Sorular
                  </h2>
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, index) => (
                        <AccordionItem
                          key={index}
                          value={`item-${index}`}
                          className="border-b border-gray-200 last:border-0"
                        >
                          <AccordionTrigger className="text-left text-sm py-3">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground pb-3">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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

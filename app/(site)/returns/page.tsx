import {
  RotateCcw,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
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

const returnSteps = [
  {
    icon: Package,
    title: "İade Talebi Oluştur",
    description:
      '"Siparişlerim" sayfasından iade etmek istediğiniz ürünü seçin ve iade nedenini belirtin.',
  },
  {
    icon: Truck,
    title: "Kargo ile Gönder",
    description:
      "Ürünü orijinal paketinde hazırlayın. Ücretsiz kargo kodu ile en yakın kargo şubesinden gönderin.",
  },
  {
    icon: RotateCcw,
    title: "Ürün Kontrolü",
    description:
      "İade edilen ürün satıcı tarafından kontrol edilir. Uygunsa iade onaylanır.",
  },
  {
    icon: CreditCard,
    title: "Para İadesi",
    description:
      "Onaylanan iadeler için ödemeniz 3-10 iş günü içinde hesabınıza yatırılır.",
  },
];

const returnableItems = [
  "Giyim ürünleri (denenmemiş, etiketli)",
  "Ayakkabı ve çanta",
  "Ev tekstili ürünleri",
  "Elektronik cihazlar (açılmamış)",
  "Kozmetik ürünler (açılmamış)",
  "Spor malzemeleri",
];

const nonReturnableItems = [
  "İç giyim ve mayo",
  "Kişisel bakım ürünleri (kullanılmış)",
  "Kozmetik ürünler (açılmış)",
  "Gıda ürünleri",
  "İndirimli/outlet ürünler (satıcı şartlarına bağlı)",
  "Dijital ürünler ve yazılımlar",
];

const faqs = [
  {
    question: "İade süresi ne kadar?",
    answer:
      "Teslimat tarihinden itibaren 15 gün içinde iade talebinde bulunabilirsiniz. Bazı ürün kategorilerinde bu süre farklılık gösterebilir.",
  },
  {
    question: "İade kargo ücreti kim tarafından karşılanır?",
    answer:
      'Standart iadelerde kargo ücretsizdir. Ancak "Fikir değişikliği" nedenli iadelerde kargo ücreti alıcıya ait olabilir.',
  },
  {
    question: "Para iadem ne zaman yapılır?",
    answer:
      "İade onaylandıktan sonra kredi kartına 3-10 iş günü, banka kartına 5-15 iş günü içinde yansır. Kapıda ödemede ise IBAN'a havale yapılır.",
  },
  {
    question: "Değişim yapabilir miyim?",
    answer:
      "Doğrudan değişim seçeneği bulunmamaktadır. İade işlemi yapıp yeni sipariş vermeniz gerekmektedir.",
  },
  {
    question: "Hasarlı ürün geldi, ne yapmalıyım?",
    answer:
      "Hasarlı ürünler için hemen iade talebi oluşturun ve fotoğraf ekleyin. Kargo hasarlarında tutanak tutulması önemlidir.",
  },
];

export default function ReturnsInfoPage() {
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
                    İade ve Değişim
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Memnun kalmadığınız ürünleri kolayca iade edebilirsiniz.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="flex flex-col gap-y-4 py-6">
                {/* Return Period Badge */}
                <div className="text-center mb-6">
                  <Badge variant="secondary" className="text-base px-6 py-2">
                    <Clock className="h-4 w-4 mr-2" />
                    15 Gün Ücretsiz İade
                  </Badge>
                </div>

                {/* Return Steps */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    İade Nasıl Yapılır?
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {returnSteps.map((step, index) => (
                      <div
                        key={step.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a] text-center relative"
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 mt-2">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm mb-2">
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Returnable vs Non-returnable */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl border border-success/30 p-4 dark:border-[#2a2a2a]">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      İade Edilebilir Ürünler
                    </h3>
                    <ul className="space-y-2">
                      {returnableItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-destructive/30 p-4 dark:border-[#2a2a2a]">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      İade Edilemeyen Ürünler
                    </h3>
                    <ul className="space-y-2">
                      {nonReturnableItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm"
                        >
                          <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Important Note */}
                <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 dark:border-[#2a2a2a]">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-2">
                        Önemli Hatırlatmalar
                      </h3>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>
                          • Ürünleri orijinal ambalajında ve etiketleri
                          sökülmemiş şekilde iade edin
                        </li>
                        <li>
                          • Aksesuarları ve hediye ürünleri de paketleyin
                        </li>
                        <li>
                          • Kargo kodunu iade talebi ekranından alabilirsiniz
                        </li>
                        <li>
                          • İade nedenini doğru seçmek işlemi hızlandırır
                        </li>
                      </ul>
                    </div>
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

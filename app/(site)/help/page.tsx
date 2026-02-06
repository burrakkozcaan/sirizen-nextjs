"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  Search,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  Package,
  RotateCcw,
  Truck,
  ShoppingBag,
  Building2,
  User,
  Phone,
  FileText,
  Shield,
  AlertCircle,
  Sparkles,
  Bot,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { QuickReplyButtons } from "@/components/help/LiveChatWidget";

const helpCategories = [
  { id: "populer", label: "Popüler Sorular", icon: HelpCircle },
  { id: "iade", label: "İade", icon: RotateCcw },
  { id: "kargo", label: "Kargo ve Teslimat", icon: Truck },
  { id: "siparis", label: "Siparişler", icon: Package },
  { id: "hakkinda", label: "sirizen.com Hakkında", icon: Building2 },
  { id: "hesap", label: "Hesabım", icon: User },
  { id: "urun", label: "Ürün & Alışveriş", icon: ShoppingBag },
  { id: "iletisim", label: "İletişim", icon: Phone },
  { id: "fatura", label: "Kurumsal Fatura", icon: FileText },
  { id: "sigorta", label: "Sirizen Sigorta", icon: Shield },
  {
    id: "geri-cagirma",
    label: "Ürün Geri Çağırmaları ve Ürün Güvenliği Bildirimleri",
    icon: AlertCircle,
  },
];

// Sorular ve cevaplar
const questionsWithAnswers: Record<string, { id: number; question: string; answer: string }[]> = {
  populer: [
    { 
      id: 1, 
      question: "Elite üyeliğin ayrıcalıkları nelerdir?",
      answer: "Elite üyelik ile kargo bedava, özel indirimler, öncelikli müşteri hizmetleri ve Elite ürünlerde ekstra fırsatlardan yararlanabilirsiniz. Elite üye olmak için son 6 ayda 10.000 TL ve üzeri alışveriş yapmanız gerekmektedir."
    },
    { 
      id: 2, 
      question: "Gel Al Noktası nedir?",
      answer: "Gel Al Noktası, siparişlerinizi anlaşmalı noktalardan teslim alabileceğiniz bir hizmettir. Kargo ücreti ödemeden, size en yakın Gel Al Noktası'ndan siparişinizi 2 saat içinde teslim alabilirsiniz."
    },
    {
      id: 3,
      question: "Kampanyadan yararlandığım bir siparişte iptal ya da iade yaparsam kampanya iptal olur mu?",
      answer: "Evet, kampanyadan yararlanarak aldığınız ürünlerde iptal veya iade yaparsanız kampanya koşulları bozulur ve kampanya iptal olabilir. Kampanya şartlarını dikkatle okumanızı öneririz."
    },
    { 
      id: 4, 
      question: "Nasıl Elite olurum?",
      answer: "Elite üye olmak için son 6 ayda toplam 10.000 TL ve üzeri alışveriş yapmanız gerekmektedir. Alışveriş tutarınıza göre otomatik olarak Elite statüsüne yükselirsiniz ve bilgilendirme e-postası alırsınız."
    },
    { 
      id: 5, 
      question: "Sağlık beyanı nedir?",
      answer: "Sağlık beyanı, kozmetik ve kişisel bakım ürünlerinde bulunan içerik bilgilerini ve uyarıları içeren bir bildirimdir. Ürünleri satın almadan önce bu beyanları okumanız önerilir."
    },
    { 
      id: 6, 
      question: "Siparişimi nasıl iptal edebilirim?",
      answer: "Siparişinizi iptal etmek için 'Siparişlerim' sayfasına gidin, iptal etmek istediğiniz siparişi seçin ve 'Siparişi İptal Et' butonuna tıklayın. Kargoya verilmemiş siparişler iptal edilebilir."
    },
    {
      id: 7,
      question: "Siparişimin teslimat adresini veya alıcı adını değiştirebilir miyim?",
      answer: "Siparişiniz kargoya verilmeden önce teslimat adresini ve alıcı adını değiştirebilirsiniz. Bunun için 'Siparişlerim' sayfasından siparişinizi bulun ve 'Adres Değiştir' seçeneğini kullanın."
    },
    { 
      id: 8, 
      question: "Siparişim ne zaman gelir?",
      answer: "Siparişleriniz genellikle 1-3 iş günü içinde kargoya verilir. Teslimat süresi seçtiğiniz kargo firmasına ve adresinize göre değişiklik gösterebilir. Sipariş detay sayfanızdan takip edebilirsiniz."
    },
    { 
      id: 9, 
      question: "Ücret iadem ne zaman yapılır?",
      answer: "İade edilen ürünlerin iade süreci tamamlandıktan sonra ücret iadesi 3-5 iş günü içinde ödeme yaptığınız karta yapılır. Bazı bankalar için bu süre 7-14 günü bulabilir."
    },
    {
      id: 10,
      question: "Ürün veya siparişim ile ilgili taleplerimi/sorularımı nasıl iletebilirim?",
      answer: "Ürün veya siparişinizle ilgili taleplerinizi 'Siparişlerim' sayfasından ilgili siparişi seçerek 'Yardım Talebi Oluştur' butonuyla iletebilir veya Sirizen Asistan ile 7/24 görüşebilirsiniz."
    },
  ],
  iade: [
    { 
      id: 1, 
      question: "İade işlemi nasıl yapılır?",
      answer: "İade işlemi için 'Siparişlerim' sayfasından ilgili siparişi seçin, 'İade Talebi Oluştur' butonuna tıklayın. İade edeceğiniz ürünleri seçin ve iade nedenini belirtin. Ardından kargo firması ücretsiz olarak ürünleri adresinizden alacaktır."
    },
    { 
      id: 2, 
      question: "İade süresi ne kadardır?",
      answer: "Teslimat tarihinden itibaren 15 gün içinde iade yapabilirsiniz. Kozmetik, kişisel bakım ve iç giyim ürünleri ambalajı açılmamış ve kullanılmamış olması koşuluyla iade edilebilir."
    },
    { 
      id: 3, 
      question: "Hangi ürünler iade edilemez?",
      answer: "Kullanılmış, ambalajı açılmış kozmetik ve kişisel bakım ürünleri, iç giyim ürünleri, özel üretim ürünleri ve hijyenik nedenlerle kullanılmış elektronik ürünler iade edilemez. Ayrıca indirimli ve kampanyalı bazı ürünlerde iade kabul edilmemektedir."
    },
    { 
      id: 4, 
      question: "İade ücreti ödenir mi?",
      answer: "Hayır, iade ücreti ödenmez. Sirizen'den yapılan iadelerde kargo ücreti tarafımızdan karşılanmaktadır. Ücretsiz iade hizmetimizden yararlanabilirsiniz."
    },
  ],
  kargo: [
    { 
      id: 1, 
      question: "Kargo takibi nasıl yapılır?",
      answer: "Kargo takibi için 'Siparişlerim' sayfasına gidin, takip etmek istediğiniz siparişi seçin. 'Kargo Takip' butonuna tıkladığınızda kargo firmanızın takip sayfasına yönlendirileceksiniz. Ayrıca SMS ve e-posta ile gönderilen takip numaralarını kullanarak da kargonuzu takip edebilirsiniz."
    },
    { 
      id: 2, 
      question: "Teslimat süresi ne kadardır?",
      answer: "Teslimat süresi ürünün bulunduğu depoya, teslimat adresinize ve seçtiğiniz kargo firmasına göre değişir. Genellikle 1-5 iş günü içinde teslimat yapılmaktadır. Sipariş detay sayfanızdan tahmini teslimat tarihini görebilirsiniz."
    },
    { 
      id: 3, 
      question: "Kargo ücreti ne kadar?",
      answer: "Standart kargo ücreti 39,90 TL'dir. 200 TL ve üzeri alışverişlerinizde kargo ücretsizdir. Elite üyeler için tüm alışverişlerde kargo bedavadır. Ayrıca Gel Al Noktası seçeneği ile her zaman kargo bedavadır."
    },
  ],
  siparis: [
    { 
      id: 1, 
      question: "Siparişimi nasıl iptal ederim?",
      answer: "Siparişinizi iptal etmek için 'Siparişlerim' sayfasına gidin, iptal etmek istediğiniz siparişi bulun ve 'Siparişi İptal Et' butonuna tıklayın. Sadece 'Hazırlanıyor' durumundaki siparişler iptal edilebilir. Kargoya verilen siparişler için iade sürecini kullanmalısınız."
    },
    { 
      id: 2, 
      question: "Sipariş durumu ne anlama gelir?",
      answer: "Sipariş durumları: 'Onay Bekliyor' - Ödeme onayı bekleniyor, 'Hazırlanıyor' - Siparişiniz depoda hazırlanıyor, 'Kargoya Verildi' - Siparişiniz kargoya teslim edildi, 'Teslim Edildi' - Siparişiniz teslim edildi, 'İptal Edildi' - Siparişiniz iptal edildi."
    },
    { 
      id: 3, 
      question: "Siparişim neden iptal edildi?",
      answer: "Siparişiniz stok yetersizliği, ödeme sorunu veya satıcı iptali gibi nedenlerle iptal edilmiş olabilir. İptal nedeni e-posta ve SMS ile size bildirilmiştir. Ödemeniz varsa 3-5 iş günü içinde iade edilecektir."
    },
  ],
  hakkinda: [
    { 
      id: 1, 
      question: "Sirizen nedir?",
      answer: "Sirizen, Türkiye'nin önde gelen e-ticaret platformlarından biridir. Milyonlarca ürünü uygun fiyatlarla, güvenli alışveriş imkanıyla müşterilerine sunar."
    },
    { 
      id: 2, 
      question: "Sirizen'de nasıl satıcı olabilirim?",
      answer: "Sirizen'de satıcı olmak için 'Satıcı Ol' sayfasına giderek başvuru formunu doldurmanız gerekmektedir. Başvurunuz incelendikten sonra gerekli belgeleri tamamlayarak satıcılık sürecinizi başlatabilirsiniz."
    },
  ],
  hesap: [
    { 
      id: 1, 
      question: "Şifremi unuttum ne yapmalıyım?",
      answer: "Şifrenizi unuttuysanız giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayın. Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilecektir. Bu bağlantıyı kullanarak yeni şifrenizi oluşturabilirsiniz."
    },
    { 
      id: 2, 
      question: "E-posta adresimi nasıl değiştirebilirim?",
      answer: "E-posta adresinizi değiştirmek için 'Hesabım' > 'Kişisel Bilgilerim' sayfasına gidin. E-posta adresi bölümünde 'Değiştir' seçeneğine tıklayın. Yeni e-posta adresinize doğrulama kodu gönderilecektir."
    },
  ],
  urun: [
    { 
      id: 1, 
      question: "Ürün garantisi nasıl çalışır?",
      answer: "Elektronik ürünlerde 2 yıl garanti zorunludur. Garanti kapsamında arızalanan ürünler için 'Siparişlerim' sayfasından garanti talebi oluşturabilirsiniz. Yetkili servis ürünü inceleyip onarım veya değişim kararı verecektir."
    },
    { 
      id: 2, 
      question: "Stokta olmayan ürün ne zaman gelir?",
      answer: "Stokta olmayan ürünlerin ne zaman stoka gireceği belirsizdir. 'Stokta yok' uyarısı olan ürünlerde 'Gelince Haber Ver' butonuna tıklayarak stok bildirimi alabilirsiniz."
    },
  ],
};

declare global {
  interface Window {
    $zoho: any;
  }
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("populer");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Script yüklendikten sonra widget'ı göster ve pozisyonu ayarla
  useEffect(() => {
    if (scriptLoaded && typeof window !== "undefined" && window.$zoho && window.$zoho.salesiq) {
      // Widget'ı göster
      window.$zoho.salesiq.floatwindow?.visible?.("show");
      
      // Pozisyonu ayarla - daha yukarıda (90px from bottom)
      const style = document.createElement('style');
      style.id = 'zoho-custom-style';
      style.innerHTML = `
        #siqchatcontainer { 
          bottom: 90px !important; 
          right: 20px !important;
        }
        .zsiq_floatmain {
          bottom: 90px !important;
          right: 20px !important;
        }
        .zsiq_flt_rel {
          bottom: 90px !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup - sayfadan çıkınca widget'ı gizle
    return () => {
      if (typeof window !== "undefined" && window.$zoho && window.$zoho.salesiq) {
        window.$zoho.salesiq.floatwindow?.visible?.("hide");
      }
      // Stili kaldır
      const style = document.getElementById('zoho-custom-style');
      if (style) {
        style.remove();
      }
    };
  }, [scriptLoaded]);

  const currentQuestions = questionsWithAnswers[activeCategory] || questionsWithAnswers.populer;

  // Arama fonksiyonu
  const filteredQuestions = searchQuery.trim()
    ? Object.values(questionsWithAnswers)
        .flat()
        .filter(
          (q) =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : currentQuestions;

  return (
    <>
      {/* Zoho SalesIQ - Sadece bu sayfada */}
      <Script
        id="zoho-salesiq-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};`,
        }}
      />
      <Script
        id="zsiqscript"
        src="https://salesiq.zohopublic.eu/widget?wc=siq5a8e418a94515ec63af2ed337ededeec9bb26b1bc8724f5c925b207b2d628c4c"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-pink-500 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Bot className="h-5 w-5 text-white" />
              <span className="text-white text-sm font-medium">7/24 Sirizen Asistan Desteği</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sana nasıl yardımcı olabiliriz?
            </h1>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Sorularınızı yanıtlamak ve size en iyi desteği sunmak için buradayız
            </p>
            <div className="max-w-xl mx-auto relative">
              <Input
                type="text"
                placeholder="Yardım Sayfasında Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sirizen Asistan Banner */}
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Sirizen Asistan</h2>
                    <p className="text-gray-600">Yapay zeka destekli yardım asistanımız ile anında çözüm bulun</p>
                  </div>
                </div>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                  onClick={() => {
                    const event = new CustomEvent('open-sirizen-assistant');
                    window.dispatchEvent(event);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Asistan ile Konuş
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Hızlı Erişim Butonları */}
              <div className="mt-6 pt-6 border-t border-orange-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Hızlı Erişim:</p>
                <QuickReplyButtons />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Grid - Sadece arama yapılmıyorsa göster */}
        {!searchQuery.trim() && (
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Yardım Kategorileri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {helpCategories.map((category) => (
                <Card
                  key={category.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg hover:border-orange-300 hover:-translate-y-1",
                    activeCategory === category.id && "border-orange-500 bg-orange-50"
                  )}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setExpandedQuestion(null);
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <div className={cn(
                      "h-12 w-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors",
                      activeCategory === category.id
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-600"
                    )}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        activeCategory === category.id && "text-orange-700"
                      )}
                    >
                      {category.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar - Sadece arama yapılmıyorsa göster */}
            {!searchQuery.trim() && (
              <div className="lg:col-span-3">
                <Card className="sticky top-4">
                  <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      {helpCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setActiveCategory(category.id);
                            setExpandedQuestion(null);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-orange-50 border-b last:border-b-0 text-left",
                            activeCategory === category.id &&
                              "bg-orange-100 text-orange-700 font-medium"
                          )}
                        >
                          <category.icon className={cn(
                            "h-4 w-4 flex-shrink-0",
                            activeCategory === category.id ? "text-orange-600" : "text-gray-400"
                          )} />
                          <span className="flex-1 line-clamp-1">{category.label}</span>
                          <ChevronRight className={cn(
                            "h-4 w-4 flex-shrink-0",
                            activeCategory === category.id ? "text-orange-600" : "text-gray-300"
                          )} />
                        </button>
                      ))}
                    </div>

                    {/* Assistant Card */}
                    <div className="p-4 border-t bg-gradient-to-br from-orange-50 to-orange-100">
                      <div className="text-center">
                        <div className="h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          Sirizen Asistan
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          7/24 Sorularınızı Cevaplar
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={() => {
                            const event = new CustomEvent('open-sirizen-assistant');
                            window.dispatchEvent(event);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Başlat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <div className={cn("lg:col-span-9", searchQuery.trim() && "lg:col-span-12")}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/" className="hover:text-orange-600 transition-colors">
                  Ana Sayfa
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">
                  {searchQuery.trim() 
                    ? `Arama: "${searchQuery}"` 
                    : helpCategories.find((c) => c.id === activeCategory)?.label || "Popüler Sorular"}
                </span>
              </div>

              {/* Questions with Answers */}
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      {searchQuery.trim() 
                        ? "Arama Sonuçları" 
                        : helpCategories.find((c) => c.id === activeCategory)?.label || "Popüler Sorular"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredQuestions.length} soru bulundu
                    </p>
                  </div>
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((item, index) => (
                      <div
                        key={`${activeCategory}-${item.id}`}
                        className={cn(
                          "border-b last:border-b-0",
                          index !== filteredQuestions.length - 1 && "border-b"
                        )}
                      >
                        <button
                          onClick={() => setExpandedQuestion(
                            expandedQuestion === item.id ? null : item.id
                          )}
                          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-orange-50 transition-colors group"
                        >
                          <span className="text-sm text-gray-700 group-hover:text-orange-700 font-medium pr-4">
                            {item.question}
                          </span>
                          <ChevronDown 
                            className={cn(
                              "h-5 w-5 text-gray-300 group-hover:text-orange-500 flex-shrink-0 transition-transform",
                              expandedQuestion === item.id && "rotate-180"
                            )} 
                          />
                        </button>
                        
                        {/* Answer */}
                        {expandedQuestion === item.id && (
                          <div className="px-6 pb-4 bg-orange-50/50">
                            <div className="pt-2 pb-2 pl-4 border-l-2 border-orange-300">
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs border-orange-200 hover:bg-orange-100"
                              >
                                Bu cevap yardımcı oldu
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-gray-500 hover:text-orange-600"
                              >
                                Yardımcı olmadı
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aramanızla eşleşen soru bulunamadı.</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Lütfen farklı anahtar kelimeler deneyin veya Sirizen Asistan ile görüşün.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Banner */}
              <Card className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">Başka bir sorunuz mu var?</h3>
                      <p className="text-gray-300 text-sm mt-1">
                        Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                          const event = new CustomEvent('open-sirizen-assistant');
                          window.dispatchEvent(event);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Asistan ile Konuş
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import {
  FileText,
  Download,
  Mail,
  Phone,
  Calendar,
  Newspaper,
  Image as ImageIcon,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pressReleases = [
  {
    id: 1,
    title: "Bazaar Hub 2024 Yılı İlk Çeyrek Sonuçları",
    date: "15 Nisan 2024",
    category: "Finansal",
    summary:
      "2024 yılının ilk çeyreğinde %35 büyüme kaydeden Bazaar Hub, e-ticaret sektöründe liderliğini sürdürüyor.",
  },
  {
    id: 2,
    title: "Yeni Teknoloji Yatırımları ve AI Entegrasyonu",
    date: "28 Mart 2024",
    category: "Teknoloji",
    summary:
      "Yapay zeka destekli öneri sistemi ve gelişmiş arama teknolojileri ile müşteri deneyimini iyileştiriyoruz.",
  },
  {
    id: 3,
    title: "Sürdürülebilirlik Projeleri ve Çevre Dostu Kargo",
    date: "10 Mart 2024",
    category: "Sürdürülebilirlik",
    summary:
      "Karbon nötr kargo hedefi ve geri dönüşümlü ambalaj kullanımı ile çevreye duyarlı alışveriş deneyimi.",
  },
  {
    id: 4,
    title: "Yeni Satıcı Destek Programı Lansmanı",
    date: "22 Şubat 2024",
    category: "İş Geliştirme",
    summary:
      "KOBİ'lere özel destek paketi ve eğitim programları ile dijital dönüşümü hızlandırıyoruz.",
  },
];

const mediaResources = [
  {
    icon: ImageIcon,
    title: "Logo ve Görseller",
    description: "Yüksek çözünürlüklü logo dosyaları ve marka görselleri",
    download: "İndir",
  },
  {
    icon: FileText,
    title: "Basın Kiti",
    description: "Şirket bilgileri, istatistikler ve önemli veriler",
    download: "İndir",
  },
  {
    icon: Users,
    title: "Yönetim Kurulu Fotoğrafları",
    description: "Yüksek kaliteli yönetim ekibi fotoğrafları",
    download: "İndir",
  },
];

const keyStats = [
  { label: "Aktif Kullanıcı", value: "30M+", icon: Users },
  { label: "Satıcı Sayısı", value: "250K+", icon: TrendingUp },
  { label: "Ürün Çeşidi", value: "200M+", icon: Award },
  { label: "Yıllık Ciro", value: "50M+ TL", icon: TrendingUp },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Basın Merkezi</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Basın bültenleri, haberler, medya materyalleri ve şirket bilgileri
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {keyStats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Press Releases */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Basın Bültenleri</h2>
              <div className="space-y-4">
                {pressReleases.map((release) => (
                  <Card
                    key={release.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{release.category}</Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {release.date}
                            </span>
                          </div>
                          <CardTitle className="text-lg mb-2">
                            {release.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {release.summary}
                      </p>
                      <Button variant="outline" size="sm">
                        Devamını Oku
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Şirket Hakkında</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Bazaar Hub, Türkiye&apos;nin önde gelen e-ticaret platformlarından
                  biridir. 2010 yılında kurulan şirketimiz, milyonlarca müşteriye
                  hizmet vererek sektörde öncü konumunu sürdürmektedir.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Teknoloji ve inovasyon odaklı yaklaşımımızla, hem müşterilerimize
                  hem de satıcılarımıza değer yaratmayı hedefliyoruz. Sürdürülebilir
                  büyüme ve toplumsal sorumluluk projelerimizle sektöre öncülük
                  ediyoruz.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Media Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medya Materyalleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mediaResources.map((resource) => (
                  <div
                    key={resource.title}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <resource.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1">
                        {resource.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {resource.description}
                      </p>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        {resource.download}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basın İletişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">E-posta</h3>
                    <a
                      href="mailto:basin@bazaarhub.com"
                      className="text-sm text-primary hover:underline"
                    >
                      basin@bazaarhub.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">Telefon</h3>
                    <a
                      href="tel:08502220111"
                      className="text-sm text-primary hover:underline"
                    >
                      0850 222 0 111
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hafta içi 09:00 - 18:00
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Basın ile ilgili tüm sorularınız için yukarıdaki iletişim
                    bilgilerini kullanabilirsiniz. En kısa sürede size dönüş
                    yapacağız.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hızlı Linkler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Yıllık Raporlar
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Yönetim Ekibi
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  Ödüller ve Başarılar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


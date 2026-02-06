import {
  Building2,
  Users,
  Globe,
  Award,
  TrendingUp,
  Heart,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const stats = [
  { label: "Aktif Kullanıcı", value: "30M+", icon: Users },
  { label: "Satıcı", value: "250K+", icon: Building2 },
  { label: "Ülke", value: "27", icon: Globe },
  { label: "Ürün", value: "200M+", icon: TrendingUp },
];

const values = [
  {
    title: "Müşteri Odaklılık",
    description:
      "Her kararımızda müşterilerimizin ihtiyaçlarını ön planda tutuyoruz.",
    icon: Heart,
  },
  {
    title: "Yenilikçilik",
    description:
      "Teknoloji ve inovasyonla e-ticaret deneyimini sürekli geliştiriyoruz.",
    icon: TrendingUp,
  },
  {
    title: "Güvenilirlik",
    description: "Şeffaf ve dürüst iş anlayışımızla güven inşa ediyoruz.",
    icon: Award,
  },
  {
    title: "Topluma Katkı",
    description:
      "Sürdürülebilir büyüme ile topluma değer katmayı hedefliyoruz.",
    icon: Globe,
  },
];

export default function AboutPage() {
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
                    Hakkımızda
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Türkiye&apos;nin lider e-ticaret platformu olarak
                    milyonlarca müşteriye hizmet veriyoruz.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="flex flex-col gap-y-4 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a] text-center"
                    >
                      <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-2xl font-bold text-primary">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Story */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Hikayemiz</h2>
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      2010 yılında kurulan Sirizen, Türkiye&apos;nin en büyük
                      e-ticaret platformu olma yolculuğuna başladı. Misyonumuz,
                      teknolojiyi kullanarak alışverişi herkes için daha
                      erişilebilir, keyifli ve ekonomik hale getirmektir.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                      Bugün 250.000&apos;den fazla satıcımız ve 200 milyondan
                      fazla ürün çeşidimizle Türkiye&apos;nin yanı sıra 27 ülkede
                      faaliyet gösteriyoruz. Lojistik altyapımız sayesinde
                      siparişleri en hızlı şekilde müşterilerimize ulaştırıyoruz.
                    </p>
                  </div>
                </div>

                {/* Values */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Değerlerimiz</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {values.map((value) => (
                      <div
                        key={value.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a] text-center hover:shadow-lg transition-shadow"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <value.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm mb-2">
                          {value.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {value.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Tarihçemiz</h2>
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <div className="space-y-4">
                      {[
                        { year: "2010", event: "Sirizen kuruldu" },
                        { year: "2014", event: "Mobil uygulama lansmanı" },
                        {
                          year: "2018",
                          event: "Stratejik ortaklıklar",
                        },
                        {
                          year: "2020",
                          event: "Sirizen Express hizmeti başladı",
                        },
                        { year: "2021", event: "Uluslararası pazarlara açılma" },
                        {
                          year: "2023",
                          event: "30 milyon aktif kullanıcıya ulaşıldı",
                        },
                      ].map((item, index) => (
                        <div key={item.year} className="flex gap-4 items-center">
                          <div className="w-16 text-right flex-shrink-0">
                            <span className="font-bold text-primary text-sm">
                              {item.year}
                            </span>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <div className="flex-1 bg-muted/50 rounded-lg p-3">
                            <p className="text-sm">{item.event}</p>
                          </div>
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
    </div>
  );
}

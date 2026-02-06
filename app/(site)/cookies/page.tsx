"use client";

import {
  Cookie,
  Settings,
  BarChart3,
  Target,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const cookieTypes = [
  {
    id: "essential",
    icon: Shield,
    title: "Zorunlu Çerezler",
    description:
      "Site işlevselliği için gerekli temel çerezler. Devre dışı bırakılamaz.",
    examples: ["Oturum yönetimi", "Güvenlik çerezleri", "Sepet bilgileri"],
    required: true,
  },
  {
    id: "functional",
    icon: Settings,
    title: "İşlevsel Çerezler",
    description:
      "Tercihlerinizi hatırlayan ve deneyiminizi kişiselleştiren çerezler.",
    examples: ["Dil tercihi", "Tema ayarları", "Son görüntülenenler"],
    required: false,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analitik Çerezler",
    description: "Site kullanımını analiz etmemize yardımcı olan çerezler.",
    examples: [
      "Google Analytics",
      "Sayfa görüntüleme",
      "Kullanıcı davranışları",
    ],
    required: false,
  },
  {
    id: "marketing",
    icon: Target,
    title: "Pazarlama Çerezleri",
    description:
      "İlgi alanlarınıza göre reklam göstermek için kullanılan çerezler.",
    examples: ["Facebook Pixel", "Google Ads", "Yeniden hedefleme"],
    required: false,
  },
];

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  const handleToggle = (id: string) => {
    if (id === "essential") return; // Cannot toggle essential cookies
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  const handleSave = () => {
    // Save preferences
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    toast.success("Çerez tercihleriniz kaydedildi.");
  };

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify({
        essential: true,
        functional: true,
        analytics: true,
        marketing: true,
      })
    );
    toast.success("Tüm çerezler kabul edildi.");
  };

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
                    Çerez Politikası
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
                  {/* Introduction */}
                  <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <h2 className="font-semibold text-base mb-3">
                      Çerez Nedir?
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Çerezler, web sitelerinin bilgisayarınıza veya mobil
                      cihazınıza yerleştirdiği küçük metin dosyalarıdır. Bu
                      dosyalar, tercihlerinizi hatırlamamıza, siteyi nasıl
                      kullandığınızı anlamamıza ve deneyiminizi geliştirmemize
                      yardımcı olur.
                    </p>
                  </div>

                  {/* Cookie Types */}
                  <h2 className="font-semibold text-base mb-4">
                    Çerez Türleri ve Tercihler
                  </h2>
                  <div className="space-y-4 mb-6">
                    {cookieTypes.map((cookie) => (
                      <div
                        key={cookie.id}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <cookie.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm">
                                  {cookie.title}
                                </h3>
                                {cookie.required && (
                                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                    Zorunlu
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">
                                {cookie.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cookie.examples.map((example) => (
                                  <span
                                    key={example}
                                    className="text-xs bg-muted px-2 py-1 rounded"
                                  >
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={
                              preferences[cookie.id as keyof typeof preferences]
                            }
                            onCheckedChange={() => handleToggle(cookie.id)}
                            disabled={cookie.required}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Button onClick={handleSave} className="flex-1">
                      Tercihlerimi Kaydet
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      variant="outline"
                      className="flex-1"
                    >
                      Tümünü Kabul Et
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                    <h3 className="font-semibold text-base mb-4">
                      Çerez Yönetimi
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Tarayıcı Ayarları
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Çerezleri tarayıcı ayarlarınızdan da yönetebilirsiniz.
                          Çoğu tarayıcı, çerezleri engelleme veya silme
                          seçenekleri sunar. Ancak çerezleri engellemek, site
                          işlevselliğini etkileyebilir.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Üçüncü Taraf Çerezleri
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Bazı çerezler üçüncü taraf hizmet sağlayıcıları
                          tarafından yerleştirilir. Bu çerezlerin kullanımı,
                          ilgili tarafların gizlilik politikalarına tabidir.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">İletişim</h4>
                        <p className="text-xs text-muted-foreground">
                          Çerez politikamız hakkında sorularınız için:{" "}
                          <a
                            href="mailto:cerez@dsirizen.com"
                            className="text-primary hover:underline"
                          >
                            cerez@dsirizen.com
                          </a>
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

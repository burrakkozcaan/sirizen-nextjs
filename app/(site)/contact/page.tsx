"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: Phone,
    title: "Telefon",
    details: ["0850 222 0 111", "Hafta içi 09:00 - 18:00"],
  },
  {
    icon: Mail,
    title: "E-posta",
    details: ["destek@trendyol.com", "info@trendyol.com"],
  },
  {
    icon: MapPin,
    title: "Adres",
    details: [
      "Maslak Mahallesi",
      "AOS 55. Sokak No: 2",
      "34398 Sarıyer / İstanbul",
    ],
  },
  {
    icon: Clock,
    title: "Çalışma Saatleri",
    details: ["Pazartesi - Cuma: 09:00 - 18:00", "Hafta sonu: Kapalı"],
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(
      "Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız."
    );
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
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
                    İletişim
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Sorularınız ve önerileriniz için bize ulaşın. Size yardımcı
                    olmaktan mutluluk duyarız.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="flex flex-col gap-y-4 py-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Contact Form */}
                  <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Bize Yazın
                      </h3>
                      <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Konu *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, subject: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Konu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="genel">Genel Soru</SelectItem>
                          <SelectItem value="siparis">
                            Sipariş Hakkında
                          </SelectItem>
                          <SelectItem value="iade">İade ve Değişim</SelectItem>
                          <SelectItem value="sikayet">Şikayet</SelectItem>
                          <SelectItem value="oneri">Öneri</SelectItem>
                          <SelectItem value="isbirligi">İş Birliği</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mesajınız *</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    <Send className="h-4 w-4" />
                        {isSubmitting ? "Gönderiliyor..." : "Gönder"}
                      </Button>
                    </form>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    {contactInfo.map((info) => (
                      <div
                        key={info.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                      >
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <info.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-1">
                              {info.title}
                            </h3>
                            {info.details.map((detail, index) => (
                              <p
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Map Placeholder */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden dark:border-[#2a2a2a]">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Harita</p>
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
    </div>
  );
}

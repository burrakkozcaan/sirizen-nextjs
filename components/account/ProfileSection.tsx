"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

export function ProfileSection() {
  const { user, refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await api.get<{
          email_notifications: boolean;
          sms_notifications: boolean;
          push_notifications: boolean;
        }>("/user/notification-preferences");
        setEmailNotifications(data.email_notifications ?? true);
        setSmsNotifications(data.sms_notifications ?? true);
        setPushNotifications(data.push_notifications ?? true);
      } catch (error) {
        // Silently fail, use defaults
        console.error("Failed to load notification preferences:", error);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handleNotificationChange = async (
    type: "email" | "sms" | "push",
    value: boolean
  ) => {
    try {
      await api.put("/user/notification-preferences", {
        [`${type}_notifications`]: value,
      });

      if (type === "email") setEmailNotifications(value);
      if (type === "sms") setSmsNotifications(value);
      if (type === "push") setPushNotifications(value);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.message || "Bildirim tercihi güncellenirken bir hata oluştu"
      );
      // Revert the change
      if (type === "email") setEmailNotifications(!value);
      if (type === "sms") setSmsNotifications(!value);
      if (type === "push") setPushNotifications(!value);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.put("/user/profile", {
        name,
        email,
        phone: phone || undefined,
      });

      // Refresh user data
      await refreshUser();
      toast.success("Profil bilgileri güncellendi");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.message ||
          apiError.errors?.email?.[0] ||
          "Profil güncellenirken bir hata oluştu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setIsLoading(true);

    try {
      await api.put("/user/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      toast.success("Şifre başarıyla değiştirildi");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.message ||
          apiError.errors?.current_password?.[0] ||
          apiError.errors?.password?.[0] ||
          "Şifre değiştirilirken bir hata oluştu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <User className="h-5 w-5" />
            Kişisel Bilgiler
          </h3>
          <p className="text-sm text-muted-foreground">
            Hesabınızla ilişkili kişisel bilgilerinizi güncelleyin
          </p>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Ad Soyad"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                placeholder="+90 555 123 4567"
              />
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Değişiklikleri Kaydet"
            )}
          </Button>
        </form>
      </div>

      {/* Password Change */}
      {showPasswordSection && (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Şifre Değiştir
            </h3>
            <p className="text-sm text-muted-foreground">
              Hesabınızın güvenliği için güçlü bir şifre kullanın
            </p>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Şifreyi Değiştir"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordSection(false)}
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Tercihleri
          </h3>
          <p className="text-sm text-muted-foreground">
            Hangi bildirimler almak istediğinizi seçin
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">E-posta Bildirimleri</p>
              <p className="text-sm text-muted-foreground">
                Kampanya ve fırsatlardan haberdar olun
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) =>
                handleNotificationChange("email", checked)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Bildirimleri</p>
              <p className="text-sm text-muted-foreground">
                Sipariş durumu ve kampanyalar
              </p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={(checked) =>
                handleNotificationChange("sms", checked)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Bildirimleri</p>
              <p className="text-sm text-muted-foreground">
                Anlık bildirimler alın
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={(checked) =>
                handleNotificationChange("push", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}


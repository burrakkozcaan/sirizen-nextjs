"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Copy,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "choose" | "setup" | "verify" | "backup" | "complete";
type Method = "app" | "sms";

export default function TwoFactorSetupPage() {
  const [step, setStep] = useState<Step>("choose");
  const [method, setMethod] = useState<Method>("app");
  const [otp, setOtp] = useState("");
  const [backupCodes] = useState([
    "ABCD-1234-EFGH",
    "IJKL-5678-MNOP",
    "QRST-9012-UVWX",
    "YZAB-3456-CDEF",
    "GHIJ-7890-KLMN",
    "OPQR-1234-STUV",
    "WXYZ-5678-ABCD",
    "EFGH-9012-IJKL",
  ]);

  const handleVerify = () => {
    if (otp.length === 6) {
      setStep("backup");
      toast.success("Kod doğrulandı!");
    } else {
      toast.error("Lütfen 6 haneli kodu girin.");
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Yedek kodlar kopyalandı!");
  };

  const handleComplete = () => {
    setStep("complete");
    toast.success("İki faktörlü doğrulama başarıyla etkinleştirildi!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Profil Ayarlarına Dön
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            İki Faktörlü Doğrulama
          </h1>
          <p className="text-muted-foreground mt-1">
            Hesabınızı ek bir güvenlik katmanı ile koruyun.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["choose", "setup", "verify", "backup", "complete"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : ["choose", "setup", "verify", "backup", "complete"].indexOf(step) > i
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {["choose", "setup", "verify", "backup", "complete"].indexOf(step) > i ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 4 && (
                <div
                  className={cn(
                    "h-0.5 w-8 mx-1",
                    ["choose", "setup", "verify", "backup", "complete"].indexOf(step) > i
                      ? "bg-success"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step: Choose Method */}
        {step === "choose" && (
          <Card>
            <CardHeader>
              <CardTitle>Doğrulama Yöntemi Seçin</CardTitle>
              <CardDescription>
                İki faktörlü doğrulama için tercih ettiğiniz yöntemi seçin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as Method)}>
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                    method === "app" ? "border-primary bg-primary/5" : "hover:bg-muted"
                  )}
                  onClick={() => setMethod("app")}
                >
                  <RadioGroupItem value="app" id="app" />
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="app" className="font-medium cursor-pointer">
                      Doğrulama Uygulaması
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Google Authenticator veya benzeri bir uygulama kullanın
                    </p>
                  </div>
                  <span className="text-xs text-success font-medium">Önerilen</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                    method === "sms" ? "border-primary bg-primary/5" : "hover:bg-muted"
                  )}
                  onClick={() => setMethod("sms")}
                >
                  <RadioGroupItem value="sms" id="sms" />
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="sms" className="font-medium cursor-pointer">
                      SMS Doğrulama
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Telefonunuza SMS ile kod gönderilir
                    </p>
                  </div>
                </div>
              </RadioGroup>
              <Button onClick={() => setStep("setup")} className="w-full mt-6">
                Devam Et
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Setup */}
        {step === "setup" && (
          <Card>
            <CardHeader>
              <CardTitle>
                {method === "app"
                  ? "Uygulamayı Kurun"
                  : "Telefon Numaranızı Doğrulayın"}
              </CardTitle>
              <CardDescription>
                {method === "app"
                  ? "Doğrulama uygulamanızla QR kodu tarayın veya kodu manuel girin."
                  : "SMS kodu göndereceğimiz telefon numaranızı girin."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {method === "app" ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      QR kodu tarayamıyor musunuz? Bu kodu manuel girin:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-muted px-3 py-2 rounded font-mono text-sm">
                        JBSWY3DPEHPK3PXP
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
                          toast.success("Kod kopyalandı!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Telefon Numarası</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+90 5XX XXX XX XX"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep("choose")}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button onClick={() => setStep("verify")} className="flex-1">
                  {method === "sms" ? "Kod Gönder" : "Devam Et"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Verify */}
        {step === "verify" && (
          <Card>
            <CardHeader>
              <CardTitle>Kodu Doğrulayın</CardTitle>
              <CardDescription>
                {method === "app"
                  ? "Doğrulama uygulamanızdaki 6 haneli kodu girin."
                  : "Telefonunuza gönderilen 6 haneli kodu girin."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("setup")}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button onClick={handleVerify} className="flex-1">
                  Doğrula
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Backup Codes */}
        {step === "backup" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Yedek Kodlarınız
              </CardTitle>
              <CardDescription>
                Bu kodları güvenli bir yere kaydedin. Telefonunuza erişemediğinizde
                kullanabilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <code
                      key={i}
                      className="bg-background px-3 py-2 rounded text-sm font-mono text-center"
                    >
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleCopyBackupCodes}
                className="w-full mb-6"
              >
                <Copy className="h-4 w-4 mr-2" />
                Kodları Kopyala
              </Button>
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-warning-foreground">
                  <strong>Önemli:</strong> Her kod yalnızca bir kez kullanılabilir. Bu
                  kodları kaybederseniz ve telefonunuza erişemezseniz, hesabınıza
                  erişiminizi kaybedebilirsiniz.
                </p>
              </div>
              <Button onClick={handleComplete} className="w-full">
                Kodları Kaydettim, Devam Et
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Tebrikler!</h2>
              <p className="text-muted-foreground mb-6">
                İki faktörlü doğrulama başarıyla etkinleştirildi. Hesabınız artık daha
                güvende.
              </p>
              <Button asChild className="w-full">
                <Link href="/account/profile">Profil Ayarlarına Dön</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


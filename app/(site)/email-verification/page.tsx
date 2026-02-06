"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

type VerificationStatus = "pending" | "verifying" | "success" | "error";

export default function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [email] = useState(
    () => searchParams.get("email") || "kullanici@email.com"
  );
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Check if there's a token in URL (verification link click)
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setStatus("verifying");
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await api.post("/auth/verify-email", { token });
      setStatus("success");
      toast.success("E-posta başarıyla doğrulandı!");
    } catch (error) {
      const apiError = error as ApiError;
      setStatus("error");
      toast.error(
        apiError.message || "E-posta doğrulama başarısız. Lütfen tekrar deneyin."
      );
    }
  };

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendEmail = async () => {
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success("Doğrulama e-postası tekrar gönderildi!");
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.message || "E-posta gönderilemedi. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        {status === "pending" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                E-posta Adresinizi Doğrulayın
              </CardTitle>
              <CardDescription className="text-base mt-2">
                <span className="font-medium text-foreground">{email}</span>{" "}
                adresine bir doğrulama bağlantısı gönderdik.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Sonraki adımlar:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>E-posta gelen kutunuzu kontrol edin</li>
                  <li>"E-postamı Doğrula" butonuna tıklayın</li>
                  <li>Hesabınız aktif hale gelecektir</li>
                </ol>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  E-posta almadınız mı?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={!canResend}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {canResend
                    ? "Tekrar Gönder"
                    : `Tekrar gönder (${countdown}s)`}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Spam/Gereksiz klasörünüzü de kontrol etmeyi unutmayın.
                </p>
              </div>

              <div className="pt-4 border-t text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  Giriş sayfasına dön
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </>
        )}

        {status === "verifying" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Doğrulanıyor...</CardTitle>
              <CardDescription className="text-base mt-2">
                E-posta adresiniz doğrulanıyor, lütfen bekleyin.
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === "success" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">
                E-posta Doğrulandı!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Hesabınız başarıyla aktif edildi. Artık giriş yapabilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/login">
                  Giriş Yap
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Ana sayfaya git
                </Link>
              </div>
            </CardContent>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">
                Doğrulama Başarısız
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleResendEmail}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Yeni Doğrulama E-postası Gönder
              </Button>

              <div className="text-center">
                <Link
                  href="/help"
                  className="text-sm text-primary hover:underline"
                >
                  Yardım merkezine git
                </Link>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

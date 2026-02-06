"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type VerificationStatus = "pending" | "verifying" | "success" | "error";

export default function EmailVerificationCodePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [email] = useState(
    () => searchParams.get("email") || ""
  );
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleVerify = async (verificationCode: string) => {
    if (verificationCode.length !== 6) {
      return;
    }

    setIsVerifying(true);
    setStatus("verifying");

    try {
      const response = await api.post<{
        message: string;
        user: any;
        token: string;
        data?: {
          user: any;
          token: string;
        };
      }>("/auth/verify-email-code", {
        email,
        code: verificationCode,
      });

      setStatus("success");
      toast.success("E-posta başarıyla doğrulandı!");

      // Store token
      const token = response.token || response.data?.token;
      if (token) {
        localStorage.setItem("auth_token", token);
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        refreshUser();
      }

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      const apiError = error as ApiError;
      setStatus("error");
      toast.error(
        apiError.message || "Doğrulama kodu hatalı. Lütfen tekrar deneyin."
      );
      setCode(""); // Clear code on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await api.post("/auth/resend-verification-code", { email });
      toast.success("Doğrulama kodu tekrar gönderildi!");
      setCountdown(300); // Reset to 5 minutes
      setCanResend(false);
      setCode(""); // Clear current code
      setStatus("pending");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.message || "E-posta gönderilemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) {
    return null;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-xs">
        {status === "pending" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                E-posta Doğrulaması
              </CardTitle>
              <CardDescription className="text-base mt-2">
                <span className="font-medium text-foreground">{email}</span>{" "}
                adresine gönderilen doğrulama kodunu girin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => {
                    setCode(value);
                    if (value.length === 6) {
                      handleVerify(value);
                    }
                  }}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Doğrulama Kodu ({formatTime(countdown)} kaldı)
                  </p>
                  {code.length === 6 && (
                    <p className="text-xs text-muted-foreground">
                      Kod otomatik olarak doğrulanıyor...
                    </p>
                  )}
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Kod gelmedi mi?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={!canResend || isResending}
                  className="gap-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      {canResend
                        ? "Tekrar Gönder"
                        : `Tekrar gönder (${formatTime(countdown)})`}
                    </>
                  )}
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
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
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
                Hesabınız başarıyla aktif edildi. Ana sayfaya yönlendiriliyorsunuz...
              </CardDescription>
            </CardHeader>
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
                Doğrulama kodu hatalı veya süresi dolmuş olabilir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Yeni Doğrulama Kodu Gönder
                  </>
                )}
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
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/hero/two.jpeg"
          alt="E-posta Doğrulama"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

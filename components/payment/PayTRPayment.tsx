"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPayTRToken, checkPaymentStatus } from "@/actions/payment.actions";
import { toast } from "sonner";

interface PayTRPaymentProps {
  orderId: number;
  orderTotal: number;
  customerData: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
  };
  onSuccess?: () => void;
  onError?: () => void;
}

export function PayTRPayment({
  orderId,
  orderTotal,
  customerData,
  onSuccess,
  onError,
}: PayTRPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installment, setInstallment] = useState(0);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createPayTRToken(orderId, {
        ...customerData,
        installment,
      });

      if (result.success && result.data) {
        setIframeUrl(result.data.iframe_url);
      } else {
        const errorMessage = result.message || "Ödeme başlatılamadı";
        setError(errorMessage);
        toast.error(errorMessage);
        onError?.();
      }
    } catch (err: any) {
      const errorMessage = err.message || "Ödeme başlatılırken bir hata oluştu";
      setError(errorMessage);
      toast.error(errorMessage);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  // PayTR callback'i dinle (sayfa yüklendiğinde)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // PayTR iframe'den gelen mesajları dinle
      if (event.data && typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.status === "success") {
            // Ödeme başarılı, durumu kontrol et
            const statusResult = await checkPaymentStatus(orderId);
            if (statusResult.success) {
              toast.success("Ödeme başarıyla tamamlandı!");
              onSuccess?.();
            }
          } else if (data.status === "failed") {
            toast.error("Ödeme başarısız oldu");
            onError?.();
          }
        } catch (e) {
          // JSON parse hatası, görmezden gel
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [orderId, onSuccess, onError]);

  // URL parametrelerinden callback'i kontrol et
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const merchantOid = params.get("merchant_oid");

    if (status === "success" && merchantOid) {
      // PayTR callback'ten geldik, durumu kontrol et
      checkPaymentStatus(orderId).then((result) => {
        if (result.success) {
          toast.success("Ödeme başarıyla tamamlandı!");
          onSuccess?.();
        }
      });
    } else if (status === "failed") {
      toast.error("Ödeme başarısız oldu");
      onError?.();
    }
  }, [orderId, onSuccess, onError]);

  if (iframeUrl) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ödeme sayfası yükleniyor. Lütfen bekleyin...
            </AlertDescription>
          </Alert>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={iframeUrl}
            className="w-full h-[600px] border-0"
            title="PayTR Ödeme"
            allow="payment"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Toplam Tutar</span>
          <span className="text-lg font-bold">
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(orderTotal)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          PayTR ile güvenli ödeme yapabilirsiniz
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Ödeme başlatılıyor...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            PayTR ile Öde
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        PayTR, Türkiye'nin güvenilir ödeme altyapısıdır. Kart bilgileriniz
        PayTR sunucularında güvenle saklanır.
      </p>
    </div>
  );
}

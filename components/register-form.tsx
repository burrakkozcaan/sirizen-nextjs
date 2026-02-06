"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  registerAction,
  type RegisterActionState,
} from "@/actions/auth.actions";

const registerInitialState: RegisterActionState = {
  errors: undefined,
  message: undefined,
  success: false,
};
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [state, formAction, pending] = useActionState<RegisterActionState, FormData>(
    registerAction,
    registerInitialState
  );

  // Handle success redirect
  useEffect(() => {
    if (state?.success) {
      // If verification is required, redirect to verification page
      if (state.requires_verification && state.email) {
        toast.success(state.message || "E-posta adresinize doğrulama kodu gönderildi.");
        router.push(`/email-verification-code?email=${encodeURIComponent(state.email)}`);
        return;
      }

      // If token is provided, login directly
      if (state.token) {
        // Store token in localStorage for client-side API calls
        localStorage.setItem("auth_token", state.token);
        toast.success(state.message || "Kayıt başarılı! Hoş geldiniz.");
        refreshUser(); // Refresh user state from server
        router.push("/");
        router.refresh();
      }
    } else if (state?.errors && !state?.success) {
      // Show error toast for general form errors
      if (state.errors._form && state.errors._form.length > 0) {
        toast.error(state.errors._form[0], {
          duration: 5000,
        });
      }
    }
  }, [state?.success, state?.token, state?.requires_verification, state?.email, state?.message, state?.errors, router, refreshUser]);

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Hesabını Oluştur</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Aşağıdaki bilgileri doldurarak hızlıca üye ol
          </p>
        </div>

        {state?.errors?._form && (
          <Field>
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {state.errors._form[0]}
            </div>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="name">Ad Soyad</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ad Soyad"
            required
            disabled={pending}
            className="w-full h-11 px-4 border border-input rounded-lg bg-muted/40
                     text-sm focus:border-primary focus:ring-1 focus:ring-primary 
                     outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            aria-invalid={state?.errors?.name ? "true" : "false"}
            aria-describedby={state?.errors?.name ? "name-error" : undefined}
          />
          {state?.errors?.name && (
            <FieldDescription id="name-error" className="text-xs text-destructive mt-1">
              {state.errors.name[0]}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">E-posta</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            disabled={pending}
            className="w-full h-11 px-4 border border-input rounded-lg bg-muted/40
                     text-sm focus:border-primary focus:ring-1 focus:ring-primary 
                     outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            aria-invalid={state?.errors?.email ? "true" : "false"}
            aria-describedby={state?.errors?.email ? "email-error" : undefined}
          />
          {state?.errors?.email && (
            <FieldDescription id="email-error" className="text-xs text-destructive mt-1">
              {state.errors.email[0]}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Şifre</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={pending}
              placeholder="••••••••"
              className="w-full h-11 px-4 pr-11 border border-input rounded-lg bg-muted/40
                     text-sm focus:border-primary focus:ring-1 focus:ring-primary 
                     outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              aria-invalid={state?.errors?.password ? "true" : "false"}
              aria-describedby={state?.errors?.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-transparent"
              disabled={pending}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="space-y-1 pt-1">
            <div
              className={cn(
                "flex items-center gap-2 text-xs",
                state?.errors?.password ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Check
                className={cn(
                  "h-3 w-3",
                  state?.errors?.password ? "opacity-100 text-destructive" : "opacity-30"
                )}
              />
              En az 6 karakter, 1 büyük harf ve 1 rakam içermelidir
            </div>
            {state?.errors?.password && (
              <FieldDescription id="password-error" className="text-xs text-destructive">
                {state.errors.password[0]}
              </FieldDescription>
            )}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="password_confirmation">Şifre Tekrar</FieldLabel>
          <div className="relative">
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type={showPassword ? "text" : "password"}
              required
              disabled={pending}
              placeholder="••••••••"
              className="w-full h-11 px-4 pr-11 border border-input rounded-lg bg-muted/40
                       text-sm focus:border-primary focus:ring-1 focus:ring-primary 
                       outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              aria-invalid={state?.errors?.password_confirmation ? "true" : "false"}
              aria-describedby={
                state?.errors?.password_confirmation ? "password_confirmation-error" : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-transparent"
              disabled={pending}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {state?.errors?.password_confirmation && (
            <FieldDescription
              id="password_confirmation-error"
              className="text-destructive text-xs"
            >
              {state.errors.password_confirmation[0]}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <div className="flex items-start gap-2">
            <Checkbox
              id="acceptTerms"
              name="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              disabled={pending}
            />
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-normal leading-snug cursor-pointer"
            >
              <Link href="/terms" className="text-primary hover:underline">
                Üyelik Koşulları
              </Link>{" "}
              ve{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Gizlilik Politikası
              </Link>
              &apos;nı okudum, kabul ediyorum.
            </Label>
          </div>
          {state?.errors?.acceptTerms && (
            <FieldDescription className="text-destructive text-xs mt-1">
              {state.errors.acceptTerms[0]}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full mt-2 py-4 text-sm leading-normal rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-md"
            disabled={pending || !acceptTerms}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kayıt yapılıyor...
              </>
            ) : (
              "Üye Ol"
            )}
          </Button>
        </Field>

        <FieldSeparator>Veya devam etmek için</FieldSeparator>

        <Field>
          <GoogleLoginButton redirectTo="/" />

          <FieldDescription className="text-center mt-4">
            Zaten üye misiniz?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Giriş Yap
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  loginAction,
  type LoginActionState,
} from "@/actions/auth.actions";

const initialState: LoginActionState = {
  errors: undefined,
  message: undefined,
  success: false,
};
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<
    LoginActionState,
    FormData
  >(loginAction, initialState);

  const from = searchParams.get("from") || "/";

  // Handle success redirect
  useEffect(() => {
    if (state?.success && state?.token) {
      // Store token in localStorage for client-side API calls
      localStorage.setItem("auth_token", state.token);
      toast.success(state.message || "Giriş başarılı!");
      refreshUser(); // Refresh user state from server
      router.push(from);
      router.refresh();
    } else if (state?.errors && !state?.success) {
      // Show error toast for general form errors
      if (state.errors._form && state.errors._form.length > 0) {
        toast.error(state.errors._form[0], {
          duration: 5000,
        });
      }
    }
  }, [state?.success, state?.token, state?.message, state?.errors, router, from, refreshUser]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form action={formAction}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <Sparkles className="size-6" />
              </div>
              <span className="sr-only">Sirizen</span>
            </div>
            <h1 className="text-xl font-bold">Sirizen'e Hoş Geldiniz</h1>
            <FieldDescription>
              Hesabın yok mu? <Link href="/register" className="underline underline-offset-4">Kayıt ol</Link>
            </FieldDescription>
          </div>

          {state?.errors?._form && (
            <Field>
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {state.errors._form[0]}
              </div>
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="email">E-posta</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={pending}
              aria-invalid={state?.errors?.email ? "true" : "false"}
              aria-describedby={state?.errors?.email ? "email-error" : undefined}
            />
            {state?.errors?.email && (
              <FieldDescription
                id="email-error"
                className="text-xs text-destructive mt-1"
              >
                {state.errors.email[0]}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Şifre</FieldLabel>
              <Link
                href="/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Şifremi Unuttum?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={pending}
                placeholder="••••••••"
                aria-invalid={state?.errors?.password ? "true" : "false"}
                aria-describedby={
                  state?.errors?.password ? "password-error" : undefined
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
            {state?.errors?.password && (
              <FieldDescription
                id="password-error"
                className="text-xs text-destructive mt-1"
              >
                {state.errors.password[0]}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </Field>

          <FieldSeparator>Veya</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-1">
            <GoogleLoginButton redirectTo={from} />
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Devam ederek{" "}
        <Link href="/terms" className="underline underline-offset-4">
          Kullanım Koşullarımızı
        </Link>{" "}
        ve{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Gizlilik Politikamızı
        </Link>{" "}
        kabul etmiş olursunuz.
      </FieldDescription>
    </div>
  );
}

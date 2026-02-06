"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest, type ApiError } from "@/lib/api-server";

// User type matching Laravel API response
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  email_verified_at?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Login Schema
const loginSchema = z.object({
  email: z
    .string({ message: "Geçerli bir e-posta adresi girin" })
    .email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre zorunludur"),
});

// Register Schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Ad Soyad en az 2 karakter olmalıdır" })
      .max(100, { message: "Ad Soyad en fazla 100 karakter olabilir" }),
    email: z
      .string({ message: "Geçerli bir e-posta adresi girin" })
      .email("Geçerli bir e-posta adresi girin"),
    password: z
      .string()
      .min(6, { message: "Şifre en az 6 karakter olmalıdır" })
      .regex(/[A-Z]/, { message: "Şifre en az 1 büyük harf içermelidir" })
      .regex(/[0-9]/, { message: "Şifre en az 1 rakam içermelidir" }),
    password_confirmation: z.string().min(1, { message: "Şifre tekrar zorunludur" }),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: "Üyelik koşullarını kabul etmelisiniz",
      }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

// Login Action State
export interface LoginActionState {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
  token?: string;
  user?: User;
}

// Register Action State
export interface RegisterActionState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
    acceptTerms?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
  token?: string;
  user?: User;
  requires_verification?: boolean;
  email?: string;
}

// Initial states are now defined in the components that use them

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  // Basic client-side validation (optional, Laravel will validate anyway)
  const validatedFields = loginSchema.safeParse({ email, password });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const data = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Set cookie with token
    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      message: "Giriş başarılı!",
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    const apiError = error as ApiError;
    
    // Laravel API'den dönen hataları field bazlı göster
    const errors: LoginActionState["errors"] = {};
    
    if (apiError.errors) {
      // Laravel'dan dönen field hatalarını ekle
      if (apiError.errors.email) {
        errors.email = apiError.errors.email;
      }
      if (apiError.errors.password) {
        errors.password = apiError.errors.password;
      }
    }
    
    // Eğer field bazlı hata yoksa genel hata mesajı göster
    if (Object.keys(errors).length === 0) {
      errors._form = [
        apiError.message || "Giriş başarısız. Lütfen tekrar deneyin.",
      ];
    }
    
    return {
      errors,
      success: false,
    };
  }
}

export async function registerAction(
  prevState: RegisterActionState | null,
  formData: FormData
): Promise<RegisterActionState> {
  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const password_confirmation = formData.get("password_confirmation")?.toString() || "";
  const acceptTerms = formData.get("acceptTerms") === "true" || formData.get("acceptTerms") === "on";

  // Client-side validation: acceptTerms kontrolü
  if (!acceptTerms) {
    return {
      errors: {
        acceptTerms: ["Üyelik koşullarını kabul etmelisiniz"],
      },
      success: false,
    };
  }

  // Client-side validation: Şifre eşleşme kontrolü
  if (password !== password_confirmation) {
    return {
      errors: {
        password_confirmation: ["Şifreler eşleşmiyor"],
      },
      success: false,
    };
  }

  // Basic client-side validation (optional, Laravel will validate anyway)
  const validatedFields = registerSchema.safeParse({
    name,
    email,
    password,
    password_confirmation,
    acceptTerms,
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const response = await apiRequest<{
      message: string;
      email?: string;
      requires_verification?: boolean;
      user?: User;
      token?: string;
      data?: AuthResponse;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation,
      }),
    });

    // If verification is required, redirect to verification page
    if (response.requires_verification) {
      return {
        success: true,
        message: response.message || "Kayıt başarılı! E-posta adresinize doğrulama kodu gönderildi.",
        requires_verification: true,
        email: response.email || email,
      };
    }

    // If token is provided (legacy or direct verification), set cookie
    if (response.token || response.data?.token) {
      const token = response.token || response.data?.token;
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return {
        success: true,
        message: "Kayıt başarılı! Hoş geldiniz.",
        token: token!,
        user: response.user || response.data?.user,
      };
    }

    // Fallback: verification required
    return {
      success: true,
      message: response.message || "Kayıt başarılı! E-posta adresinize doğrulama kodu gönderildi.",
      requires_verification: true,
      email: response.email || email,
    };
  } catch (error) {
    const apiError = error as ApiError;
    
    // Laravel API'den dönen hataları field bazlı göster
    const errors: RegisterActionState["errors"] = {};
    
    if (apiError.errors) {
      // Laravel'dan dönen tüm field hatalarını ekle
      if (apiError.errors.name) {
        errors.name = apiError.errors.name;
      }
      if (apiError.errors.email) {
        errors.email = apiError.errors.email;
      }
      if (apiError.errors.password) {
        errors.password = apiError.errors.password;
      }
      if (apiError.errors.password_confirmation) {
        errors.password_confirmation = apiError.errors.password_confirmation;
      }
    }
    
    // Eğer field bazlı hata yoksa genel hata mesajı göster
    if (Object.keys(errors).length === 0) {
      errors._form = [
        apiError.message || "Kayıt başarısız. Lütfen tekrar deneyin.",
      ];
    }
    
    return {
      errors,
      success: false,
    };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    // Even if logout fails on server, clear cookie
    console.error("Logout error:", error);
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
  }
  
  return { success: true };
}


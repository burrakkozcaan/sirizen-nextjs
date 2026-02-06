// Server-side API helper for Next.js Server Actions
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sirizen-apps.test/api";

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

interface FetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Get auth token from cookies (only works in server components)
  let token: string | undefined;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get("auth_token")?.value;
  } catch {
    // Cookies not available (e.g., during prerender or in client components)
    token = undefined;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  // Next.js cache options
  if (options.next) {
    const nextOptions = options.next;
    const { revalidate, tags } = nextOptions;
    
    if (revalidate !== undefined) {
      fetchOptions.next = { revalidate };
    }
    if (tags) {
      fetchOptions.next = { ...fetchOptions.next, tags };
    }
  }

  let data: any;
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    
    // Try to parse JSON, but handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || "Bir hata oluştu" };
    }

    if (!response.ok) {
      // Handle different error types
      let errorMessage = data.message || "Bir hata oluştu";
      
      // Network errors
      if (response.status === 0 || response.status >= 500) {
        errorMessage = "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.";
      } else if (response.status === 401) {
        errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
      } else if (response.status === 403) {
        errorMessage = "Bu işlem için yetkiniz bulunmamaktadır.";
      } else if (response.status === 404) {
        errorMessage = "İstenen kaynak bulunamadı.";
      } else if (response.status === 422) {
        // Validation errors - keep original message
        errorMessage = data.message || "Girdiğiniz bilgileri kontrol edin.";
      } else if (response.status === 429) {
        errorMessage = "Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.";
      }

      const error: ApiError = {
        message: errorMessage,
        errors: data.errors,
      };
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error && typeof error === "object" && "message" in error) {
      throw error;
    }
    
    // Handle network errors
    const networkError: ApiError = {
      message: "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      errors: undefined,
    };
    throw networkError;
  }
}

// Export individual functions instead of an object for "use server" compatibility
export async function apiGet<T>(endpoint: string, options?: FetchOptions) {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions
) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions
) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(endpoint: string, options?: FetchOptions) {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}


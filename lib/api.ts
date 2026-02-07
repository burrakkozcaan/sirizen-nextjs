// API Configuration for Laravel Backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://sirizen-apps.test/api";

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let data: any;
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Validate URL
    if (!url || url === 'undefined' || url.includes('undefined')) {
      throw new Error(`Geçersiz API URL: ${url}`);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    
    // Handle specific error types
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const networkError: ApiError = {
        message: `API sunucusuna bağlanılamıyor. URL: ${API_BASE_URL}${endpoint}. İnternet bağlantınızı kontrol edin veya API sunucusunun çalıştığından emin olun.`,
        errors: undefined,
      };
      throw networkError;
    }
    
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError: ApiError = {
        message: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
        errors: undefined,
      };
      throw timeoutError;
    }
    
    // Handle other network errors
    const networkError: ApiError = {
      message: error instanceof Error ? error.message : "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      errors: undefined,
    };
    throw networkError;
  }
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};

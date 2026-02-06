const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.sirizen.com";

function getBackendOrigin() {
  // Strip trailing `/api` (and trailing slashes) to get the backend origin used for media.
  return API_BASE_URL.replace(/\/+$/, "").replace(/\/api$/, "");
}

/**
 * Turns an API-provided media path into an absolute URL usable by next/image.
 * - Absolute URLs are returned as-is
 * - Campaign banners (campaigns/banners/*) are prefixed with CDN base URL
 * - Other relative paths are prefixed with backend origin
 */
export function resolveMediaUrl(input?: string | null | { url?: string }): string {
  // Handle object with url property
  if (input && typeof input === 'object' && 'url' in input) {
    input = input.url;
  }
  
  // Convert to string if not already
  const urlString = typeof input === 'string' ? input : String(input || '');
  
  if (!urlString) return "";

  // Already absolute
  if (/^https?:\/\//i.test(urlString)) return urlString;
  if (urlString.startsWith("//")) return `https:${urlString}`;

  // Campaign banners should come from CDN
  if (urlString.startsWith("campaigns/banners/") || urlString.startsWith("/campaigns/banners/")) {
    const cleanPath = urlString.startsWith("/") ? urlString : `/${urlString}`;
    return `${CDN_BASE_URL}${cleanPath}`;
  }

  const origin = getBackendOrigin();
  if (!origin) return urlString;

  if (urlString.startsWith("/")) return `${origin}${urlString}`;
  return `${origin}/${urlString}`;
}



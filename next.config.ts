import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Most Laravel setups serve uploaded media from the backend origin (often /storage/*),
// while API lives under /api. We allow Next/Image to load from that backend origin.
const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
let backendUrl: URL | null = null;
try {
  backendUrl = new URL(backendOrigin);
} catch {
  backendUrl = null;
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      ...(backendUrl
        ? [
            {
              protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
              hostname: backendUrl.hostname,
              ...(backendUrl.port ? { port: backendUrl.port } : {}),
              pathname: "/**",
            },
          ]
        : []),
      // CDN for campaign banners
      {
        protocol: "https",
        hostname: "cdn.sirizen.com",
        pathname: "/**",
      },
      // Unsplash (temporary - for test data in database, should be replaced with CDN URLs)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Placeholder images (fallback)
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      // Trendyol CDN (for category images)
      {
        protocol: "https",
        hostname: "cdn.dsmcdn.com",
        pathname: "/**",
      },
      // Sensible local defaults
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
    ],
  },
  // React Compiler - experimental, şimdilik kapalı
  // experimental: {
  //   reactCompiler: true,
  // },
};

export default nextConfig;

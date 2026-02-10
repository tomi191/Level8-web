import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: import.meta.dirname,
    resolveAlias: {
      tailwindcss: resolve(import.meta.dirname, "node_modules/tailwindcss"),
      "tw-animate-css": resolve(
        import.meta.dirname,
        "node_modules/tw-animate-css"
      ),
      "shadcn/tailwind.css": resolve(
        import.meta.dirname,
        "node_modules/shadcn/dist/tailwind.css"
      ),
    },
  },
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

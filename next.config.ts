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
};

export default nextConfig;

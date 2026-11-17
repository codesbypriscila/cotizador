import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The admin is session-driven and the quote builder reads the catalog from the
  // database on every request, so we use request-time rendering (same as Wishly).
  cacheComponents: false,
  poweredByHeader: false,
  // No floating Next.js badge in development (it covered the screenshots).
  devIndicators: false,
  serverExternalPackages: ["pg"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

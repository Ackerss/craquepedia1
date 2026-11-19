import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  serverExternalPackages: ["postgres"],
  outputFileTracingIncludes: {
    "/api/arte/[id]": ["./src/assets/fonts/**", "./public/sports/**"],
  },
};

export default nextConfig;

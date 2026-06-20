import type { NextConfig } from "next";

const repo = "ai-fitness";
const basePath =
  process.env.NODE_ENV === "production" ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

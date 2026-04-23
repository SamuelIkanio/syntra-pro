import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudflare tunnel hosts for development
  // @ts-ignore
  allowedDevOrigins: ["present-deal-steam-tonight.trycloudflare.com"]
};

export default nextConfig;

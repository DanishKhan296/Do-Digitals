import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Vercel handles deployment natively — no standalone output needed.
  // The previous "output: standalone" was for the dev sandbox.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z-cdn-media.chatglm.cn" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;

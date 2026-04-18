import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    resolveAlias: {
      "tw-animate-css": "tw-animate-css/dist/tw-animate.css",
    },
  },
};

export default nextConfig;

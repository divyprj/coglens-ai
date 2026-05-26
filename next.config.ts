import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse relies on canvas polyfills that don't work in the
  // build environment. Mark it as external so it's loaded at runtime only.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;

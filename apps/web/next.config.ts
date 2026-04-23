import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows Next.js to use the raw TS files from your workspace packages
  transpilePackages: ["@repo/db", "@repo/validation"],
};

export default nextConfig;

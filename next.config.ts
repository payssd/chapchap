import type { NextConfig } from "next";

const nextConfig: NextConfig & { eslint?: { ignoreDuringBuilds?: boolean } } = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

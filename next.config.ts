import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude templates folder from build - they are deployed separately
  // experimental: {
    turbopack: {
      resolveAlias: {
        // Prevent templates from being included in build
      },
    },
  // },
  webpack: (config) => {
    // Exclude templates directory from webpack
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/templates/**'],
    };
    return config;
  },
};

export default nextConfig;

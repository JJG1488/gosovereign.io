import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Enable MDX pages
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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

const withMDX = createMDX({
  // Add markdown plugins here if needed
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);

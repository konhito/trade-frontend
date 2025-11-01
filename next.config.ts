import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
      skipDefaultConversion: true,
    },
  },
  pageExtensions: ['mdx', 'ts', 'tsx'],
  experimental: {
    useCache: false,
    mdxRs: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Resolve project root using process.cwd() (works in all Node.js contexts)
    // Avoids __dirname and import.meta.url which aren't available in Edge runtime
    const path = require('path')
    const projectRoot = process.cwd()

    config.resolve.alias = {
      ...config.resolve.alias,
      '@/server/subscription': path.join(projectRoot, 'lib', 'stubs', 'server-subscription.ts'),
    };

    return config;
  },
  output: undefined,
  trailingSlash: false,
  async generateBuildId() {
    return 'build-' + Date.now();
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);

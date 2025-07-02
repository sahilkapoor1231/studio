
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // This is needed to fix a compatibility issue between an older version of handlebars (a dependency of Genkit) and webpack.
      handlebars: 'handlebars/dist/handlebars.js',
    };
    return config;
  },
};

export default nextConfig;

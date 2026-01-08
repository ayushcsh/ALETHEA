/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🔴 IMPORTANT: Disable Turbopack (Next.js 16)
  experimental: {
    turbo: false,
  },

  // External packages for server components
  serverExternalPackages: ['@tailwindcss/typography', 'pdf-parse'],

  // Webpack config (you ARE using webpack → so this is correct)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    return config;
  },

  // Images config (already modern ✔)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  output: 'standalone',

  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'production',
  },
};

export default nextConfig;
